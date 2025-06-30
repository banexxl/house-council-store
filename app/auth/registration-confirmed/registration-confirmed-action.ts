'use client'

import { logClientAction } from "@/app/lib/client-logging";
import { createSupabaseBrowserClient } from "@/app/lib/supabase-client";

export const activateAccount = async (email: string): Promise<{ success: boolean, error?: string }> => {

     const supabase = await createSupabaseBrowserClient();

     const { data, error } = await supabase
          .from('tblClients')
          .update({ client_status: 'active' })
          .eq('email', email);

     if (error) {
          logClientAction({
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

     await logClientAction({
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
