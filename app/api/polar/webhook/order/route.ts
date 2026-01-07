// app/api/polar/webhook/order/route.ts
import { logServerAction } from "@/app/lib/server-logging";
import { Webhooks } from "@polar-sh/nextjs";
import {
     convertToSnakeCase,
     extractMeta,
     resolveClientFromPolarCustomerId,
     upsertInvoiceFromOrder,
     patchClientSubscription,
     revalidateProfile,
} from "../webhook-utils";

export const runtime = "nodejs";

// ---------------------------------------------------------------------------
// Order Webhook Handler
// ---------------------------------------------------------------------------

export const POST = Webhooks({
     webhookSecret: process.env.POLAR_WEBHOOK_SECRET_SANDBOX!,

     onOrderCreated: async (payload) => {
          const t0 = Date.now();
          const eventType = "order.created";
          console.log(`${eventType} webhook received:`, payload);

          const orderData = convertToSnakeCase(payload.data);
          const meta = extractMeta(payload);

          let client_id = meta.client_id;
          let subscription_id = meta.subscription_id;

          // Try to resolve client from customer_id if not in metadata
          if (!client_id && orderData.customer_id) {
               const resolved = await resolveClientFromPolarCustomerId(orderData.customer_id);
               if (resolved) {
                    client_id = resolved.client_id;
                    subscription_id = resolved.subscription_id ?? subscription_id;
               }
          }

          if (!orderData.id) {
               await logServerAction({
                    user_id: client_id,
                    action: `Store Webhook - ${eventType} missing order id`,
                    payload: { eventType, data: orderData },
                    status: "fail",
                    error: "Order payload did not include id",
                    duration_ms: Date.now() - t0,
                    type: "internal",
               });
               return;
          }

          if (!client_id) {
               await logServerAction({
                    user_id: null,
                    action: `Store Webhook - ${eventType} missing clientId`,
                    payload: { eventType, orderId: orderData.id, meta },
                    status: "fail",
                    error: "Unable to resolve client for order",
                    duration_ms: Date.now() - t0,
                    type: "internal",
               });
               return;
          }

          try {
               await upsertInvoiceFromOrder({
                    order: orderData as any,
                    client_id,
                    subscription_id,
               });

               try {
                    await patchClientSubscription(client_id, { order_id: orderData.id }, eventType);
               } catch (orderPatchError: any) {
                    const patchErr = orderPatchError instanceof Error ? orderPatchError : new Error(orderPatchError?.message ?? "unknown error");
                    await logServerAction({
                         user_id: client_id,
                         action: `Store Webhook - ${eventType} order_id patch failed`,
                         payload: { orderId: orderData.id },
                         status: "fail",
                         error: patchErr.message,
                         duration_ms: Date.now() - t0,
                         type: "internal",
                    });
               }

               revalidateProfile();

               await logServerAction({
                    user_id: client_id,
                    action: `Store Webhook - Processed ${eventType}`,
                    payload: { eventType, orderId: orderData.id, subscription_id },
                    status: "success",
                    error: "",
                    duration_ms: Date.now() - t0,
                    type: "internal",
               });
          } catch (e: any) {
               const err = e instanceof Error ? e : new Error(e?.message ?? "unknown error");
               await logServerAction({
                    user_id: client_id,
                    action: `Store Webhook - ${eventType} invoice sync failed`,
                    payload: { orderId: orderData.id, subscription_id },
                    status: "fail",
                    error: err.message,
                    duration_ms: Date.now() - t0,
                    type: "internal",
               });
               throw err;
          }
     },

     onOrderUpdated: async (payload) => {
          const t0 = Date.now();
          const eventType = "order.updated";
          console.log(`${eventType} webhook received:`, payload);

          const orderData = payload.data;
          const meta = extractMeta(payload);

          let client_id = meta.client_id;
          let subscription_id = meta.subscription_id;

          if (!client_id && orderData.customerId) {
               const resolved = await resolveClientFromPolarCustomerId(orderData.customerId);
               if (resolved) {
                    client_id = resolved.client_id;
                    subscription_id = resolved.subscription_id ?? subscription_id;
               }
          }

          if (!orderData.id) {
               await logServerAction({
                    user_id: client_id,
                    action: `Store Webhook - ${eventType} missing order id`,
                    payload: { eventType, data: orderData },
                    status: "fail",
                    error: "Order payload did not include id",
                    duration_ms: Date.now() - t0,
                    type: "internal",
               });
               return;
          }

          if (!client_id) {
               await logServerAction({
                    user_id: null,
                    action: `Store Webhook - ${eventType} missing clientId`,
                    payload: { eventType, orderId: orderData.id, meta },
                    status: "fail",
                    error: "Unable to resolve client for order",
                    duration_ms: Date.now() - t0,
                    type: "internal",
               });
               return;
          }

          try {
               await upsertInvoiceFromOrder({
                    order: orderData as any,
                    client_id,
                    subscription_id,
               });

               try {
                    await patchClientSubscription(client_id, { order_id: orderData.id }, eventType);
               } catch (orderPatchError: any) {
                    const patchErr = orderPatchError instanceof Error ? orderPatchError : new Error(orderPatchError?.message ?? "unknown error");
                    await logServerAction({
                         user_id: client_id,
                         action: `Store Webhook - ${eventType} order_id patch failed`,
                         payload: { orderId: orderData.id },
                         status: "fail",
                         error: patchErr.message,
                         duration_ms: Date.now() - t0,
                         type: "internal",
                    });
               }

               revalidateProfile();

               await logServerAction({
                    user_id: client_id,
                    action: `Store Webhook - Processed ${eventType}`,
                    payload: { eventType, orderId: orderData.id, subscription_id },
                    status: "success",
                    error: "",
                    duration_ms: Date.now() - t0,
                    type: "internal",
               });
          } catch (e: any) {
               const err = e instanceof Error ? e : new Error(e?.message ?? "unknown error");
               await logServerAction({
                    user_id: client_id,
                    action: `Store Webhook - ${eventType} invoice sync failed`,
                    payload: { orderId: orderData.id, subscription_id },
                    status: "fail",
                    error: err.message,
                    duration_ms: Date.now() - t0,
                    type: "internal",
               });
               throw err;
          }
     },

     onOrderPaid: async (payload) => {
          const t0 = Date.now();
          const eventType = "order.paid";
          console.log(`${eventType} webhook received:`, payload);

          const orderData = payload.data;
          const meta = extractMeta(payload);

          let client_id = meta.client_id;
          let subscription_id = meta.subscription_id;

          if (!client_id && orderData.customerId) {
               const resolved = await resolveClientFromPolarCustomerId(orderData.customerId);
               if (resolved) {
                    client_id = resolved.client_id;
                    subscription_id = resolved.subscription_id ?? subscription_id;
               }
          }

          if (!orderData.id) {
               await logServerAction({
                    user_id: client_id,
                    action: `Store Webhook - ${eventType} missing order id`,
                    payload: { eventType, data: orderData },
                    status: "fail",
                    error: "Order payload did not include id",
                    duration_ms: Date.now() - t0,
                    type: "internal",
               });
               return;
          }

          if (!client_id) {
               await logServerAction({
                    user_id: null,
                    action: `Store Webhook - ${eventType} missing clientId`,
                    payload: { eventType, orderId: orderData.id, meta },
                    status: "fail",
                    error: "Unable to resolve client for order",
                    duration_ms: Date.now() - t0,
                    type: "internal",
               });
               return;
          }

          try {
               await upsertInvoiceFromOrder({
                    order: orderData as any,
                    client_id,
                    subscription_id,
               });

               try {
                    await patchClientSubscription(client_id, { order_id: orderData.id }, eventType);
               } catch (orderPatchError: any) {
                    const patchErr = orderPatchError instanceof Error ? orderPatchError : new Error(orderPatchError?.message ?? "unknown error");
                    await logServerAction({
                         user_id: client_id,
                         action: `Store Webhook - ${eventType} order_id patch failed`,
                         payload: { orderId: orderData.id },
                         status: "fail",
                         error: patchErr.message,
                         duration_ms: Date.now() - t0,
                         type: "internal",
                    });
               }

               revalidateProfile();

               await logServerAction({
                    user_id: client_id,
                    action: `Store Webhook - Processed ${eventType}`,
                    payload: { eventType, orderId: orderData.id, subscription_id },
                    status: "success",
                    error: "",
                    duration_ms: Date.now() - t0,
                    type: "internal",
               });
          } catch (e: any) {
               const err = e instanceof Error ? e : new Error(e?.message ?? "unknown error");
               await logServerAction({
                    user_id: client_id,
                    action: `Store Webhook - ${eventType} invoice sync failed`,
                    payload: { orderId: orderData.id, subscription_id },
                    status: "fail",
                    error: err.message,
                    duration_ms: Date.now() - t0,
                    type: "internal",
               });
               throw err;
          }
     },
});
