'use client';

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

          if (!restrictingStatuses.includes(data.client_status)) {
               return { success: true }
          }
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
