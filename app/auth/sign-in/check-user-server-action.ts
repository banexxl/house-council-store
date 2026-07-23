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
     const start = Date.now();

     try {
          console.log('[checkUserPermissionServer] Starting for email:', email);
          const supabase = await useServerSideSupabaseAnonClient();
          console.log('[checkUserPermissionServer] Supabase client created');

          const { data: tenantData, error: tenantError } = await supabase
               .from('tblTenants')
               .select('email')
               .eq('email', email)
               .maybeSingle();

          console.log('[checkUserPermissionServer] tblTenants query result:', {
               tenantErrorMsg: tenantError?.message,
               tenantErrorCode: tenantError?.code,
               foundTenant: !!tenantData?.email
          });

          if (tenantError) {
               console.log('[checkUserPermissionServer] Tenant error occurred, logging and continuing');
               await logServerAction({
                    user_id: null,
                    action: 'Check if email exists - tblTenants lookup failed',
                    payload: { email },
                    status: 'fail',
                    error: tenantError.message || '',
                    duration_ms: Date.now() - start,
                    type: 'auth'
               });
          }

          await logServerAction({
               user_id: null,
               action: 'Check if email exists - tblTenants lookup result',
               payload: { email, found: Boolean(tenantData?.email) },
               status: 'success',
               error: '',
               duration_ms: Date.now() - start,
               type: 'auth'
          });

          if (tenantData?.email) {
               await logServerAction({
                    user_id: null,
                    action: 'Check if email exists - EmailInUse',
                    payload: { email },
                    status: 'fail',
                    error: 'Email already in use',
                    duration_ms: Date.now() - start,
                    type: 'auth'
               });
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

          console.log('[checkUserPermissionServer] Querying tblPolarCustomers');
          const { data: customerData, error: customerError } = await supabase
               .from('tblPolarCustomers')
               .select('email, externalId')
               .eq('email', email)
               .is('deletedAt', null)
               .single();

          console.log('[checkUserPermissionServer] tblPolarCustomers query result:', {
               customerErrorMsg: customerError?.message,
               customerErrorCode: customerError?.code,
               foundCustomer: !!customerData?.email
          });

          if (customerError) {
               const serializedError = safeSerializeError(customerError);
               console.log('[checkUserPermissionServer] Customer error occurred:', serializedError);

               await logServerAction({
                    user_id: null,
                    action: 'Check if client exists - not found in tblPolarCustomers',
                    payload: { email },
                    status: 'fail',
                    error: serializedError.message,
                    duration_ms: Date.now() - start,
                    type: 'auth'
               });

               if (serializedError.code === 'PGRST116') {
                    console.log('[checkUserPermissionServer] Customer not found (PGRST116)');
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

               console.log('[checkUserPermissionServer] Database error:', serializedError);
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
               await logServerAction({
                    user_id: null,
                    action: 'Check if client exists - missing externalId',
                    payload: { email, externalId: customerData?.externalId ?? null },
                    status: 'fail',
                    error: 'Missing externalId',
                    duration_ms: Date.now() - start,
                    type: 'auth'
               });
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

          console.log('[checkUserPermissionServer] Getting auth user, externalId:', customerData.externalId);
          const supabaseAdmin = await useServerSideSupabaseServiceRoleClient();
          const { data, error } = await supabaseAdmin.auth.admin.getUserById(customerData.externalId);
          console.log('[checkUserPermissionServer] Auth user query result:', { error: error?.message, hasUser: !!data?.user });

          if (data?.user) {
               const userMetadata = data.user.user_metadata;
               const clientStatus = userMetadata?.client_status;

               await logServerAction({
                    user_id: data.user.id,
                    action: 'User successfully authenticated.',
                    payload: { email, clientStatus },
                    status: 'success',
                    error: '',
                    duration_ms: Date.now() - start,
                    type: 'auth'
               });

               if (clientStatus && clientStatus !== 'active') {
                    await logServerAction({
                         user_id: data.user.id,
                         action: 'User restricted by client_status',
                         payload: { email, clientStatus },
                         status: 'fail',
                         error: 'Client status not active',
                         duration_ms: Date.now() - start,
                         type: 'auth'
                    });
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
               console.log('[checkUserPermissionServer] Auth error occurred:', serializedError);

               await logServerAction({
                    user_id: null,
                    action: 'Check if client exists - auth error',
                    payload: { email },
                    status: 'fail',
                    error: serializedError.message,
                    duration_ms: Date.now() - start,
                    type: 'auth'
               });

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
     } catch (err) {
          console.error('[checkUserPermissionServer] Unexpected error caught:', err);
          const errorMessage = err instanceof Error ? err.message : String(err);
          const errorStack = err instanceof Error ? err.stack : '';
          console.error('[checkUserPermissionServer] Error stack:', errorStack);

          await logServerAction({
               user_id: null,
               action: 'checkUserPermissionServer - Unexpected error caught',
               payload: { email, error: errorMessage, stack: errorStack },
               status: 'fail',
               error: errorMessage,
               duration_ms: Date.now() - start,
               type: 'auth'
          });

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
