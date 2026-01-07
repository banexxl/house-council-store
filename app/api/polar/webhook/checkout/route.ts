// app/api/polar/webhook/checkout/route.ts
import { logServerAction } from "@/app/lib/server-logging";
import { Webhooks } from "@polar-sh/nextjs";

export const runtime = "nodejs";

// ---------------------------------------------------------------------------
// Checkout Webhook Handler
// ---------------------------------------------------------------------------

export const POST = Webhooks({
     webhookSecret: process.env.POLAR_WEBHOOK_SECRET_SANDBOX!,

     onCheckoutCreated: async (payload) => {
          const t0 = Date.now();
          console.log('Checkout created webhook received:', payload);

          await logServerAction({
               user_id: null,
               action: "Store Webhook - checkout.created received",
               payload: { checkoutId: payload.data.id },
               status: "success",
               error: "",
               duration_ms: Date.now() - t0,
               type: "internal",
          });
     },

     onCheckoutUpdated: async (payload) => {
          const t0 = Date.now();
          console.log('Checkout updated webhook received:', payload);

          await logServerAction({
               user_id: null,
               action: "Store Webhook - checkout.updated received",
               payload: { checkoutId: payload.data.id },
               status: "success",
               error: "",
               duration_ms: Date.now() - t0,
               type: "internal",
          });
     },
});
