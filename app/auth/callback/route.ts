import { logServerAction } from '@/app/lib/server-logging';
import { useServerSideSupabaseServiceRoleClient } from '@/app/lib/ss-supabase-service-role-client';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { polar } from '@/app/lib/polar';

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
     const userId = sessionUser.id;
     const { data: customerInsertData, error: customerInsertError } = await supabase.from('tblPolarCustomers').upsert({
          externalId: userId,
          email: userEmail,
          name: (sessionUser.user_metadata as any)?.full_name || (sessionUser.user_metadata as any)?.name || (sessionUser.user_metadata as any)?.contact_person || userEmail.split('@')[0],
          emailVerified: sessionUser.email_confirmed_at !== null,
          metadata: sessionUser.user_metadata,
     }, { onConflict: 'externalId' })
          .select().single();

     if (customerInsertError) {
          await logServerAction({
               action: 'Auth callback errored - Inserting user into tblPolarCustomers failed',
               error: customerInsertError.message,
               duration_ms: Date.now() - start,
               payload: { externalId: userId, email: userEmail },
               status: 'fail',
               user_id: userId,
               type: 'auth'
          });
          // Rollback by deleting the auth user
          await supabase.auth.signOut();
          await supabase.auth.admin.deleteUser(userId);
          throw customerInsertError;
     }
     // Check if Polar customer already exists for this user
     try {
          // Search by email since that's the primary identifier
          const existingCustomer = await polar.customers.list({
               email: userEmail,
               limit: 1,
          });

          if (existingCustomer.result && existingCustomer.result.items.length > 0) {
               // Customer already exists, proceed to login
               await logServerAction({
                    action: 'Signed in with Google account (existing customer)',
                    error: '',
                    duration_ms: Date.now() - start,
                    payload: { code, requestUrl, customerId: existingCustomer.result.items[0].id },
                    status: 'success',
                    user_id: userId,
                    type: 'auth'
               });

               const dashboardUrl = `${requestUrl.origin}`;
               return NextResponse.redirect(dashboardUrl);
          }

          const polarCustomer = await polar.customers.create({
               email: sessionData.session.user.email || '',
               name: (sessionUser.user_metadata as any)?.full_name || (sessionUser.user_metadata as any)?.name || (sessionUser.user_metadata as any)?.contact_person || userEmail.split('@')[0],
               metadata: {
                    userId: sessionUser.id,
               }
          });

          await logServerAction({
               action: 'Signed in with Google account (new customer created)',
               error: '',
               duration_ms: Date.now() - start,
               payload: {
                    code,
                    requestUrl,
                    customerId: polarCustomer.id,
                    email: sessionData.session.user.email || '',
                    name: (sessionUser.user_metadata as any)?.full_name || (sessionUser.user_metadata as any)?.name || (sessionUser.user_metadata as any)?.contact_person || userEmail.split('@')[0],
               },
               status: 'success',
               user_id: userId,
               type: 'auth'
          });

          const dashboardUrl = `${requestUrl.origin}`;
          return NextResponse.redirect(dashboardUrl);

     } catch (customerError: any) {
          // If Polar customer creation fails, delete the auth user and sign out
          await logServerAction({
               action: 'Auth callback errored - Polar customer creation failed',
               error: customerError.message || String(customerError),
               duration_ms: Date.now() - start,
               payload: { code, requestUrl, email: userEmail },
               status: 'fail',
               user_id: userId,
               type: 'auth'
          });

          await supabase.auth.signOut();
          await supabase.auth.admin.deleteUser(userId);

          const allCookies = cookieStore.getAll();
          allCookies.forEach(cookie => cookieStore.delete(cookie.name));

          const redirectUrl = `${requestUrl.origin}/auth/error?error=Failed to create customer account. Please try again or contact support.`;
          return NextResponse.redirect(redirectUrl);
     }
}
