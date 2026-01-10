'use client';

import { logClientAction } from '@/app/lib/client-logging';
import { supabaseBrowserClient } from '@/app/lib/sb-browser-client';

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

export const checkClientExistsAndIsPermitted = async (
     values: SignInFormValues
): Promise<{ success: boolean; error?: ErrorType }> => {
     const start = Date.now()

     const { data, error } = await supabaseBrowserClient
          .from('tblPolarCustomers')
          .select('*')
          .eq('email', values.email)
          .single()

     if (data) {
          await logClientAction({
               user_id: null,
               action: 'Check if client exists and is permitted - client found',
               payload: { email: values.email },
               status: 'success',
               error: '',
               duration_ms: Date.now() - start,
               type: 'auth'
          })
          await logClientAction({
               user_id: data.id,
               action: 'Check if client exists and is permitted - Client status is restricted',
               payload: { email: values.email, status: data.client_status },
               status: 'fail',
               error: `Client is restricted with status ${data.client_status}`,
               duration_ms: Date.now() - start,
               type: 'auth'
          })
          let hint = `Your email is registered, but your account status "${data.client_status}" does not permit sign-in. Please contact support for assistance.`;
          switch (data.client_status) {
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
               success: false, error: {
                    code: 'ClientRestricted',
                    details: 'Your account is restricted',
                    hint,
               }
          }
     }

     const baseError = error
          ? {
               code: error.code,
               details: error.details,
               message: error.message,
               hint: error.hint || 'Please try again later',
          }
          : {
               code: 'UnknownError',
               details: 'An unknown error occurred',
               message: 'Unknown error',
               hint: 'Please try again later',
          }

     switch (error?.code) {
          case 'PGRST116':
               return {
                    success: false,
                    error: {
                         ...baseError,
                         hint: 'Please try registering first',
                         message: 'Invalid credentials',
                    },
               }
          case 'PGRS003':
               return {
                    success: false,
                    error: {
                         ...baseError,
                         hint: 'Please try resetting your password',
                         message: 'Invalid credentials',
                    },
               }
          default:
               return { success: false, error: baseError }
     }
}
