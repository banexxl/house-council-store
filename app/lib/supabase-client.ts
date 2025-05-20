'use client'

import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with service role key
export const createSupabaseClient = () => {
     const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
     const supabaseServiceRoleKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
     return createClient(supabaseUrl!, supabaseServiceRoleKey!);
}
