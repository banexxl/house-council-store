'use server';

import { useServerSideSupabaseServiceRoleClient } from "@/app/lib/ss-supabase-service-role-client";
import { logoutUserAction } from "./logout-action";
import { Client } from "../types/client";

export const deleteAccountAction = async (clientId: string, clientEmail: string): Promise<{ success: boolean, error?: string }> => {

     console.log('clientId', clientId);

     const supabase = await useServerSideSupabaseServiceRoleClient();

     await logoutUserAction();

     const { data, error } = await supabase.auth.admin.deleteUser(clientId);
     console.log('deleteAccountData', data);
     console.log('deleteAccountError', error);


     if (error) {
          console.log('error', error);
          return { success: false, error: error.message }
     }



     const { data: deleteClientData, error: deleteClientError } = await supabase
          .from('tblClients')
          .delete()
          .eq('email', clientEmail);
     if (deleteClientError) {
          console.log('error', deleteClientError);
          return { success: false, error: deleteClientError.message }
     }

     return { success: true }
}

export const readAccountByEmailAction = async (email: string): Promise<{ client?: Client, error?: string }> => {

     const supabase = await useServerSideSupabaseServiceRoleClient();

     const { data: client, error } = await supabase
          .from('tblClients')
          .select('*')
          .eq('email', email)
          .single();

     if (error) {
          return { error: error.message }
     }

     return { client }
}