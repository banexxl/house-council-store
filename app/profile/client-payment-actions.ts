'use server';

import { revalidatePath } from 'next/cache';
import { useServerSideSupabaseServiceRoleClient } from '../lib/ss-supabase-service-role-client';
import { logServerAction } from '../lib/server-logging';
import { Payment } from '../types/payment';

export const createOrUpdateClientPayment = async (
     payment: Payment
): Promise<{
     success: boolean;
     data?: Payment;
     error?: string;
}> => {
     const start = Date.now();
     const supabase = await useServerSideSupabaseServiceRoleClient();
     let result;

     if (payment.id) {
          result = await supabase
               .from('tblInvoices')
               .update({
                    updated_at: new Date().toISOString(),
                    total_paid: payment.total_paid,
                    invoice_number: payment.invoice_number,
                    subscription_plan: payment.subscription_plan,
                    client: payment.client,
                    billing_information: payment.billing_information,
                    status: payment.status,
                    currency: payment.currency,
                    refunded_at: payment.refunded_at,
                    is_recurring: payment.is_recurring,
               })
               .eq('id', payment.id)
               .select()
               .single();
     } else {
          result = await supabase
               .from('tblInvoices')
               .insert({
                    id: payment.id,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                    total_paid: payment.total_paid,
                    invoice_number: payment.invoice_number,
                    subscription_plan: payment.subscription_plan,
                    client: payment.client,
                    billing_information: payment.billing_information,
                    status: payment.status,
                    currency: payment.currency,
                    refunded_at: payment.refunded_at,
                    is_recurring: payment.is_recurring,
               })
               .select()
               .single();
     }

     const { data, error } = result;
     if (error) {
          await logServerAction({
               user_id: payment.client,
               action: 'Create or Update Client Payment - Error',
               payload: { payment },
               status: 'fail',
               error: error.message,
               duration_ms: Date.now() - start,
               type: 'db',
          });
          return { success: false, error: error.message };
     }

     await logServerAction({
          user_id: payment.client,
          action: 'Create or Update Client Payment - Success',
          payload: { payment },
          status: 'success',
          error: '',
          duration_ms: Date.now() - start,
          type: 'db',
     });

     revalidatePath(`/profile/${payment.client}`);
     return { success: true, data };
};

export const readClientPayment = async (
     id: string
): Promise<{ success: boolean; data?: Payment; error?: string }> => {
     const start = Date.now();
     const supabase = await useServerSideSupabaseServiceRoleClient();

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
     const supabase = await useServerSideSupabaseServiceRoleClient();

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
     const supabase = await useServerSideSupabaseServiceRoleClient();

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
