import { NextResponse } from 'next/server';
import { useServerSideSupabaseServiceRoleClient } from '@/app/lib/ss-supabase-service-role-client';
import { logServerAction } from '@/app/lib/server-logging';
import { randomBytes } from 'crypto';

export async function GET(request: Request) {
     const start = Date.now();
     const requestUrl = new URL(request.url);
     const token = requestUrl.searchParams.get('token');
     const email = requestUrl.searchParams.get('email'); // In case email is passed separately

     console.log('=== INVITE USER ROUTE START ===');
     console.log('Request URL:', requestUrl.href);
     console.log('Token received:', token ? `${token.substring(0, 10)}...` : 'null');
     console.log('Email received:', email);

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

          // For expired tokens, redirect to Supabase's built-in confirmation URL
          // This will handle the token verification and redirect back to our callback
          console.log('Redirecting to Supabase confirmation URL...');

          const supabaseUrl = process.env.SUPABASE_URL;
          const confirmationUrl = `${supabaseUrl}/auth/v1/verify?token=${token}&type=invite&redirect_to=${encodeURIComponent(`${requestUrl.origin}/auth/invite-user/confirmed`)}`;

          console.log('Confirmation URL:', confirmationUrl);

          return NextResponse.redirect(confirmationUrl);

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
