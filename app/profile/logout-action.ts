'use server';

import { useServerSideSupabaseAnonClient } from '@/app/lib/ss-supabase-anon-client';
import { logServerAction } from '../lib/server-logging';

export const logoutUserAction = async (): Promise<string | null> => {
     const startTime = Date.now();
     const supabase = await useServerSideSupabaseAnonClient();
     const { error } = await supabase.auth.signOut();
     if (error) {
          await logServerAction({
               user_id: '',
               action: 'Logout User - Error.',
               payload: {},
               status: 'success',
               error: '',
               duration_ms: Date.now() - startTime
          })
          return error.message;
     }
     return null;
}