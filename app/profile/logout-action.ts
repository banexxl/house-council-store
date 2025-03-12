'use server';

import { useServerSideSupabaseClient } from '@/lib/ss-supabase-anon-client';

export const logoutUserAction = async (): Promise<string | null> => {
     const supabase = await useServerSideSupabaseClient();
     const { error } = await supabase.auth.signOut();
     return error ? error.message : null
}