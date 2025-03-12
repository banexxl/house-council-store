'use server'

import { Session, User } from "@/components/Header";
import { useServerSideSupabaseClient } from "./ss-supabase-anon-client";

export const getSession = async (): Promise<{ user: User } | null> => {

     const supabase = await useServerSideSupabaseClient()

     // Retrieve the authenticated user
     const { data, error } = await supabase.auth.getUser()

     if (error) {
          return null
     }

     return { user: data.user as User }
}