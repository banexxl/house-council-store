'use server'

import { User } from "@supabase/supabase-js";
import { useServerSideSupabaseAnonClient } from "./ss-supabase-anon-client";

export const getSession = async (): Promise<{ user: User } | null> => {

     const supabase = await useServerSideSupabaseAnonClient()

     // Retrieve the authenticated user
     const { data, error } = await supabase.auth.getUser()

     if (error) {
          return null
     }

     return { user: data.user as User }
}