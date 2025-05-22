'use server';

import { logServerAction } from '@/app/lib/server-logging';
import { useServerSideSupabaseAnonClient } from '@/app/lib/ss-supabase-anon-client';
import { redirect } from 'next/navigation';

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
                    return { success: false, error: { code: error.code, details: error.details, hint: 'Please try registering first', message: 'Email not found' } };
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
                    return { success: false, error: { code: error.code, details: error.details, hint: 'Please try resetting your password', message: 'Password is incorrect' } };
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

export const handleGoogleSignIn = async (): Promise<{ success: boolean; error?: any }> => {

     const start = Date.now();

     const supabase = await useServerSideSupabaseAnonClient();
     // Initiate Google OAuth flow.
     const { data: authData, error: authError } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          // Optionally, set a redirect URL after sign in:
          options: {
               redirectTo: `${process.env.BASE_URL}/auth/callback`
          },
     });
     console.log('google auth data', authData)
     console.log('google auth error', authError);

     if (authError) {
          await logServerAction({
               user_id: null,
               action: 'Signing in with Google failed',
               payload: {},
               status: 'fail',
               error: authError ? authError.message : 'Unknown error',
               duration_ms: Date.now() - start,
               type: 'auth'
          })
          return { success: false, error: authError };
     } else {
          if (authData.url) {
               await logServerAction({
                    user_id: null,
                    action: 'Signed in with Google',
                    payload: { authData },
                    status: 'success',
                    error: '',
                    duration_ms: Date.now() - start,
                    type: 'auth'
               })
               redirect(authData.url);
          } else {
               return { success: false, error: { message: 'Redirect URL is null.' } };
          }
     }
};


