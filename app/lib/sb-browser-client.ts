'use client'

import { createBrowserClient } from '@supabase/ssr'
console.log('NEXT_PUBLIC_SB_CLIENT_KEY', process.env.NEXT_PUBLIC_SB_CLIENT_KEY! || 'undefined');

export const supabaseBrowserClient = createBrowserClient(
     process.env.NEXT_PUBLIC_SUPABASE_URL!,
     process.env.NEXT_PUBLIC_SB_CLIENT_KEY!
)
