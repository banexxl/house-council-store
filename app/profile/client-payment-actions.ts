'use server';

import { revalidatePath } from 'next/cache';
import { logServerAction } from '../lib/server-logging';
import { Payment } from '../types/payment';
import { Currency } from '../types/currency';
import { BaseEntity } from '../types/base-entity';
import { useServerSideSupabaseAnonClient } from '../lib/ss-supabase-anon-client';
import { addMonths, addYears, subMonths, subYears, isBefore, isAfter, differenceInCalendarMonths } from 'date-fns';

type RenewalPeriod = 'monthly' | 'yearly'; // extend if you add more (weekly, quarterly, etc.)
type PaymentStatus = 'processing' | 'failed' | 'chargeback' | 'succeeded' | 'pending' | 'refunded' | 'cancelled' | 'disputed'; // matches your enum

const PAID_STATUSES: PaymentStatus[] = ['succeeded']; // only succeeded is considered fully paid
const GRACE_DAYS = 7; // set >0 if you want a grace period before considering overdue

const addOnePeriod = (d: Date, period: RenewalPeriod) => {
     return period === 'yearly' ? addYears(d, 1) : addMonths(d, 1);
}

const subOnePeriod = (d: Date, period: RenewalPeriod) => {
     return period === 'yearly' ? subYears(d, 1) : subMonths(d, 1);
}

const getSubscription = async (supabase: any, clientId: string, planId: string) => {
     // TABLE/COLUMN NAMES: adjust if yours differ
     const { data, error } = await supabase
          .from('tblClient_Subscription')
          .select(`
               id, 
               status, 
               created_at, 
               updated_at, 
               is_auto_renew, 
               next_payment_date, 
               expired, 
               renewal_period,
               subscription_plan_id,
               tblSubscriptionPlans!inner(total_price_with_discounts)
          `)
          .eq('client_id', clientId)
          .eq('subscription_plan_id', planId)
          .maybeSingle();

     if (error) throw new Error(error.message);
     return data as {
          id: string;
          status: 'trialing' | 'active' | 'paused' | 'canceled' | 'expired' | string;
          created_at: string;
          updated_at: string;
          is_auto_renew: boolean;
          next_payment_date: string | null;
          expired: boolean;
          renewal_period: RenewalPeriod | null;
          subscription_plan_id: string;
          tblSubscriptionPlans: {
               total_price_with_discounts: number;
          };
     } | null;
}

const resolveDueWindow = (sub: NonNullable<Awaited<ReturnType<typeof getSubscription>>>) => {
     const now = new Date();
     const period: RenewalPeriod = sub.renewal_period ?? 'monthly';

     // Prefer explicit next_payment_date; otherwise infer "one period after updated_at"
     const candidateDue = sub.next_payment_date
          ? new Date(sub.next_payment_date)
          : addOnePeriod(new Date(sub.updated_at ?? sub.created_at), period);

     // Optional grace period
     const effectiveDue = new Date(candidateDue.getTime() + GRACE_DAYS * 24 * 3600 * 1000);

     const periodEnd = candidateDue;            // end is the due date (exclusive)
     const periodStart = subOnePeriod(candidateDue, period); // start is one period before

     return { now, period, dueDate: effectiveDue, periodStart, periodEnd };
}

