'use server'

import { useServerSideSupabaseClient } from "@/lib/ss-supabase-service-user-client";

export const resendRegistrationEmail = async (email: string): Promise<boolean> => {

     const supabase = await useServerSideSupabaseClient();
     const { data, error } = await supabase.auth.resend({
          type: 'signup',
          email,
     })

     if (error) {
          console.log('error', error)
          return false
     }
     console.log('data', data)
     return true
}