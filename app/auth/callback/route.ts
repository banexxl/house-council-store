import { logServerAction } from '@/app/lib/server-logging';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {

     const start = Date.now()

     const cookieStore = await cookies();
     const supabase = createServerClient(
          process.env.SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!,
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

     const requestUrl = new URL(request.url);
     // Extract the "code" and "error" parameters
     const code = requestUrl.searchParams.get('code');
     const error = requestUrl.searchParams.get('error');
     const errorCode = requestUrl.searchParams.get('error_code');
     const errorDescription = requestUrl.searchParams.get('error_description');
     const codeChallenge = requestUrl.searchParams.get('code_challenge');

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

     if (code) {
          const { data, error: authError } = await supabase.auth.exchangeCodeForSession(code || codeChallenge || '');
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
               data ?? await logServerAction({
                    action: 'Auth callback errored',
                    error: authError.message,
                    duration_ms: Date.now() - start,
                    payload: { code, requestUrl },
                    status: 'fail',
                    user_id: null,
                    type: 'auth'
               });
               return NextResponse.redirect(`${requestUrl.origin}/auth/error?error=${authError.message}`);
          }
     }

     // Retrieve the session after OAuth to get the user details
     const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
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
          return NextResponse.redirect(`${requestUrl.origin}/auth/error?error=${sessionError.message}`);
     }

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
          return NextResponse.redirect(`${requestUrl.origin}/auth/error?error=No session found.`);
     }

     // Extract the user's email from the session
     const userEmail = sessionData.session.user.email;
     // Check if the user's email exists in tblClients.
     const { data, error: clientError } = await supabase
          .from('tblClients')
          .select('*')
          .eq('email', userEmail)

     if (clientError) {
          await logServerAction({
               action: 'Auth callback errored',
               error: clientError.message,
               duration_ms: Date.now() - start,
               payload: { code, requestUrl },
               status: 'fail',
               user_id: null,
               type: 'auth'
          })
          supabase.auth.signOut();
          const { data, error } = await supabase.auth.admin.deleteUser(sessionData.session.user.id);

          error ?? await logServerAction({
               action: 'Auth callback errored',
               error: 'Failed to delete user',
               duration_ms: Date.now() - start,
               payload: { code, requestUrl },
               status: 'fail',
               user_id: null,
               type: 'auth'
          })

          data ?? await logServerAction({
               action: 'Auth callback errored',
               error: 'User deleted successfully',
               duration_ms: Date.now() - start,
               payload: { code, requestUrl },
               status: 'fail',
               user_id: null,
               type: 'auth'
          })
          // Remove cookies
          cookieStore.getAll().forEach(cookie => cookieStore.delete(cookie.name));

          return NextResponse.redirect(`${requestUrl.origin}/auth/error?error=Error checking email in database.`);
     }

     if (!data || data.length === 0) {
          const user = sessionData.session.user;

          const { data, error: insertError } = await supabase.from('tblClients').insert({
               name: user.user_metadata.contact_person || user.user_metadata.name || user.email,
               email: user.email,
               type: '3cb057f5-32c1-423b-a549-5c28a89c6907',
               client_status: '6f0f38ed-bd14-4f84-9718-1e37fe0b7027',
               role_id: '01054864-19ab-4d52-ba1e-59ab35858349',
               password: '',
               has_accepted_terms_and_conditions: false,
               has_accepted_privacy_policy: false,
               has_accepted_marketing: false,
               is_verified: true
          });

          data ?? await logServerAction({
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

               // Clean up
               await supabase.auth.signOut();
               await supabase.auth.admin.deleteUser(user.id);
               cookieStore.getAll().forEach(cookie => cookieStore.delete(cookie.name));

               return NextResponse.redirect(`${requestUrl.origin}/auth/error?error=Failed to create user in tblClients.`);
          }
     }

     if (data.length > 1) {

          await logServerAction({
               action: 'Auth callback errored',
               error: 'Duplicate email found in tblClients.',
               duration_ms: Date.now() - start,
               payload: { code, requestUrl },
               status: 'fail',
               user_id: null,
               type: 'auth'
          })

          supabase.auth.signOut();
          const { data, error } = await supabase.auth.admin.deleteUser(sessionData.session.user.id);

          error ?? await logServerAction({
               action: 'Auth callback errored',
               error: 'Failed to delete user',
               duration_ms: Date.now() - start,
               payload: { code, requestUrl },
               status: 'fail',
               user_id: null,
               type: 'auth'
          })

          data ?? await logServerAction({
               action: 'Auth callback errored',
               error: 'User deleted successfully',
               duration_ms: Date.now() - start,
               payload: { code, requestUrl },
               status: 'fail',
               user_id: null,
               type: 'auth'
          })
          // Remove cookies
          cookieStore.getAll().forEach(cookie => cookieStore.delete(cookie.name));

          return NextResponse.redirect(`${requestUrl.origin}/auth/error?error=Duplicate email found in tblClients. Please contact support.`);
     }

     await logServerAction({
          action: 'Signed in with Google account',
          error: '',
          duration_ms: Date.now() - start,
          payload: { code, requestUrl },
          status: 'success',
          user_id: sessionData.session.user.id,
          type: 'auth'
     })

     // Redirect to dashboard with absolute URL
     const dashboardUrl = `${requestUrl.origin}/profile`;
     return NextResponse.redirect(dashboardUrl);
}
