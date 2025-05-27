'use server';

import { logServerAction } from '@/app/lib/server-logging';
import { useServerSideSupabaseAnonClient } from '@/app/lib/ss-supabase-anon-client';

export type SignInFormValues = {
     email: string;
     password: string;
};

export type ErrorType = {
     code: string;
     details: string;
     hint?: string;
     message?: string;
}

export const checkClientExists = async (values: SignInFormValues): Promise<{ success: boolean, error?: ErrorType }> => {

     const start = Date.now();

     const supabase = await useServerSideSupabaseAnonClient();

     const { data, error } = await supabase
          .from('tblClients')
          .select('email')
          .eq('email', values.email)
          .single();

     if (data) {
          await logServerAction({
               user_id: null,
               action: 'Signing in with email and password - user found in tblClients',
               payload: JSON.stringify(values),
               status: 'success',
               error: '',
               duration_ms: Date.now() - start,
               type: 'auth'
          })

          return { success: true };
     }

     if (error) {
          switch (error.code) {
               case 'PGRST116':
                    await logServerAction({
                         user_id: null,
                         action: 'Signing in with email and password failed',
                         payload: JSON.stringify(values),
                         status: 'fail',
                         error: error.message,
                         duration_ms: Date.now() - start,
                         type: 'auth'
                    })
                    return { success: false, error: { code: error.code, details: error.details, hint: 'Please try registering first', message: 'Invalid credentials' } };
               case 'PGRS003':
                    await logServerAction({
                         user_id: null,
                         action: 'Signing in with email and password failed',
                         payload: JSON.stringify(values),
                         status: 'fail',
                         error: error.message,
                         duration_ms: Date.now() - start,
                         type: 'auth'
                    })
                    return { success: false, error: { code: error.code, details: error.details, hint: 'Please try resetting your password', message: 'Invalid credentials' } };
               default:
                    await logServerAction({
                         user_id: null,
                         action: 'Signing in with email and password failed',
                         payload: JSON.stringify(values),
                         status: 'fail',
                         error: error.message,
                         duration_ms: Date.now() - start,
                         type: 'auth'
                    })
                    return { success: false, error: { code: error.code, details: error.details, hint: error.hint, message: error.message } };
          }
     }

     return { success: false, error: { code: 'UnknownError', details: 'An unknown error occurred', hint: 'Please try again later', message: 'Unknown error' } };
}