// app/api/polar/webhook/route.ts
import { polar } from "@/app/lib/polar";
import { logServerAction } from "@/app/lib/server-logging";
import { getApartmentCountForClient } from "@/app/profile/subscription-plan-actions";
import { PolarSubscription, PolarSubscriptionStatus } from "@/app/types/polar-subscription-types";
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

type SubscriptionRecordPatch = PolarSubscription & { subscription_id: string };

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

const stringifyOrNull = (value: unknown): string | null => {
     try {
          return value === undefined || value === null ? null : JSON.stringify(value);
     } catch {
          return null;
     }
};

const stringifyOrEmptyObject = (value: unknown): string => {
     try {
          return JSON.stringify(value ?? {});
     } catch {
          return "{}";
     }
};

interface BuildSubscriptionSnapshotArgs {
     clientId: string;
     subscriptionPlanId: string;
     apartmentsCount: number;
     data: any;
     statusOverride?: PolarSubscriptionStatus;
}

function buildSubscriptionSnapshot({
     clientId,
     subscriptionPlanId,
     apartmentsCount,
     data,
     statusOverride,
}: BuildSubscriptionSnapshotArgs): SubscriptionRecordPatch {
     const metadata = isRecord(data?.metadata) ? data.metadata : {};
     const customFieldData = isRecord(data?.custom_field_data) ? data.custom_field_data : {};
     const status = normalizeSubscriptionStatus(statusOverride ?? data?.status);

     return {
          id: ensureString(data?.id ?? data?.polar_subscription_id ?? ""),
          client_id: clientId,
          subscription_id: ensureString(data?.id ?? ""),
          polar_subscription_id: ensureString(data?.id ?? ""),
          created_at: ensureDateString(data?.created_at),
          modified_at: ensureDateString(data?.modified_at ?? data?.updated_at),
          apartment_count: typeof apartmentsCount === "number" ? Math.max(1, apartmentsCount) : 1,
          metadata,
          amount: typeof data?.amount === "number" ? data.amount : 0,
          currency: ensureString(data?.currency ?? "usd"),
          recurring_interval: normalizeInterval(data?.recurring_interval),
          recurring_interval_count: typeof data?.recurring_interval_count === "number" ? data.recurring_interval_count : 1,
          status,
          current_period_start: ensureDateString(data?.current_period_start),
          current_period_end: ensureDateString(data?.current_period_end),
          trial_start: ensureNullableString(data?.trial_start),
          trial_end: ensureNullableString(data?.trial_end),
          cancel_at_period_end: Boolean(data?.cancel_at_period_end),
          canceled_at: ensureNullableString(data?.canceled_at),
          started_at: ensureDateString(data?.started_at),
          ends_at: ensureNullableString(data?.ends_at),
          ended_at: ensureNullableString(data?.ended_at),
          customer_id: ensureString(data?.customer_id ?? ""),
          product_id: ensureString(data?.product_id ?? ""),
          discount_id: ensureNullableString(data?.discount_id),
          checkout_id: ensureNullableString(data?.checkout_id),
          customer_cancellation_reason: ensureNullableString(data?.customer_cancellation_reason),
          customer_cancellation_comment: ensureNullableString(data?.customer_cancellation_comment),
          prices: Array.isArray(data?.prices)
               ? data.prices.map((price: unknown) => stringifyOrEmptyObject(price))
               : [],
          meters: Array.isArray(data?.meters)
               ? data.meters.map((meter: unknown) => stringifyOrEmptyObject(meter))
               : [],
          seats: typeof data?.seats === "number" ? data.seats : 0,
          custom_field_data: customFieldData,
     };
}

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
          subscriptionPlanId: meta?.subscriptionPlanId ?? meta?.subscription_id ?? null,
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
     polarOrderId?: string | null;
}): Promise<{ client_id: string; subscription_id: string } | null> {

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
               .select("client_id, subscription_id")
               .eq("subscription_id", ids.polarSubscriptionId)
               .maybeSingle<{ client_id: string; subscription_id: string }>();

          if (data?.client_id && data?.subscription_id) return data;
     }

     if (ids.polarOrderId) {
          const { data } = await supabase
               .from("tblClient_Subscription")
               .select("client_id, subscription_id")
               .eq("order_id", ids.polarOrderId)
               .maybeSingle<{ client_id: string; subscription_id: string }>();

          if (data?.client_id && data?.subscription_id) return data;
     }

     if (ids.polarCustomerId) {
          const { data } = await supabase
               .from("tblClient_Subscription")
               .select("client_id, subscription_id")
               .eq("customer_id", ids.polarCustomerId)
               .maybeSingle<{ client_id: string; subscription_id: string }>();

          if (data?.client_id && data?.subscription_id) return data;
     }

     return null;
}

type ClientSubscriptionPatch = Partial<PolarSubscription> & Record<string, unknown>;

