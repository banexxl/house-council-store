import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export const useServerSideSupabaseServiceRoleClient = async () => {
     // Use the server-side Supabase client
     const cookieStore = await cookies();
     const supabase = createServerClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SB_SERVICE_KEY!,
          {
               cookies: {
                    getAll: () => cookieStore.getAll(),
                    setAll: (cookiesToSet) => {
                         cookiesToSet.forEach(({ name, value, options }) => {
                              try {
                                   cookieStore.set(name, value, options);
                              } catch {
                                   // Handle cases where setting cookies in server actions isn't supported
                              }
                         });
                    },
               },
          }
     );

     return supabase
}