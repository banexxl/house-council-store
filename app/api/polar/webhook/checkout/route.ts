// app/api/polar/webhook/checkout/route.ts
import { logServerAction } from "@/app/lib/server-logging";
import { Webhooks } from "@polar-sh/nextjs";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

// ✅ Webhooks should use SERVICE ROLE (bypasses RLS)
const supabase = createClient(
     process.env.NEXT_PUBLIC_SUPABASE_URL!,
     process.env.SB_SERVICE_KEY!
);

// ---------------------------------------------------------------------------
// Checkout Webhook Handler
// ---------------------------------------------------------------------------

export const POST = Webhooks({
     webhookSecret: process.env.POLAR_WEBHOOK_SECRET_CHECKOUT!,

     onCheckoutCreated: async (payload) => {
          const t0 = Date.now();
          console.log('Checkout created webhook received:', JSON.stringify(payload, null, 2));
          try {
               // Upsert checkout data to database
               const { data, error: upsertError } = await supabase
                    .from("tblPolarCheckouts")
                    .upsert(payload.data, { onConflict: "id" })
                    .select();

               if (upsertError) {
                    await logServerAction({
                         user_id: payload.data.customerId || null,
                         action: "Store Webhook - checkout.updated failed",
                         payload: { checkout_id: payload.data.id, error: upsertError.message },
                         status: "fail",
                         error: upsertError.message,
                         duration_ms: Date.now() - t0,
                         type: "webhook",
                    });
               }

               await logServerAction({
                    user_id: payload.data.customerId || null,
                    action: "Store Webhook - checkout.created success",
                    payload: { checkout_id: payload.data.id },
                    status: "success",
                    error: "",
                    duration_ms: Date.now() - t0,
                    type: "webhook",
               });

          } catch (e: any) {
               console.error('Checkout created error:', e);
               console.error('Error message:', e?.message);
               console.error('Error stack:', e?.stack);
               const errorMessage = e?.message || e?.toString() || "unknown error";
               await logServerAction({
                    user_id: null,
                    action: "Store Webhook - checkout.created failed",
                    payload: { type: payload.type, error: errorMessage },
                    status: "fail",
                    error: errorMessage,
                    duration_ms: Date.now() - t0,
                    type: "webhook",
               });
               throw new Error(errorMessage);
          }
     },

     onCheckoutUpdated: async (payload) => {
          const t0 = Date.now();
          console.log('Checkout updated webhook received:', JSON.stringify(payload, null, 2));
          try {
               // Upsert checkout data to database
               const { data, error: upsertError } = await supabase
                    .from("tblPolarCheckouts")
                    .upsert(payload.data, { onConflict: "id" })
                    .select();

               if (upsertError) {
                    await logServerAction({
                         user_id: payload.data.customerId || null,
                         action: "Store Webhook - checkout.updated failed",
                         payload: { checkout_id: payload.data.id, error: upsertError.message },
                         status: "fail",
                         error: upsertError.message,
                         duration_ms: Date.now() - t0,
                         type: "webhook",
                    });
               }
               await logServerAction({
                    user_id: payload.data.customerId || null,
                    action: "Store Webhook - checkout.updated success",
                    payload: { checkout_id: payload.data.id },
                    status: "success",
                    error: "",
                    duration_ms: Date.now() - t0,
                    type: "webhook",
               });

          } catch (e: any) {
               console.error('Checkout updated error:', e);
               console.error('Error message:', e?.message);
               console.error('Error stack:', e?.stack);
               const errorMessage = e?.message || e?.toString() || "unknown error";
               await logServerAction({
                    user_id: null,
                    action: "Store Webhook - checkout.updated failed",
                    payload: { type: payload.type, error: errorMessage },
                    status: "fail",
                    error: errorMessage,
                    duration_ms: Date.now() - t0,
                    type: "webhook",
               });
               throw new Error(errorMessage);
          }
     }
});
