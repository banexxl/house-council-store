import { logServerAction } from '@/app/lib/server-logging';
import { useServerSideSupabaseServiceRoleClient } from '@/app/lib/ss-supabase-service-role-client';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

function normalizeEmail(v?: string | null) {
     return (v ?? '').trim().toLowerCase();
}

export async function GET(request: Request) {

     const start = Date.now();

     const cookieStore = await cookies();
     const supabase = await useServerSideSupabaseServiceRoleClient();
     const requestUrl = new URL(request.url);
     // Extract the "code" and "error" parameters
     const code = requestUrl.searchParams.get('code');
     const error = requestUrl.searchParams.get('error');
     const errorCode = requestUrl.searchParams.get('error_code');
     const errorDescription = requestUrl.searchParams.get('error_description');

     // If there's an error parameter, log it and redirect to error page
     if (error) {
          await logServerAction({
               action: 'Auth callback errored',
               error,
               duration_ms: Date.now() - start,
               payload: { code, requestUrl, errorCode, errorDescription },
               status: 'fail',
               user_id: null,
               type: 'auth'
          });
          // Redirect to error page with absolute URL
          const errorPageUrl = `${requestUrl.origin}/auth/error?error=${error}&error_code=${errorCode}&error_description=${encodeURIComponent(errorDescription || '')}`;
          return NextResponse.redirect(errorPageUrl);
     }

     // If "code" is present, exchange it for a session
     if (code) {
          const { data, error: authError } = await supabase.auth.exchangeCodeForSession(code);
          data ?? await logServerAction({
               action: 'Auth callback success',
               error: authError ? authError.message : '',
               duration_ms: Date.now() - start,
               payload: { code, data },
               status: 'success',
               user_id: null,
               type: 'auth'
          });

          if (authError) {
               await logServerAction({
                    action: 'Auth callback errored',
                    error: authError.message,
                    duration_ms: Date.now() - start,
                    payload: { code, requestUrl },
                    status: 'fail',
                    user_id: null,
                    type: 'auth'
               });

               const redirectUrl = `${requestUrl.origin}/auth/error?error=${authError.message}`;
               return NextResponse.redirect(redirectUrl);
          }
     }
     // If "code" is not present, log an error and redirect to error page
     else {
          console.log('ERROR: No code parameter provided in callback');

          await logServerAction({
               action: 'Auth callback errored',
               error: 'No code provided in the callback.',
               duration_ms: Date.now() - start,
               payload: { code, requestUrl },
               status: 'fail',
               user_id: null,
               type: 'auth'
          });

          const redirectUrl = `${requestUrl.origin}/auth/error?error=No code provided in the callback.`;
          console.log('Redirecting to error page:', redirectUrl);
          return NextResponse.redirect(redirectUrl);
     }

     // Retrieve the session after OAuth to get the user details
     const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

     // If there's an error retrieving the session, log it and redirect to error page
     if (sessionError) {
          await logServerAction({
               action: 'Auth callback errored',
               error: sessionError.message,
               duration_ms: Date.now() - start,
               payload: { code, requestUrl },
               status: 'fail',
               user_id: null,
               type: 'auth'
          });

          const redirectUrl = `${requestUrl.origin}/auth/error?error=${sessionError.message}`;
          return NextResponse.redirect(redirectUrl);
     }

     // If no session is found, log it and redirect to error page
     if (!sessionData.session) {
          await logServerAction({
               action: 'Auth callback errored',
               error: 'No session found',
               duration_ms: Date.now() - start,
               payload: { code, requestUrl },
               status: 'fail',
               user_id: null,
               type: 'auth'
          });

          const redirectUrl = `${requestUrl.origin}/auth/error?error=No session found.`;
          return NextResponse.redirect(redirectUrl);
     }

     // Extract the user's email from the session
     const sessionUser = sessionData.session.user;
     const userEmail = normalizeEmail(sessionUser.email);

     // Check if the user's email exists in tblClients.
     const { data, error: clientError } = await supabase
          .from('tblClients')
          .select('*')
          .eq('email', userEmail)
     // If there's an error checking the email, log it and redirect to error page
     if (clientError) {
          await logServerAction({
               action: 'Auth callback errored',
               error: clientError.message,
               duration_ms: Date.now() - start,
               payload: { code, requestUrl },
               status: 'fail',
               user_id: null,
               type: 'auth'
          });

          await supabase.auth.signOut();
          await supabase.auth.admin.deleteUser(sessionData.session.user.id);
          const allCookies = cookieStore.getAll();
          allCookies.forEach(cookie => cookieStore.delete(cookie.name));

          const redirectUrl = `${requestUrl.origin}/auth/error?error=Error checking email in database.`;
          return NextResponse.redirect(redirectUrl);
     }

     if (!data || data.length === 0) {
          const user = sessionData.session.user;
          const clientInsertData = {
               name: (user as any).user_metadata?.contact_person || (user as any).user_metadata?.name || user.email,
               email: user.email,
               client_type: 'individual',
               client_status: 'active',
               has_accepted_terms_and_conditions: false,
               has_accepted_privacy_policy: false,
               has_accepted_marketing: false,
               is_verified: true,
               user_id: sessionData.session.user.id
          };
          const { data: insertData, error: insertError } = await supabase.from('tblClients').insert(clientInsertData);
          insertData ?? await logServerAction({
               action: 'Auth callback success',
               error: 'Successfully inserted new user into tblClients',
               duration_ms: Date.now() - start,
               payload: { code, requestUrl },
               status: 'success',
               user_id: null,
               type: 'auth'
          });

          if (insertError) {
               insertError ?? await logServerAction({
                    action: 'Auth callback errored',
                    error: 'Failed to insert new user into tblClients',
                    duration_ms: Date.now() - start,
                    payload: { code, requestUrl },
                    status: 'fail',
                    user_id: null,
                    type: 'auth'
               });


               await supabase.auth.signOut();
               const allCookies = cookieStore.getAll();
               allCookies.forEach(cookie => cookieStore.delete(cookie.name));

               const redirectUrl = `${requestUrl.origin}/auth/error?error=Failed to create user.`;
               return NextResponse.redirect(redirectUrl);
          } else {
               await logServerAction({
                    action: 'Auth callback success',
                    error: '',
                    duration_ms: Date.now() - start,
                    payload: { code, requestUrl },
                    status: 'success',
                    user_id: null,
                    type: 'auth'
               });
          }
     } else {
          // Optional: if provider is google, promote your business status here
          if (sessionUser.app_metadata?.provider === 'google') {
               const client = data[0];
               // Example normalization — adjust fields to your rules
               if (client.client_status === 'pending_activation' || client.is_verified === false) {
                    const { data: upd, error: updErr } = await supabase
                         .from('tblClients')
                         .update({ client_status: 'active', is_verified: true })
                         .eq('id', client.id);
                    if (updErr) {
                         await logServerAction({
                              action: 'Auth callback errored',
                              error: 'Failed to promote client status after Google sign-in',
                              duration_ms: Date.now() - start,
                              payload: { code, requestUrl },
                              status: 'fail',
                              user_id: null,
                              type: 'auth'
                         });
                    }
               }
          }
     }

     if (data && data.length > 1) {
          await logServerAction({
               action: 'Auth callback errored',
               error: 'Duplicate email found in tblClients.',
               duration_ms: Date.now() - start,
               payload: { code, requestUrl },
               status: 'fail',
               user_id: null,
               type: 'auth'
          });
          await supabase.auth.signOut();

          const { data: deleteData, error: deleteError } = await supabase.auth.admin.deleteUser(sessionData.session.user.id);
          const allCookies = cookieStore.getAll();
          allCookies.forEach(cookie => cookieStore.delete(cookie.name));
          const redirectUrl = `${requestUrl.origin}/auth/error?error=Duplicate email found in tblClients. Please contact support.`;
          return NextResponse.redirect(redirectUrl);
     }

     // Final log for successful sign-in
     await logServerAction({
          action: 'Signed in with Google account',
          error: '',
          duration_ms: Date.now() - start,
          payload: { code, requestUrl },
          status: 'success',
          user_id: sessionData.session.user.id,
          type: 'auth'
     });

     // Redirect to dashboard with absolute URL
     const dashboardUrl = `${requestUrl.origin}`;
     console.log('SUCCESS: Redirecting to dashboard:', dashboardUrl);
     console.log('Total callback processing time:', Date.now() - start, 'ms');
     return NextResponse.redirect(dashboardUrl);
}
