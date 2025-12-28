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

// --- helpers -------------------------------------------------------------

type RenewalPeriod = "monthly" | "annually";

function nowIso() {
     return new Date().toISOString();
}

function normalizeRenewalPeriod(value: any): RenewalPeriod | null {
     if (value === "monthly" || value === "annually") return value;
     // accept other spellings if they come from earlier code
     if (value === "annual" || value === "yearly") return "annually";
     return null;
}

function mapPolarToLocalStatus(eventType: string, data: any): string {
     // You can refine this once you see real event payloads.
     // Keep your existing enum values: trialing, active, canceled, paused, expired, etc.
     const t = eventType.toLowerCase();

     if (t.includes("trial") && t.includes("started")) return "trialing";
     if (t.includes("trial") && t.includes("ended")) return "active";

     if (t.includes("subscription") && t.includes("canceled")) return "canceled";
     if (t.includes("subscription") && t.includes("created")) {
          // Polar may create as trialing or active depending on product/trial config
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

     // default
     return "active";
}

function extractMeta(payloadData: any) {
     // Polar puts metadata on checkout/subscription/order depending on the event
     const meta = payloadData?.metadata ?? payloadData?.data?.metadata ?? {};
     return {
          clientId: meta?.clientId ?? meta?.client_id ?? null,
          subscriptionPlanId: meta?.subscriptionPlanId ?? meta?.subscription_plan_id ?? null,
          renewalPeriod: normalizeRenewalPeriod(meta?.renewal_period ?? meta?.billingCycle ?? meta?.billing_cycle),
          apartmentsCount: meta?.apartments_count ?? null,
     };
}

async function upsertClientSubscription(args: {
     clientId: string;
     subscriptionPlanId: string;
     renewalPeriod: RenewalPeriod | null;
     status: string;
     polarCustomerId?: string | null;
     polarSubscriptionId?: string | null;
     nextPaymentDate?: string | null;
     isAutoRenew?: boolean | null;
     expired?: boolean | null;
}) {
     const {
          clientId,
          subscriptionPlanId,
          renewalPeriod,
          status,
          polarCustomerId,
          polarSubscriptionId,
          nextPaymentDate,
          isAutoRenew,
          expired,
     } = args;

     // Read existing to avoid overwriting IDs with null
     const { data: existing } = await supabase
          .from("tblClient_Subscription")
          .select("polar_customer_id, polar_subscription_id, created_at")
          .eq("client_id", clientId)
          .maybeSingle();

     const finalPolarCustomerId = polarCustomerId ?? existing?.polar_customer_id ?? null;
     const finalPolarSubscriptionId = polarSubscriptionId ?? existing?.polar_subscription_id ?? null;

     const { error } = await supabase
          .from("tblClient_Subscription")
          .upsert(
               {
                    client_id: clientId,
                    subscription_plan_id: subscriptionPlanId,
                    renewal_period: renewalPeriod ?? "monthly",
                    status,
                    updated_at: nowIso(),
                    created_at: existing?.created_at ?? nowIso(),
                    polar_customer_id: finalPolarCustomerId,
                    polar_subscription_id: finalPolarSubscriptionId,
                    next_payment_date: nextPaymentDate ?? null,
                    is_auto_renew: isAutoRenew ?? true,
                    expired: expired ?? false,
               },
               { onConflict: "client_id" } // requires UNIQUE(client_id)
          );

     if (error) {
          await logServerAction({
               user_id: null,
               action: 'Upsert Client Subscription Failed',
               payload: { clientId, subscriptionPlanId, renewalPeriod, status },
               status: 'fail',
               error: error.message,
               duration_ms: 0,
               type: 'internal',
          })
     }

     if (error) throw error;
}

// --- webhook handler ------------------------------------------------------

export const POST = Webhooks({
     webhookSecret: process.env.NODE_ENV === "development" ? process.env.POLAR_WEBHOOK_SECRET_SANDBOX! : process.env.POLAR_WEBHOOK_SECRET!,
     onPayload: async (payload) => {
          const eventType = (payload as any)?.type ?? "";
          const data = (payload as any)?.data ?? {};

          // Extract IDs and metadata (shape varies by event)
          const meta = extractMeta(data);

          // Some events may have customer/subscription nested differently
          const polarCustomerId =
               data?.customer?.id ??
               data?.customer_id ??
               data?.customerId ??
               null;

          const polarSubscriptionId =
               data?.subscription?.id ??
               data?.subscription_id ??
               data?.subscriptionId ??
               data?.id ?? // if the event data itself *is* the subscription
               null;

          // Period end / next billing date commonly present on subscription objects
          const nextPaymentDate =
               data?.current_period_end ??
               data?.current_period_end_at ??
               data?.next_billing_at ??
               data?.next_payment_date ??
               null;

          // Map to your local status enum
          const status = mapPolarToLocalStatus(eventType, data);

          // Handle only events you care about for now:
          const t = eventType.toLowerCase();
          console.log('Polar webhook event received:', eventType, 'for client:', meta.clientId);
          // CHECKOUT COMPLETED
          if (t.includes("checkout") && t.includes("completed")) {
               if (!meta.clientId || !meta.subscriptionPlanId) return;

               await upsertClientSubscription({
                    clientId: meta.clientId,
                    subscriptionPlanId: meta.subscriptionPlanId,
                    renewalPeriod: meta.renewalPeriod,
                    status, // likely trialing/active depending on your Polar trial config
                    polarCustomerId,
                    polarSubscriptionId,
                    nextPaymentDate,
                    isAutoRenew: true,
                    expired: false,
               });
               return;
          }

          // SUBSCRIPTION CREATED / UPDATED / CANCELED
          if (t.includes("subscription") && (t.includes("created") || t.includes("updated") || t.includes("canceled"))) {
               if (!meta.clientId || !meta.subscriptionPlanId) return;

               const isCanceled = t.includes("canceled");
               await upsertClientSubscription({
                    clientId: meta.clientId,
                    subscriptionPlanId: meta.subscriptionPlanId,
                    renewalPeriod: meta.renewalPeriod,
                    status: isCanceled ? "canceled" : status,
                    polarCustomerId,
                    polarSubscriptionId,
                    nextPaymentDate,
                    isAutoRenew: !isCanceled,
                    expired: false, // you may flip to true when period truly ends
               });
               return;
          }

          // TRIAL STARTED / ENDED
          if (t.includes("trial") && (t.includes("started") || t.includes("ended"))) {
               if (!meta.clientId || !meta.subscriptionPlanId) return;

               await upsertClientSubscription({
                    clientId: meta.clientId,
                    subscriptionPlanId: meta.subscriptionPlanId,
                    renewalPeriod: meta.renewalPeriod,
                    status,
                    polarCustomerId,
                    polarSubscriptionId,
                    nextPaymentDate,
                    isAutoRenew: true,
                    expired: false,
               });
               return;
          }

          // PAYMENT SUCCEEDED / FAILED
          if (t.includes("payment") && (t.includes("succeeded") || t.includes("failed"))) {
               if (!meta.clientId || !meta.subscriptionPlanId) return;

               await upsertClientSubscription({
                    clientId: meta.clientId,
                    subscriptionPlanId: meta.subscriptionPlanId,
                    renewalPeriod: meta.renewalPeriod,
                    status, // active or past_due
                    polarCustomerId,
                    polarSubscriptionId,
                    nextPaymentDate,
                    isAutoRenew: true,
                    expired: false,
               });
               return;
          }

          // INVOICE CREATED / FINALIZED
          if (t.includes("invoice") && (t.includes("created") || t.includes("finalized"))) {
               // Optional: if you have an invoices table, insert it here.
               // Not required for access gating.
               return;
          }

          // Default: ignore other event types
     },
});
