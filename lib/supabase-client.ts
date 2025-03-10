'use client'

import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with service role key
export const createSupabaseClient = () => {
     const supabaseUrl = process.env.SUPABASE_URL
     const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
     return createClient(supabaseUrl!, supabaseServiceRoleKey!);
}
