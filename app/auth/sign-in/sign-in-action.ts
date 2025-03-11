'use server';

import { verifyPassword } from '@/lib/bcrypt';
import { useServerSideSupabaseClient } from '@/lib/ss-supabase-service-user-client';

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

