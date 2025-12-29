// app/api/polar/webhook/route.ts
import { logServerAction } from "@/app/lib/server-logging";
import { Webhooks } from "@polar-sh/nextjs";
import { createClient } from "@supabase/supabase-js";

// Ensure Node runtime (webhook signature verification + SDK typically expects Node)
export const runtime = "nodejs";

// Use service role for webhooks (bypasses RLS) — never expose to client
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
     quantity: number | null;
     subscription_plan_id: string | null;
     client_id: string | null;
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
          apartmentsCount: meta?.apartments_count ?? null,
     };
}

/**
 * Extract ids from payload. Different event types nest objects differently.
 * We keep this very defensive.
 */
function extractIds(eventType: string, data: any) {
     const t = eventType.toLowerCase();

     const polarCustomerId =
          data?.customer?.id ??
          data?.customer_id ??
          data?.customerId ??
          null;

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

     // product id can be in a few places depending on event payload shape
     const polarProductId =
          data?.product?.id ??
          data?.product_id ??
          data?.products?.[0]?.id ??
          data?.line_items?.[0]?.product?.id ??
          data?.line_items?.[0]?.product_id ??
          data?.items?.[0]?.product?.id ??
          data?.items?.[0]?.product_id ??
          null;

     // quantity can exist on subscription, or on line item quantity for some systems
     const quantity =
          data?.quantity ??
          data?.seats ??
          data?.seat_quantity ??
          data?.items?.[0]?.quantity ??
          data?.line_items?.[0]?.quantity ??
          null;

     return {
          polarCustomerId: polarCustomerId ? String(polarCustomerId) : null,
          polarSubscriptionId: polarSubscriptionId ? String(polarSubscriptionId) : null,
          polarCheckoutId: polarCheckoutId ? String(polarCheckoutId) : null,
          polarOrderId: polarOrderId ? String(polarOrderId) : null,
          polarProductId: polarProductId ? String(polarProductId) : null,
          quantity: typeof quantity === "number" ? quantity : quantity ? Number(quantity) : null,
     };
}

/**
 * Next billing date / period end commonly present on subscription objects.
 * We'll also accept a fallback if your DB requires next_payment_date not null.
 */
function extractNextPaymentDate(data: any) {
     return (
          data?.current_period_end ??
          data?.current_period_end_at ??
          data?.next_billing_at ??
          data?.next_payment_date ??
          null
     );
}

/**
 * If an event arrives without metadata, try to locate the client subscription row
 * using polar_subscription_id or polar_customer_id.
 */
