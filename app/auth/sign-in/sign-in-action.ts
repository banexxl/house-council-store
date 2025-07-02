'use client';

import { logClientAction } from '@/app/lib/client-logging';
import { createSupabaseBrowserClient } from '@/app/lib/supabase-client';

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
     const restrictingStatuses = ['inactive', 'pending_activation', 'suspended', 'archived']
     const allowedStatuses = ['active', 'trial', 'vip']
     const supabase = await createSupabaseBrowserClient();

     const { data, error } = await supabase
          .from('tblClients')
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
          if (!restrictingStatuses.includes(data.client_status)) {
               await logClientAction({
                    user_id: data.id,
                    action: 'Check if client exists and is permitted - Client status is allowed',
                    payload: { email: values.email, status: data.client_status },
                    status: 'success',
                    error: '',
                    duration_ms: Date.now() - start,
                    type: 'auth'
               })
               return { success: true }
          }
          await logClientAction({
               user_id: data.id,
               action: 'Check if client exists and is permitted - Client status is restricted',
               payload: { email: values.email, status: data.client_status },
               status: 'fail',
               error: `Client is restricted with status ${data.client_status}`,
               duration_ms: Date.now() - start,
               type: 'auth'
          })
          return {
               success: false, error: {
                    code: 'ClientRestricted',
                    details: 'Your account is restricted',
                    hint: 'Please contact support for assistance',
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
