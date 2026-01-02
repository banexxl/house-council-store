// app/api/polar/webhook/route.ts
import { polar } from "@/app/lib/polar";
import { logServerAction } from "@/app/lib/server-logging";
import { getApartmentCountForClient } from "@/app/profile/subscription-plan-actions";
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

     await logServerAction({
          user_id: null,
          action: "Store Webhook - Resolving client and plan from Polar IDs",
          payload: { ids },
          status: "success",
          error: "",
          duration_ms: 0,
          type: "internal",
     });

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

type SubscriptionPatch = Partial<{
     subscription_plan_id: string;
     status: string;
     renewal_period: "monthly" | "annually";
     is_auto_renew: boolean;
     expired: boolean;
     next_payment_date: string | null;

     polar_customer_id: string | null;
     polar_subscription_id: string | null;
     polar_checkout_id: string | null;
     polar_order_id: string | null;
     polar_product_id: string | null;

     apartment_count: number; // keep >= 1
}>;

async function patchClientSubscription(clientId: string, patch: SubscriptionPatch): Promise<{ success: boolean, error?: string }> {
     const update: Record<string, any> = { updated_at: nowIso() };

     for (const [k, v] of Object.entries(patch)) {
          if (v !== undefined) update[k] = v; // ✅ only defined keys
     }
     console.log('Trying to patch client subscription with update: ', update);

     // ✅ For updates: just update existing row
     const { error } = await supabase
          .from("tblClient_Subscription")
          .update(update)
          .eq("client_id", clientId);


     if (error) {
          console.log('Error patching client subscription: ', error);
          return { success: false, error: error.message };
     }
     return { success: true };
}

