'use server';

import { useServerSideSupabaseServiceRoleClient } from "@/app/lib/ss-supabase-service-role-client";
import { Client } from "../types/client";
import { revalidatePath } from "next/cache";
import { logServerAction } from "../lib/server-logging";
import { Payment } from "../types/payment";
import { SubscriptionPlan } from "../types/subscription-plan";
import { ClientBillingInformation } from "../types/billing-information";
import { Currency } from "../types/currency";
import { BaseEntity } from "../types/base-entity";

export const makePaymentAction = async (
     payment: Payment,
): Promise<{ success: boolean; error?: string }> => {

     const start = Date.now();
     const supabase = await useServerSideSupabaseServiceRoleClient();
     console.log('payment', payment);

     const { data, error } = await supabase.from('tblPaymentInvoices').insert(payment).select('*').single();
     console.log('error', error);
     console.log('data', data);

     if (error) {
          await logServerAction({
               user_id: payment.client,
               action: 'Make Payment - Error',
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
          action: 'Make Payment - Success',
          payload: { payment },
          status: 'success',
          error: '',
          duration_ms: Date.now() - start,
          type: 'action',
     });

     revalidatePath('/profile');
     return { success: true };
};

export const readCurrencyByCodeAction = async (code: string): Promise<{ success: boolean; currency?: Currency; error?: string }> => {
     const supabase = await useServerSideSupabaseServiceRoleClient();
     const { data, error } = await supabase.from('tblCurrency').select('*').eq('code', code).single();
     if (error) {
          return { success: false, error: error.message }
     }
     return { success: true, currency: data }
};

export const readCurrencyByCurrencyNumberAction = async (currencyNumber: number): Promise<{ success: boolean; currency?: Currency; error?: string }> => {
     const supabase = await useServerSideSupabaseServiceRoleClient();
     const { data, error } = await supabase.from('tblCurrency').select('*').eq('number', currencyNumber).single();
     if (error) {
          return { success: false, error: error.message }
     }
     return { success: true, currency: data }
}

export const readAllCurrenciesAction = async (): Promise<{ success: boolean; currencies?: Currency[]; error?: string }> => {
     const supabase = await useServerSideSupabaseServiceRoleClient();
     const { data, error } = await supabase.from('tblCurrencies').select('*');
     if (error) {
          return { success: false, error: error.message }
     }
     return { success: true, currencies: data }
}

export const readAllPaymentMethodsAction = async (): Promise<{ success: boolean; paymentMethods?: BaseEntity[]; error?: string }> => {

     const supabase = await useServerSideSupabaseServiceRoleClient();
     const { data, error } = await supabase.from('tblPaymentMethods').select('*');
     if (error) {
          return { success: false, error: error.message }
     }

     return { success: true, paymentMethods: data }
}
