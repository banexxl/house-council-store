'use server';

import { sendSuccessfullClientRegistrationToSupport } from '@/app/lib/node-mailer';
import { polar } from '@/app/lib/polar';
import { logServerAction } from '@/app/lib/server-logging';
import { useServerSideSupabaseAnonClient } from '@/app/lib/ss-supabase-anon-client';
import { useServerSideSupabaseServiceRoleClient } from '@/app/lib/ss-supabase-service-role-client';

export type RegisterFormValues = {
     contact_person: string;
     email: string;
     confirm_email: string;
     password: string;
     confirm_password: string;
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

     const supabaseAdmin = await useServerSideSupabaseServiceRoleClient();
     const supabase = await useServerSideSupabaseAnonClient();

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


     // First, sign up the user with Supabase Auth
     const { data: signUpData, error: signUpError } = await supabaseAdmin.auth.signUp({
          email: values.email,
          password: values.password,
          options: {
               emailRedirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/auth/registration-confirmation`,
          }
     });

     if (signUpError) {
          await logServerAction({
               user_id: null,
               action: 'Register user - sign up error',
               payload: { values },
               status: 'fail',
               error: signUpError.message,
               duration_ms: 0,
               type: 'auth'
          });
          if (signUpError.code === '23505') {
               return { success: false, error: { code: '23505', details: 'Email already exists', hint: null, message: 'Email already exists' } };
          }
          return {
               success: false,
               error: {
                    code: signUpError.code ? String(signUpError.code) : 'UNKNOWN',
                    details: signUpError.message || 'Unknown error',
                    hint: null,
                    message: signUpError.message || 'Unknown error'
               }
          };
     }

     // If sign up is successful, insert into tblPolarCustomers with user_id
     const userId = signUpData?.user?.id ?? null;
     const { data, error } = await supabase.from('tblPolarCustomers').insert({
          name: values.contact_person,
          email: values.email,
     }).select().single();

     if (error) {
          await logServerAction({
               user_id: userId,
               action: 'Register user - insert error',
               payload: { values },
               status: 'fail',
               error: error.message,
               duration_ms: 0,
               type: 'auth'
          });
          if (error.code === '23505') {
               return { success: false, error: { code: '23505', details: 'Email already exists', hint: null, message: 'Email already exists' } };
          }
          return { success: false, error: { code: error.code, details: error.details, hint: error.hint, message: error.message } };
     }

     if (signUpData) {
          const { data: connectionTableData, error: connectionTableError } = await supabase.from('tblPolarCustomer_AuthID').insert({
               authId: userId,
               customerId: data.id,
          });
          console.log('Inserted into tblPolarCustomer_AuthID:', connectionTableData, connectionTableError);

          if (connectionTableError) {
               //Rollback
               await supabase.from('tblPolarCustomers').delete().eq('id', data.id);
               await supabaseAdmin.auth.admin.deleteUser(userId!);
          }
          try {
               await polar.customers.create({
                    email: values.email,
                    name: values.contact_person,
               });
          } catch (polarError) {
               // Rollback: Delete the Polar customer record
               if (data?.id) {
                    await supabase.from('tblPolarCustomers').delete().eq('id', data.id);
               }

               // Rollback: Delete the auth user
               if (userId) {
                    await supabaseAdmin.auth.admin.deleteUser(userId);
               }

               await logServerAction({
                    user_id: userId,
                    action: 'Register user - Polar customer creation failed',
                    payload: { values },
                    status: 'fail',
                    error: polarError instanceof Error ? polarError.message : 'Unknown error',
                    duration_ms: 0,
                    type: 'auth'
               });

               return {
                    success: false,
                    error: {
                         code: 'POLAR_ERROR',
                         details: 'Failed to create customer account',
                         hint: null,
                         message: 'Failed to create customer account'
                    }
               };
          }
          await sendSuccessfullClientRegistrationToSupport(values.email, values.contact_person);
     }

     await logServerAction({
          user_id: userId,
          action: 'Register user - sign up & insert success',
          payload: { values },
          status: 'success',
          error: '',
          duration_ms: 0,
          type: 'auth'
     });

     return { success: true };
}
