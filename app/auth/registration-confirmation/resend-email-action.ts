'use server'

import { useServerSideSupabaseServiceRoleClient } from "@/app/lib/ss-supabase-service-role-client";

export const resendRegistrationEmail = async (email: string): Promise<boolean> => {

     const supabase = await useServerSideSupabaseServiceRoleClient();
     const { data, error } = await supabase.auth.resend({
          type: 'signup',
          email,
     })

     if (error) {
          return false
     }
     return true
}