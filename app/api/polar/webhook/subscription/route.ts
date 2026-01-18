// app/api/polar/webhook/subscription/route.ts
import { logServerAction } from "@/app/lib/server-logging";
import { getApartmentCountForCustomer } from "@/app/profile/subscription-plan-actions";
import { PolarSubscription } from "@/app/types/polar-subscription-types";
import { Webhooks } from "@polar-sh/nextjs";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

// ✅ Webhooks should use SERVICE ROLE (bypasses RLS)
const supabase = createClient(
     process.env.NEXT_PUBLIC_SUPABASE_URL!,
     process.env.SB_SERVICE_KEY!
);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function convertToPolarSubscription(subscription: PolarSubscription): Promise<PolarSubscription> {
     // Get apartment count for customer
     const apartmentCount = await getApartmentCountForCustomer(subscription.customerId ?? subscription.customerId);

     return {
          id: subscription.id,
          orderId: subscription.orderId ?? subscription.orderId ?? null,
          createdAt: subscription.createdAt ? new Date(subscription.createdAt) : null,
          modifiedAt: subscription.modifiedAt ? new Date(subscription.modifiedAt) : null,
          metadata: subscription.metadata ?? subscription.metadata ?? {},
          amount: Number(subscription.amount * apartmentCount),
          currency: subscription.currency,
          recurringInterval: subscription.recurringInterval ?? subscription.recurringInterval,
          recurringIntervalCount: subscription.recurringIntervalCount ?? subscription.recurringIntervalCount,
          status: subscription.status,
          currentPeriodStart: subscription.currentPeriodStart ? new Date(subscription.currentPeriodStart) : null,
          currentPeriodEnd: subscription.currentPeriodEnd ? new Date(subscription.currentPeriodEnd) : null,
          trialStart: subscription.trialStart ? new Date(subscription.trialStart) : null,
          trialEnd: subscription.trialEnd ? new Date(subscription.trialEnd) : null,
          cancelAtPeriodEnd: subscription.cancelAtPeriodEnd ?? subscription.cancelAtPeriodEnd ?? false,
          canceledAt: subscription.canceledAt ? new Date(subscription.canceledAt) : null,
          startedAt: subscription.startedAt ? new Date(subscription.startedAt) : null,
          endsAt: subscription.endsAt ? new Date(subscription.endsAt) : null,
          endedAt: subscription.endedAt ? new Date(subscription.endedAt) : null,
          customerId: subscription.customerId ?? subscription.customerId,
          productId: subscription.productId ?? subscription.productId,
          product: subscription.product,
          discountId: subscription.discountId ?? subscription.discountId ?? null,
          discount: subscription.discount ?? null,
          checkoutId: subscription.checkoutId ?? subscription.checkoutId ?? null,
          customerCancellationReason: subscription.customerCancellationReason ?? subscription.customerCancellationReason ?? null,
          customerCancellationComment: subscription.customerCancellationComment ?? subscription.customerCancellationComment ?? null,
          prices: subscription.prices || [],
          meters: subscription.meters || [],
          seats: apartmentCount || 0,
          customFieldData: subscription.customFieldData ?? subscription.customFieldData ?? {},
     };
}

