"use client";

import type { RealtimeChannel, RealtimePostgresChangesPayload } from "@supabase/supabase-js";
import log from "./logger";
import { supabaseBrowserClient } from "./sb-browser-client";

type AnyChannel = RealtimeChannel & {
     on: (
          type: "postgres_changes",
          filter: { event: "*" | "INSERT" | "UPDATE" | "DELETE"; schema: string; table: string; filter?: string },
          callback: (payload: any) => void
     ) => AnyChannel;
};

export interface InitListenerOptions<T extends Record<string, any> = Record<string, any>> {
     schema?: string;                 // default 'public'
     channelName?: string;            // fixed name optional
     filter?: string;                 // e.g. "user_id=eq.<uuid>"
     onEvent: (payload: RealtimePostgresChangesPayload<T>) => void;
}

/** Wait until we have an authenticated session (so the WS uses an auth JWT, not anon). */
async function waitForSessionJwt(): Promise<string | null> {
     const { data } = await supabaseBrowserClient.auth.getSession();
     if (data.session?.access_token) return data.session.access_token;

     return new Promise((resolve) => {
          const { data: sub } = supabaseBrowserClient.auth.onAuthStateChange((_e, session) => {
               if (session?.access_token) {
                    sub.subscription.unsubscribe();
                    resolve(session.access_token);
               }
          });
     });
}

/** Subscribe to a table (INSERT/UPDATE/DELETE). Returns an async cleanup fn. */
export async function initTableRealtimeListener<T extends Record<string, any> = Record<string, any>>(
     table: string,
     events: Array<"INSERT" | "UPDATE" | "DELETE"> = ["INSERT", "UPDATE", "DELETE"],
     { schema = "public", channelName, filter, onEvent }: InitListenerOptions<T>
): Promise<() => Promise<void>> {
     // 1) Ensure WS is authenticated
     const jwt = await waitForSessionJwt();
     if (jwt) {
          // keep WS auth in sync (defensive; SDK usually does this automatically)
          (supabaseBrowserClient.realtime as any)?.setAuth?.(jwt);
     }

     // 2) Channel
     const name = channelName || `rt-${schema}-${table}-${Math.random().toString(36).slice(2, 9)}`;
     const base = { schema, table } as const;
     const f = (filter && filter.trim()) ? { filter } : {};
     let channel = supabaseBrowserClient.channel(name) as AnyChannel;

     const attachListeners = (target: AnyChannel) => {
          for (const ev of events) {
               target.on("postgres_changes", { event: ev, ...base, ...f }, (payload: any) => {
                    onEvent(payload as RealtimePostgresChangesPayload<T>);
               });
          }
     };

     const subscribeChannel = (target: AnyChannel, reason: "initial" | "reconnect" = "initial") => {
          target.subscribe((status) => {
               log(`[Realtime] Channel status (${reason}): ${status}`);
          });
     };

     // 3) Attach listeners (no empty filter!)
     attachListeners(channel);

     // 4) Subscribe (with status logs)
     subscribeChannel(channel, "initial");

     // 4b) When tab regains focus/visibility or network returns, try to re-subscribe
     const tryResubscribe = async () => {
          if (typeof document !== 'undefined' && document.visibilityState !== 'visible') return;
          const state = (channel as any)?.state;

          log(`[Realtime] Focus/online/visible; channel state: ${state}`);

          // Recreate the channel instance if it was closed/errored (subscribe is one-shot per instance).
          if (state === "closed" || state === "errored") {
               const prev = channel;
               try {
                    await supabaseBrowserClient.removeChannel(prev);
               } catch { }
               channel = supabaseBrowserClient.channel(name) as AnyChannel;
               attachListeners(channel);
               subscribeChannel(channel, "reconnect");
          }
     };

     const onFocus = () => { void tryResubscribe(); };
     const onVisible = () => { void tryResubscribe(); };
     const onOnline = () => { void tryResubscribe(); };

     if (typeof window !== 'undefined') {
          window.addEventListener('focus', onFocus);
          window.addEventListener('online', onOnline);
     }
     if (typeof document !== 'undefined') {
          document.addEventListener('visibilitychange', onVisible);
     }

     // 5) Cleanup
     return async () => {
          if (typeof window !== 'undefined') {
               window.removeEventListener('focus', onFocus);
               window.removeEventListener('online', onOnline);
          }
          if (typeof document !== 'undefined') {
               document.removeEventListener('visibilitychange', onVisible);
          }
          await supabaseBrowserClient.removeChannel(channel);
     };
}

export const initClientSubscriptionRealtime = <T extends Record<string, any> = Record<string, any>>(
     clientId: string,
     onEvent: InitListenerOptions<T>["onEvent"]
) => {
     // Enforce a non-empty filter; if missing, no-op with safe cleanup
     if (!clientId) {
          log('[Realtime] initClientSubscriptionRealtime called without clientId; skipping subscribe.', 'warn');
          return Promise.resolve(async () => { /* noop */ });
     }

     // Correct Postgres filter syntax requires operator (eq.)
     const filter = `client_id=eq.${clientId}`;

     log(`[Realtime] Subscribing to tblClient_Subscription ${filter}`, 'info');


     return initTableRealtimeListener<T>("tblClient_Subscription", ["INSERT", "UPDATE", "DELETE"], {
          schema: "public",
          channelName: `client_${clientId}_subscription`,
          filter,
          onEvent: (payload) => {
               log(`[Realtime] Client subscription event ${JSON.stringify(payload)}`);
               onEvent(payload as RealtimePostgresChangesPayload<T>);
          },
     });
}
