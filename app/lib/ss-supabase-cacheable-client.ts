import { createClient } from "@supabase/supabase-js"

/**
 * Plain, cookie-free Supabase client (service role) for use inside
 * `unstable_cache`-wrapped reads — `unstable_cache` forbids calling dynamic
 * APIs like `cookies()`/`headers()` inside its callback, which rules out the
 * cookie-bound clients in ss-supabase-anon-client.ts /
 * ss-supabase-service-role-client.ts. Safe to bypass RLS here because every
 * caller already resolves the id it queries by from the caller's own
 * session before invoking these cached reads (see subscription-plan-actions.ts).
 */
export function getCacheableServiceRoleClient() {
     return createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SB_SERVICE_KEY!
     )
}
