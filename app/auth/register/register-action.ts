'use server';

import { hashPassword } from '@/app/lib/bcrypt';
import { logServerAction } from '@/app/lib/server-logging';
import { useServerSideSupabaseServiceRoleClient } from '@/app/lib/ss-supabase-service-role-client';

export type RegisterFormValues = {
     contact_person: string;
     email: string;
     confirm_email: string;
     password: string;
     confirm_password: string;
     has_accepted_terms_and_conditions: boolean;
     has_accepted_privacy_policy: boolean;
     has_accepted_marketing: boolean;
};
export type ErrorType = {
     code: string;
     details: string;
     hint: string | null;
     message: string;
}
export const registerUser = async (values: RegisterFormValues): Promise<{ success: boolean, error?: ErrorType }> => {

     const hashedPassword = await hashPassword(values.password);

     if (!values.email || !values.password || !values.confirm_password || !values.contact_person) {
          return { success: false, error: { code: 'VALIDATION_ERROR', details: 'All fields are required', hint: null, message: 'All fields are required' } };
     }

     const supabase = await useServerSideSupabaseServiceRoleClient();

     if (values.password !== values.confirm_password) {
          logServerAction({
               user_id: null,
               action: 'Register user - passwords do not match',
               payload: { values },
               status: 'fail',
               error: 'Passwords do not match',
               duration_ms: 0
          })
          return { success: false, error: { code: 'PASSWORDS_DO_NOT_MATCH', details: 'Passwords do not match', hint: null, message: 'Passwords do not match' } };
     }

     const { data, error } = await supabase.from('tblClients').insert({
          name: values.contact_person,
          email: values.email,
          type: '3cb057f5-32c1-423b-a549-5c28a89c6907',
          client_status: '6f0f38ed-bd14-4f84-9718-1e37fe0b7027',
          role_id: '01054864-19ab-4d52-ba1e-59ab35858349',
          password: hashedPassword,
          has_accepted_terms_and_conditions: values.has_accepted_terms_and_conditions,
          has_accepted_privacy_policy: values.has_accepted_privacy_policy,
          has_accepted_marketing: values.has_accepted_marketing
     }).select().single();

     if (error) {
          logServerAction({
               user_id: null,
               action: 'Register user - insert error',
               payload: { values },
               status: 'fail',
               error: error.message,
               duration_ms: 0
          })
          if (error.code === '23505') {
               return { success: false, error: { code: '23505', details: 'Email already exists', hint: null, message: 'Email already exists' } };
          }
          return { success: false, error: { code: error.code, details: error.details, hint: error.hint, message: error.message } };
     }

     // If no error and data is returned, we want to add the user in the tblClients
     if (data) {
          await logServerAction({
               user_id: data.user?.id ?? null,
               action: 'Register user - insert success -> Signing up...',
               payload: { values },
               status: 'success',
               error: '',
               duration_ms: 0
          })
          const { error } = await supabase.auth.signUp({
               email: values.email,
               password: values.password,
               options: {
                    emailRedirectTo: `${process.env.BASE_URL}/auth/registration-confirmed`,
               }
          });

          if (error) {
               logServerAction({
                    user_id: null,
                    action: 'Register user - sign up error',
                    payload: { values },
                    status: 'fail',
                    error: error.message,
                    duration_ms: 0
               })
               if (error.code === '23505') {
                    return { success: false, error: { code: '23505', details: 'Email already exists', hint: null, message: 'Email already exists' } };
               }
          }
     }

     await logServerAction({
          user_id: data.user?.id ?? null,
          action: 'Register user - sign up success',
          payload: { values },
          status: 'success',
          error: '',
          duration_ms: 0
     })

     return { success: true };
}
