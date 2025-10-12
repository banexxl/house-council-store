'use server';

import { revalidatePath } from 'next/cache';
import { useServerSideSupabaseServiceRoleClient } from '../lib/ss-supabase-service-role-client';
import { logServerAction } from '../lib/server-logging';
import { Payment } from '../types/payment';
import { Currency } from '../types/currency';
import { BaseEntity } from '../types/base-entity';

export const makePaymentAction = async (
     payment: Payment,
): Promise<{ success: boolean; error?: string }> => {

     const start = Date.now();
     const supabase = await useServerSideSupabaseServiceRoleClient();
     const { data, error } = await supabase.from('tblInvoices').insert(payment).select('*').single();

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
