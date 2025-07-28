'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/app/lib/sb-client';

export default function AcceptInvitePage() {

     const router = useRouter();

     useEffect(() => {
          const fragment = new URLSearchParams(window.location.hash.substring(1));
          const access_token = fragment.get('access_token');
          const refresh_token = fragment.get('refresh_token');

          const handleAuth = async () => {
               if (access_token && refresh_token) {
                    const { error } = await supabase.auth.setSession({
                         access_token,
                         refresh_token,
                    });

                    if (error) {
                         console.error('Error setting session:', error.message);
                         router.replace('/auth/error');
                         return;
                    }

                    const { data: userData, error: userError } = await supabase.auth.getUser();

                    if (userData?.user && !userError) {
                         console.log('User logged in:', userData.user);
                         router.replace('/'); // success
                    } else {
                         console.warn('Session set but no user found:', userError);
                         router.replace('/auth/error');
                    }
               } else {
                    console.warn('Missing tokens in URL fragment');
                    router.replace('/auth/error');
               }
          };

          handleAuth();
     }, [router]);

     return null; // No UI, acts like redirect handler
}
