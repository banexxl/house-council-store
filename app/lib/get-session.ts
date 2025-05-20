'use server'

import { User } from "@supabase/supabase-js";
import { useServerSideSupabaseAnonClient } from "./ss-supabase-anon-client";
import { logServerAction } from "./server-logging";

export const getSessionUser = async (): Promise<User | null> => {

     const supabase = await useServerSideSupabaseAnonClient()

     // Retrieve the authenticated user
     const { data, error } = await supabase.auth.getUser()

     if (error) {
          await logServerAction({
               user_id: null,
               action: 'Get Session User - Error during supabase getUser.',
               payload: {},
               status: 'fail',
               error: error.message,
               duration_ms: 0,
               type: 'auth'
          })
          return null
     }
     await logServerAction({
          user_id: null,
          action: 'Get Session User - Success.',
          payload: {},
          status: 'success',
          error: '',
          duration_ms: 0,
          type: 'auth'
     })
     return data.user
}