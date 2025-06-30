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

export const checkClientExists = async (
     values: SignInFormValues
): Promise<{ success: boolean; error?: ErrorType }> => {
     const start = Date.now()

     const supabase = await createSupabaseBrowserClient();

     const { data, error } = await supabase
          .from('tblClients')
          .select('email')
          .eq('email', values.email)
          .single()

     if (data) {
          await logClientAction({
               user_id: null,
               action: 'Sign in - check client exists',
               payload: { email: values.email },
               status: 'success',
               error: '',
               duration_ms: Date.now() - start,
               type: 'auth',
          })
          return { success: true }
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

     await logClientAction({
          user_id: null,
          action: 'Sign in - check client exists error',
          payload: { email: values.email },
          status: 'fail',
          error: error?.message || 'Unknown error',
          duration_ms: Date.now() - start,
          type: 'auth',
     })

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
