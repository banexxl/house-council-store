'use server';

import { hashPassword } from '@/app/lib/bcrypt';
import { sendSuccessfullClientRegistrationToSupport } from '@/app/lib/node-mailer';
import { logServerAction } from '@/app/lib/server-logging';
import { useServerSideSupabaseServiceRoleClient } from '@/app/lib/ss-supabase-service-role-client';

export type RegisterFormValues = {
     contact_person: string;
     name: string;
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
               duration_ms: 0,
               type: 'auth'
          })
          return { success: false, error: { code: 'PASSWORDS_DO_NOT_MATCH', details: 'Passwords do not match', hint: null, message: 'Passwords do not match' } };
     }

     const { data, error } = await supabase.from('tblClients').insert({
          contact_person: values.contact_person,
          name: values.name,
          email: values.email,
          type: values.name.replace(/\s/g, '') === '' ? 'individual' : 'business',
          client_status: 'active',
          client_role: 'client',
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
               duration_ms: 0,
               type: 'auth'
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
               duration_ms: 0,
               type: 'auth'
          })
          const { data: signUpData, error } = await supabase.auth.signUp({
               email: values.email,
               password: values.password,
               options: {
                    emailRedirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/auth/registration-confirmed`,
               }
          });

          if (signUpData) {
               await sendSuccessfullClientRegistrationToSupport(values.email, values.contact_person);
          }

          if (error) {
               logServerAction({
                    user_id: null,
                    action: 'Register user - sign up error',
                    payload: { values },
                    status: 'fail',
                    error: error.message,
                    duration_ms: 0,
                    type: 'auth'
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
          duration_ms: 0,
          type: 'auth'
     })

     return { success: true };
}
