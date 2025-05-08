'use server';

import { revalidatePath } from "next/cache"
import { useServerSideSupabaseServiceRoleClient } from "../lib/ss-supabase-service-role-client";
import { ClientBillingInformation } from "../types/billing-information";
import { logServerAction } from "../lib/server-logging";

export const createOrUpdateClientBillingInformation = async (clientBillingInformation: ClientBillingInformation)
     : Promise<{ createOrUpdateClientBillingInformationSuccess: boolean, createOrUpdateClientBillingInformationData?: ClientBillingInformation, createOrUpdateClientBillingInformationError?: any }> => {

     const startTime = Date.now();

     const supabase = await useServerSideSupabaseServiceRoleClient();
     let result;

     if (clientBillingInformation.id && clientBillingInformation.id && clientBillingInformation.id !== "") {
          // Update existing client billing information
          result = await supabase
               .from('tblBillingInformation')
               .update({
                    updated_at: new Date().toISOString(),
                    contact_person: clientBillingInformation.contact_person,
                    billing_address: clientBillingInformation.billing_address,
                    card_number: clientBillingInformation.card_number,
                    cvc: clientBillingInformation.cvc,
                    expiration_date: clientBillingInformation.expiration_date,
                    payment_method_id: clientBillingInformation.payment_method_id,
                    billing_status_id: clientBillingInformation.billing_status_id,
                    default_payment_method: clientBillingInformation.default_payment_method,
                    /////////////////////////////
                    cash_amount: Number(clientBillingInformation.cash_amount)
               })
               .eq('id', clientBillingInformation.id)
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
                    contact_person: clientBillingInformation.contact_person,
                    billing_address: clientBillingInformation.billing_address,
                    card_number: clientBillingInformation.card_number,
                    cvc: clientBillingInformation.cvc,
                    expiration_date: clientBillingInformation.expiration_date,
                    payment_method_id: clientBillingInformation.payment_method_id,
                    billing_status_id: clientBillingInformation.billing_status_id,
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
               payload: { clientBillingInformation },
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
          payload: { clientBillingInformation },
          status: 'success',
          error: '',
          duration_ms: Date.now() - startTime,
          type: 'action'
     })

     revalidatePath(`/profile`);
     return { createOrUpdateClientBillingInformationSuccess: true, createOrUpdateClientBillingInformationData: data };
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
               type: 'db'
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
          type: 'db'
     })
     return { readClientBillingInformationSuccess: true, readClientBillingInformationData: data ?? undefined };
}

export const deleteClientBillingInformation = async (client_id: string, ids: string[] | undefined): Promise<{ deleteClientBillingInformationSuccess: boolean, deleteClientBillingInformationError?: any }> => {

     const startTime = Date.now();

     if (ids?.length == 0) {
          return { deleteClientBillingInformationSuccess: false, deleteClientBillingInformationError: "No IDs provided" };
     }

     const supabase = await useServerSideSupabaseServiceRoleClient();
     console.log("deleteClientBillingInformation", { client_id, ids });

     const { error } = await supabase
          .from('tblBillingInformation')
          .delete()
          .in('id', ids!);

     if (error) {
          await logServerAction({
               user_id: client_id,
               action: 'Delete Client Billing Information - Error.',
               payload: { ids },
               status: 'fail',
               error: error.message,
               duration_ms: Date.now() - startTime,
               type: 'action'
          })
          return { deleteClientBillingInformationSuccess: false, deleteClientBillingInformationError: error.message };
     }

     await logServerAction({
          user_id: client_id,
          action: 'Delete Client Billing Information - Success.',
          payload: { ids },
          status: 'success',
          error: '',
          duration_ms: Date.now() - startTime,
          type: 'action'
     })

     revalidatePath('/profile');
     return { deleteClientBillingInformationSuccess: true };
}

export const readAllClientsBillingInformation = async (clientId: string): Promise<{ readAllClientBillingInformationSuccess: boolean, readAllClientBillingInformationData?: ClientBillingInformation[], readAllClientBillingInformationError?: string }> => {

     const startTime = Date.now();

     const supabase = await useServerSideSupabaseServiceRoleClient();

     const { data, error } = await supabase
          .from('tblBillingInformation')
          .select('*')
          .order('created_at', { ascending: false })
          .eq('client_id', clientId);

     if (error) {
          await logServerAction({
               user_id: clientId,
               action: 'Read All Client Billing Information - Error.',
               payload: { clientId },
               status: 'fail',
               error: error.message,
               duration_ms: Date.now() - startTime,
               type: 'db'
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
          type: 'db'
     })

     return { readAllClientBillingInformationSuccess: true, readAllClientBillingInformationData: data ?? undefined };
}

export const makeCardDefault = async (clientId: string, clientBillingInformationID: string): Promise<{ makeCardDefaultSuccess: boolean; makeCardDefaultError?: string }> => {

     const startTime = Date.now();
     const supabase = await useServerSideSupabaseServiceRoleClient();

     // Step 1: Set all cards for this client to default_payment_method = false
     const { error: updateError } = await supabase
          .from('tblBillingInformation')
          .update({ default_payment_method: false })
          .eq('client_id', clientId);

     if (updateError) {
          await logServerAction({
               user_id: clientId,
               action: 'Make Card Default - Update Error.',
               payload: clientBillingInformationID,
               status: 'fail',
               error: updateError.message,
               duration_ms: Date.now() - startTime,
               type: 'db',
          });
          return { makeCardDefaultSuccess: false, makeCardDefaultError: updateError.message };
     }

     // Step 2: Set the selected billing info to default_payment_method = true
     const { error: setDefaultError } = await supabase
          .from('tblBillingInformation')
          .update({ default_payment_method: true })
          .eq('id', clientBillingInformationID)
          .eq('client_id', clientId);

     if (setDefaultError) {
          await logServerAction({
               user_id: clientId,
               action: 'Make Card Default - Set Default Error.',
               payload: { id: clientBillingInformationID },
               status: 'fail',
               error: setDefaultError.message,
               duration_ms: Date.now() - startTime,
               type: 'db',
          });
     }

     await logServerAction({
          user_id: clientId,
          action: 'Make Card Default - Success.',
          payload: { id: clientBillingInformationID },
          status: 'success',
          error: '',
          duration_ms: Date.now() - startTime,
          type: 'action',
     });

     revalidatePath(`/profile`);

     return { makeCardDefaultSuccess: true };
};


