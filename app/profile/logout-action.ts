'use server';

import { useServerSideSupabaseAnonClient } from '@/lib/ss-supabase-anon-client';

export const logoutUserAction = async (): Promise<string | null> => {
     const supabase = await useServerSideSupabaseAnonClient();
     const { error } = await supabase.auth.signOut();
     return error ? error.message : null
}