export const makePaymentAction = async (
     payment: Payment
): Promise<{ success: boolean; error?: string }> => {
     const start = Date.now();
     const supabase = await useServerSideSupabaseAnonClient();

     try {
          // 1) Load subscription
          const sub = await getSubscription(supabase, payment.client, payment.subscription_plan);
          if (!sub) {
               throw new Error('No subscription found for this client & plan.');
          }

          // Reject states that shouldn't be charged
          if (['canceled', 'paused', 'expired'].includes(sub.status) || sub.expired) {
               throw new Error(`Subscription is ${sub.status}; payment is not allowed.`);
          }

          // 2) Validate payment amount matches subscription plan price
          const expectedAmount = sub.tblSubscriptionPlans.total_price_with_discounts;
          if (payment.total_paid !== expectedAmount) {
               throw new Error(`Payment amount ${payment.total_paid} does not match the subscription price ${expectedAmount}.`);
          }

          const { now, period, dueDate, periodStart, periodEnd } = resolveDueWindow(sub);

          // 2) Check if client has any previous payments to determine if this is the first payment
          const { data: allClientPayments, error: paymentsCheckError } = await supabase
               .from('tblInvoices')
               .select('id, status, created_at')
               .eq('client', payment.client)
               .eq('subscription_plan', payment.subscription_plan);

          if (paymentsCheckError) throw new Error(paymentsCheckError.message);

          const hasAnyPayments = allClientPayments && allClientPayments.length > 0;

          // If this is the first payment ever for this subscription, allow it immediately
          if (!hasAnyPayments) {
               // No previous payments - allow first payment
          } else {
               // Has previous payments - check for current billing period duplicates
               const currentPeriodPayments = allClientPayments.filter(invoice => {
                    const invoiceDate = new Date(invoice.created_at);
                    return invoiceDate >= periodStart &&
                         invoiceDate < periodEnd &&
                         PAID_STATUSES.includes(invoice.status as PaymentStatus);
               });

               if (currentPeriodPayments.length > 0) {
                    return {
                         success: false,
                         error: 'You have already made a payment for this billing period. Only one payment per billing cycle is allowed.'
                    };
               }

               // 3) Prevent payments too far in advance (only for non-first payments)
               // Only allow payment if current date is within the billing window or grace period
               const gracePeriodStart = new Date(periodStart.getTime() - (GRACE_DAYS * 24 * 3600 * 1000));

               if (isBefore(now, gracePeriodStart)) {
                    const nextAllowedDate = gracePeriodStart.toLocaleDateString();
                    return {
                         success: false,
                         error: `Payment is too early. You can make your next payment starting ${nextAllowedDate}.`
                    };
               }
          }

          // 4) Insert invoice
          const { data: invoice, error: insertErr } = await supabase
               .from('tblInvoices')
               .insert({
                    ...payment,
                    // Optional: add an idempotency/period key to be extra safe
                    // period_key: `${payment.client}:${payment.subscription_plan}:${periodStart.toISOString()}`,
                    is_recurring: true,
                    status: 'succeeded', // or whatever you set post-processor
                    // If you add these columns, include them too:
                    // billing_period_start: periodStart.toISOString(),
                    // billing_period_end: periodEnd.toISOString(),
               })
               .select('*')
               .single();

          if (insertErr) throw new Error(insertErr.message);

          // 5) Advance subscription: next_payment_date += 1 period
          const currentAnchor = sub.next_payment_date
               ? new Date(sub.next_payment_date)
               : periodEnd; // if no explicit date, use the end we just charged

          const newNextPayment = addOnePeriod(currentAnchor, period).toISOString();

          const { error: updateErr } = await supabase
               .from('tblClient_Subscription')
               .update({
                    updated_at: new Date().toISOString(),
                    next_payment_date: newNextPayment,
                    status: 'active',
                    expired: false,
               })
               .eq('id', sub.id); // or .eq('subscription_plan_id', payment.subscription_plan)

          if (updateErr) throw new Error(updateErr.message);

          await logServerAction({
               user_id: payment.client,
               action: 'Make Payment - Success',
               payload: { payment, invoice_id: invoice.id, billed_period: { start: periodStart, end: periodEnd } },
               status: 'success',
               error: '',
               duration_ms: Date.now() - start,
               type: 'action',
          });

          revalidatePath('/profile');
          return { success: true };
     } catch (e: any) {
          await logServerAction({
               user_id: payment.client,
               action: 'Make Payment - Error',
               payload: { payment },
               status: 'fail',
               error: e?.message ?? String(e),
               duration_ms: Date.now() - start,
               type: 'db',
          });
          return { success: false, error: e?.message ?? 'Unknown error' };
     }
};

