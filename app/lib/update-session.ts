import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {

     let supabaseResponse = NextResponse.next({
          request,
     });

     const supabase = createServerClient(
          process.env.SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          {
               cookies: {
                    getAll() {
                         return request.cookies.getAll();
                    },
                    setAll(cookiesToSet) {
                         cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value));
                         supabaseResponse = NextResponse.next({
                              request,
                         });
                         cookiesToSet.forEach(({ name, value, options }) =>
                              supabaseResponse.cookies.set(name, value, options)
                         );
                    },
               },
          }
     );

     // Retrieve the authenticated user
     const {
          data: { user },
     } = await supabase.auth.getUser();

     const { pathname } = request.nextUrl;

     // Define public routes that don't require authentication
     const publicRoutes = [
          '/auth/sign-in',
          '/auth/callback',
          '/auth/error',
          '/auth/register',
          '/auth/registration-confirmation',
          '/auth/registration-confirmed',
          '/auth/reset-password',
          '/documentation',
          '/pricing',
          '/contact',
          '/api/polar',
          '/api/polar/webhook/',
     ];
     const isPublicRoute =
          pathname === '/' ||
          publicRoutes.some(route => pathname === route || pathname.startsWith(`${route}/`));

     // Always allow access to the error page
     if (pathname.startsWith('/auth/error')) {
          return supabaseResponse;
     }

     if (user) {
          // User is authenticated
          if (pathname === '/auth/sign-in'
               || pathname === '/auth/registration-confirmation'
               || pathname === '/auth/registration-confirmed'
               || pathname === '/auth/register'
          ) {
               // Redirect to homepage if trying to access login page or root
               return NextResponse.redirect(new URL('/', request.url));
          }
          // Allow authenticated users to access any route
          return supabaseResponse;
     } else {
          // User is not authenticated
          if (!isPublicRoute) {
               // Redirect to login page if trying to access a protected route
               return NextResponse.redirect(new URL('/auth/sign-in', request.url));
          }

          // Return the response for all other cases
          return supabaseResponse;
     }
}