"use client"

import { useEffect, useState } from "react"
import type { User } from "@supabase/supabase-js"
import { supabaseBrowserClient } from "./sb-browser-client"

/**
 * Client-side auth state, kept out of the root layout so pages that don't
 * otherwise touch cookies/headers can render statically. `getSession()` reads
 * the locally cached session (no network round trip for a valid session,
 * unlike `getUser()`), so this resolves essentially immediately on mount.
 */
export function useAuthUser(): User | null {
     const [user, setUser] = useState<User | null>(null)

     useEffect(() => {
          let active = true

          supabaseBrowserClient.auth.getSession().then(({ data }) => {
               if (active) setUser(data.session?.user ?? null)
          })

          const { data: subscription } = supabaseBrowserClient.auth.onAuthStateChange(
               (_event, session) => {
                    setUser(session?.user ?? null)
               }
          )

          return () => {
               active = false
               subscription.subscription.unsubscribe()
          }
     }, [])

     return user
}

/**
 * Signs out via the browser client so the shared @supabase/ssr cookies clear
 * immediately and `onAuthStateChange` fires — callers should await this
 * before refreshing/navigating.
 */
export async function signOutClient(): Promise<void> {
     await supabaseBrowserClient.auth.signOut()
}