export const readClientPayment = async (
     id: string
): Promise<{ success: boolean; data?: Payment; error?: string }> => {
     const start = Date.now();
     const supabase = await useServerSideSupabaseAnonClient();

     const { data, error } = await supabase.from('tblInvoices').select('*').eq('id', id).single();

     if (error) {
          await logServerAction({
               user_id: id,
               action: 'Read Client Payment - Error',
               payload: { id },
               status: 'fail',
               error: error.message,
               duration_ms: Date.now() - start,
               type: 'db',
          });
          return { success: false, error: error.message };
     }

     return { success: true, data };
};

export const deleteClientPayment = async (
     clientId: string,
     ids: string[]
): Promise<{ success: boolean; error?: string }> => {
     const start = Date.now();
     const supabase = await useServerSideSupabaseAnonClient();

     const { error } = await supabase.from('tblInvoices').delete().in('id', ids);

     if (error) {
          await logServerAction({
               user_id: clientId,
               action: 'Delete Client Payment - Error',
               payload: { ids },
               status: 'fail',
               error: error.message,
               duration_ms: Date.now() - start,
               type: 'db',
          });
          return { success: false, error: error.message };
     }

     await logServerAction({
          user_id: clientId,
          action: 'Delete Client Payment - Success',
          payload: { ids },
          status: 'success',
          error: '',
          duration_ms: Date.now() - start,
          type: 'action',
     });

     revalidatePath(`/profile/${clientId}`);
     return { success: true };
};

export const readAllClientPaymentsAction = async (
     clientId: string
): Promise<{ success: boolean; data?: Payment[]; error?: string }> => {
     const start = Date.now();
     const supabase = await useServerSideSupabaseAnonClient();

     const { data, error } = await supabase
          .from('tblInvoices')
          .select('*')
          .order('created_at', { ascending: false })
          .eq('client', clientId);

     if (error) {
          await logServerAction({
               user_id: clientId,
               action: 'Read All Client Payments - Error',
               payload: { clientId },
               status: 'fail',
               error: error.message,
               duration_ms: Date.now() - start,
               type: 'db',
          });
          return { success: false, error: error.message };
     }

     await logServerAction({
          user_id: clientId,
          action: 'Read All Client Payments - Success',
          payload: { clientId },
          status: 'success',
          error: '',
          duration_ms: Date.now() - start,
          type: 'db',
     });

     return { success: true, data };
};

export const readCurrencyByCodeAction = async (code: string): Promise<{ success: boolean; currency?: Currency; error?: string }> => {
     const supabase = await useServerSideSupabaseAnonClient();
     const { data, error } = await supabase.from('tblCurrency').select('*').eq('code', code).single();
     if (error) {
          return { success: false, error: error.message }
     }
     return { success: true, currency: data }
};

export const readCurrencyByCurrencyNumberAction = async (currencyNumber: number): Promise<{ success: boolean; currency?: Currency; error?: string }> => {
     const supabase = await useServerSideSupabaseAnonClient();
     const { data, error } = await supabase.from('tblCurrency').select('*').eq('number', currencyNumber).single();
     if (error) {
          return { success: false, error: error.message }
     }
     return { success: true, currency: data }
}

export const readAllCurrenciesAction = async (): Promise<{ success: boolean; currencies?: Currency[]; error?: string }> => {
     const supabase = await useServerSideSupabaseAnonClient();
     const { data, error } = await supabase.from('tblCurrencies').select('*');
     if (error) {
          return { success: false, error: error.message }
     }
     return { success: true, currencies: data }
}

export const readAllPaymentMethodsAction = async (): Promise<{ success: boolean; paymentMethods?: BaseEntity[]; error?: string }> => {

     const supabase = await useServerSideSupabaseAnonClient();
     const { data, error } = await supabase.from('tblPaymentMethods').select('*');
     if (error) {
          return { success: false, error: error.message }
     }

     return { success: true, paymentMethods: data }
}