async function patchClientSubscription(clientId: string, patch: ClientSubscriptionPatch): Promise<{ success: boolean, error?: string }> {
     const update: Record<string, unknown> = { updated_at: nowIso() };

     for (const [k, v] of Object.entries(patch)) {
          if (v !== undefined) update[k] = v;
     }
     console.log('Trying to patch client subscription', { clientId, update });

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
     subscription_id: string;
     renewal_period: "monthly" | "annually";
     status: string;
}) {
     const { error } = await supabase
          .from("tblClient_Subscription")
          .upsert({
               client_id: clientId,
               subscription_id: base.subscription_id,
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
     webhookSecret: process.env.WEBHOOK_SECRET_SANDBOX!,
     onPayload: async (payload: any) => {
          const t0 = Date.now();

          const eventType = (payload as any)?.type ?? "";
          const t = String(eventType).toLowerCase();
          const data = (payload as any)?.data ?? {};

          const meta = extractMeta(data);
          const status = mapPolarToLocalStatus(eventType, data);
          const normalizedStatus = normalizeSubscriptionStatus(data?.status ?? status);
          const nextPaymentDate = extractNextPaymentDate(data);
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
          // Resolve clientId + subscriptionPlanId for events that need them
          // -------------------------------------------------------------------------
          let clientId = meta.clientId;
          let subscriptionPlanId = meta.subscriptionPlanId;
          const renewalPeriod: RenewalPeriod = meta.renewalPeriod ?? "monthly";

          const polarCustomerId: string | null =
               data?.customer_id ?? data?.customerId ?? (t.startsWith("customer.") ? data?.id : null) ?? null;
          const polarSubscriptionId: string | null = data?.subscription_id ?? data?.subscriptionId ?? null;
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
                         polarOrderId,
                    });

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

                    clientId = resolved.client_id;
                    subscriptionPlanId = resolved.subscription_id;
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
          // Event: CUSTOMER UPDATED (patch only customer_id)
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
                    // Only patch customer_id. Do NOT touch apartment_count, status, etc.
                    const updated = await patchClientSubscription(resolvedClientId, {
                         customer_id: polarCustomerId!,
                         customer: stringifyOrEmptyObject(data),
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
                         action: "Store Webhook - customer.updated patched customer_id",
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
                         subscription_id: subscriptionPlanId!,
                         renewal_period: renewalPeriod,
                         status: normalizedStatus,
                    });
                    const apartmentsCount = await getApartmentCountForClient(clientId!);
                    const subscriptionSnapshot = buildSubscriptionSnapshot({
                         clientId: clientId!,
                         subscriptionPlanId: subscriptionPlanId!,
                         apartmentsCount,
                         data,
                         statusOverride: normalizedStatus,
                    });

                    const buildPatch = (overrides: Record<string, unknown> = {}) => ({
                         ...subscriptionSnapshot,
                         renewal_period: renewalPeriod,
                         next_payment_date: nextPaymentDate ?? null,
                         ...overrides,
                    });

                    // subscription.active
                    if (t.includes("subscription.active")) {
                         await patchClientSubscription(clientId!, buildPatch({
                              is_auto_renew: true,
                              expired: false,
                         }));

                         revalidatePath("/profile");
                         return;
                    }

                    // subscription.canceled (cancel at period end / canceled)
                    if (t.includes("subscription.canceled")) {
                         await patchClientSubscription(clientId!, buildPatch({
                              is_auto_renew: false,
                              expired: false,
                         }));

                         revalidatePath("/profile");
                         return;
                    }

                    // subscription.uncanceled
                    if (t.includes("subscription.uncanceled")) {
                         await patchClientSubscription(clientId!, buildPatch({
                              is_auto_renew: true,
                              expired: false,
                         }));

                         revalidatePath("/profile");
                         return;
                    }

                    // subscription.revoked (immediate)
                    if (t.includes("subscription.revoked")) {
                         await patchClientSubscription(clientId!, buildPatch({
                              is_auto_renew: false,
                              expired: true,
                         }));

                         revalidatePath("/profile");
                         return;
                    }

                    // subscription.past_due
                    if (t.includes("subscription.past_due")) {
                         await patchClientSubscription(clientId!, buildPatch({
                              is_auto_renew: true,
                              expired: false,
                         }));

                         revalidatePath("/profile");
                         return;
                    }

                    // subscription.created
                    if (t.includes("subscription.created")) {
                         await patchClientSubscription(clientId!, buildPatch({
                              is_auto_renew: true,
                              expired: false,
                         }));

                         revalidatePath("/profile");
                         return;
                    }

                    // subscription.updated
                    if (t.includes("subscription.updated")) {
                         await patchClientSubscription(clientId!, buildPatch({
                              is_auto_renew: true,
                              expired: false,
                         }));

                         revalidatePath("/profile");
                         return;
                    }
               }

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
