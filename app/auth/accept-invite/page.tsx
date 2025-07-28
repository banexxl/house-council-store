'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/app/lib/sb-client';
import Loading from '@/app/components/loading';

export default function AcceptInvitePage() {
     const router = useRouter();
     const [isLoading, setIsLoading] = useState(true);

     useEffect(() => {
          const fragment = new URLSearchParams(window.location.hash.substring(1));
          const access_token = fragment.get('access_token');
          const refresh_token = fragment.get('refresh_token');

          const handleAuth = async () => {
               if (!access_token || !refresh_token) {
                    router.replace('/auth/error');
                    return;
               }

               const { error: sessionError } = await supabase.auth.setSession({
                    access_token,
                    refresh_token,
               });

               if (sessionError) {
                    console.error('setSession error:', sessionError.message);
                    router.replace('/auth/error');
                    return;
               }

               // Set HTTP-only cookie on server
               const res = await fetch('/api/auth/set-cookie', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ access_token, refresh_token }),
               });

               if (!res.ok) {
                    console.warn('Failed to set cookie');
                    router.replace('/auth/error');
                    return;
               }

               router.replace('/');
          };

          handleAuth().finally(() => setIsLoading(false));
     }, [router]);

     return isLoading ? <Loading /> : null;
}
