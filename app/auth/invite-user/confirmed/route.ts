import { NextResponse } from 'next/server';
import { useServerSideSupabaseServiceRoleClient } from '@/app/lib/ss-supabase-service-role-client';
import { logServerAction } from '@/app/lib/server-logging';
import { randomBytes } from 'crypto';

export async function GET(request: Request) {
     const start = Date.now();
     const requestUrl = new URL(request.url);

     console.log('=== INVITE CONFIRMED ROUTE START ===');
     console.log('Request URL:', requestUrl.href);

     try {
          console.log('Initializing Supabase service role client...');
          const supabase = await useServerSideSupabaseServiceRoleClient();
          console.log('Supabase client initialized successfully');

          // Get the current session (user should be authenticated after confirmation)
          console.log('Getting current session...');
          const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

          console.log('Session result:', {
               hasSession: !!sessionData?.session,
               hasUser: !!sessionData?.session?.user,
               error: sessionError?.message
          });

          if (sessionError || !sessionData?.session?.user) {
               console.log('ERROR: No valid session found after confirmation');

               await logServerAction({
                    action: 'Invite confirmation failed',
                    error: 'No valid session after confirmation',
                    duration_ms: Date.now() - start,
                    payload: { sessionError: sessionError?.message },
                    status: 'fail',
                    user_id: null,
                    type: 'auth'
               });

               return NextResponse.redirect(`${requestUrl.origin}/auth/error?error=Session verification failed`);
          }

          const user = sessionData.session.user;
          const userId = user.id;
          const userEmail = user.email;
          const userName = user.user_metadata?.name || user.email?.split('@')[0] || '';

          console.log('User details from session:');
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

          console.log('Redirecting to main application...');
          // Redirect to the main application (dashboard or home)
          return NextResponse.redirect(`${requestUrl.origin}/`);

     } catch (error) {
          console.log('=== UNEXPECTED ERROR ===');
          console.log('Error type:', error instanceof Error ? 'Error' : typeof error);
          console.log('Error message:', error instanceof Error ? error.message : 'Unknown error');
          console.log('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
          console.log('Error object:', error);

          await logServerAction({
               action: 'Invite confirmation processing error',
               error: error instanceof Error ? error.message : 'Unknown error',
               duration_ms: Date.now() - start,
               payload: { error: error instanceof Error ? error.message : 'Unknown error' },
               status: 'fail',
               user_id: null,
               type: 'auth'
          });

          console.log('Redirecting to error page...');
          return NextResponse.redirect(`${requestUrl.origin}/auth/error?error=An unexpected error occurred`);
     } finally {
          console.log('=== INVITE CONFIRMED ROUTE END ===');
          console.log('Total duration:', Date.now() - start, 'ms');
     }
}