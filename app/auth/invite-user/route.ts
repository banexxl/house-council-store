import { NextResponse } from 'next/server';
import { useServerSideSupabaseServiceRoleClient } from '@/app/lib/ss-supabase-service-role-client';
import { logServerAction } from '@/app/lib/server-logging';
import { randomBytes } from 'crypto';

export async function GET(request: Request) {
     const start = Date.now();
     const requestUrl = new URL(request.url);
     const email = requestUrl.searchParams.get('email');

     console.log('=== INVITE USER ROUTE START ===');
     console.log('Request URL:', requestUrl.href);
     console.log('Email received:', email);

     // Validate email parameter
     if (!email) {
          console.log('ERROR: No email provided in request');

          await logServerAction({
               action: 'Invite user validation failed',
               error: 'No email provided',
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

          // Find the user in auth.users by email (user should already exist from Supabase dashboard invite)
          console.log('Looking up user in auth.users by email...');
          const { data: users, error: listError } = await supabase.auth.admin.listUsers();

          if (listError) {
               console.log('ERROR: Failed to list users');
               console.log('List error:', listError);
               throw listError;
          }

          const user = users.users.find(u => u.email === email);

          if (!user) {
               console.log('ERROR: User not found in auth.users - they may not have been invited yet');

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

               return NextResponse.redirect(`${requestUrl.origin}/?message=User is already a super admin`);
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
               console.log('ERROR: Failed to insert super admin');
               console.log('Insert error:', insertError);

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

          console.log('Redirecting to success page...');
          return NextResponse.redirect(`${requestUrl.origin}/?message=User successfully added as super admin`);

     } catch (error) {
          console.log('=== UNEXPECTED ERROR ===');
          console.log('Error type:', error instanceof Error ? 'Error' : typeof error);
          console.log('Error message:', error instanceof Error ? error.message : 'Unknown error');
          console.log('Error stack:', error instanceof Error ? error.stack : 'No stack trace');

          await logServerAction({
               action: 'Invite user processing error',
               error: error instanceof Error ? error.message : 'Unknown error',
               duration_ms: Date.now() - start,
               payload: { email, error: error instanceof Error ? error.message : 'Unknown error' },
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
