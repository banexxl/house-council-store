// app/api/polar/webhook/product/route.ts
import { logServerAction } from "@/app/lib/server-logging";
import { Webhooks } from "@polar-sh/nextjs";
import { convertToSnakeCase } from "../webhook-utils";

export const runtime = "nodejs";

// ---------------------------------------------------------------------------
// Product Webhook Handler
// ---------------------------------------------------------------------------

export const POST = Webhooks({
     webhookSecret: process.env.POLAR_WEBHOOK_SECRET_SANDBOX_PRODUCT!,

     onProductCreated: async (payload) => {
          const t0 = Date.now();
          console.log('Product created webhook received:', payload);

          const productData = convertToSnakeCase(payload.data);

          await logServerAction({
               user_id: null,
               action: "Store Webhook - product.created received",
               payload: { productId: productData.id },
               status: "success",
               error: "",
               duration_ms: Date.now() - t0,
               type: "internal",
          });
     },

     onProductUpdated: async (payload) => {
          const t0 = Date.now();
          console.log('Product updated webhook received:', payload);

          const productData = convertToSnakeCase(payload.data);

          await logServerAction({
               user_id: null,
               action: "Store Webhook - product.updated received",
               payload: { productId: productData.id },
               status: "success",
               error: "",
               duration_ms: Date.now() - t0,
               type: "internal",
          });
     },
});
