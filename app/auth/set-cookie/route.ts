// app/api/auth/set-cookie/route.ts

import { useServerSideSupabaseAnonClient } from '@/app/lib/ss-supabase-anon-client';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {

     const supabase = await useServerSideSupabaseAnonClient()

     const { access_token, refresh_token } = await request.json();

     const { error } = await supabase.auth.setSession({ access_token, refresh_token });

     if (error) {
          return NextResponse.json({ error: error.message }, { status: 401 });
     }

     return NextResponse.json({ success: true });
}
