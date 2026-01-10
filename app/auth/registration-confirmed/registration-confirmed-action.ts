'use client'

import { logClientAction } from "@/app/lib/client-logging";
import { supabaseBrowserClient } from "@/app/lib/sb-browser-client";

export const activateAccount = async (email: string): Promise<{ success: boolean, error?: string }> => {

     const { data, error } = await supabaseBrowserClient
          .from('tblClients')
          .update({ client_status: 'active', is_verified: true })
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