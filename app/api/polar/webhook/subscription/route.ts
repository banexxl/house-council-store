// app/api/polar/webhook/subscription/route.ts
import { logServerAction } from "@/app/lib/server-logging";
import { getApartmentCountForClient } from "@/app/profile/subscription-plan-actions";
import { Webhooks } from "@polar-sh/nextjs";
import {
     supabase,
     convertToSnakeCase,
     extractMeta,
     resolveClientFromPolarCustomerId,
     getSubscriptionPlanIdForClient,
     revalidateProfile,
} from "../webhook-utils";

export const runtime = "nodejs";

// ---------------------------------------------------------------------------
// Subscription Webhook Handler
// ---------------------------------------------------------------------------

export const POST = Webhooks({
     webhookSecret: process.env.POLAR_WEBHOOK_SECRET_SANDBOX_SUBSCRIPTION!,

     onSubscriptionCreated: async (payload) => {
          const t0 = Date.now();
          console.log(`${payload.type} webhook received:`, payload);

          const subscriptionData = convertToSnakeCase(payload.data);
          const meta = extractMeta(payload);

          let client_id = meta.client_id;
          let subscription_id = meta.subscription_id;

          const polarSubscriptionId = subscriptionData.id;
          const polarCustomerId = subscriptionData.customer_id;
          const polarProductId = subscriptionData.product_id;

          // Try to resolve client if not in metadata
          if (!client_id && polarCustomerId) {
               const resolved = await resolveClientFromPolarCustomerId(polarCustomerId);
               if (resolved) {
                    client_id = resolved.client_id;
                    subscription_id = resolved.subscription_id ?? subscription_id;
               }
          }

          if (!client_id) {
               await logServerAction({
                    user_id: null,
                    action: `Store Webhook - ${payload.type} missing clientId`,
                    payload: { type: payload.type, polarSubscriptionId, polarCustomerId },
                    status: "fail",
                    error: "Cannot process subscription event without clientId",
                    duration_ms: Date.now() - t0,
                    type: "internal",
               });
               return;
          }

          if (!subscription_id) {
               subscription_id = await getSubscriptionPlanIdForClient(client_id);
          }

          try {
               if (!polarSubscriptionId) {
                    await logServerAction({
                         user_id: null,
                         action: `Store Webhook - ${payload.type} missing polar subscription id`,
                         payload: { type: payload.type },
                         status: "fail",
                         error: "No subscription id in payload",
                         duration_ms: Date.now() - t0,
                         type: "internal",
                    });
                    return;
               }

               // Resolve subscription plan from product_id
               let resolvedSubscriptionId = subscription_id;
               if (polarProductId) {
                    const { data: subRow, error: subError } = await supabase
                         .from("tblSubscriptionPlans")
                         .select("id")
                         .or(`polar_product_id_monthly.eq.${polarProductId},polar_product_id_annually.eq.${polarProductId}`)
                         .maybeSingle<{ id: string }>();
                    if (subError && !subRow) {
                         await logServerAction({
                              user_id: null,
                              action: `Store Webhook - ${payload.type} could not resolve subscription plan from product id`,
                              payload: { type: payload.type, polarProductId },
                              status: "fail",
                              error: "No subscription plan found for product id",
                              duration_ms: Date.now() - t0,
                              type: "internal",
                         })
                         return
                    }
               }

               const apartments_count = await getApartmentCountForClient(client_id);

               // Extract id and map to polar_subscription_id
               const { id, ...restSubscriptionData } = subscriptionData;

               // Merge converted payload with custom fields
               const upsertData = {
                    ...restSubscriptionData,
                    client_id,
                    subscription_id: resolvedSubscriptionId,
                    polar_subscription_id: id,
                    apartment_count: apartments_count,
                    status: subscriptionData.status || payload.data.status,
               };

               const { error: upsertError } = await supabase
                    .from("tblClient_Subscription")
                    .upsert(upsertData, { onConflict: "client_id" });

               if (upsertError) throw upsertError;

               revalidateProfile();

               await logServerAction({
                    user_id: client_id,
                    action: `Store Webhook - Processed ${payload.type}`,
                    payload: { type: payload.type, status: payload.data.status, polarSubscriptionId },
                    status: "success",
                    error: "",
                    duration_ms: Date.now() - t0,
                    type: "internal",
               });
          } catch (e: any) {
               const err = e instanceof Error ? e : new Error(e?.message ?? "unknown error");
               await logServerAction({
                    user_id: client_id,
                    action: `Store Webhook - ${payload.type} handler failed`,
                    payload: { type: payload.type, polarSubscriptionId, polarCustomerId, polarProductId },
                    status: "fail",
                    error: err.message,
                    duration_ms: Date.now() - t0,
                    type: "internal",
               });
               throw err;
          }
     },

     onSubscriptionUpdated: async (payload) => {
          const t0 = Date.now();
          const eventType = "subscription.updated";
          console.log(`${eventType} webhook received:`, payload);

          const subscriptionData = convertToSnakeCase(payload.data);
          const meta = extractMeta(payload);

          let client_id = meta.client_id;
          let subscription_id = meta.subscription_id;

          const polarSubscriptionId = subscriptionData.id;
          const polarCustomerId = subscriptionData.customer_id;
          const polarProductId = subscriptionData.product_id;

          if (!client_id && polarCustomerId) {
               const resolved = await resolveClientFromPolarCustomerId(polarCustomerId);
               if (resolved) {
                    client_id = resolved.client_id;
                    subscription_id = resolved.subscription_id ?? subscription_id;
               }
          }

          if (!client_id) {
               await logServerAction({
                    user_id: null,
                    action: `Store Webhook - ${eventType} missing clientId`,
                    payload: { eventType, polarSubscriptionId, polarCustomerId },
                    status: "fail",
                    error: "Cannot process subscription event without clientId",
                    duration_ms: Date.now() - t0,
                    type: "internal",
               });
               return;
          }

          if (!subscription_id) {
               subscription_id = await getSubscriptionPlanIdForClient(client_id);
          }

          try {
               if (!polarSubscriptionId) {
                    await logServerAction({
                         user_id: null,
                         action: `Store Webhook - ${eventType} missing polar subscription id`,
                         payload: { eventType },
                         status: "fail",
                         error: "No subscription id in payload",
                         duration_ms: Date.now() - t0,
                         type: "internal",
                    });
                    return;
               }

               let resolvedSubscriptionId = subscription_id;
               if (polarProductId) {
                    const { data: subRow, error: subError } = await supabase
                         .from("tblSubscriptionPlans")
                         .select("id")
                         .or(`polar_product_id_monthly.eq.${polarProductId},polar_product_id_annually.eq.${polarProductId}`)
                         .maybeSingle<{ id: string }>();
                    if (subError && !subRow) {
                         await logServerAction({
                              user_id: null,
                              action: `Store Webhook - ${eventType} could not resolve subscription plan from product id`,
                              payload: { eventType, polarProductId },
                              status: "fail",
                              error: "No subscription plan found for product id",
                              duration_ms: Date.now() - t0,
                              type: "webhook",
                         })
                         return
                    }
               }

               const apartments_count = await getApartmentCountForClient(client_id);

               // Extract id and map to polar_subscription_id
               const { id, ...restSubscriptionData } = subscriptionData;

               // Merge converted payload with custom fields
               const upsertData = {
                    ...restSubscriptionData,
                    client_id,
                    subscription_id: resolvedSubscriptionId,
                    polar_subscription_id: id,
                    apartment_count: apartments_count,
                    status: subscriptionData.status || payload.data.status,
               };

               const { error: upsertError } = await supabase
                    .from("tblClient_Subscription")
                    .upsert(upsertData, { onConflict: "client_id" });

               if (upsertError) throw upsertError;

               revalidateProfile();

               await logServerAction({
                    user_id: client_id,
                    action: `Store Webhook - Processed ${eventType}`,
                    payload: { eventType, status: subscriptionData.status, polarSubscriptionId },
                    status: "success",
                    error: "",
                    duration_ms: Date.now() - t0,
                    type: "internal",
               });
          } catch (e: any) {
               const err = e instanceof Error ? e : new Error(e?.message ?? "unknown error");
               await logServerAction({
                    user_id: client_id,
                    action: `Store Webhook - ${eventType} handler failed`,
                    payload: { eventType, polarSubscriptionId, polarCustomerId, polarProductId },
                    status: "fail",
                    error: err.message,
                    duration_ms: Date.now() - t0,
                    type: "internal",
               });
               throw err;
          }
     },

     onSubscriptionActive: async (payload) => {
          const t0 = Date.now();
          const eventType = "subscription.active";
          console.log(`${eventType} webhook received:`, payload);

          const subscriptionData = convertToSnakeCase(payload.data);
          const meta = extractMeta(payload);

          let client_id = meta.client_id;
          let subscription_id = meta.subscription_id;

          const polarSubscriptionId = subscriptionData.id;
          const polarCustomerId = subscriptionData.customer_id;
          const polarProductId = subscriptionData.product_id;

          if (!client_id && polarCustomerId) {
               const resolved = await resolveClientFromPolarCustomerId(polarCustomerId);
               if (resolved) {
                    client_id = resolved.client_id;
                    subscription_id = resolved.subscription_id ?? subscription_id;
               }
          }

          if (!client_id) {
               await logServerAction({
                    user_id: null,
                    action: `Store Webhook - ${eventType} missing clientId`,
                    payload: { eventType, polarSubscriptionId, polarCustomerId },
                    status: "fail",
                    error: "Cannot process subscription event without clientId",
                    duration_ms: Date.now() - t0,
                    type: "internal",
               });
               return;
          }

          if (!subscription_id) {
               subscription_id = await getSubscriptionPlanIdForClient(client_id);
          }

          try {
               if (!polarSubscriptionId) {
                    await logServerAction({
                         user_id: null,
                         action: `Store Webhook - ${eventType} missing polar subscription id`,
                         payload: { eventType },
                         status: "fail",
                         error: "No subscription id in payload",
                         duration_ms: Date.now() - t0,
                         type: "internal",
                    });
                    return;
               }

               let resolvedSubscriptionId = subscription_id;
               if (polarProductId) {
                    const { data: subRow, error: subError } = await supabase
                         .from("tblSubscriptionPlans")
                         .select("id")
                         .or(`polar_product_id_monthly.eq.${polarProductId},polar_product_id_annually.eq.${polarProductId}`)
                         .maybeSingle<{ id: string }>();
                    if (subError && !subRow) {
                         await logServerAction({
                              user_id: null,
                              action: `Store Webhook - ${eventType} could not resolve subscription plan from product id`,
                              payload: { eventType, polarProductId },
                              status: "fail",
                              error: "No subscription plan found for product id",
                              duration_ms: Date.now() - t0,
                              type: "webhook",
                         })
                    }
               }

               const apartments_count = await getApartmentCountForClient(client_id);

               // Merge converted payload with custom fields
               const upsertData = {
                    ...subscriptionData,
                    client_id,
                    subscription_id: resolvedSubscriptionId,
                    polar_subscription_id: polarSubscriptionId,
                    apartment_count: apartments_count,
                    status: subscriptionData.status || payload.data.status,
               };

               const { error: upsertError } = await supabase
                    .from("tblClient_Subscription")
                    .upsert(upsertData, { onConflict: "client_id" });

               if (upsertError) throw upsertError;

               revalidateProfile();

               await logServerAction({
                    user_id: client_id,
                    action: `Store Webhook - Processed ${eventType}`,
                    payload: { eventType, status: payload.data.status, polarSubscriptionId },
                    status: "success",
                    error: "",
                    duration_ms: Date.now() - t0,
                    type: "internal",
               });
          } catch (e: any) {
               const err = e instanceof Error ? e : new Error(e?.message ?? "unknown error");
               await logServerAction({
                    user_id: client_id,
                    action: `Store Webhook - ${eventType} handler failed`,
                    payload: { eventType, polarSubscriptionId, polarCustomerId, polarProductId },
                    status: "fail",
                    error: err.message,
                    duration_ms: Date.now() - t0,
                    type: "internal",
               });
               throw err;
          }
     },

     onSubscriptionCanceled: async (payload) => {
          const t0 = Date.now();
          const eventType = "subscription.canceled";
          console.log(`${eventType} webhook received:`, payload);

          const subscriptionData = convertToSnakeCase(payload.data);
          const meta = extractMeta(payload);

          let client_id = meta.client_id;
          let subscription_id = meta.subscription_id;

          const polarSubscriptionId = subscriptionData.id;
          const polarCustomerId = subscriptionData.customer_id;
          const polarProductId = subscriptionData.product_id;

          if (!client_id && polarCustomerId) {
               const resolved = await resolveClientFromPolarCustomerId(polarCustomerId);
               if (resolved) {
                    client_id = resolved.client_id;
                    subscription_id = resolved.subscription_id ?? subscription_id;
               }
          }

          if (!client_id) {
               await logServerAction({
                    user_id: null,
                    action: `Store Webhook - ${eventType} missing clientId`,
                    payload: { eventType, polarSubscriptionId, polarCustomerId },
                    status: "fail",
                    error: "Cannot process subscription event without clientId",
                    duration_ms: Date.now() - t0,
                    type: "internal",
               });
               return;
          }

          if (!subscription_id) {
               subscription_id = await getSubscriptionPlanIdForClient(client_id);
          }

          try {
               if (!polarSubscriptionId) {
                    await logServerAction({
                         user_id: null,
                         action: `Store Webhook - ${eventType} missing polar subscription id`,
                         payload: { eventType },
                         status: "fail",
                         error: "No subscription id in payload",
                         duration_ms: Date.now() - t0,
                         type: "internal",
                    });
                    return;
               }

               let resolvedSubscriptionId = subscription_id;
               if (polarProductId) {
                    const { data: subRow, error: subError } = await supabase
                         .from("tblSubscriptionPlans")
                         .select("id")
                         .or(`polar_product_id_monthly.eq.${polarProductId},polar_product_id_annually.eq.${polarProductId}`)
                         .maybeSingle<{ id: string }>();
                    if (subError && !subRow) {
                         await logServerAction({
                              user_id: null,
                              action: `Store Webhook - ${eventType} could not resolve subscription plan from product id`,
                              payload: { eventType, polarProductId },
                              status: "fail",
                              error: "No subscription plan found for product id",
                              duration_ms: Date.now() - t0,
                              type: "webhook",
                         })
                    }
               }



               const apartments_count = await getApartmentCountForClient(client_id);

               // Extract id and map to polar_subscription_id
               const { id, ...restSubscriptionData } = subscriptionData;

               // Merge converted payload with custom fields
               const upsertData = {
                    ...restSubscriptionData,
                    client_id,
                    subscription_id: resolvedSubscriptionId,
                    polar_subscription_id: id,
                    apartment_count: apartments_count,
                    status: subscriptionData.status || payload.data.status,
               };

               const { error: upsertError } = await supabase
                    .from("tblClient_Subscription")
                    .upsert(upsertData, { onConflict: "client_id" });

               if (upsertError) throw upsertError;

               revalidateProfile();

               await logServerAction({
                    user_id: client_id,
                    action: `Store Webhook - Processed ${eventType}`,
                    payload: { eventType, status: payload.data.status, polarSubscriptionId },
                    status: "success",
                    error: "",
                    duration_ms: Date.now() - t0,
                    type: "internal",
               });
          } catch (e: any) {
               const err = e instanceof Error ? e : new Error(e?.message ?? "unknown error");
               await logServerAction({
                    user_id: client_id,
                    action: `Store Webhook - ${eventType} handler failed`,
                    payload: { eventType, polarSubscriptionId, polarCustomerId, polarProductId },
                    status: "fail",
                    error: err.message,
                    duration_ms: Date.now() - t0,
                    type: "internal",
               });
               throw err;
          }
     },

     onSubscriptionRevoked: async (payload) => {
          const t0 = Date.now();
          const eventType = "subscription.revoked";
          console.log(`${eventType} webhook received:`, payload);

          const subscriptionData = convertToSnakeCase(payload.data);
          const meta = extractMeta(payload);

          let client_id = meta.client_id;
          let subscription_id = meta.subscription_id;

          const polarSubscriptionId = subscriptionData.id;
          const polarCustomerId = subscriptionData.customer_id;
          const polarProductId = subscriptionData.product_id;

          if (!client_id && polarCustomerId) {
               const resolved = await resolveClientFromPolarCustomerId(polarCustomerId);
               if (resolved) {
                    client_id = resolved.client_id;
                    subscription_id = resolved.subscription_id ?? subscription_id;
               }
          }

          if (!client_id) {
               await logServerAction({
                    user_id: null,
                    action: `Store Webhook - ${eventType} missing clientId`,
                    payload: { eventType, polarSubscriptionId, polarCustomerId },
                    status: "fail",
                    error: "Cannot process subscription event without clientId",
                    duration_ms: Date.now() - t0,
                    type: "internal",
               });
               return;
          }

          if (!subscription_id) {
               subscription_id = await getSubscriptionPlanIdForClient(client_id);
          }

          try {
               if (!polarSubscriptionId) {
                    await logServerAction({
                         user_id: null,
                         action: `Store Webhook - ${eventType} missing polar subscription id`,
                         payload: { eventType },
                         status: "fail",
                         error: "No subscription id in payload",
                         duration_ms: Date.now() - t0,
                         type: "internal",
                    });
                    return;
               }

               let resolvedSubscriptionId = subscription_id;
               if (polarProductId) {
                    const { data: subRow, error: subError } = await supabase
                         .from("tblSubscriptionPlans")
                         .select("id")
                         .or(`polar_product_id_monthly.eq.${polarProductId},polar_product_id_annually.eq.${polarProductId}`)
                         .maybeSingle<{ id: string }>();
                    if (subError && !subRow) {
                         await logServerAction({
                              user_id: null,
                              action: `Store Webhook - ${eventType} could not resolve subscription plan from product id`,
                              payload: { eventType, polarProductId },
                              status: "fail",
                              error: "No subscription plan found for product id",
                              duration_ms: Date.now() - t0,
                              type: "webhook",
                         })
                    }
               }



               const apartments_count = await getApartmentCountForClient(client_id);

               // Extract id and map to polar_subscription_id
               const { id, ...restSubscriptionData } = subscriptionData;

               // Merge converted payload with custom fields
               const upsertData = {
                    ...restSubscriptionData,
                    client_id,
                    subscription_id: resolvedSubscriptionId,
                    polar_subscription_id: id,
                    apartment_count: apartments_count,
                    status: subscriptionData.status || payload.data.status,
               };

               const { error: upsertError } = await supabase
                    .from("tblClient_Subscription")
                    .upsert(upsertData, { onConflict: "client_id" });

               if (upsertError) throw upsertError;

               revalidateProfile();

               await logServerAction({
                    user_id: client_id,
                    action: `Store Webhook - Processed ${eventType}`,
                    payload: { eventType, status: payload.data.status, polarSubscriptionId },
                    status: "success",
                    error: "",
                    duration_ms: Date.now() - t0,
                    type: "internal",
               });
          } catch (e: any) {
               const err = e instanceof Error ? e : new Error(e?.message ?? "unknown error");
               await logServerAction({
                    user_id: client_id,
                    action: `Store Webhook - ${eventType} handler failed`,
                    payload: { eventType, polarSubscriptionId, polarCustomerId, polarProductId },
                    status: "fail",
                    error: err.message,
                    duration_ms: Date.now() - t0,
                    type: "internal",
               });
               throw err;
          }
     },
});