async function upsertSubscription(subscription: any, eventType: string) {
     const t0 = Date.now();

     // Convert to PolarSubscription type with apartment count in metadata
     const polarSubscription = await convertToPolarSubscription(subscription);

     // Map to database row structure
     const row = {
          id: polarSubscription.id,
          orderId: polarSubscription.orderId ?? null,
          checkoutId: polarSubscription.checkoutId ?? null,
          customerId: polarSubscription.customerId,
          productId: polarSubscription.productId ?? null,
          discountId: polarSubscription.discountId ?? null,
          createdAt: polarSubscription.createdAt ?? null,
          modifiedAt: polarSubscription.modifiedAt ?? null,
          metadata: polarSubscription.metadata ?? {},
          amount: polarSubscription.amount ?? null,
          currency: polarSubscription.currency ?? null,
          recurringInterval: polarSubscription.recurringInterval ?? null,
          recurringIntervalCount: polarSubscription.recurringIntervalCount ?? null,
          status: polarSubscription.status ?? null,
          currentPeriodStart: polarSubscription.currentPeriodStart ?? null,
          currentPeriodEnd: polarSubscription.currentPeriodEnd ?? null,
          trialStart: polarSubscription.trialStart ?? null,
          trialEnd: polarSubscription.trialEnd ?? null,
          cancelAtPeriodEnd: polarSubscription.cancelAtPeriodEnd ?? null,
          canceledAt: polarSubscription.canceledAt ?? null,
          startedAt: polarSubscription.startedAt ?? null,
          endsAt: polarSubscription.endsAt ?? null,
          endedAt: polarSubscription.endedAt ?? null,
          customerCancellationReason: polarSubscription.customerCancellationReason ?? null,
          customerCancellationComment: polarSubscription.customerCancellationComment ?? null,
          prices: polarSubscription.prices ?? null,
          meters: polarSubscription.meters ?? null,
          seats: polarSubscription.seats ?? null,
          customFieldData: polarSubscription.customFieldData ?? null,
     };

     // ✅ Handle unique constraint on customerId by deleting old subscriptions first
     // Check if a subscription with different ID exists for this customer
     const { data: existingSubscriptions } = await supabase
          .from("tblPolarSubscriptions")
          .select("id")
          .eq("customerId", polarSubscription.customerId)
          .neq("id", polarSubscription.id);

     // Delete old subscriptions for this customer if they exist
     if (existingSubscriptions && existingSubscriptions.length > 0) {
          const oldIds = existingSubscriptions.map(sub => sub.id);
          await supabase
               .from("tblPolarSubscriptions")
               .delete()
               .in("id", oldIds);

          console.log(`Deleted ${oldIds.length} old subscription(s) for customer ${polarSubscription.customerId}`);
     }

     // ✅ Use subscriptionId as conflict target (external id)
     const { data, error } = await supabase
          .from("tblPolarSubscriptions")
          .upsert(row, { onConflict: "id" })
          .select()
          .single();

     await logServerAction({
          user_id: polarSubscription.customerId,
          action: `${eventType} - Upsert Subscription`,
          payload: row,
          status: error ? "fail" : "success",
          error: error?.message || "",
          duration_ms: Date.now() - t0,
          type: "webhook",
     });

     if (error) {
          console.error(`Error upserting subscription for ${eventType}:`, error);
          throw error;
     }

     return data;
}

// ---------------------------------------------------------------------------
// Webhook Handler (all payload types separately)
// ---------------------------------------------------------------------------

export const POST = Webhooks({
     webhookSecret: process.env.POLAR_WEBHOOK_SECRET_SANDBOX_SUBSCRIPTION!,

     onSubscriptionCreated: async (payload) => {
          const eventType = "subscription.created";
          const subscription = payload.data;

          console.log(`${eventType} webhook received`, {
               id: subscription.id,
               customerId: subscription.customerId,
               status: subscription.status,
          });

          await upsertSubscription(subscription, eventType);
     },

     onSubscriptionUpdated: async (payload) => {
          const eventType = "subscription.updated";
          const subscription = payload.data;

          console.log(`${eventType} webhook received`, {
               id: subscription.id,
               customerId: subscription.customerId,
               status: subscription.status,
          });

          await upsertSubscription(subscription, eventType);
     },

     onSubscriptionActive: async (payload) => {
          const eventType = "subscription.active";
          const subscription = payload.data;

          console.log(`${eventType} webhook received`, {
               id: subscription.id,
               customerId: subscription.customerId,
               status: subscription.status,
          });

          // Active is just a state; upsert the snapshot
          await upsertSubscription(subscription, eventType);
     },

     onSubscriptionCanceled: async (payload) => {
          const eventType = "subscription.canceled";
          const subscription = payload.data;

          console.log(`${eventType} webhook received`, {
               id: subscription.id,
               customerId: subscription.customerId,
               status: subscription.status,
               cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
          });

          await upsertSubscription(subscription, eventType);
     },

     onSubscriptionRevoked: async (payload) => {
          const eventType = "subscription.revoked"
          const subscription = payload.data;

          console.log(`${eventType} webhook received`, {
               id: subscription.id,
               customerId: subscription.customerId,
               status: subscription.status,
               cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
          });

          await upsertSubscription(subscription, eventType);
     },
});
