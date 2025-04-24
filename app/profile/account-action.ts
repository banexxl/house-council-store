'use server';

import { useServerSideSupabaseServiceRoleClient } from "@/app/lib/ss-supabase-service-role-client";
import { Client } from "../types/client";
import { revalidatePath } from "next/cache";
import { logServerAction } from "../lib/server-logging";


export const logoutUserAction = async (): Promise<string | null> => {
     const startTime = Date.now();
     const supabase = await useServerSideSupabaseServiceRoleClient();
     const userId = (await supabase.auth.getUser()).data.user?.id;
     const { error } = await supabase.auth.signOut();
     if (error) {
          await logServerAction({
               user_id: userId ? userId : '',
               action: 'Logout User - Error during supabase logout.',
               payload: {},
               status: 'fail',
               error: '',
               duration_ms: Date.now() - startTime
          })
          return error.message;
     }
     await logServerAction({
          user_id: userId ? userId : '',
          action: 'Logout User - Success.',
          payload: {},
          status: 'success',
          error: '',
          duration_ms: Date.now() - startTime
     })
     return null;
}

export const deleteAccountAction = async (clientId: string, clientEmail: string): Promise<{ success: boolean, error?: string }> => {

     const startTime = Date.now();

     const supabase = await useServerSideSupabaseServiceRoleClient();

     await logoutUserAction();

     const { data, error } = await supabase.auth.admin.deleteUser(clientId);

     if (error) {
          await logServerAction({
               user_id: clientId,
               action: 'Delete Account - Error for auth table of users.',
               payload: {},
               status: 'fail',
               error: error.message,
               duration_ms: Date.now() - startTime
          })
          return { success: false, error: error.message }
     }

     const { data: deleteClientData, error: deleteClientError } = await supabase
          .from('tblClients')
          .delete()
          .eq('email', clientEmail);
     if (deleteClientError) {

          await logServerAction({
               user_id: clientId,
               action: 'Delete Account - Error for tblClients table.',
               payload: {},
               status: 'fail',
               error: deleteClientError.message,
               duration_ms: Date.now() - startTime
          })
          return { success: false, error: deleteClientError.message }
     }

     await logServerAction({
          user_id: clientId,
          action: 'Delete Account - Success.',
          payload: {},
          status: 'success',
          error: '',
          duration_ms: Date.now() - startTime
     })

     return { success: true }
}

export const readAccountByEmailAction = async (email: string): Promise<{ client?: Client, error?: string }> => {

     const startTime = Date.now();

     const supabase = await useServerSideSupabaseServiceRoleClient();
     const userId = (await supabase.auth.getUser()).data.user?.id;
     const { data: client, error } = await supabase
          .from('tblClients')
          .select('*')
          .eq('email', email)
          .single();

     if (error) {

          await logServerAction({
               user_id: userId ? userId : '',
               action: 'Read Account - Error for tblClients table.',
               payload: { email },
               status: 'fail',
               error: error.message,
               duration_ms: Date.now() - startTime
          })
          return { error: error.message }
     }

     await logServerAction({
          user_id: client?.id,
          action: 'Read Account - Success.',
          payload: { email },
          status: 'success',
          error: '',
          duration_ms: Date.now() - startTime
     })

     return { client }
}

export const updateAccountAction = async (id: string, update: Partial<Client>): Promise<{ success: boolean, error?: string, data?: Client }> => {

     const startTime = Date.now();

     const supabase = await useServerSideSupabaseServiceRoleClient();

     const { data, error } = await supabase
          .from('tblClients')
          .update(update)
          .eq('id', id)
          .single();

     if (error) {

          await logServerAction({
               user_id: id,
               action: 'Update Account - Error for tblClients table.',
               payload: { update },
               status: 'fail',
               error: error.message,
               duration_ms: Date.now() - startTime
          })
          return { success: false, error: error.message }
     }

     await logServerAction({
          user_id: id,
          action: 'Update Account - Success.',
          payload: { update },
          status: 'success',
          error: '',
          duration_ms: Date.now() - startTime
     })

     revalidatePath('/profile');

     return { success: true, data }
}

