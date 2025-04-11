import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {

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

     if (error) {
          // Redirect to error page with absolute URL
          const errorPageUrl = `${requestUrl.origin}/auth/error?error=${error}&error_code=${errorCode}&error_description=${encodeURIComponent(errorDescription || '')}`;
          console.log('errorPageUrl', errorPageUrl);
          return NextResponse.redirect(errorPageUrl);
     }

     if (code) {
          const { data, error: authError } = await supabase.auth.exchangeCodeForSession(code);
          if (authError) {
               console.log('error', authError);
               return NextResponse.redirect(`${requestUrl.origin}/auth/error?error=${authError.message}`);
          }
     }

     // Retrieve the session after OAuth to get the user details
     const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
     if (sessionError) {
          console.error('Error retrieving session:', sessionError);
          return NextResponse.redirect(`${requestUrl.origin}/auth/error?error=${sessionError.message}`);
     }
     console.log('sessionData', sessionData);

     if (!sessionData.session) {
          console.error('No session available after sign in.');
          return NextResponse.redirect(`${requestUrl.origin}/auth/error?error=No session found.`);
     }

     // Extract the user's email from the session
     const userEmail = sessionData.session.user.email;
     console.log('Authenticated user email:', userEmail);

     // Check if the user's email exists in tblClients.
     const { data, error: clientError } = await supabase
          .from('tblClients')
          .select('*')
          .eq('email', userEmail)

     if (clientError) {
          console.error('Error checking email in database:', clientError);
          supabase.auth.signOut();
          const { data, error } = await supabase.auth.admin.deleteUser(sessionData.session.user.id);

          // Remove cookies
          cookieStore.getAll().forEach(cookie => cookieStore.delete(cookie.name));

          return NextResponse.redirect(`${requestUrl.origin}/auth/error?error=Error checking email in database.`);
     }

     if (!data || data.length === 0) {
          const user = sessionData.session.user;

          const { error: insertError } = await supabase.from('tblClients').insert({
               name: user.user_metadata.full_name || user.user_metadata.name || user.email,
               email: user.email,
               type: '3cb057f5-32c1-423b-a549-5c28a89c6907',
               client_status: '6f0f38ed-bd14-4f84-9718-1e37fe0b7027',
               role_id: '01054864-19ab-4d52-ba1e-59ab35858349',
               password: '',
               has_accepted_terms_and_conditions: false,
               has_accepted_privacy_policy: false,
               has_accepted_marketing: false,
          });

          if (insertError) {
               console.error('Failed to insert new user into tblClients:', insertError);

               // Clean up
               await supabase.auth.signOut();
               await supabase.auth.admin.deleteUser(user.id);
               cookieStore.getAll().forEach(cookie => cookieStore.delete(cookie.name));

               return NextResponse.redirect(`${requestUrl.origin}/auth/error?error=Failed to create user in tblClients.`);
          }

          console.log('New user added to tblClients.');
     }

     if (data.length > 1) {
          supabase.auth.signOut();
          const { data, error } = await supabase.auth.admin.deleteUser(sessionData.session.user.id);
          console.log('data', data);
          console.log('error', error);
          console.log('Duplicate email found in tblClients. Please contact support.');

          // Remove cookies
          cookieStore.getAll().forEach(cookie => cookieStore.delete(cookie.name));

          return NextResponse.redirect(`${requestUrl.origin}/auth/error?error=Duplicate email found in tblClients. Please contact support.`);
     }

     console.log('Email found in tblClients. Sign in successful.');

     // Redirect to dashboard with absolute URL
     const dashboardUrl = `${requestUrl.origin}/profile`;
     return NextResponse.redirect(dashboardUrl);
}
