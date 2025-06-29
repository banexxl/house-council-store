import { logServerAction } from "@/app/lib/server-logging";
import { useServerSideSupabaseServiceRoleClient } from "@/app/lib/ss-supabase-service-role-client";

export const activateAccount = async (email: string): Promise<{ success: boolean, error?: string }> => {

     const supabase = await useServerSideSupabaseServiceRoleClient();

     const { data, error } = await supabase
          .from('tblClients')
          .update({ client_status: 'active' })
          .eq('email', email);

     if (error) {
          logServerAction({
               user_id: null,
               action: 'Activate account - update error',
               payload: { email },
               status: 'fail',
               error: error.message,
               duration_ms: 0,
               type: 'auth'
          });
          return { success: false, error: error.message };
     }

     await logServerAction({
          user_id: null,
          action: 'Activate account - update success',
          payload: { email },
          status: 'success',
          error: '',
          duration_ms: 0,
          type: 'auth'
     });

     return { success: true };
}
