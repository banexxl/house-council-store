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
                         cookiesToSet.forEach(({ name, value, options }) => {
                              supabaseResponse.cookies.set(name, value, options);
                         });


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
          "/",
          "/auth/sign-in",
          "/auth/callback",
          "/auth/error",
          "/auth/forgot-password",
          "/auth/invite-user",
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
     // Authenticated: enforce MFA (AAL2) ONLY if the user has a verified TOTP factor
     // -----------------------------
     const isProtectedRoute = !isPublicRoute;

     if (isProtectedRoute) {
          const aal = getAalFromJwt(session?.access_token);

          if (aal !== "aal2") {
               // Check if user actually has MFA enrolled (verified TOTP)
               const { data: factorsData, error: factorsErr } = await supabase.auth.mfa.listFactors();

               // If we can't read factors, be conservative: require MFA only if you want strict behavior.
               // Here we choose: if factors can't be checked, DO NOT force MFA (prevents lockouts).
               if (factorsErr) {
                    return supabaseResponse;
               }

               const hasVerifiedTotp =
                    !!factorsData?.totp?.some((f) => f.status === "verified");

               // ✅ If no verified TOTP, do NOT force OTP
               if (!hasVerifiedTotp) {
                    return supabaseResponse;
               }

               // ✅ Verified TOTP exists -> force OTP
               const url = request.nextUrl.clone();
               url.pathname = "/auth/sign-in";
               url.searchParams.set("mfa", "1");
               url.searchParams.set("next", pathname);
               return NextResponse.redirect(url);
          }
     }


     /// -----------------------------
     // Bounce authenticated users away from auth pages
     // BUT allow /auth/sign-in when MFA is enrolled and not yet completed
     // -----------------------------
     const authPagesToBounce = [
          "/auth/sign-in",
          "/auth/register",
          "/auth/registration-confirmation",
          "/auth/registration-confirmed",
     ];

     if (authPagesToBounce.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
          const aal = getAalFromJwt(session?.access_token);

          if (aal === "aal2") {
               // Fully authed -> bounce
               return NextResponse.redirect(new URL("/", request.url));
          }

          // AAL1: bounce ONLY if user has no verified TOTP (i.e. MFA not enrolled)
          const { data: factorsData, error: factorsErr } = await supabase.auth.mfa.listFactors();

          // If we can't check factors, don't bounce to avoid trapping users
          if (factorsErr) {
               return supabaseResponse;
          }

          const hasVerifiedTotp = !!factorsData?.totp?.some((f) => f.status === "verified");

          if (!hasVerifiedTotp) {
               // Logged in, no MFA enrolled -> bounce away from auth pages
               return NextResponse.redirect(new URL("/", request.url));
          }

          // Has MFA enrolled but session is AAL1 -> allow /auth/sign-in (they must enter OTP)
          return supabaseResponse;
     }

}

export const config = {
     matcher: [
          "/((?!api/|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
     ],
};
