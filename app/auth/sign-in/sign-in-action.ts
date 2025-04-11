'use server';

import { verifyPassword } from '@/app/lib/bcrypt';
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

export const signInUser = async (values: SignInFormValues): Promise<{ success: boolean, error?: ErrorType }> => {

     const supabase = await useServerSideSupabaseAnonClient();

     const { data, error } = await supabase
          .from('tblClients')
          .select('password')
          .eq('email', values.email)
          .single();

     if (error) {
          switch (error.code) {
               case 'PGRST116':
                    return { success: false, error: { code: error.code, details: error.details, hint: 'Please try registering first', message: 'Email not found' } };
               case 'PGRS003':
                    return { success: false, error: { code: error.code, details: error.details, hint: 'Please try resetting your password', message: 'Password is incorrect' } };
               default:
                    return { success: false, error: { code: error.code, details: error.details, hint: error.hint, message: error.message } };
          }
     }

     // const isValid = await verifyPassword(values.password, data.password);
     // console.log('values.password', values.password);
     // console.log('data.password', data.password);
     // console.log('isValid', isValid);

     // if (!isValid) {
     //      return { success: false, error: { code: 'INVALID_PASSWORD', details: 'Invalid password', hint: 'Please correct the password', message: 'Invalid password' } };
     // }

     const { data: signInSession, error: signInError } = await supabase.auth.signInWithPassword({
          email: values.email,
          password: values.password,
     });
     console.log('signInSession', signInSession);
     console.log('signInError', signInError);


     if (signInError) {
          return { success: false, error: { code: signInError.code!, details: signInError.message } };
     }

     return { success: true };
}

export const handleGoogleSignIn = async (): Promise<{ success: boolean; error?: any }> => {
     const supabase = await useServerSideSupabaseAnonClient();

     // Initiate Google OAuth flow.
     const { data: authData, error: authError } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          // Optionally, set a redirect URL after sign in:
          options: {
               redirectTo: `${process.env.BASE_URL}/auth/callback`
          },
     });
     console.log('Google authData', authData);
     console.log('Google authError', authError);

     if (!authError == null) {
          console.error('Error during Google sign in:', authError);
          return { success: false, error: authError };
     } else {
          if (authData.url) {
               redirect(authData.url);
          } else {
               return { success: false, error: { message: 'Redirect URL is null.' } };
          }
     }
};