async function resolveClientAndPlanFromPolarIds(ids: {
     polarSubscriptionId?: string | null;
     polarCustomerId?: string | null;
}): Promise<{ client_id: string; subscription_plan_id: string } | null> {
     if (ids.polarSubscriptionId) {
          const { data } = await supabase
               .from("tblClient_Subscription")
               .select("client_id, subscription_plan_id")
               .eq("polar_subscription_id", ids.polarSubscriptionId)
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

     quantity?: number | null;

     nextPaymentDate?: string | null;
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
          quantity,
          nextPaymentDate,
          isAutoRenew,
          expired,
     } = args;

     // Read existing row (typed) to avoid overwriting non-null with null
     const { data: existingRow, error: existingErr } = await supabase
          .from("tblClient_Subscription")
          .select(
               "created_at, polar_customer_id, polar_subscription_id, polar_checkout_id, polar_order_id, polar_product_id, quantity"
          )
          .eq("client_id", clientId)
          .maybeSingle<ClientSubscriptionRow>();

     if (existingErr) {
          await logServerAction({
               user_id: null,
               action: "Webhook - Read existing subscription failed",
               payload: { clientId },
               status: "fail",
               error: existingErr.message,
               duration_ms: Date.now() - t0,
               type: "internal",
          });
     }

     const existing: ClientSubscriptionRow | null = existingRow ?? null;

     const finalPolarCustomerId = polarCustomerId ?? existing?.polar_customer_id ?? null;
     const finalPolarSubscriptionId = polarSubscriptionId ?? existing?.polar_subscription_id ?? null;
     const finalPolarCheckoutId = polarCheckoutId ?? existing?.polar_checkout_id ?? null;
     const finalPolarOrderId = polarOrderId ?? existing?.polar_order_id ?? null;
     const finalPolarProductId = polarProductId ?? existing?.polar_product_id ?? null;

     const finalQuantity =
          typeof quantity === "number" && Number.isFinite(quantity)
               ? Math.max(1, Math.floor(quantity))
               : existing?.quantity ?? 1;

     // IMPORTANT: Your DB currently required next_payment_date NOT NULL earlier.
     // If it's still NOT NULL, we must provide a fallback value.
     // Best is to change DB to allow NULL. But as a safety net:
     const safeNextPaymentDate =
          nextPaymentDate ??
          // fallback: +30 days from now
          new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString();

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

                    next_payment_date: safeNextPaymentDate,

                    polar_customer_id: finalPolarCustomerId,
                    polar_subscription_id: finalPolarSubscriptionId,
                    polar_checkout_id: finalPolarCheckoutId,
                    polar_order_id: finalPolarOrderId,
                    polar_product_id: finalPolarProductId,

                    quantity: finalQuantity,
               },
               { onConflict: "client_id" } // requires UNIQUE(client_id)
          );

     if (upsertErr) {
          await logServerAction({
               user_id: null,
               action: "Webhook - Upsert Client Subscription Failed",
               payload: {
                    clientId,
                    subscriptionPlanId,
                    renewalPeriod,
                    status,
                    nextPaymentDate: safeNextPaymentDate,
                    quantity: finalQuantity,
               },
               status: "fail",
               error: upsertErr.message,
               duration_ms: Date.now() - t0,
               type: "internal",
          });
          throw upsertErr;
     }

     await logServerAction({
          user_id: null,
          action: "Webhook - Upsert Client Subscription Success",
          payload: { clientId, status, quantity: finalQuantity },
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
          const data = (payload as any)?.data ?? {};
          const t = eventType.toLowerCase();

          const meta = extractMeta(data);
          const ids = extractIds(eventType, data);
          const status = mapPolarToLocalStatus(eventType, data);
          const nextPaymentDate = extractNextPaymentDate(data);

          // TEMP: useful while wiring events
          console.log("Polar webhook:", eventType, {
               metaClientId: meta.clientId,
               metaSubscriptionPlanId: meta.subscriptionPlanId,
               ids,
          });

          // If metadata missing, try to resolve client_id / subscription_plan_id from stored polar ids
          if (!meta.clientId || !meta.subscriptionPlanId) {
               const resolved = await resolveClientAndPlanFromPolarIds({
                    polarSubscriptionId: ids.polarSubscriptionId,
                    polarCustomerId: ids.polarCustomerId,
               });

               if (!resolved) {
                    await logServerAction({
                         user_id: null,
                         action: "Webhook - Missing metadata and could not resolve client/plan",
                         payload: { eventType, ids },
                         status: "fail",
                         error: "No mapping found in tblClient_Subscription",
                         duration_ms: Date.now() - t0,
                         type: "internal",
                    });
                    return;
               }

               meta.clientId = resolved.client_id;
               meta.subscriptionPlanId = resolved.subscription_plan_id;
          }

          // Handle events you care about (you can broaden later)

          // CHECKOUT CREATED/UPDATED/COMPLETED
          if (t.startsWith("checkout.")) {
               await upsertClientSubscription({
                    clientId: meta.clientId!,
                    subscriptionPlanId: meta.subscriptionPlanId!,
                    renewalPeriod: meta.renewalPeriod,
                    status,
                    polarCustomerId: ids.polarCustomerId,
                    polarSubscriptionId: ids.polarSubscriptionId,
                    polarCheckoutId: ids.polarCheckoutId, // ✅ this will now be set (data.id for checkout.*)
                    polarOrderId: ids.polarOrderId,
                    polarProductId: ids.polarProductId,
                    quantity: ids.quantity,
                    nextPaymentDate,
                    isAutoRenew: true,
                    expired: false,
               });
               return;
          }

          // CUSTOMER CREATED/UPDATED
          if (t.startsWith("customer.")) {
               // Often customer events don't have subscription info, but we can still store customer id
               await upsertClientSubscription({
                    clientId: meta.clientId!,
                    subscriptionPlanId: meta.subscriptionPlanId!,
                    renewalPeriod: meta.renewalPeriod,
                    status,
                    polarCustomerId: ids.polarCustomerId,
                    polarSubscriptionId: ids.polarSubscriptionId,
                    polarCheckoutId: ids.polarCheckoutId,
                    polarOrderId: ids.polarOrderId,
                    polarProductId: ids.polarProductId,
                    quantity: ids.quantity,
                    nextPaymentDate,
                    isAutoRenew: true,
                    expired: false,
               });
               return;
          }

          // ORDER CREATED/UPDATED (enable these events in Polar webhook settings)
          if (t.startsWith("order.")) {
               await upsertClientSubscription({
                    clientId: meta.clientId!,
                    subscriptionPlanId: meta.subscriptionPlanId!,
                    renewalPeriod: meta.renewalPeriod,
                    status,
                    polarCustomerId: ids.polarCustomerId,
                    polarSubscriptionId: ids.polarSubscriptionId,
                    polarCheckoutId: ids.polarCheckoutId,
                    polarOrderId: ids.polarOrderId, // ✅
                    polarProductId: ids.polarProductId, // ✅ likely present here (line items)
                    quantity: ids.quantity,
                    nextPaymentDate,
                    isAutoRenew: true,
                    expired: false,
               });
               return;
          }

          // SUBSCRIPTION CREATED/UPDATED/CANCELED (enable these events in Polar webhook settings)
          if (t.startsWith("subscription.")) {
               const isCanceled = t.includes("canceled");
               await upsertClientSubscription({
                    clientId: meta.clientId!,
                    subscriptionPlanId: meta.subscriptionPlanId!,
                    renewalPeriod: meta.renewalPeriod,
                    status: isCanceled ? "canceled" : status,
                    polarCustomerId: ids.polarCustomerId,
                    polarSubscriptionId: ids.polarSubscriptionId, // ✅
                    polarCheckoutId: ids.polarCheckoutId,
                    polarOrderId: ids.polarOrderId,
                    polarProductId: ids.polarProductId,
                    quantity: ids.quantity,
                    nextPaymentDate,
                    isAutoRenew: !isCanceled,
                    expired: false,
               });
               return;
          }

          // PAYMENT SUCCEEDED / FAILED (enable these events in Polar webhook settings)
          if (t.startsWith("payment.")) {
               await upsertClientSubscription({
                    clientId: meta.clientId!,
                    subscriptionPlanId: meta.subscriptionPlanId!,
                    renewalPeriod: meta.renewalPeriod,
                    status,
                    polarCustomerId: ids.polarCustomerId,
                    polarSubscriptionId: ids.polarSubscriptionId,
                    polarCheckoutId: ids.polarCheckoutId,
                    polarOrderId: ids.polarOrderId,
                    polarProductId: ids.polarProductId,
                    quantity: ids.quantity,
                    nextPaymentDate,
                    isAutoRenew: true,
                    expired: false,
               });
               return;
          }

          // INVOICE CREATED / FINALIZED (optional, if you later store invoices)
          if (t.startsWith("invoice.")) {
               return;
          }

          // Default: ignore other events
     },
});
