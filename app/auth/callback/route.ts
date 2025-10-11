import { logServerAction } from '@/app/lib/server-logging';
import { useServerSideSupabaseServiceRoleClient } from '@/app/lib/ss-supabase-service-role-client';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {

     const start = Date.now()

     console.log('=== AUTH CALLBACK ROUTE START ===');
     console.log('Start time:', new Date().toISOString());

     const cookieStore = await cookies();
     const supabase = await useServerSideSupabaseServiceRoleClient();

     console.log('Cookie store initialized');
     console.log('Supabase client initialized');

     const requestUrl = new URL(request.url);
     console.log('Request URL:', requestUrl.href);
     console.log('Request URL origin:', requestUrl.origin);
     console.log('Request URL pathname:', requestUrl.pathname);
     console.log('Request URL search:', requestUrl.search);

     // Extract the "code" and "error" parameters
     const code = requestUrl.searchParams.get('code');
     const error = requestUrl.searchParams.get('error');
     const errorCode = requestUrl.searchParams.get('error_code');
     const errorDescription = requestUrl.searchParams.get('error_description');

     console.log('URL Parameters extracted:');
     console.log('- code:', code ? `${code.substring(0, 10)}...` : 'null');
     console.log('- error:', error);
     console.log('- errorCode:', errorCode);
     console.log('- errorDescription:', errorDescription);
     console.log('- All search params:', Object.fromEntries(requestUrl.searchParams.entries()));

     if (error) {
          console.log('ERROR: Auth callback received error parameter');
          console.log('Error details:', { error, errorCode, errorDescription });

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
          console.log('Redirecting to error page:', errorPageUrl);
          return NextResponse.redirect(errorPageUrl);
     }

     // If "code" is present, exchange it for a session
     if (code) {
          console.log('Code parameter found, attempting to exchange for session...');

          const { data, error: authError } = await supabase.auth.exchangeCodeForSession(code);

          console.log('Exchange code for session result:');
          console.log('- Has data:', !!data);
          console.log('- Has session:', !!data?.session);
          console.log('- Has user:', !!data?.user);
          console.log('- Session user ID:', data?.user?.id);
          console.log('- Session user email:', data?.user?.email);
          console.log('- Auth error:', authError?.message);
          console.log('- Full data object:', JSON.stringify(data, null, 2));
          console.log('- Full error object:', JSON.stringify(authError, null, 2));

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
               console.log('ERROR: Failed to exchange code for session');
               console.log('Auth error details:', authError);

               data ?? await logServerAction({
                    action: 'Auth callback errored',
                    error: authError.message,
                    duration_ms: Date.now() - start,
                    payload: { code, requestUrl },
                    status: 'fail',
                    user_id: null,
                    type: 'auth'
               });

               const redirectUrl = `${requestUrl.origin}/auth/error?error=${authError.message}`;
               console.log('Redirecting to error page:', redirectUrl);
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
     console.log('Attempting to retrieve session after OAuth...');
     const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

     console.log('Get session result:');
     console.log('- Has session data:', !!sessionData);
     console.log('- Has session:', !!sessionData?.session);
     console.log('- Has user:', !!sessionData?.session?.user);
     console.log('- Session error:', sessionError?.message);
     console.log('- Session user ID:', sessionData?.session?.user?.id);
     console.log('- Session user email:', sessionData?.session?.user?.email);
     console.log('- Session user metadata:', JSON.stringify(sessionData?.session?.user?.user_metadata, null, 2));
     console.log('- Full session data:', JSON.stringify(sessionData, null, 2));

     // If there's an error retrieving the session, log it and redirect to error page
     if (sessionError) {
          console.log('ERROR: Failed to retrieve session');
          console.log('Session error details:', sessionError);

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
          console.log('Redirecting to error page:', redirectUrl);
          return NextResponse.redirect(redirectUrl);
     }

     // If no session is found, log it and redirect to error page
     if (!sessionData.session) {
          console.log('ERROR: No session found in session data');
          console.log('Session data received:', sessionData);

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
          console.log('Redirecting to error page:', redirectUrl);
          return NextResponse.redirect(redirectUrl);
     }

     // Extract the user's email from the session
     const userEmail = sessionData.session.user.email;
     console.log('Extracted user email from session:', userEmail);
     console.log('Full user object:', JSON.stringify(sessionData.session.user, null, 2));

     // Check if the user's email exists in tblClients.
     console.log('Checking if user email exists in tblClients...');
     const { data, error: clientError } = await supabase
          .from('tblClients')
          .select('*')
          .eq('email', userEmail)

     console.log('tblClients query result:');
     console.log('- Has data:', !!data);
     console.log('- Data length:', data?.length);
     console.log('- Client error:', clientError?.message);
     console.log('- Full data:', JSON.stringify(data, null, 2));
     console.log('- Full error:', JSON.stringify(clientError, null, 2));

     // If there's an error checking the email, log it and redirect to error page
     if (clientError) {
          console.log('ERROR: Failed to check email in tblClients');
          console.log('Client error details:', clientError);

          await logServerAction({
               action: 'Auth callback errored',
               error: clientError.message,
               duration_ms: Date.now() - start,
               payload: { code, requestUrl },
               status: 'fail',
               user_id: null,
               type: 'auth'
          })

          console.log('Signing out user due to client error...');
          supabase.auth.signOut();

          console.log('Deleting user due to client error...');
          const { data, error } = await supabase.auth.admin.deleteUser(sessionData.session.user.id);
          console.log('Delete user result:', { data, error });

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
          console.log('Removing all cookies...');
          const allCookies = cookieStore.getAll();
          console.log('Cookies to remove:', allCookies.map(c => c.name));
          allCookies.forEach(cookie => cookieStore.delete(cookie.name));

          const redirectUrl = `${requestUrl.origin}/auth/error?error=Error checking email in database.`;
          console.log('Redirecting to error page:', redirectUrl);
          return NextResponse.redirect(redirectUrl);
     }

     if (!data || data.length === 0) {
          console.log('User email NOT found in tblClients');
          console.log('Proceeding to create new client record...');

          const user = sessionData.session.user;
          console.log('User details for client creation:');
          console.log('- User ID:', user.id);
          console.log('- User email:', user.email);
          console.log('- User metadata:', JSON.stringify(user.user_metadata, null, 2));
          console.log('- Contact person:', user.user_metadata.contact_person);
          console.log('- Name:', user.user_metadata.name);

          const clientInsertData = {
               name: user.user_metadata.contact_person || user.user_metadata.name || user.email,
               email: user.email,
               client_type: 'individual',
               client_status: 'active',
               has_accepted_terms_and_conditions: false,
               has_accepted_privacy_policy: false,
               has_accepted_marketing: false,
               is_verified: true,
               user_id: sessionData.session.user.id
          };
          console.log('Attempting to insert client data:', JSON.stringify(clientInsertData, null, 2));

          const { data: insertData, error: insertError } = await supabase.from('tblClients').insert(clientInsertData);
          console.log('tblClients insert result:');
          console.log('- Insert data:', JSON.stringify(insertData, null, 2));
          console.log('- Insert error:', insertError?.message);
          console.log('- Full insert error:', JSON.stringify(insertError, null, 2));

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
               console.log('ERROR: Failed to insert user into tblClients');
               console.log('Insert error details:', insertError);

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
               console.log('Cleaning up after insert error...');
               console.log('Signing out user...');
               await supabase.auth.signOut();
               console.log('Deleting user...');
               await supabase.auth.admin.deleteUser(user.id);
               console.log('Removing cookies...');
               const allCookies = cookieStore.getAll();
               console.log('Cookies to remove:', allCookies.map(c => c.name));
               allCookies.forEach(cookie => cookieStore.delete(cookie.name));

               const redirectUrl = `${requestUrl.origin}/auth/error?error=Failed to create user.`;
               console.log('Redirecting to error page after insert error:', redirectUrl);
               return NextResponse.redirect(redirectUrl);
          } else {
               console.log('SUCCESS: User successfully inserted into tblClients');
          }
     } else {
          console.log('User found in tblClients, proceeding with existing client...');
          console.log('Client data found:', JSON.stringify(data[0], null, 2));
     }

     if (data.length > 1) {
          console.log('ERROR: Duplicate email found in tblClients');
          console.log('Found', data.length, 'records with same email');
          console.log('All duplicate records:', JSON.stringify(data, null, 2));

          await logServerAction({
               action: 'Auth callback errored',
               error: 'Duplicate email found in tblClients.',
               duration_ms: Date.now() - start,
               payload: { code, requestUrl },
               status: 'fail',
               user_id: null,
               type: 'auth'
          })

          console.log('Signing out user (duplicate email)...');
          supabase.auth.signOut();
          console.log('Deleting user (duplicate email)...');
          const { data: deleteData, error: deleteError } = await supabase.auth.admin.deleteUser(sessionData.session.user.id);
          console.log('Delete user result (duplicate email):', { deleteData, deleteError });

          deleteError ?? await logServerAction({
               action: 'Auth callback errored',
               error: 'Failed to delete user',
               duration_ms: Date.now() - start,
               payload: { code, requestUrl },
               status: 'fail',
               user_id: null,
               type: 'auth'
          })

          deleteData ?? await logServerAction({
               action: 'Auth callback errored',
               error: 'User deleted successfully',
               duration_ms: Date.now() - start,
               payload: { code, requestUrl },
               status: 'fail',
               user_id: null,
               type: 'auth'
          })
          // Remove cookies
          console.log('Removing cookies (duplicate email)...');
          const allCookies = cookieStore.getAll();
          console.log('Cookies to remove:', allCookies.map(c => c.name));
          allCookies.forEach(cookie => cookieStore.delete(cookie.name));

          const redirectUrl = `${requestUrl.origin}/auth/error?error=Duplicate email found in tblClients. Please contact support.`;
          console.log('Redirecting to error page (duplicate email):', redirectUrl);
          return NextResponse.redirect(redirectUrl);
     }

     console.log('SUCCESS: Authentication flow completed successfully');
     console.log('Final user session ID:', sessionData.session.user.id);
     console.log('Final user email:', sessionData.session.user.email);

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
     const dashboardUrl = `${requestUrl.origin}`;
     console.log('SUCCESS: Redirecting to dashboard:', dashboardUrl);
     console.log('Total callback processing time:', Date.now() - start, 'ms');
     return NextResponse.redirect(dashboardUrl);
}

