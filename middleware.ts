import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

function getAalFromJwt(accessToken?: string | null): string | null {
     if (!accessToken) return null;

     try {
          const payload = accessToken.split(".")[1];
          const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
          const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
          const json = JSON.parse(Buffer.from(padded, "base64").toString("utf8"));
          return json?.aal ?? null; // "aal1" | "aal2"
     } catch {
          return null;
     }
}

export async function middleware(request: NextRequest) {
     let supabaseResponse = NextResponse.next({ request });

     const supabase = createServerClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SB_CLIENT_KEY!,
          {
               cookies: {
                    getAll() {
                         return request.cookies.getAll();
                    },
                    setAll(cookiesToSet) {
                         cookiesToSet.forEach(({ name, value, options }) =>
                              request.cookies.set(name, value)
                         );

                         supabaseResponse = NextResponse.next({ request });

                         cookiesToSet.forEach(({ name, value, options }) =>
                              supabaseResponse.cookies.set(name, value, options)
                         );
                    },
               },
          }
     );

     const { pathname } = request.nextUrl;

     // -----------------------------
     // Public routes (no auth needed)
     // -----------------------------
     const publicRoutes = [
          "/", // keep if your homepage is public marketing; remove if "/" is your app dashboard
          "/auth/sign-in",
          "/auth/callback",
          "/auth/error",
          "/auth/register",
          "/auth/registration-confirmation",
          "/auth/registration-confirmed",
          "/auth/reset-password",
          "/documentation",
          "/pricing",
          "/contact",
          "/api/polar",
          "/api/polar/webhook",
     ];

     const isPublicRoute = publicRoutes.some(
          (route) => pathname === route || pathname.startsWith(`${route}/`)
     );

     if (pathname.startsWith("/auth/error")) {
          return supabaseResponse;
     }

     const {
          data: { session },
     } = await supabase.auth.getSession();

     const {
          data: { user },
     } = await supabase.auth.getUser();

     // -----------------------------
     // Not authenticated
     // -----------------------------
     if (!user) {
          if (!isPublicRoute) {
               return NextResponse.redirect(new URL("/auth/sign-in", request.url));
          }
          return supabaseResponse;
     }

     // -----------------------------
     // Authenticated: enforce MFA (AAL2) on protected routes
     // -----------------------------
     const isProtectedRoute = !isPublicRoute;

     if (isProtectedRoute) {
          const aal = getAalFromJwt(session?.access_token);

          if (aal !== "aal2") {
               // redirect to sign-in with a hint to show OTP UI
               const url = request.nextUrl.clone();
               url.pathname = "/auth/sign-in";
               url.searchParams.set("mfa", "1");
               url.searchParams.set("next", pathname); // optional: return after verification
               return NextResponse.redirect(url);
          }
     }

     // Optional: if you're already AAL2, keep your old behavior (bounce away from auth pages)
     const authPagesToBounce = [
          "/auth/sign-in",
          "/auth/register",
          "/auth/registration-confirmation",
          "/auth/registration-confirmed",
     ];

     const aal = getAalFromJwt(session?.access_token);
     if (aal === "aal2" && authPagesToBounce.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
          return NextResponse.redirect(new URL("/", request.url));
     }

     return supabaseResponse;
}

export const config = {
     matcher: [
          "/((?!api/|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
     ],
};
