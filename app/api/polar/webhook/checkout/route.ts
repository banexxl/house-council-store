// app/api/polar/webhook/checkout/route.ts
import { logServerAction } from "@/app/lib/server-logging";
import { useServerSideSupabaseAnonClient } from "@/app/lib/ss-supabase-anon-client";
import { Webhooks } from "@polar-sh/nextjs";

export const runtime = "nodejs";

// ---------------------------------------------------------------------------
// Checkout Webhook Handler
// ---------------------------------------------------------------------------

export const POST = Webhooks({
     webhookSecret: process.env.POLAR_WEBHOOK_SECRET_SANDBOX_CHECKOUT!,

     onCheckoutCreated: async (payload) => {
          const t0 = Date.now();
          console.log('Checkout created webhook received:', payload);
          const supabase = await useServerSideSupabaseAnonClient();
          try {
               // Upsert checkout data to database
               const { error: upsertError } = await supabase
                    .from("tblPolarCheckout")
                    .upsert(payload, { onConflict: "id" });
               console.log('upsertcheckout error', upsertError);

               if (upsertError) throw upsertError;

          } catch (e: any) {
               const err = e instanceof Error ? e : new Error(e?.message ?? "unknown error");
               await logServerAction({
                    user_id: null,
                    action: "Store Webhook - checkout.created failed",
                    payload: { type: payload.type },
                    status: "fail",
                    error: err.message,
                    duration_ms: Date.now() - t0,
                    type: "internal",
               });
               throw err;
          }
     },

     onCheckoutUpdated: async (payload) => {
          const t0 = Date.now();
          console.log('Checkout updated webhook received:', payload);
          const supabase = await useServerSideSupabaseAnonClient();
          try {
               // Upsert checkout data to database
               const { error: upsertError } = await supabase
                    .from("tblPolarCheckout")
                    .upsert(payload, { onConflict: "id" });

               if (upsertError) throw upsertError;

          } catch (e: any) {
               const err = e instanceof Error ? e : new Error(e?.message ?? "unknown error");
               await logServerAction({
                    user_id: null,
                    action: "Store Webhook - checkout.updated failed",
                    payload: { type: payload.type },
                    status: "fail",
                    error: err.message,
                    duration_ms: Date.now() - t0,
                    type: "internal",
               });
               throw err;
          }
     }
});
