'use server';

import { useServerSideSupabaseServiceRoleClient } from '@/app/lib/ss-supabase-service-role-client';
import { useServerSideSupabaseAnonClient } from '@/app/lib/ss-supabase-anon-client';
import { logServerAction } from '@/app/lib/server-logging';

export type ErrorType = {
     code: string;
     details: string;
     hint?: string;
     message?: string;
}

export async function checkUserPermissionServer(email: string): Promise<{ success: boolean; error?: ErrorType }> {
     const start = Date.now();
     const supabase = await useServerSideSupabaseAnonClient();

     const { data: customerData, error: customerError } = await supabase
          .from('tblPolarCustomers')
          .select('email, userId')
          .eq('email', email)
          // And non deleted customers only
          .is('deletedAt', null)
          .single();

     // If customer not found in tblPolarCustomers
     if (customerError) {
          await logServerAction({
               user_id: null,
               action: 'Check if client exists - not found in tblPolarCustomers',
               payload: { email },
               status: 'fail',
               error: customerError.message || '',
               duration_ms: Date.now() - start,
               type: 'auth'
          });

          if (customerError.code === 'PGRST116') {
               return {
                    success: false,
                    error: {
                         code: 'UserNotFound',
                         details: 'No account found with this email',
                         message: 'Invalid credentials',
                         hint: 'Please try registering first or check your email address',
                    },
               };
          }

          return {
               success: false,
               error: {
                    code: customerError.code || 'DatabaseError',
                    details: customerError.details || 'Database query failed',
                    message: customerError.message || 'Unknown error',
                    hint: 'Please try again later',
               },
          };
     }

     // If no userId, user setup is incomplete
     if (!customerData?.userId) {
          return {
               success: false,
               error: {
                    code: 'IncompleteSetup',
                    details: 'User setup incomplete',
                    message: 'Invalid credentials',
                    hint: 'Your account setup is incomplete. Please try registering again or contact support.',
               },
          };
     }

     // Get auth user with service role client
     const supabaseAdmin = await useServerSideSupabaseServiceRoleClient();
     const { data, error } = await supabaseAdmin.auth.admin.getUserById(customerData.userId);

     // If auth user found, check their status
     if (data?.user) {
          const userMetadata = data.user.user_metadata;
          const clientStatus = userMetadata?.client_status;

          await logServerAction({
               user_id: data.user.id,
               action: 'Check if client is permitted - checking status',
               payload: { email, clientStatus },
               status: 'success',
               error: '',
               duration_ms: Date.now() - start,
               type: 'db'
          });

          // If status exists and is not 'active', deny access
          if (clientStatus && clientStatus !== 'active') {
               let hint = `Your email is registered, but your account status "${clientStatus}" does not permit sign-in. Please contact support for assistance.`;
               switch (clientStatus) {
                    case 'inactive':
                         hint = 'Your account is inactive. Please contact support to activate your account.';
                         break;
                    case 'pending_activation':
                         hint = 'Your account is pending activation. Please check your email for activation instructions or contact support.';
                         break;
                    case 'suspended':
                         hint = 'Your account has been suspended. Please contact support for more information.';
                         break;
                    case 'archived':
                         hint = 'Your account has been archived and cannot be used. Please contact support if you believe this is an error.';
                         break;
               }
               return {
                    success: false,
                    error: {
                         code: 'ClientRestricted',
                         details: 'Your account is restricted',
                         hint,
                    }
               };
          }

          // User exists and is permitted
          return { success: true };
     }

     // Handle errors from getUserById
     if (error) {
          await logServerAction({
               user_id: null,
               action: 'Check if client exists - auth error',
               payload: { email },
               status: 'fail',
               error: error.message || '',
               duration_ms: Date.now() - start,
               type: 'auth'
          });

          // User not found in auth
          if (error.message?.includes('User not found') || error.status === 404) {
               return {
                    success: false,
                    error: {
                         code: 'AuthUserNotFound',
                         details: 'Authentication user not found',
                         message: 'Invalid credentials',
                         hint: 'Your account setup is incomplete. Please try registering again or contact support.',
                    },
               };
          }

          // Invalid user ID format
          if (error.message?.includes('Invalid') || error.message?.includes('invalid')) {
               return {
                    success: false,
                    error: {
                         code: 'InvalidUserId',
                         details: 'Invalid user identifier',
                         message: 'Invalid credentials',
                         hint: 'There was an issue with your account. Please contact support.',
                    },
               };
          }

          // Permission or other errors
          return {
               success: false,
               error: {
                    code: error.code || 'AuthError',
                    details: error.message || 'Authentication service error',
                    message: error.message || 'Unknown error',
                    hint: 'Unable to verify your account. Please try again later or contact support.',
               },
          };
     }

     // No data and no error - unexpected state
     await logServerAction({
          user_id: null,
          action: 'Check if client exists - unexpected state',
          payload: { email },
          status: 'fail',
          error: 'No data and no error from getUserById',
          duration_ms: Date.now() - start,
          type: 'auth'
     });

     return {
          success: false,
          error: {
               code: 'UnknownError',
               details: 'An unknown error occurred',
               message: 'Unknown error',
               hint: 'Please try again later',
          },
     };
}
