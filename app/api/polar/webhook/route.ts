// app/api/polar/webhook/route.ts
import { logServerAction } from "@/app/lib/server-logging";
import { getApartmentCountForClient } from "@/app/profile/subscription-plan-actions";
import { PolarSubscription, PolarSubscriptionStatus } from "@/app/types/polar-subscription-types";
import type { PolarOrder, PolarOrderStatus } from "@/app/types/polar-order-types";
import { Webhooks } from "@polar-sh/nextjs";
import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";

export const runtime = "nodejs";

// ✅ Use SERVICE ROLE for webhooks (bypasses RLS). Never use anon key here.
const supabase = createClient(
     process.env.NEXT_PUBLIC_SUPABASE_URL!,
     process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type SubscriptionRecordPatch = PolarSubscription;

const SUBSCRIPTION_STATUS_VALUES: PolarSubscriptionStatus[] = [
     "incomplete",
     "incomplete_expired",
     "trialing",
     "active",
     "past_due",
     "canceled",
     "unpaid",
];

const SUBSCRIPTION_STATUS_SET = new Set(SUBSCRIPTION_STATUS_VALUES);
const SUBSCRIPTION_INTERVAL_VALUES: PolarSubscription["recurring_interval"][] = ["day", "week", "month", "year"];
const SUBSCRIPTION_INTERVAL_SET = new Set(SUBSCRIPTION_INTERVAL_VALUES);

const isRecord = (value: unknown): value is Record<string, unknown> =>
     typeof value === "object" && value !== null && !Array.isArray(value);

const ensureString = (value: unknown, fallback = ""): string =>
     typeof value === "string" && value.length > 0 ? value : fallback;

const ensureNullableString = (value: unknown): string | null =>
     typeof value === "string" && value.length > 0 ? value : null;

const ensureDateString = (value: unknown): string =>
     typeof value === "string" && value.length > 0 ? value : nowIso();

const normalizeSubscriptionStatus = (value: unknown): PolarSubscriptionStatus => {
     if (typeof value === "string") {
          const lowered = value.toLowerCase() as PolarSubscriptionStatus;
          if (SUBSCRIPTION_STATUS_SET.has(lowered)) {
               return lowered;
          }
     }
     return "incomplete";
};

const normalizeInterval = (value: unknown): PolarSubscription["recurring_interval"] => {
     if (typeof value === "string") {
          const lowered = value.toLowerCase() as PolarSubscription["recurring_interval"];
          if (SUBSCRIPTION_INTERVAL_SET.has(lowered)) {
               return lowered;
          }
     }
     return "month";
};

const stringifyOrEmptyObject = (value: unknown): string => {
     try {
          return JSON.stringify(value ?? {});
     } catch {
          return "{}";
     }
};

interface BuildSubscriptionSnapshotArgs {
     client_id: string;
     subscription_id: string;
     apartments_count: number;
     data: any;
     statusOverride?: PolarSubscriptionStatus;
}

function buildSubscriptionSnapshot({
     client_id,
     subscription_id,
     apartments_count,
     data,
     statusOverride,
}: BuildSubscriptionSnapshotArgs): SubscriptionRecordPatch {

     const pick = (...keys: string[]) => {
          for (const key of keys) {
               const value = data?.[key as keyof typeof data];
               if (value !== undefined) {
                    return value;
               }
          }
          return undefined;
     };

     const metadataValue = pick("metadata");
     const customFieldDataValue = pick("custom_field_data", "customFieldData");
     const pricesValue = pick("prices");
     const metersValue = pick("meters");
     const recurringIntervalCountValue = pick("recurring_interval_count", "recurringIntervalCount");
     const seatsValue = pick("seats");
     const amountValue = pick("amount", "Amount");
     const currencyValue = pick("currency", "Currency");

     const metadata = isRecord(metadataValue) ? metadataValue : {};
     const customFieldData = isRecord(customFieldDataValue) ? customFieldDataValue : {};
     const status = normalizeSubscriptionStatus(statusOverride ?? pick("status"));
     const subscriptionId = ensureString(pick("id"));
     const serializeArray = (items: unknown[]): string[] =>
          items.map((item) => (typeof item === "string" ? item : stringifyOrEmptyObject(item)));

     return {
          id: subscriptionId,
          client_id,
          subscription_id,
          polar_subscription_id: subscriptionId,
          created_at: ensureDateString(pick("createdAt", "created_at", "created")),
          updated_at: ensureDateString(pick("updatedAt", "updated_at", "updated")),
          apartment_count: typeof apartments_count === "number" ? Math.max(1, apartments_count) : 1,
          metadata,
          amount: typeof amountValue === "number" ? amountValue : 0,
          currency: ensureString((currencyValue as string | undefined) ?? "usd"),
          recurring_interval: normalizeInterval(pick("recurring_interval", "recurringInterval")),
          recurring_interval_count: typeof recurringIntervalCountValue === "number" ? recurringIntervalCountValue : 1,
          status,
          current_period_start: ensureDateString(pick("currentPeriodStart", "current_period_start")),
          current_period_end: ensureDateString(pick("currentPeriodEnd", "current_period_end", "currentPeriodEnd")),
          trial_start: ensureNullableString(pick("trial_start", "trialStart")),
          trial_end: ensureNullableString(pick("trial_end", "trialEnd")),
          cancel_at_period_end: Boolean(pick("cancel_at_period_end", "cancelAtPeriodEnd")),
          canceled_at: ensureNullableString(pick("canceled_at", "canceledAt")),
          started_at: ensureDateString(pick("startedAt", "started_at", "started")),
          ends_at: ensureNullableString(pick("ends_at", "endsAt")),
          ended_at: ensureNullableString(pick("ended_at", "endedAt")),
          customer_id: ensureString((pick("customer_id", "customerId") as string | undefined) ?? ""),
          product_id: ensureString((pick("product_id", "productId") as string | undefined) ?? ""),
          discount_id: ensureNullableString(pick("discount_id", "discountId")),
          checkout_id: ensureNullableString(pick("checkout_id", "checkoutId")),
          customer_cancellation_reason: ensureNullableString(pick("customer_cancellation_reason", "customerCancellationReason")),
          customer_cancellation_comment: ensureNullableString(pick("customer_cancellation_comment", "customerCancellationComment")),
          prices: Array.isArray(pricesValue) ? serializeArray(pricesValue) : [],
          meters: Array.isArray(metersValue) ? serializeArray(metersValue) : [],
          seats: typeof seatsValue === "number" ? seatsValue : 0,
          custom_field_data: customFieldData,
     };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function nowIso() {
     return new Date().toISOString();
}

function extractMeta(payloadData: any) {
     const meta = payloadData?.data?.metadata
     const subscription_id = meta?.subscription_id
     const client_id = meta?.client_id
     const apartment_count = meta?.apartment_count
     return {
          client_id,
          subscription_id,
          apartment_count: typeof apartment_count === "number" ? apartment_count : undefined,
     };
}

/**
 * For Strategy B we want to ingest once per period. This is best-effort because
 * not all Polar event types include period start. We'll fall back to "now".
 */
function extractCurrentPeriodStart(data: any): string | null {
     return (
          data?.current_period_start ??
          data?.current_period_start_at ??
          data?.billing_period_start ??
          data?.period_start ??
          null
     );
}

interface InvoiceUpsertArgs {
     order: PolarOrder;
     client_id: string;
     subscription_id: string | null;
}

async function upsertInvoiceFromOrder({ order, client_id, subscription_id }: InvoiceUpsertArgs): Promise<void> {
     // Map camelCase keys to snake_case for DB compatibility
     function toSnakeCase(str: string) {
          return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
     }

     // function deepOmitPlatformFeeCurrency(obj: any): any {
     //      if (Array.isArray(obj)) {
     //           return obj.map(deepOmitPlatformFeeCurrency);
     //      } else if (obj && typeof obj === 'object') {
     //           const result: Record<string, unknown> = {};
     //           for (const [k, v] of Object.entries(obj)) {
     //                if (k === 'platform_fee_currency') continue;
     //                result[k] = deepOmitPlatformFeeCurrency(v);
     //           }
     //           return result;
     //      }
     //      return obj;
     // }

     // Recursively sanitize all datetime fields at any depth

     function isDateTimeKey(key: string) {
          // Matches snake_case or camelCase datetime fields
          return /(_at|At|_date|Date|_time|Time)$/.test(key);
     }

     function sanitizeDateTimes(obj: any): any {
          if (Array.isArray(obj)) {
               return obj.map(sanitizeDateTimes);
          } else if (obj && typeof obj === 'object') {
               const result: Record<string, unknown> = {};
               for (const [k, v] of Object.entries(obj)) {
                    // Drop platform fee currency so we don't try to upsert a non-existent column
                    if (k === 'platform_fee_currency' || k === 'platformFeeCurrency') continue;

                    if (isDateTimeKey(k)) {
                         // Preserve real Date objects as ISO strings; keep non-empty strings as-is
                         if (v instanceof Date) {
                              result[k] = v.toISOString();
                         } else if (typeof v === 'string' && v.length > 0) {
                              result[k] = v;
                         } else if (v === null) {
                              result[k] = null;
                         } else {
                              // Unknown/empty datetime-like value -> store as null
                              result[k] = null;
                         }
                    } else {
                         result[k] = sanitizeDateTimes(v);
                    }
               }
               return result;
          }
          return obj;
     }

     const cleanedOrder = sanitizeDateTimes(order);
     const record: Record<string, unknown> = {};
     for (const [key, value] of Object.entries(cleanedOrder)) {
          record[toSnakeCase(key)] = value;
     }
     record["client_id"] = client_id;
     if (subscription_id) {
          record["subscription_id"] = subscription_id;
     }
     console.log('Record for tblInvoice update', record);

     const { error, status, count } = await supabase
          .from("tblInvoices")
          .upsert(record, { onConflict: "id" });
     // If error or no rows affected, throw
     if (error || (typeof count === "number" && count === 0)) {
          throw new Error(`Failed to upsert invoice for order ${order.id}: ${error ? error.message : "No rows updated"}`);
     }
}

/**
 * If an event arrives without metadata, try to locate client/plan
 * by looking up saved Polar ids.
 */
async function resolveClientFromPolarCustomerId(polar_customer_id: string): Promise<{ client_id: string; subscription_id: string | null } | null> {

     await logServerAction({
          user_id: null,
          action: "Store Webhook - Resolving client from Polar IDs",
          payload: { polar_customer_id },
          status: "success",
          error: "",
          duration_ms: 0,
          type: "internal",
     });

     if (polar_customer_id) {
          const { data } = await supabase
               .from("tblClient_Subscription")
               .select("client_id, subscription_id")
               .eq("customer_id", polar_customer_id)
               .maybeSingle<{ client_id: string; subscription_id: string | null }>();

          if (data?.client_id) return data;
     }

     return null;
}

async function getSubscriptionPlanIdForClient(clientId: string): Promise<string | null> {
     const { data } = await supabase
          .from("tblClient_Subscription")
          .select("subscription_id")
          .eq("client_id", clientId)
          .maybeSingle<{ subscription_id: string | null }>();

     return data?.subscription_id ?? null;
}

type ClientSubscriptionPatch = Partial<PolarSubscription>;

async function patchClientSubscription(clientId: string, patch: ClientSubscriptionPatch): Promise<void> {
     const update: Record<string, unknown> = { updated_at: nowIso() };

     for (const [k, v] of Object.entries(patch)) {
          if (v !== undefined) update[k] = v;
     }
     console.log('Trying to patch client subscription', { clientId, update });

     const { error } = await supabase
          .from("tblClient_Subscription")
          .update(update)
          .eq("client_id", clientId);

     if (error) {
          console.log('Error patching client subscription: ', error);
          throw new Error(`Failed to patch subscription for client ${clientId}: ${error.message}`);
     }
}

async function ensureSubscriptionRow(
     subscriptionData: PolarSubscription
): Promise<void> {
     const upsertData: Record<string, unknown> = {
          client_id: subscriptionData.client_id,
          subscription_id: subscriptionData.subscription_id,
          polar_subscription_id: subscriptionData.polar_subscription_id,
          status: subscriptionData.status,
          apartment_count: subscriptionData.apartment_count,
          metadata: subscriptionData.metadata,
          amount: subscriptionData.amount,
          currency: subscriptionData.currency,
          recurring_interval: subscriptionData.recurring_interval,
          recurring_interval_count: subscriptionData.recurring_interval_count,
          current_period_start: subscriptionData.current_period_start,
          current_period_end: subscriptionData.current_period_end,
          trial_start: subscriptionData.trial_start,
          trial_end: subscriptionData.trial_end,
          cancel_at_period_end: subscriptionData.cancel_at_period_end,
          canceled_at: subscriptionData.canceled_at,
          started_at: subscriptionData.started_at,
          ends_at: subscriptionData.ends_at,
          ended_at: subscriptionData.ended_at,
          customer_id: subscriptionData.customer_id,
          product_id: subscriptionData.product_id,
          discount_id: subscriptionData.discount_id,
          checkout_id: subscriptionData.checkout_id,
          customer_cancellation_reason: subscriptionData.customer_cancellation_reason,
          customer_cancellation_comment: subscriptionData.customer_cancellation_comment,
          prices: subscriptionData.prices,
          meters: subscriptionData.meters,
          seats: subscriptionData.seats,
          custom_field_data: subscriptionData.custom_field_data,
          created_at: subscriptionData.created_at,
          updated_at: subscriptionData.updated_at,
     };

     if (subscriptionData.order_id) {
          upsertData.order_id = subscriptionData.order_id;
     }
     console.log('Upsert Client Subscripton Data', upsertData);

     const { error } = await supabase
          .from("tblClient_Subscription")
          .upsert(upsertData, { onConflict: "client_id" });

     if (error) throw error;
}

// customer.updated payload often has email; use it to resolve your DB client
async function resolveClientIdByEmail(email?: string | null): Promise<string | null> {
     if (!email) return null;

     const { data, error } = await supabase
          .from("tblClients")
          .select("id")
          .eq("email", email)
          .maybeSingle();

     if (error) return null;
     return data?.id ?? null;
}

// ---------------------------------------------------------------------------
// Webhook handler
// ---------------------------------------------------------------------------

export const POST = Webhooks({
     webhookSecret: process.env.POLAR_WEBHOOK_SECRET_SANDBOX!,
     onPayload: async (payload: any) => {
          const t0 = Date.now();
          console.log('Webhook payload received: ', payload);

          const eventType = (payload as any)?.type ?? "";
          const t = String(eventType).toLowerCase();
          const data = (payload as any)?.data ?? {};
          const meta = extractMeta(data);
          const normalizedStatus = normalizeSubscriptionStatus(data?.status);
          const currentPeriodStart = extractCurrentPeriodStart(data);

          await logServerAction({
               user_id: null,
               action: `Store Webhook - Payload Received of type ${eventType}`,
               payload,
               status: "success",
               error: "",
               duration_ms: Date.now() - t0,
               type: "internal",
          });

          // -------------------------------------------------------------------------
          // Resolve clientId for events that need it
          // -------------------------------------------------------------------------
          let client_id = meta.client_id;
          let subscription_id = meta.subscription_id;

          const isCustomerEvent = t.startsWith("customer.");
          const isSubscriptionEvent = t.startsWith("subscription.");
          const isOrderEvent = t.startsWith("order.");

          const polarCustomerId: string | null =
               data?.customer_id ?? data?.customerId ?? (isCustomerEvent ? data?.id : null) ?? null;
          const polarSubscriptionId: string | null =
               data?.subscription_id ?? data?.subscriptionId ?? (isSubscriptionEvent ? data?.id ?? null : null);
          const polarOrderId: string | null = data?.order_id ?? data?.orderId ?? null;
          const polarProductId: string | null = data?.product_id ?? data?.productId ?? null;

          // customer.* events often have no metadata; handle separately below

          if (!isCustomerEvent) {
               // For subscription events, try resolve if meta is missing
               if (!client_id) {
                    const resolved = await resolveClientFromPolarCustomerId(polarCustomerId!)
                    if (!resolved) {
                         await logServerAction({
                              user_id: null,
                              action: "Store Webhook - Missing metadata and could not resolve client/plan",
                              payload: { eventType, polarSubscriptionId, polarCustomerId, polarOrderId },
                              status: "fail",
                              error: "No mapping found in tblClient_Subscription yet",
                              duration_ms: Date.now() - t0,
                              type: "internal",
                         });
                         return;
                    }

                    client_id = resolved.client_id;
                    if (!subscription_id && resolved.subscription_id) {
                         subscription_id = resolved.subscription_id;
                    }
               }

               // by here we need these for subscription table
               if (!client_id) {
                    await logServerAction({
                         user_id: null,
                         action: "Store Webhook - Cannot process event (still missing clientId)",
                         payload: { eventType, meta },
                         status: "fail",
                         error: "clientId missing",
                         duration_ms: Date.now() - t0,
                         type: "internal",
                    });
                    return;
               }

               if (!subscription_id && client_id) {
                    subscription_id = await getSubscriptionPlanIdForClient(client_id);
               }
          }

          // -------------------------------------------------------------------------
          // Event: CUSTOMER.* (patch only customer_id)
          // -------------------------------------------------------------------------
          if (isCustomerEvent) {
               const email = data?.email as string | undefined;
               const resolvedClientId = await resolveClientIdByEmail(email);

               if (!resolvedClientId) {
                    await logServerAction({
                         user_id: null,
                         action: "Store Webhook - customer.updated could not resolve client by email",
                         payload: { eventType, email, polarCustomerId },
                         status: "fail",
                         error: "No client found for email",
                         duration_ms: Date.now() - t0,
                         type: "internal",
                    });
                    return;
               }

               try {
                    // Only patch customer_id. Do NOT touch apartment_count, status, etc.
                    await patchClientSubscription(resolvedClientId, {
                         customer_id: polarCustomerId!,
                    });

                    revalidatePath("/profile");

                    await logServerAction({
                         user_id: null,
                         action: "Store Webhook - customer.updated patched customer_id",
                         payload: { resolvedClientId, polarCustomerId },
                         status: "success",
                         error: "",
                         duration_ms: Date.now() - t0,
                         type: "internal",
                    });
               } catch (e: any) {
                    const err = e instanceof Error ? e : new Error(e?.message ?? "unknown error");
                    await logServerAction({
                         user_id: null,
                         action: "Store Webhook - customer.updated patch failed",
                         payload: { eventType, polarCustomerId },
                         status: "fail",
                         error: err.message,
                         duration_ms: Date.now() - t0,
                         type: "internal",
                    });
                    throw err;
               }
               return;
          }

          // -------------------------------------------------------------------------
          // Order events -> translate Polar orders into tblInvoices rows
          // -------------------------------------------------------------------------
          if (isOrderEvent) {
               const orderPayload = data as PolarOrder | undefined;

               if (!orderPayload?.id) {
                    await logServerAction({
                         user_id: client_id,
                         action: "Store Webhook - order.* missing order id",
                         payload: { eventType, data },
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
                         action: "Store Webhook - order.* missing clientId",
                         payload: { eventType, orderId: orderPayload.id, meta },
                         status: "fail",
                         error: "Unable to resolve client for order",
                         duration_ms: Date.now() - t0,
                         type: "internal",
                    });
                    return;
               }

               try {
                    await upsertInvoiceFromOrder({
                         order: orderPayload,
                         client_id,
                         subscription_id,
                    });

                    try {
                         await patchClientSubscription(client_id, { order_id: orderPayload.id });
                    } catch (orderPatchError: any) {
                         const patchErr = orderPatchError instanceof Error ? orderPatchError : new Error(orderPatchError?.message ?? "unknown error");
                         await logServerAction({
                              user_id: client_id,
                              action: "Store Webhook - order.* order_id patch failed",
                              payload: { orderId: orderPayload.id },
                              status: "fail",
                              error: patchErr.message,
                              duration_ms: Date.now() - t0,
                              type: "internal",
                         });
                    }

                    revalidatePath("/profile");

                    await logServerAction({
                         user_id: client_id,
                         action: `Store Webhook - Processed ${eventType}`,
                         payload: { eventType, orderId: orderPayload.id, subscription_id },
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
                         payload: { orderId: orderPayload.id, subscription_id },
                         status: "fail",
                         error: err.message,
                         duration_ms: Date.now() - t0,
                         type: "internal",
                    });
                    throw err;
               }

               return;
          }

          // -------------------------------------------------------------------------
          // Subscription events -> upsert tblClient_Subscription rows
          // -------------------------------------------------------------------------
          if (isSubscriptionEvent) {
               try {
                    if (!polarSubscriptionId) {
                         await logServerAction({
                              user_id: null,
                              action: "Store Webhook - Missing polar subscription id",
                              payload: { eventType },
                              status: "fail",
                              error: "No subscription id in payload",
                              duration_ms: Date.now() - t0,
                              type: "internal",
                         });
                         return;
                    }
                    // Resolve the new subscription_id from tblSubscriptions using product_id
                    const productId = data?.product_id || data?.productId || null;
                    let resolvedSubscriptionId = subscription_id;
                    if (productId) {
                         const { data: subRow, error: subError } = await supabase
                              .from("tblSubscriptionPlans")
                              .select("id")
                              .or(`polar_product_id_monthly.eq.${productId},polar_product_id_annually.eq.${productId}`)
                              .maybeSingle<{ id: string }>();
                         if (!subError && subRow && subRow.id) {
                              resolvedSubscriptionId = subRow.id;
                              // Update tblClient_Subscription with the new subscription_id
                              await supabase
                                   .from("tblClient_Subscription")
                                   .update({ subscription_id: resolvedSubscriptionId })
                                   .eq("polar_subscription_id", data?.product.id);
                         }
                    }

                    if (!resolvedSubscriptionId) {
                         await logServerAction({
                              user_id: null,
                              action: "Store Webhook - Missing subscription plan id after resolving",
                              payload: { eventType, client_id, polarSubscriptionId },
                              status: "fail",
                              error: "subscriptionPlanId missing after resolving",
                              duration_ms: Date.now() - t0,
                              type: "internal",
                         });
                         return;
                    }

                    const apartments_count = await getApartmentCountForClient(client_id!);
                    const subscriptionSnapshot = buildSubscriptionSnapshot({
                         client_id: client_id!,
                         subscription_id: resolvedSubscriptionId!,
                         apartments_count,
                         data,
                         statusOverride: normalizedStatus,
                    });

                    await ensureSubscriptionRow(subscriptionSnapshot);

                    revalidatePath("/profile");

                    // If we reach here, ignore
                    await logServerAction({
                         user_id: null,
                         action: "Store Webhook - Ignored event",
                         payload: { eventType, status: normalizedStatus, currentPeriodStart },
                         status: "success",
                         error: "",
                         duration_ms: Date.now() - t0,
                         type: "internal",
                    });
               } catch (e: any) {
                    const err = e instanceof Error ? e : new Error(e?.message ?? "unknown error");
                    await logServerAction({
                         user_id: null,
                         action: "Store Webhook - Handler failed",
                         payload: {
                              eventType,
                              client_id,
                              subscription_id,
                              polarCustomerId,
                              polarSubscriptionId,
                              polarOrderId,
                              polarProductId,
                              currentPeriodStart,
                         },
                         status: "fail",
                         error: err.message,
                         duration_ms: Date.now() - t0,
                         type: "internal",
                    });
                    throw err;
               }
          }
     },
});