async function ensureSubscriptionRow(clientId: string, base: {
     subscription_plan_id: string;
     renewal_period: "monthly" | "annually";
     status: string;
}) {
     const { error } = await supabase
          .from("tblClient_Subscription")
          .upsert({
               client_id: clientId,
               subscription_plan_id: base.subscription_plan_id,
               renewal_period: base.renewal_period,
               status: base.status,
               created_at: nowIso(),
               updated_at: nowIso(),
               is_auto_renew: true,
               expired: false,
               apartment_count: 1, // satisfy check constraint
          }, { onConflict: "client_id" });

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

          const eventType = (payload as any)?.type ?? "";
          const t = String(eventType).toLowerCase();
          const data = (payload as any)?.data ?? {};

          const meta = extractMeta(data);
          const status = mapPolarToLocalStatus(eventType, data);
          const nextPaymentDate = extractNextPaymentDate(data);
          const currentPeriodStart = extractCurrentPeriodStart(data);

          await logServerAction({
               user_id: null,
               action: "Store Webhook - Payload Received",
               payload,
               status: "success",
               error: "",
               duration_ms: Date.now() - t0,
               type: "internal",
          });

          // -------------------------------------------------------------------------
          // Resolve clientId + subscriptionPlanId for events that need them
          // -------------------------------------------------------------------------
          let clientId = meta.clientId;
          let subscriptionPlanId = meta.subscriptionPlanId;
          const renewalPeriod: RenewalPeriod = meta.renewalPeriod ?? "monthly";

          const polarCustomerId: string | null =
               data?.customer_id ?? data?.customerId ?? (t.startsWith("customer.") ? data?.id : null) ?? null;

          const polarSubscriptionId: string | null = data?.subscription_id ?? data?.subscriptionId ?? null;
          const polarCheckoutId: string | null = data?.checkout_id ?? data?.checkoutId ?? null;
          const polarOrderId: string | null = data?.order_id ?? data?.orderId ?? null;
          const polarProductId: string | null = data?.product_id ?? data?.productId ?? null;

          // customer.updated often has no metadata; handle separately below
          const isCustomerUpdated = t === "customer.updated" || (t.startsWith("customer.") && t.includes("updated"));

          if (!isCustomerUpdated) {
               // For subscription events, try resolve if meta is missing
               if (!clientId || !subscriptionPlanId) {
                    const resolved = await resolveClientAndPlanFromPolarIds({
                         polarSubscriptionId,
                         polarCustomerId,
                         polarCheckoutId,
                         polarOrderId,
                    });

                    if (!resolved) {
                         await logServerAction({
                              user_id: null,
                              action: "Store Webhook - Missing metadata and could not resolve client/plan",
                              payload: { eventType, polarSubscriptionId, polarCustomerId, polarCheckoutId, polarOrderId },
                              status: "fail",
                              error: "No mapping found in tblClient_Subscription yet",
                              duration_ms: Date.now() - t0,
                              type: "internal",
                         });
                         return;
                    }

                    clientId = resolved.client_id;
                    subscriptionPlanId = resolved.subscription_plan_id;
               }

               // by here we need these for subscription table
               if (!clientId || !subscriptionPlanId) {
                    await logServerAction({
                         user_id: null,
                         action: "Store Webhook - Cannot process event (still missing clientId/subscriptionPlanId)",
                         payload: { eventType, meta },
                         status: "fail",
                         error: "clientId/subscriptionPlanId missing",
                         duration_ms: Date.now() - t0,
                         type: "internal",
                    });
                    return;
               }
          }

          // -------------------------------------------------------------------------
          // Event: CUSTOMER UPDATED (patch only polar_customer_id)
          // -------------------------------------------------------------------------
          if (isCustomerUpdated) {
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
                    // Only patch polar_customer_id. Do NOT touch apartment_count, status, etc.
                    const updated = await patchClientSubscription(resolvedClientId, {
                         polar_customer_id: polarCustomerId,
                    });

                    if (!updated.success) {
                         // subscription row might not exist yet; log and exit safely
                         await logServerAction({
                              user_id: null,
                              action: "Store Webhook - customer.updated: subscription row missing (no update performed)",
                              payload: { resolvedClientId, polarCustomerId },
                              status: "fail",
                              error: "tblClient_Subscription row not found for client_id",
                              duration_ms: Date.now() - t0,
                              type: "internal",
                         });
                         return;
                    }

                    revalidatePath("/profile");

                    await logServerAction({
                         user_id: null,
                         action: "Store Webhook - customer.updated patched polar_customer_id",
                         payload: { resolvedClientId, polarCustomerId },
                         status: "success",
                         error: "",
                         duration_ms: Date.now() - t0,
                         type: "internal",
                    });
               } catch (e: any) {
                    await logServerAction({
                         user_id: null,
                         action: "Store Webhook - customer.updated patch failed",
                         payload: { eventType, polarCustomerId },
                         status: "fail",
                         error: e?.message ?? "unknown error",
                         duration_ms: Date.now() - t0,
                         type: "internal",
                    });
               }
               return;
          }

          // -------------------------------------------------------------------------
          // Subscription lifecycle events (event-specific patches)
          // -------------------------------------------------------------------------

          // Helper: patch common subscription identifiers (safe)
          const commonIdsPatch: SubscriptionPatch = {
               polar_customer_id: polarCustomerId,
               polar_subscription_id: polarSubscriptionId,
               polar_checkout_id: polarCheckoutId,
               polar_order_id: polarOrderId,
               polar_product_id: polarProductId,
          };

          // Some events should ensure the row exists before patching
          const shouldEnsureRow =
               t.includes("subscription.created") ||
               t.includes("subscription.updated") ||
               t.includes("subscription.active") ||
               t.includes("subscription.past_due") ||
               t.includes("subscription.uncanceled") ||
               t.includes("subscription.canceled") ||
               t.includes("subscription.revoked");

          try {
               if (shouldEnsureRow) {
                    await ensureSubscriptionRow(clientId!, {
                         subscription_plan_id: subscriptionPlanId!,
                         renewal_period: renewalPeriod,
                         status,
                    });
               }

               // Compute apartment_count only on subscription events (and always keep >= 1)
               const apartmentsCount = await getApartmentCountForClient(clientId!);

               // subscription.active
               if (t.includes("subscription.active")) {
                    await patchClientSubscription(clientId!, {
                         status: "active",
                         renewal_period: renewalPeriod,
                         is_auto_renew: true,
                         expired: false,
                         next_payment_date: nextPaymentDate ?? null,
                         apartment_count: apartmentsCount,
                         ...commonIdsPatch,
                    });

                    revalidatePath("/profile");
                    return;
               }

               // subscription.canceled (cancel at period end / canceled)
               if (t.includes("subscription.canceled")) {
                    await patchClientSubscription(clientId!, {
                         status: "canceled",
                         renewal_period: renewalPeriod,
                         is_auto_renew: false,
                         expired: false,
                         next_payment_date: nextPaymentDate ?? null,
                         apartment_count: apartmentsCount,
                         ...commonIdsPatch,
                    });

                    revalidatePath("/profile");
                    return;
               }

               // subscription.uncanceled
               if (t.includes("subscription.uncanceled")) {
                    await patchClientSubscription(clientId!, {
                         status: "active",
                         renewal_period: renewalPeriod,
                         is_auto_renew: true,
                         expired: false,
                         next_payment_date: nextPaymentDate ?? null,
                         apartment_count: apartmentsCount,
                         ...commonIdsPatch,
                    });

                    revalidatePath("/profile");
                    return;
               }

               // subscription.revoked (immediate)
               if (t.includes("subscription.revoked")) {
                    await patchClientSubscription(clientId!, {
                         status: "canceled",
                         renewal_period: renewalPeriod,
                         is_auto_renew: false,
                         expired: true,
                         next_payment_date: nextPaymentDate ?? null,
                         apartment_count: apartmentsCount,
                         ...commonIdsPatch,
                    });

                    revalidatePath("/profile");
                    return;
               }

               // subscription.past_due
               if (t.includes("subscription.past_due")) {
                    await patchClientSubscription(clientId!, {
                         status: "past_due",
                         renewal_period: renewalPeriod,
                         is_auto_renew: true,
                         expired: false,
                         next_payment_date: nextPaymentDate ?? null,
                         apartment_count: apartmentsCount,
                         ...commonIdsPatch,
                    });

                    revalidatePath("/profile");
                    return;
               }

               // subscription.created
               if (t.includes("subscription.created")) {
                    await patchClientSubscription(clientId!, {
                         status,
                         renewal_period: renewalPeriod,
                         is_auto_renew: true,
                         expired: false,
                         next_payment_date: nextPaymentDate ?? null,
                         apartment_count: apartmentsCount,
                         polar_subscription_id: data?.id,
                         ...commonIdsPatch,
                    });

                    revalidatePath("/profile");
                    return;
               }

               // subscription.updated
               if (t.includes("subscription.updated")) {
                    await patchClientSubscription(clientId!, {
                         status,
                         renewal_period: renewalPeriod,
                         is_auto_renew: true,
                         expired: false,
                         next_payment_date: nextPaymentDate ?? null,
                         apartment_count: apartmentsCount,
                         polar_subscription_id: data.id,
                         ...commonIdsPatch,
                    });

                    revalidatePath("/profile");
                    return;
               }

               // If we reach here, ignore
               await logServerAction({
                    user_id: null,
                    action: "Store Webhook - Ignored event",
                    payload: { eventType, status, currentPeriodStart },
                    status: "success",
                    error: "",
                    duration_ms: Date.now() - t0,
                    type: "internal",
               });
          } catch (e: any) {
               // IMPORTANT: don't delete Polar customer here.
               // Most failures here are DB constraints/mapping issues, not a Polar resource issue.
               await logServerAction({
                    user_id: null,
                    action: "Store Webhook - Handler failed",
                    payload: {
                         eventType,
                         clientId,
                         subscriptionPlanId,
                         polarCustomerId,
                         polarSubscriptionId,
                         polarCheckoutId,
                         polarOrderId,
                         polarProductId,
                         nextPaymentDate,
                         currentPeriodStart,
                    },
                    status: "fail",
                    error: e?.message ?? "unknown error",
                    duration_ms: Date.now() - t0,
                    type: "internal",
               });
          }
     },
});
