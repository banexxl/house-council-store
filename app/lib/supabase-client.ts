'use client'

import { createBrowserClient } from '@supabase/ssr';

// Initialize Supabase client with service role key
export const createSupabaseBrowserClient = async () => {
     const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
     const supabaseServiceRoleKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
     return await createBrowserClient(supabaseUrl!, supabaseServiceRoleKey!);
}
