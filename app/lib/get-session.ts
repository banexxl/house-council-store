'use server'

import { User } from "@supabase/supabase-js";
import { useServerSideSupabaseAnonClient } from "./ss-supabase-anon-client";

export const getSessionUser = async (): Promise<User | null> => {

     const supabase = await useServerSideSupabaseAnonClient()

     // Retrieve the authenticated user
     const { data, error } = await supabase.auth.getUser()

     if (error) {
          return null
     }

     return data.user
}