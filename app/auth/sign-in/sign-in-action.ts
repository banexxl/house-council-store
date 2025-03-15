'use server';

import { verifyPassword } from '@/lib/bcrypt';
import { useServerSideSupabaseClient } from '@/lib/ss-supabase-anon-client';

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

     const supabase = await useServerSideSupabaseClient();

     const { data, error } = await supabase
          .from('tblClients')
          .select('password')
          .eq('email', values.email)
          .single();
     console.log('data iz tblClients', data);
     console.log('error iz tblClients', error);

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

     const isValid = await verifyPassword(values.password, data.password);
     console.log('isValid', isValid);

     if (!isValid) {
          return { success: false, error: { code: 'INVALID_PASSWORD', details: 'Invalid password', hint: 'Please correct the password', message: 'Invalid password' } };
     }

     const { data: signInSession, error: signInError } = await supabase.auth.signInWithPassword({
          email: values.email,
          password: values.password,
     });

     if (signInError) {
          return { success: false, error: { code: signInError.code!, details: signInError.message } };
     }

     return { success: true };
}


export const handleGoogleSignIn = async (): Promise<{ success: boolean; error?: any }> => {
     const supabase = await useServerSideSupabaseClient();

     // Initiate Google OAuth flow.
     const { data: authData, error: authError } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          // Optionally, set a redirect URL after sign in:
          options: {
               redirectTo: `${process.env.BASE_URL}/auth/callback`
          },
     });
     console.log('authData', authData);
     console.log('authError', authError);


     if (authError) {
          console.error('Error during Google sign in:', authError);
          return { success: false, error: authError };
     }

     // After OAuth the user is usually redirected and the session is set.
     // Here we try to retrieve the session.
     const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
     if (sessionError) {
          console.error('Error retrieving session:', sessionError);
          return { success: false, error: sessionError };
     }
     console.log('sessionData', sessionData);
     console.log('sessionError', sessionError);


     if (!sessionData.session) {
          console.error('No session available after Google sign in.');
          return { success: false, error: { message: 'No session found.' } };
     }

     const userEmail = sessionData.session.user.email;
     console.log('Authenticated user email:', userEmail);

     // Check if the user's email exists in tblClients.
     const { data, error } = await supabase
          .from('tblClients')
          .select('email')
          .eq('email', userEmail)
          .single();
     console.log('data', data);
     console.log('error', error);


     if (error) {
          console.error('Error checking email in database:', error);
          return { success: false, error };
     }

     if (!data) {
          console.log('Email not registered. Consider triggering a sign-up process.');
          // You could return an error or trigger a sign-up flow.
          return { success: false, error: { message: 'Email not registered. Please sign up.' } };
     }

     console.log('Email found in tblClients. Sign in successful.');
     return { success: true };
};


