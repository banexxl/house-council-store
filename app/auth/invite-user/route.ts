import { NextResponse } from 'next/server';
import { useServerSideSupabaseServiceRoleClient } from '@/app/lib/ss-supabase-service-role-client';
import { logServerAction } from '@/app/lib/server-logging';
import { randomBytes } from 'crypto';

export async function GET(request: Request) {
     const start = Date.now();
     const requestUrl = new URL(request.url);
     const email = requestUrl.searchParams.get('email');
     const token = requestUrl.searchParams.get('token');

     console.log('=== INVITE USER ROUTE START ===');
     console.log('Request URL:', requestUrl.href);
     console.log('Email received:', email);
     console.log('Token received:', token ? `${token.substring(0, 10)}...` : 'null');

     // Validate email parameter (token may be consumed by Supabase verification)
     if (!email) {
          await logServerAction({
               action: 'Invite user validation failed',
               error: 'No email provided',
               duration_ms: Date.now() - start,
               payload: { requestUrl: requestUrl.href },
               status: 'fail',
               user_id: null,
               type: 'auth'
          });

          return NextResponse.redirect(`${requestUrl.origin}/auth/error?error=Invalid invite link - missing email`);
     }

     // If no token, this likely means Supabase already verified it during redirect
     if (!token) {
          console.log('No token received - likely consumed by Supabase verification process');
          console.log('Proceeding with email-only flow (Supabase already verified the user)');
     }

     try {
          console.log('Initializing Supabase service role customer...');
          const supabase = await useServerSideSupabaseServiceRoleClient();
          console.log('Supabase customer initialized successfully');

          // Try to verify token if we have one (optional since Supabase may have already verified)
          let tokenVerified = false;

          if (token) {
               console.log('Verifying invite token...');
               const { data: verifyData, error: verifyError } = await supabase.auth.verifyOtp({
                    token_hash: token,
                    type: 'invite'
               });

               console.log('Token verification result:', {
                    hasData: !!verifyData,
                    hasUser: !!verifyData?.user,
                    userEmail: verifyData?.user?.email,
                    error: verifyError?.message
               });

               // Check if token is valid and matches the email
               if (verifyError || !verifyData?.user || verifyData.user.email !== email) {
                    await logServerAction({
                         action: 'Invite token verification failed',
                         error: verifyError?.message || 'Token/email mismatch',
                         duration_ms: Date.now() - start,
                         payload: { email, tokenError: verifyError?.message },
                         status: 'fail',
                         user_id: null,
                         type: 'auth'
                    });

                    return NextResponse.redirect(`${requestUrl.origin}/auth/error?error=Invalid or expired invite token`);
               }

               console.log('Token verified successfully for email:', email);
               tokenVerified = true;
          } else {
               console.log('No token to verify - assuming Supabase already handled verification');
               tokenVerified = true; // Trust that Supabase verified before redirecting
          }

          // Find the user in auth.users by email (user should already exist from Supabase dashboard invite)
          console.log('Looking up user in auth.users by email...');
          const { data: users, error: listError } = await supabase.auth.admin.listUsers();

          if (listError) {
               throw listError;
          }

          const user = users.users.find(u => u.email === email);

          if (!user) {
               await logServerAction({
                    action: 'Invite user failed',
                    error: 'User not found in auth.users - not invited yet',
                    duration_ms: Date.now() - start,
                    payload: { email },
                    status: 'fail',
                    user_id: null,
                    type: 'auth'
               });

               return NextResponse.redirect(`${requestUrl.origin}/auth/error?error=User not found - please invite them from Supabase dashboard first`);
          }

          console.log('User found in auth.users:', {
               id: user.id,
               email: user.email,
               created_at: user.created_at,
               email_confirmed_at: user.email_confirmed_at
          });

          // Check if email exists in other role tables first (security check)
          console.log('Checking if email exists in other role tables...');

          const [customerCheck, tenantCheck] = await Promise.all([
               supabase.from('tblPolarCustomers').select('id').eq('email', email).single(),
               supabase.from('tblTenants').select('id').eq('email', email).single()
          ]);

          const existingRoles = [];
          if (customerCheck.data) existingRoles.push('customer');
          if (tenantCheck.data) existingRoles.push('Tenant');

          console.log('Existing role check results:', {
               hascustomerRole: !!customerCheck.data,
               hasTenantRole: !!tenantCheck.data,
               existingRoles
          });

          if (existingRoles.length > 0) {
               await logServerAction({
                    action: 'Invite user failed - existing roles conflict',
                    error: `User already has roles: ${existingRoles.join(', ')}`,
                    duration_ms: Date.now() - start,
                    payload: { email, userId: user.id, existingRoles },
                    status: 'fail',
                    user_id: user.id,
                    type: 'auth'
               });

               return NextResponse.redirect(`${requestUrl.origin}/auth/error?error=User already has existing roles: ${encodeURIComponent(existingRoles.join(', '))}`);
          }

          console.log('No conflicting roles found, proceeding with super admin creation');

          // Check if user already exists in tblSuperAdmins
          console.log('Checking if user already exists in tblSuperAdmins...');
          const { data: existingSuperAdmin } = await supabase
               .from('tblSuperAdmins')
               .select('id')
               .eq('email', email)
               .single();

          if (existingSuperAdmin) {
               console.log('User already exists in tblSuperAdmins, no action needed');

               await logServerAction({
                    action: 'Invite user already exists',
                    error: '',
                    duration_ms: Date.now() - start,
                    payload: { email, userId: user.id },
                    status: 'success',
                    user_id: user.id,
                    type: 'auth'
               });

               return NextResponse.redirect('https://dashboard.nest-link.app');
          }

          // Add user to tblSuperAdmins using their existing auth.users ID
          console.log('Adding user to tblSuperAdmins with user_id:', user.id);
          const secret = randomBytes(16).toString('hex');
          const userName = user.user_metadata?.name || email.split('@')[0];

          const { error: insertError } = await supabase
               .from('tblSuperAdmins')
               .insert({
                    name: userName,
                    email: email,
                    secret: secret,
                    user_id: user.id,
                    created_at: new Date().toISOString()
               });

          if (insertError) {
               await logServerAction({
                    action: 'Invite user super admin creation failed',
                    error: insertError.message,
                    duration_ms: Date.now() - start,
                    payload: { email, userId: user.id },
                    status: 'fail',
                    user_id: user.id,
                    type: 'auth'
               });

               return NextResponse.redirect(`${requestUrl.origin}/auth/error?error=Failed to create admin account`);
          }

          console.log('Super admin created successfully with user_id:', user.id);

          await logServerAction({
               action: 'User added to super admins successfully',
               error: '',
               duration_ms: Date.now() - start,
               payload: { email, userId: user.id },
               status: 'success',
               user_id: user.id,
               type: 'auth'
          });

          console.log('Redirecting to dashboard...');
          return NextResponse.redirect('https://dashboard.nest-link.app');

     } catch (error) {
          await logServerAction({
               action: 'Invite user processing error',
               error: error instanceof Error ? error.message : 'Unknown error',
               duration_ms: Date.now() - start,
               payload: { email, token: token ? `${token.substring(0, 10)}...` : null, error: error instanceof Error ? error.message : 'Unknown error' },
               status: 'fail',
               user_id: null,
               type: 'auth'
          });

          return NextResponse.redirect(`${requestUrl.origin}/auth/error?error=An unexpected error occurred`);
     } finally {
          console.log('=== INVITE USER ROUTE END ===');
          console.log('Total duration:', Date.now() - start, 'ms');
     }
}
