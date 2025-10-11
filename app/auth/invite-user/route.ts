import { NextResponse } from 'next/server';
import { useServerSideSupabaseServiceRoleClient } from '@/app/lib/ss-supabase-service-role-client';
import { logServerAction } from '@/app/lib/server-logging';
import { randomBytes } from 'crypto';

export async function GET(request: Request) {
     const start = Date.now();
     const requestUrl = new URL(request.url);
     const token = requestUrl.searchParams.get('token');

     console.log('=== INVITE USER ROUTE START ===');
     console.log('Request URL:', requestUrl.href);
     console.log('Token received:', token ? `${token.substring(0, 10)}...` : 'null');

     // Validate token parameter
     if (!token) {
          console.log('ERROR: No token provided in request');

          await logServerAction({
               action: 'Invite user validation failed',
               error: 'No token provided',
               duration_ms: Date.now() - start,
               payload: { requestUrl: requestUrl.href },
               status: 'fail',
               user_id: null,
               type: 'auth'
          });

          return NextResponse.redirect(`${requestUrl.origin}/auth/error?error=Invalid invite link`);
     }

     try {
          console.log('Initializing Supabase service role client...');
          const supabase = await useServerSideSupabaseServiceRoleClient();
          console.log('Supabase client initialized successfully');

          console.log('Attempting to verify invite token with different methods...');

          // First, try to verify as an invite token
          console.log('Method 1: Trying verifyOtp with type "invite"...');
          let verifyData, verifyError;

          try {
               const result = await supabase.auth.verifyOtp({
                    token_hash: token,
                    type: 'invite'
               });
               verifyData = result.data;
               verifyError = result.error;
               console.log('Method 1 result:', {
                    hasData: !!verifyData,
                    hasUser: !!verifyData?.user,
                    hasSession: !!verifyData?.session,
                    error: verifyError?.message
               });
          } catch (error) {
               console.log('Method 1 failed with exception:', error);
               verifyError = error;
          }

          // If that fails, try as email confirmation
          if (verifyError || !verifyData?.user) {
               console.log('Method 2: Trying verifyOtp with type "email"...');
               try {
                    const result = await supabase.auth.verifyOtp({
                         token_hash: token,
                         type: 'email'
                    });
                    verifyData = result.data;
                    verifyError = result.error;
                    console.log('Method 2 result:', {
                         hasData: !!verifyData,
                         hasUser: !!verifyData?.user,
                         hasSession: !!verifyData?.session,
                         error: verifyError?.message
                    });
               } catch (error) {
                    console.log('Method 2 failed with exception:', error);
                    verifyError = error;
               }
          }

          // If still failing, try to exchange the token directly
          if (verifyError || !verifyData?.user) {
               console.log('Method 3: Trying exchangeCodeForSession...');
               try {
                    const result = await supabase.auth.exchangeCodeForSession(token);
                    verifyData = result.data;
                    verifyError = result.error;
                    console.log('Method 3 result:', {
                         hasData: !!verifyData,
                         hasUser: !!verifyData?.user,
                         hasSession: !!verifyData?.session,
                         error: verifyError?.message
                    });
               } catch (error) {
                    console.log('Method 3 failed with exception:', error);
                    verifyError = error;
               }
          }

          // If all methods fail, try to get user info directly using the token as access token
          if (verifyError || !verifyData?.user) {
               console.log('Method 4: Trying to get user with token as access token...');
               try {
                    const result = await supabase.auth.getUser(token);
                    if (result.data?.user && !result.error) {
                         verifyData = { user: result.data.user, session: null };
                         verifyError = null;
                         console.log('Method 4 success: Found user with token as access token');
                    } else {
                         console.log('Method 4 failed:', result.error?.message);
                    }
               } catch (error) {
                    console.log('Method 4 failed with exception:', error);
               }
          }

          if (verifyError || !verifyData?.user) {
               console.log('ERROR: All token verification methods failed');
               console.log('Final verify error:', verifyError);

               await logServerAction({
                    action: 'Invite user validation failed',
                    error: 'Invalid or expired invite token',
                    duration_ms: Date.now() - start,
                    payload: {
                         token,
                         verifyError: verifyError instanceof Error ? verifyError.message : 'Unknown error'
                    },
                    status: 'fail',
                    user_id: null,
                    type: 'auth'
               });

               return NextResponse.redirect(`${requestUrl.origin}/auth/error?error=Invalid or expired invite link`);
          }

          const user = verifyData.user;
          const userId = user.id;
          const userEmail = user.email;
          const userName = user.user_metadata?.name || user.email?.split('@')[0] || '';

          console.log('User details extracted:');
          console.log('- User ID:', userId);
          console.log('- Email:', userEmail);
          console.log('- Name:', userName);
          console.log('- User metadata:', user.user_metadata);

          console.log('Checking if user already exists in tblSuperAdmins...');
          // Check if user already exists in tblSuperAdmins
          const { data: existingSuperAdmin, error: superAdminCheckError } = await supabase
               .from('tblSuperAdmins')
               .select('id')
               .eq('email', userEmail)
               .single();

          console.log('SuperAdmin check result:', {
               exists: !!existingSuperAdmin,
               error: superAdminCheckError?.message
          });

          if (!existingSuperAdmin) {
               console.log('User not found in tblSuperAdmins, creating new super admin...');

               // Generate a secret for the super admin
               const secret = randomBytes(16).toString('hex');
               console.log('Generated secret:', `${secret.substring(0, 8)}...`);

               const insertData = {
                    name: userName,
                    email: userEmail,
                    secret: secret,
                    user_id: userId,
                    created_at: new Date().toISOString()
               };

               console.log('Inserting super admin data:', {
                    ...insertData,
                    secret: `${secret.substring(0, 8)}...`
               });

               // Add user to tblSuperAdmins
               const { error: insertError } = await supabase
                    .from('tblSuperAdmins')
                    .insert(insertData);

               if (insertError) {
                    console.log('ERROR: Failed to insert super admin');
                    console.log('Insert error:', insertError);

                    await logServerAction({
                         action: 'Invite user super admin creation failed',
                         error: insertError.message,
                         duration_ms: Date.now() - start,
                         payload: {
                              email: userEmail,
                              userId,
                              insertError: insertError.message
                         },
                         status: 'fail',
                         user_id: userId,
                         type: 'auth'
                    });

                    return NextResponse.redirect(`${requestUrl.origin}/auth/error?error=Failed to create admin account`);
               }

               console.log('Super admin created successfully');
          } else {
               console.log('User already exists in tblSuperAdmins, skipping creation');
          }

          console.log('Logging successful invite acceptance...');
          // Log successful invite acceptance
          await logServerAction({
               action: 'Invite user accepted successfully',
               error: '',
               duration_ms: Date.now() - start,
               payload: {
                    email: userEmail,
                    userId
               },
               status: 'success',
               user_id: userId,
               type: 'auth'
          });

          console.log('Preparing redirect...');
          const callbackUrl = `${requestUrl.origin}/auth/callback?code=${verifyData.session?.access_token}`;
          console.log('Redirecting to:', callbackUrl);

          // Redirect to the callback URL to complete the authentication flow
          return NextResponse.redirect(callbackUrl);

     } catch (error) {
          console.log('=== UNEXPECTED ERROR ===');
          console.log('Error type:', error instanceof Error ? 'Error' : typeof error);
          console.log('Error message:', error instanceof Error ? error.message : 'Unknown error');
          console.log('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
          console.log('Error object:', error);

          await logServerAction({
               action: 'Invite user processing error',
               error: error instanceof Error ? error.message : 'Unknown error',
               duration_ms: Date.now() - start,
               payload: { token, error: error instanceof Error ? error.message : 'Unknown error' },
               status: 'fail',
               user_id: null,
               type: 'auth'
          });

          console.log('Redirecting to error page...');
          return NextResponse.redirect(`${requestUrl.origin}/auth/error?error=An unexpected error occurred`);
     } finally {
          console.log('=== INVITE USER ROUTE END ===');
          console.log('Total duration:', Date.now() - start, 'ms');
     }
}
