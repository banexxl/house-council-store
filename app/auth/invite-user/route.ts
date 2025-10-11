import { NextResponse } from 'next/server';
import { useServerSideSupabaseServiceRoleClient } from '@/app/lib/ss-supabase-service-role-client';
import { logServerAction } from '@/app/lib/server-logging';
import { randomBytes } from 'crypto';

export async function GET(request: Request) {
     const start = Date.now();
     const requestUrl = new URL(request.url);
     const token = requestUrl.searchParams.get('token');

     // Validate token parameter
     if (!token) {
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
          const supabase = await useServerSideSupabaseServiceRoleClient();

          // Verify the invite token using Supabase's built-in invite verification
          const { data: verifyData, error: verifyError } = await supabase.auth.verifyOtp({
               token_hash: token,
               type: 'invite'
          });

          if (verifyError || !verifyData.user) {
               await logServerAction({
                    action: 'Invite user validation failed',
                    error: 'Invalid or expired invite token',
                    duration_ms: Date.now() - start,
                    payload: { token, verifyError: verifyError?.message },
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

          // Check if user already exists in tblSuperAdmins
          const { data: existingSuperAdmin, error: superAdminCheckError } = await supabase
               .from('tblSuperAdmins')
               .select('id')
               .eq('email', userEmail)
               .single();

          if (!existingSuperAdmin) {
               // Generate a secret for the super admin
               const secret = randomBytes(16).toString('hex');

               // Add user to tblSuperAdmins
               const { error: insertError } = await supabase
                    .from('tblSuperAdmins')
                    .insert({
                         name: userName,
                         email: userEmail,
                         secret: secret,
                         user_id: userId,
                         created_at: new Date().toISOString()
                    });

               if (insertError) {
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
          }

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

          // Redirect to the callback URL to complete the authentication flow
          return NextResponse.redirect(`${requestUrl.origin}/auth/callback?code=${verifyData.session?.access_token}`);

     } catch (error) {
          await logServerAction({
               action: 'Invite user processing error',
               error: error instanceof Error ? error.message : 'Unknown error',
               duration_ms: Date.now() - start,
               payload: { token, error: error instanceof Error ? error.message : 'Unknown error' },
               status: 'fail',
               user_id: null,
               type: 'auth'
          });

          return NextResponse.redirect(`${requestUrl.origin}/auth/error?error=An unexpected error occurred`);
     }
}
