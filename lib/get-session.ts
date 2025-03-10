'use server'

import { useServerSideSupabaseClient } from "./ss-supabase-anon-client";

export const getSession = async () => {

     const supabase = await useServerSideSupabaseClient()

     // Retrieve the authenticated user
     const { data, error } = await supabase.auth.getUser()

     if (error) {
          return null
     }

     return data
}