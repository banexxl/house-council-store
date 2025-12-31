// app/api/polar/webhook/route.ts
import { polar } from "@/app/lib/polar";
import { logServerAction } from "@/app/lib/server-logging";
import { getApartmentCountForClient } from "@/app/profile/subscription-plan-actions";
import { Webhooks } from "@polar-sh/nextjs";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

// ✅ Use SERVICE ROLE for webhooks (bypasses RLS). Never use anon key here.
const supabase = createClient(
     process.env.NEXT_PUBLIC_SUPABASE_URL!,
     process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type RenewalPeriod = "monthly" | "annually";

type ClientSubscriptionRow = {
     created_at: string | null;

     polar_customer_id: string | null;
     polar_subscription_id: string | null;
     polar_checkout_id: string | null;
     polar_order_id: string | null;
     polar_product_id: string | null;
     client_id: string | null;

     apartment_count: number | null;

     subscription_plan_id: string | null;

     apartment_count_last_synced_at?: string | null;
     apartment_count_last_sent?: number | null;
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function nowIso() {
     return new Date().toISOString();
}

function normalizeRenewalPeriod(value: any): RenewalPeriod | null {
     if (value === "monthly" || value === "annually") return value;
     if (value === "annual" || value === "yearly") return "annually";
     return null;
}

function mapPolarToLocalStatus(eventType: string, data: any): string {
     const t = eventType.toLowerCase();

     if (t.includes("trial") && t.includes("started")) return "trialing";
     if (t.includes("trial") && t.includes("ended")) return "active";

     if (t.includes("subscription") && t.includes("canceled")) return "canceled";

     if (t.includes("subscription") && t.includes("created")) {
          const status = (data?.status ?? "").toString().toLowerCase();
          if (status.includes("trial")) return "trialing";
          if (status.includes("active")) return "active";
          return "active";
     }

     if (t.includes("subscription") && t.includes("updated")) {
          const status = (data?.status ?? "").toString().toLowerCase();
          if (status.includes("trial")) return "trialing";
          if (status.includes("active")) return "active";
          if (status.includes("canceled")) return "canceled";
          if (status.includes("paused")) return "paused";
          return "active";
     }

     if (t.includes("payment") && t.includes("failed")) return "past_due";
     if (t.includes("payment") && t.includes("succeeded")) return "active";

     return "active";
}

function extractMeta(payloadData: any) {
     const meta = payloadData?.metadata ?? payloadData?.data?.metadata ?? {};
     return {
          clientId: meta?.clientId ?? meta?.client_id ?? null,
          subscriptionPlanId: meta?.subscriptionPlanId ?? meta?.subscription_plan_id ?? null,
          renewalPeriod: normalizeRenewalPeriod(
               meta?.renewal_period ?? meta?.billingCycle ?? meta?.billing_cycle
          ),
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

function isSameOrAfter(
     aIso: string | null | undefined,
     bIso: string | null | undefined
) {
     if (!aIso || !bIso) return false;
     return new Date(aIso).getTime() >= new Date(bIso).getTime();
}

/**
 * Strategy B meter expects metadata.apartments_count (per your meter config screenshot).
 * IMPORTANT: The key must match exactly: apartments_count
 */
async function ingestApartmentSnapshot(args: {
     polarCustomerId: string;
     clientId: string;
     apartmentsCount: number;
     timestampIso: string;
}) {
     const { polarCustomerId, clientId, apartmentsCount, timestampIso } = args;

     await polar.events.ingest({
          events: [
               {
                    name: "apartments_snapshot",
                    customerId: polarCustomerId,
                    timestamp: new Date(timestampIso),
                    metadata: {
                         client_id: clientId,
                         apartments_count: apartmentsCount, // ✅ must match meter property
                    },
               },
          ],
     });
}

/**
 * Extract ids from payload. Different event types nest objects differently.
 * Keep this defensive.
 */
function extractIds(eventType: string, data: any) {
     const t = eventType.toLowerCase();

     const polarCustomerId =
          data?.customer?.id ?? data?.customer_id ?? data?.customerId ?? null;

     // subscription.* often has data.id (the subscription itself)
     const polarSubscriptionId =
          data?.subscription?.id ??
          data?.subscription_id ??
          data?.subscriptionId ??
          (t.startsWith("subscription.") ? data?.id : null) ??
          null;

     // checkout.* has data.id (the checkout itself)
     const polarCheckoutId =
          (t.startsWith("checkout.") ? data?.id : null) ??
          data?.checkout?.id ??
          data?.checkout_id ??
          null;

     // order.* has data.id (the order itself)
     const polarOrderId =
          (t.startsWith("order.") ? data?.id : null) ??
          data?.order?.id ??
          data?.order_id ??
          null;

     // product id is usually best found in order line items
     const polarProductId =
          data?.product?.id ??
          data?.product_id ??
          data?.products?.[0]?.id ??
          data?.line_items?.[0]?.product?.id ??
          data?.line_items?.[0]?.product_id ??
          data?.items?.[0]?.product?.id ??
          data?.items?.[0]?.product_id ??
          null;

     // apartment_count (Polar doesn't always include it → default to 1)
     const qtyRaw =
          data?.apartment_count ??
          data?.seats ??
          data?.seat_quantity ??
          data?.items?.[0]?.apartment_count ??
          data?.line_items?.[0]?.apartment_count ??
          null;

     let quantityParsed: number | null = null;

     if (typeof qtyRaw === "number") {
          quantityParsed = Number.isFinite(qtyRaw) ? qtyRaw : null;
     } else if (qtyRaw != null) {
          const n = Number(qtyRaw);
          quantityParsed = Number.isFinite(n) ? n : null;
     }

     const apartment_count = Math.max(1, quantityParsed ?? 1);

     return {
          polarCustomerId: polarCustomerId ? String(polarCustomerId) : null,
          polarSubscriptionId: polarSubscriptionId ? String(polarSubscriptionId) : null,
          polarCheckoutId: polarCheckoutId ? String(polarCheckoutId) : null,
          polarOrderId: polarOrderId ? String(polarOrderId) : null,
          polarProductId: polarProductId ? String(polarProductId) : null,
          apartment_count,
     };
}

/** Next billing date / period end commonly present on subscription objects. */
function extractNextPaymentDate(data: any): string | null {
     return (
          data?.current_period_end ??
          data?.current_period_end_at ??
          data?.next_billing_at ??
          data?.next_payment_date ??
          null
     );
}

/**
 * If an event arrives without metadata, try to locate client/plan
 * by looking up saved Polar ids.
 */
async function resolveClientAndPlanFromPolarIds(ids: {
     polarSubscriptionId?: string | null;
     polarCustomerId?: string | null;
     polarCheckoutId?: string | null;
     polarOrderId?: string | null;
}): Promise<{ client_id: string; subscription_plan_id: string } | null> {
     if (ids.polarSubscriptionId) {
          const { data } = await supabase
               .from("tblClient_Subscription")
               .select("client_id, subscription_plan_id")
               .eq("polar_subscription_id", ids.polarSubscriptionId)
               .maybeSingle<{ client_id: string; subscription_plan_id: string }>();

          if (data?.client_id && data?.subscription_plan_id) return data;
     }

     if (ids.polarOrderId) {
          const { data } = await supabase
               .from("tblClient_Subscription")
               .select("client_id, subscription_plan_id")
               .eq("polar_order_id", ids.polarOrderId)
               .maybeSingle<{ client_id: string; subscription_plan_id: string }>();

          if (data?.client_id && data?.subscription_plan_id) return data;
     }

     if (ids.polarCheckoutId) {
          const { data } = await supabase
               .from("tblClient_Subscription")
               .select("client_id, subscription_plan_id")
               .eq("polar_checkout_id", ids.polarCheckoutId)
               .maybeSingle<{ client_id: string; subscription_plan_id: string }>();

          if (data?.client_id && data?.subscription_plan_id) return data;
     }

     if (ids.polarCustomerId) {
          const { data } = await supabase
               .from("tblClient_Subscription")
               .select("client_id, subscription_plan_id")
               .eq("polar_customer_id", ids.polarCustomerId)
               .maybeSingle<{ client_id: string; subscription_plan_id: string }>();

          if (data?.client_id && data?.subscription_plan_id) return data;
     }

     return null;
}

async function upsertClientSubscription(args: {
     clientId: string;
     subscriptionPlanId: string;
     renewalPeriod: RenewalPeriod | null;
     status: string;

     polarCustomerId?: string | null;
     polarSubscriptionId?: string | null;
     polarCheckoutId?: string | null;
     polarOrderId?: string | null;
     polarProductId?: string | null;

     polarQuantity?: number | null;

     nextPaymentDate?: string | null;
     currentPeriodStart?: string | null;

     isAutoRenew?: boolean | null;
     expired?: boolean | null;
}) {
     const t0 = Date.now();

     const {
          clientId,
          subscriptionPlanId,
          renewalPeriod,
          status,
          polarCustomerId,
          polarSubscriptionId,
          polarCheckoutId,
          polarOrderId,
          polarProductId,
          polarQuantity,
          nextPaymentDate,
          currentPeriodStart,
          isAutoRenew,
          expired,
     } = args;

     // Read existing row to avoid overwriting non-null with null
     const { data: existingRow, error: existingErr } = await supabase
          .from("tblClient_Subscription")
          .select(
               "created_at, polar_customer_id, polar_subscription_id, polar_checkout_id, polar_order_id, polar_product_id, apartment_count, seats_last_synced_at, quantity_last_sent"
          )
          .eq("client_id", clientId)
          .maybeSingle<ClientSubscriptionRow>();

     if (existingErr) {
          await logServerAction({
               user_id: null,
               action: "Store Webhook - Read existing subscription failed",
               payload: { clientId },
               status: "fail",
               error: existingErr.message,
               duration_ms: Date.now() - t0,
               type: "internal",
          });
     }

     const existing: ClientSubscriptionRow | null = existingRow ?? null;

     const finalPolarCustomerId = polarCustomerId ?? existing?.polar_customer_id ?? null;
     const finalPolarSubscriptionId =
          polarSubscriptionId ?? existing?.polar_subscription_id ?? null;
     const finalPolarCheckoutId = polarCheckoutId ?? existing?.polar_checkout_id ?? null;
     const finalPolarOrderId = polarOrderId ?? existing?.polar_order_id ?? null;
     const finalPolarProductId = polarProductId ?? existing?.polar_product_id ?? null;

     // Always store a safe apartment_count (NOT NULL column in your schema)
     const polarSeats =
          typeof polarQuantity === "number" && Number.isFinite(polarQuantity)
               ? Math.max(1, Math.floor(polarQuantity))
               : null;

     const finalQuantity = polarSeats ?? existing?.apartment_count ?? 1;

     // You already have an action for this (it does join through buildings)
     const apartmentsCount = Math.max(0, await getApartmentCountForClient(clientId));

     const { error: upsertErr } = await supabase
          .from("tblClient_Subscription")
          .upsert(
               {
                    client_id: clientId,
                    subscription_plan_id: subscriptionPlanId,
                    renewal_period: renewalPeriod ?? "monthly",
                    status,
                    updated_at: nowIso(),
                    created_at: existing?.created_at ?? nowIso(),

                    is_auto_renew: isAutoRenew ?? true,
                    expired: expired ?? false,

                    next_payment_date: nextPaymentDate ?? null,

                    polar_customer_id: finalPolarCustomerId,
                    polar_subscription_id: finalPolarSubscriptionId,
                    polar_checkout_id: finalPolarCheckoutId,
                    polar_order_id: finalPolarOrderId,
                    polar_product_id: finalPolarProductId,
                    // optional (you said you added this column)
                    apartment_count: apartmentsCount,
               },
               { onConflict: "client_id" }
          );

     if (upsertErr) {
          await logServerAction({
               user_id: null,
               action: "Store Webhook - Upsert Client Subscription Failed",
               payload: {
                    clientId,
                    subscriptionPlanId,
                    renewalPeriod,
                    status,
                    nextPaymentDate,
                    apartment_count: finalQuantity,
               },
               status: "fail",
               error: upsertErr.message,
               duration_ms: Date.now() - t0,
               type: "internal",
          });
          throw upsertErr;
     }

     // -----------------------------------------------------------------------
     // Strategy B: ingest ONE apartments_snapshot per billing period (best effort)
     // - Your meter sums metadata.apartments_count
     // - We'll try to use current period start if provided, otherwise "now"
     // - We'll store seats_last_synced_at to prevent duplicates
     // -----------------------------------------------------------------------
     const timestampIso = currentPeriodStart ?? nowIso();

     const shouldIngest =
          status === "active" &&
          !!finalPolarCustomerId &&
          // if we've already synced after/at this timestamp, skip
          !isSameOrAfter(existing?.apartment_count_last_synced_at ?? null, timestampIso);

     if (shouldIngest) {
          try {
               await ingestApartmentSnapshot({
                    polarCustomerId: finalPolarCustomerId!,
                    clientId,
                    apartmentsCount,
                    timestampIso,
               });

               await supabase
                    .from("tblClient_Subscription")
                    .update({
                         quantity_last_sent: apartmentsCount,
                         seats_last_synced_at: nowIso(),
                         seats_sync_error: null,
                    })
                    .eq("client_id", clientId);
          } catch (e: any) {
               await supabase
                    .from("tblClient_Subscription")
                    .update({
                         seats_sync_error: e?.message ?? "usage ingest failed",
                         seats_last_synced_at: nowIso(),
                    })
                    .eq("client_id", clientId);
          }
     }

     await logServerAction({
          user_id: null,
          action: "Store Webhook - Upsert Client Subscription Success",
          payload: {
               clientId,
               status,
               apartment_count: finalQuantity,
               polar_checkout_id: finalPolarCheckoutId,
               polar_order_id: finalPolarOrderId,
               polar_product_id: finalPolarProductId,
               usage_ingest_attempted: shouldIngest,
               usage_timestamp: timestampIso,
          },
          status: "success",
          error: "",
          duration_ms: Date.now() - t0,
          type: "internal",
     });
}

// ---------------------------------------------------------------------------
// Webhook handler
// ---------------------------------------------------------------------------

export const POST = Webhooks({
     webhookSecret: process.env.POLAR_WEBHOOK_SECRET!,
     onPayload: async (payload) => {
          const t0 = Date.now();

          const eventType = (payload as any)?.type ?? "";
          console.log('Polar Webhook received:', eventType);
          const data = (payload as any)?.data ?? {};
          const t = eventType.toLowerCase();

          const meta = extractMeta(data);
          console.log('Polar Webhooks - meta data', meta);
          const ids = extractIds(eventType, data);
          console.log('Polar Webhooks - extracted ids', ids);
          const status = mapPolarToLocalStatus(eventType, data);
          console.log('Polar Webhooks - mapped status', status);
          const nextPaymentDate = extractNextPaymentDate(data);
          console.log('Polar Webhooks - next payment date', nextPaymentDate);
          const currentPeriodStart = extractCurrentPeriodStart(data);
          console.log('Polar Webhooks - current period start', currentPeriodStart);

          // If metadata missing, try resolve from stored polar ids
          if (!meta.clientId || !meta.subscriptionPlanId) {
               const resolved = await resolveClientAndPlanFromPolarIds({
                    polarSubscriptionId: ids.polarSubscriptionId,
                    polarCustomerId: ids.polarCustomerId,
                    polarCheckoutId: ids.polarCheckoutId,
                    polarOrderId: ids.polarOrderId,
               });

               if (!resolved) {
                    // customer.created can arrive before checkout and be metadata-less → ignore safely
                    await logServerAction({
                         user_id: null,
                         action: "Store Webhook - Missing metadata and could not resolve client/plan",
                         payload: { eventType, ids },
                         status: "fail",
                         error: "No mapping found in tblClient_Subscription yet",
                         duration_ms: Date.now() - t0,
                         type: "internal",
                    });
                    return;
               }

               meta.clientId = resolved.client_id;
               meta.subscriptionPlanId = resolved.subscription_plan_id;
          }

          // ✅ Handle lifecycle events (enable these in Polar webhook settings)
          if (
               t.startsWith("checkout.") ||
               t.startsWith("order.") ||
               t.startsWith("subscription.") ||
               t.startsWith("refund.") ||
               t.startsWith("payment.") ||
               t.startsWith("customer.") ||
               t.startsWith("product.") ||
               t.startsWith("benefit.")
          ) {
               const isCanceled = t.startsWith("subscription.") && t.includes("canceled");

               await upsertClientSubscription({
                    clientId: meta.clientId!,
                    subscriptionPlanId: meta.subscriptionPlanId!,
                    renewalPeriod: meta.renewalPeriod,
                    status: isCanceled ? "canceled" : status,

                    polarCustomerId: ids.polarCustomerId,
                    polarSubscriptionId: ids.polarSubscriptionId,
                    polarCheckoutId: ids.polarCheckoutId,
                    polarOrderId: ids.polarOrderId,
                    polarProductId: ids.polarProductId,

                    polarQuantity: ids.apartment_count,
                    nextPaymentDate,
                    currentPeriodStart,

                    isAutoRenew: !isCanceled,
                    expired: false,
               });

               return;
          }

          // ignore customer.* / invoice.* by default
          if (t.startsWith("customer.") || t.startsWith("invoice.")) return;

          await logServerAction({
               user_id: null,
               action: "Store Webhook - Ignored event",
               payload: { eventType },
               status: "success",
               error: "",
               duration_ms: Date.now() - t0,
               type: "internal",
          });
     },
});
