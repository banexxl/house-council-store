"use client"; // Ensures this component runs only on the client side (hooks + Supabase browser client)

import { useEffect } from "react"; // React hooks for lifecycle
import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js"; // Type for realtime payload shape
import log from "./logger";
import { initClientSubscriptionRealtime } from "./sb-realtime";
import { supabaseBrowserClient } from "./sb-browser-client";

// Domain model: minimal subset of tblClient_Subscription columns needed here
interface ClientSubscriptionRow {
     id: string;
     client_id: string;
     status: "trialing" | "active" | "past_due" | "canceled";
     next_payment_date: string | null;
}

interface ClientSubscriptionWatcherProps {
     clientId: string;
}

export default function ClientSubscriptionWatcher({ clientId }: ClientSubscriptionWatcherProps) {

     useEffect(() => { // Core effect: sets up initial validation, realtime listener, and polling fallback
          let cleanup: (() => Promise<void>) | null = null; // Function to unsubscribe realtime channel
          let clientStatusChannel: ReturnType<typeof supabaseBrowserClient.channel> | null = null; // separate channel for client status
          let intervalId: any = null;

          async function start() { // Orchestrates the lifecycle: initial status check -> realtime -> polling
               if (!clientId) return;

               // Step 0: Initial snapshot validation - if subscription missing or not allowed, force sign-out early
               try {
                    const { data: current, error: readErr } = await supabaseBrowserClient
                         .from('tblClient_Subscription')
                         .select('status')
                         .eq('client_id', clientId)
                         .single();
                    if (!readErr) { // Successfully read subscription row
                         const statusNow = (current as any)?.status as string | undefined;
                         if (!statusNow || (statusNow !== 'active' && statusNow !== 'trialing')) { // Disallow anything outside permitted statuses
                              log(`[ClientSubscriptionWatcher] Non-active/trialing status on load; signing out`, 'info');
                              return; // skip setting up realtime if we just signed out
                         }
                    } else { // Read error -> conservative approach: sign out
                         log(`[ClientSubscriptionWatcher] Failed to read current subscription; treating as non-active ${readErr?.message}`, 'error');
                         return;
                    }
               } catch (e) { // Unexpected exception -> also sign out to avoid unauthorized access
                    log(`[ClientSubscriptionWatcher] Error during initial status check ${e}`, 'error');
                    return;
               }

               // Realtime listener: reacts to UPDATE / DELETE events on this client's subscription row
               cleanup = await initClientSubscriptionRealtime(clientId, async (payload: RealtimePostgresChangesPayload<any>) => {

                    log(`[ClientSubscriptionWatcher] Realtime payload ${JSON.stringify({
                         eventType: (payload as any).eventType,
                         new: (payload as any).new,
                         old: (payload as any).old,
                    })}`);

                    try { // Defensive parsing + decision logic
                         const raw = (payload.new || payload.old || {}) as Partial<ClientSubscriptionRow>;
                         const row: ClientSubscriptionRow | null = (raw && typeof raw === 'object')
                              ? {
                                   id: String((raw as any).id || ''),
                                   client_id: String((raw as any).client_id || ''),
                                   status: ((raw as any).status as any) ?? 'active',
                                   next_payment_date: (raw as any).next_payment_date ?? null,
                              }
                              : null;
                         if (!row) return;

                         const status = row.status;
                         const affectedClientId = row.client_id;

                         if (affectedClientId !== clientId) return; // Ignore stray events (shouldn't happen with filter)

                         const isAllowed = status === 'active' || status === 'trialing'; // Allowed statuses that keep the session
                         if ((payload.eventType === "DELETE") || (payload.eventType === "UPDATE" && status && !isAllowed)) { // Any disallowed transition => sign out
                              if (process.env.NODE_ENV !== 'production') {
                                   console.warn('[ClientSubscriptionWatcher] Realtime triggered sign-out', {
                                        eventType: (payload as any).eventType,
                                        status
                                   });
                              }
                         }
                         return;
                    } catch (e) {
                         log(`[ClientSubscriptionWatcher] error handling payload: ${JSON.stringify(payload)}`, 'error');
                    }
               });

          }

          start();

          return () => { // Cleanup on unmount or clientId change
               if (cleanup) cleanup().catch(() => { });
               if (intervalId) clearInterval(intervalId);
               if (clientStatusChannel) {
                    try { supabaseBrowserClient.removeChannel(clientStatusChannel); } catch { }
               }
          };
     }, [clientId]);

     return null; // No UI rendered; purely behavioral component
}
