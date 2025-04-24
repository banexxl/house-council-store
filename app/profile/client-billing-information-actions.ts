'use server';

import { revalidatePath } from "next/cache"
import { useServerSideSupabaseServiceRoleClient } from "../lib/ss-supabase-service-role-client";
import { ClientBillingInformation } from "../types/billing-information";
import { logServerAction } from "../lib/server-logging";

export const createOrUpdateClientBillingInformation = async (clientBillingInformation: ClientBillingInformation, paymentMethodTypeId: string, billingInformationStatusId: string, billingInformationId?: string)
     : Promise<{ createOrUpdateClientBillingInformationSuccess: boolean, createOrUpdateClientBillingInformation?: ClientBillingInformation, createOrUpdateClientBillingInformationError?: any }> => {

     const startTime = Date.now();

     const supabase = await useServerSideSupabaseServiceRoleClient();
     let result;

     if (billingInformationId && billingInformationId !== "") {
          // Update existing client billing information
          result = await supabase
               .from('tblBillingInformation')
               .update({
                    updated_at: new Date().toISOString(),
                    full_name: clientBillingInformation.full_name,
                    billing_address: clientBillingInformation.billing_address,
                    card_number: clientBillingInformation.card_number,
                    cvc: clientBillingInformation.cvc,
                    expiration_date: clientBillingInformation.expiration_date,
                    payment_method_id: paymentMethodTypeId,
                    billing_status_id: billingInformationStatusId,
                    /////////////////////////////
                    cash_amount: Number(clientBillingInformation.cash_amount)
               })
               .eq('id', billingInformationId)
               .select()
               .single();
     } else {
          // Insert new client billing information
          result = await supabase
               .from('tblBillingInformation')
               .insert({
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                    client_id: clientBillingInformation.client_id,
                    full_name: clientBillingInformation.full_name,
                    billing_address: clientBillingInformation.billing_address,
                    card_number: clientBillingInformation.card_number,
                    cvc: clientBillingInformation.cvc,
                    expiration_date: clientBillingInformation.expiration_date,
                    payment_method_id: paymentMethodTypeId,
                    billing_status_id: billingInformationStatusId,
                    cash_amount: Number(clientBillingInformation.cash_amount)
               })
               .select()
               .single();
     }

     const { data, error } = result;

     if (error) {
          await logServerAction({
               user_id: clientBillingInformation.client_id,
               action: 'Create or Update Client Billing Information - Error.',
               payload: { clientBillingInformation, paymentMethodTypeId, billingInformationStatusId },
               status: 'fail',
               error: error.message,
               duration_ms: Date.now() - startTime,
               type: 'action'
          })
          return { createOrUpdateClientBillingInformationSuccess: false, createOrUpdateClientBillingInformationError: error };
     }

     await logServerAction({
          user_id: clientBillingInformation.client_id,
          action: 'Create or Update Client Billing Information - Success.',
          payload: { clientBillingInformation, paymentMethodTypeId, billingInformationStatusId },
          status: 'success',
          error: '',
          duration_ms: Date.now() - startTime,
          type: 'action'
     })

     revalidatePath(`/dashboard/clients/billing-information/${clientBillingInformation.client_id}`);
     return { createOrUpdateClientBillingInformationSuccess: true, createOrUpdateClientBillingInformation: data };
}

export const readClientBillingInformation = async (id: string): Promise<{ readClientBillingInformationSuccess: boolean, readClientBillingInformationData?: ClientBillingInformation, readClientBillingInformationError?: string }> => {

     const startTime = Date.now();

     const supabase = await useServerSideSupabaseServiceRoleClient();

     const { data, error } = await supabase
          .from('tblBillingInformation')
          .select('*')
          .eq('id', id)
          .single();

     if (error) {
          await logServerAction({
               user_id: id,
               action: 'Read Client Billing Information - Error.',
               payload: { id },
               status: 'fail',
               error: error.message,
               duration_ms: Date.now() - startTime,
               type: 'action'
          })
          return { readClientBillingInformationSuccess: false, readClientBillingInformationError: error.message };
     }

     await logServerAction({
          user_id: id,
          action: 'Read Client Billing Information - Success.',
          payload: { id },
          status: 'success',
          error: '',
          duration_ms: Date.now() - startTime,
          type: 'action'
     })
     return { readClientBillingInformationSuccess: true, readClientBillingInformationData: data ?? undefined };
}

export const deleteClientBillingInformation = async (ids: string[] | undefined): Promise<{ deleteClientBillingInformationSuccess: boolean, deleteClientBillingInformationError?: string }> => {

     const startTime = Date.now();

     if (ids?.length == 0) {
          return { deleteClientBillingInformationSuccess: false, deleteClientBillingInformationError: "No IDs provided" };
     }

     const supabase = await useServerSideSupabaseServiceRoleClient();

     const { error } = await supabase
          .from('tblBillingInformation')
          .delete()
          .in('id', ids!);

     if (error) {
          // await logServerAction({
          //      user_id: ids?.[0],
          //      action: 'Delete Client Billing Information - Error.',
          //      payload: { ids },
          //      status: 'fail',
          //      error: error.message,
          //      duration_ms: Date.now() - startTime
          // })
          return { deleteClientBillingInformationSuccess: false, deleteClientBillingInformationError: error.message };
     }

     revalidatePath('/dashboard/clients/billing-information');
     return { deleteClientBillingInformationSuccess: true };
}

export const readAllClientsBillingInformation = async (clientId: string): Promise<{ readAllClientBillingInformationSuccess: boolean, readAllClientBillingInformationData?: ClientBillingInformation[], readAllClientBillingInformationError?: string }> => {

     const startTime = Date.now();

     const supabase = await useServerSideSupabaseServiceRoleClient();

     const { data, error } = await supabase
          .from('tblBillingInformation')
          .select('*')
          .eq('client_id', clientId);

     if (error) {
          await logServerAction({
               user_id: clientId,
               action: 'Read All Client Billing Information - Error.',
               payload: { clientId },
               status: 'fail',
               error: error.message,
               duration_ms: Date.now() - startTime,
               type: 'action'
          })
          return { readAllClientBillingInformationSuccess: false, readAllClientBillingInformationError: error.message };
     }

     await logServerAction({
          user_id: clientId,
          action: 'Read All Client Billing Information - Success.',
          payload: { clientId },
          status: 'success',
          error: '',
          duration_ms: Date.now() - startTime,
          type: 'action'
     })

     return { readAllClientBillingInformationSuccess: true, readAllClientBillingInformationData: data ?? undefined };
}
