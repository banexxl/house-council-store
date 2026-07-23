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

// Helper function to safely serialize error objects
function safeSerializeError(err: any): { code: string; message: string; details: string } {
     if (!err) {
          return { code: 'UnknownError', message: 'Unknown error', details: 'An unknown error occurred' };
     }

     const code = String(err.code || err.name || 'Error').substring(0, 100);
     const message = String(err.message || 'Unknown').substring(0, 500);
     const details = String(err.details || err.detail || message).substring(0, 500);

     return { code, message, details };
}

export async function checkUserPermissionServer(email: string): Promise<{ success: boolean; error?: ErrorType }> {

     try {
          const supabase = await useServerSideSupabaseAnonClient();

          const { data: tenantData, error: tenantError } = await supabase
               .from('tblTenants')
               .select('email')
               .eq('email', email)
               .maybeSingle();


          if (tenantData?.email) {
               return {
                    success: false,
                    error: {
                         code: 'EmailInUse',
                         details: 'Email already in use',
                         message: 'This email is already in use',
                         hint: 'Try signing in or resetting your password instead.',
                    },
               };
          }

          const { data: customerData, error: customerError } = await supabase
               .from('tblPolarCustomers')
               .select('email, externalId')
               .eq('email', email)
               .is('deletedAt', null)
               .single();

          if (customerError) {
               const serializedError = safeSerializeError(customerError);
               if (serializedError.code === 'PGRST116') {
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
                         code: serializedError.code || 'DatabaseError',
                         details: serializedError.details || 'Database query failed',
                         message: serializedError.message || 'Unknown error',
                         hint: 'Please try again later',
                    },
               };
          }

          if (!customerData?.externalId) {
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

          const supabaseAdmin = await useServerSideSupabaseServiceRoleClient();
          const { data, error } = await supabaseAdmin.auth.admin.getUserById(customerData.externalId);

          if (data?.user) {
               const userMetadata = data.user.user_metadata;
               const clientStatus = userMetadata?.client_status;

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

               return { success: true };
          }

          if (error) {
               const serializedError = safeSerializeError(error);
               if (serializedError.message?.includes('User not found') || serializedError.code === '404') {
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

               if (serializedError.message?.includes('Invalid') || serializedError.message?.includes('invalid')) {
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

               return {
                    success: false,
                    error: {
                         code: serializedError.code || 'AuthError',
                         details: serializedError.details || 'Authentication service error',
                         message: serializedError.message || 'Unknown error',
                         hint: 'Unable to verify your account. Please try again later or contact support.',
                    },
               };
          }

          return {
               success: false,
               error: {
                    code: 'UnknownError',
                    details: 'An unknown error occurred',
                    message: 'Unknown error',
                    hint: 'Please try again later',
               },
          };
     } catch (err) {
          const errorMessage = err instanceof Error ? err.message : String(err);
          const errorStack = err instanceof Error ? err.stack : '';
          return {
               success: false,
               error: {
                    code: 'ServerError',
                    details: 'An unexpected error occurred on the server',
                    message: errorMessage,
                    hint: 'Please try again later or contact support.',
               },
          };
     }
}
