'use server';

import { useServerSideSupabaseServiceRoleClient } from "@/lib/ss-supabase-service-role-client";
import { logoutUserAction } from "./logout-action";

export const deleteAccountAction = async (clientId: string, clientEmail: string): Promise<{ success: boolean, error?: string }> => {

     const supabase = await useServerSideSupabaseServiceRoleClient();
     const { data, error } = await supabase.auth.admin.deleteUser(clientId);

     if (error) {
          console.log('error', error);
          return { success: false, error: error.message }
     }

     await logoutUserAction();

     const { data: deleteClientData, error: deleteClientError } = await supabase
          .from('tblClients')
          .delete()
          .eq('email', clientEmail);
     if (deleteClientError) {
          console.log('error', deleteClientError);
          return { success: false, error: deleteClientError.message }
     }

     console.log('data', data);
     return { success: true }
}

export const readAccountByIdAction = async (clientId: string): Promise<{ success: boolean, error?: string }> => {

     const supabase = await useServerSideSupabaseServiceRoleClient();
     const { data, error } = await supabase
          .from('tblClients')
          .select('*')
          .eq('id', clientId)
          .single();

     if (error) {
          console.log('error', error);
          return { success: false, error: error.message }
     }

     console.log('data', data);
     return { success: true }
}