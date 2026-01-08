// app/api/polar/webhook/checkout/route.ts
import { logServerAction } from "@/app/lib/server-logging";
import { Webhooks } from "@polar-sh/nextjs";
import { convertToSnakeCase, supabase } from "../webhook-utils";

export const runtime = "nodejs";

// ---------------------------------------------------------------------------
// Checkout Webhook Handler
// ---------------------------------------------------------------------------

export const POST = Webhooks({
     webhookSecret: process.env.POLAR_WEBHOOK_SECRET_SANDBOX_CHECKOUT!,

     onCheckoutCreated: async (payload) => {
          const t0 = Date.now();
          console.log('Checkout created webhook received:', payload);

          try {
               const checkoutData = convertToSnakeCase(payload.data);

               // Upsert checkout data to database
               const { error: upsertError } = await supabase
                    .from("tblPolarCheckout")
                    .upsert(checkoutData, { onConflict: "id" });

               if (upsertError) throw upsertError;

               await logServerAction({
                    user_id: null,
                    action: "Store Webhook - checkout.created received",
                    payload: {
                         checkoutId: checkoutData.id,
                         customerId: checkoutData.customer_id,
                         productId: checkoutData.product_id,
                         status: checkoutData.status
                    },
                    status: "success",
                    error: "",
                    duration_ms: Date.now() - t0,
                    type: "internal",
               });
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

          try {
               const checkoutData = convertToSnakeCase(payload.data);

               // Upsert checkout data to database
               const { error: upsertError } = await supabase
                    .from("tblPolarCheckout")
                    .upsert(checkoutData, { onConflict: "id" });

               if (upsertError) throw upsertError;

               await logServerAction({
                    user_id: null,
                    action: "Store Webhook - checkout.updated received",
                    payload: {
                         checkoutId: checkoutData.id,
                         customerId: checkoutData.customer_id,
                         productId: checkoutData.product_id,
                         status: checkoutData.status
                    },
                    status: "success",
                    error: "",
                    duration_ms: Date.now() - t0,
                    type: "internal",
               });
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
