// app/lib/sb-realtime.ts
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
     schema?: string;
     channelName?: string;
     filter?: string;
     onEvent: (payload: RealtimePostgresChangesPayload<T>) => void;
}

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

export async function initTableRealtimeListener<T extends Record<string, any> = Record<string, any>>(
     table: string,
     events: Array<"INSERT" | "UPDATE" | "DELETE"> = ["INSERT", "UPDATE", "DELETE"],
     { schema = "public", channelName, filter, onEvent }: InitListenerOptions<T>
): Promise<() => Promise<void>> {
     const jwt = await waitForSessionJwt();
     if (jwt) (supabaseBrowserClient.realtime as any)?.setAuth?.(jwt);

     const name = channelName || `rt-${schema}-${table}-${Math.random().toString(36).slice(2, 9)}`;
     const base = { schema, table } as const;
     const f = filter && filter.trim() ? { filter } : {};

     const channel = supabaseBrowserClient.channel(name) as AnyChannel;

     for (const ev of events) {
          channel.on("postgres_changes", { event: ev, ...base, ...f }, (payload: any) => {
               onEvent(payload as RealtimePostgresChangesPayload<T>);
          });
     }

     // Wait for SUBSCRIBED (so caller knows it really connected)
     await new Promise<void>((resolve, reject) => {
          channel.subscribe((status: string, err?: any) => {
               log(`[Realtime] Channel status (initial): ${status}`);

               if (err) {
                    console.error("[Realtime] subscribe error details:", err);
                    log(`[Realtime] subscribe error details: ${JSON.stringify(err)}`, "error");
               }

               if (status === "SUBSCRIBED") resolve();
               if (status === "TIMED_OUT" || status === "CHANNEL_ERROR") {
                    reject(new Error(`Realtime subscribe failed: ${status}`));
               }
          });
     });

     return async () => {
          try {
               await supabaseBrowserClient.removeChannel(channel);
          } catch { }
     };
}

// ✅ NEW: Subscribe by unique subscriptionId only
export const initPolarSubscriptionRealtime = <T extends Record<string, any> = Record<string, any>>(
     subscriptionId: string,
     onEvent: InitListenerOptions<T>["onEvent"]
) => {
     if (!subscriptionId) {
          log("[Realtime] initPolarSubscriptionRealtime called without subscriptionId; skipping.", "warn");
          return Promise.resolve(async () => { });
     }

     const filter = `id=eq.${subscriptionId}`;
     log(`[Realtime] Subscribing to tblPolarSubscriptions with filter: ${filter}`, "info");

     return initTableRealtimeListener<T>("tblPolarSubscriptions", ["INSERT", "UPDATE", "DELETE"], {
          schema: "public",
          channelName: `polar_subscription_${subscriptionId}`,
          filter,
          onEvent,
     });
};
