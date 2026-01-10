// app/api/polar/webhook/subscription/route.ts
import { logServerAction } from "@/app/lib/server-logging";
import { getApartmentCountForCustomer } from "@/app/profile/subscription-plan-actions";
import { Webhooks } from "@polar-sh/nextjs";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

const supabase = createClient(
     process.env.NEXT_PUBLIC_SUPABASE_URL!,
     process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// ---------------------------------------------------------------------------
// Helper Functions
// ---------------------------------------------------------------------------

async function upsertSubscription(subscription: any, eventType: string) {
     const t0 = Date.now();
     const apartmentCount = await getApartmentCountForCustomer(subscription.customerId);

     const subscriptionData = {
          id: subscription.id,
          orderId: subscription.orderId || null,
          createdAt: subscription.createdAt,
          modifiedAt: subscription.modifiedAt,
          apartmentCount: apartmentCount,
          metadata: subscription.metadata,
          amount: subscription.amount,
          currency: subscription.currency,
          recurringInterval: subscription.recurringInterval,
          recurringIntervalCount: subscription.recurringIntervalCount,
          status: subscription.status,
          currentPeriodStart: subscription.currentPeriodStart,
          currentPeriodEnd: subscription.currentPeriodEnd,
          trialStart: subscription.trialStart,
          trialEnd: subscription.trialEnd,
          cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
          canceledAt: subscription.canceledAt,
          startedAt: subscription.startedAt,
          endsAt: subscription.endsAt,
          endedAt: subscription.endedAt,
          customerId: subscription.customerId,
          productId: subscription.productId,
          discountId: subscription.discountId,
          checkoutId: subscription.checkoutId,
          customerCancellationReason: subscription.customerCancellationReason,
          customerCancellationComment: subscription.customerCancellationComment,
          prices: subscription.prices,
          meters: subscription.meters,
          seats: subscription.seats,
          customFieldData: subscription.customFieldData,
     };

     const { data, error } = await supabase
          .from("tblPolarSubscriptions")
          .upsert(subscriptionData, { onConflict: "id" })
          .select()
          .single();

     const duration = Date.now() - t0;

     await logServerAction({
          user_id: subscription.customerId,
          action: `${eventType} - Upsert Subscription`,
          payload: subscriptionData,
          status: error ? "fail" : "success",
          error: error?.message || "",
          duration_ms: duration,
          type: "webhook",
     });

     if (error) {
          console.error(`Error upserting subscription for ${eventType}:`, error);
          throw error;
     }

     return data;
}

// ---------------------------------------------------------------------------
// Subscription Webhook Handler
// ---------------------------------------------------------------------------

export const POST = Webhooks({
     webhookSecret: process.env.POLAR_WEBHOOK_SECRET_SANDBOX_SUBSCRIPTION!,

     onSubscriptionCreated: async (payload) => {
          const eventType = "subscription.created";
          console.log(`${eventType} webhook received:`, payload);

          try {
               const subscription = payload.data;
               await upsertSubscription(subscription, eventType);
               console.log(`${eventType} processed successfully for subscription:`, subscription.id);
          } catch (error) {
               console.error(`Error processing ${eventType}:`, error);
               throw error;
          }
     },

     onSubscriptionUpdated: async (payload) => {
          const eventType = "subscription.updated";
          console.log(`${eventType} webhook received:`, payload);

          try {
               const subscription = payload.data;
               await upsertSubscription(subscription, eventType);
               console.log(`${eventType} processed successfully for subscription:`, subscription.id);
          } catch (error) {
               console.error(`Error processing ${eventType}:`, error);
               throw error;
          }
     },

     onSubscriptionActive: async (payload) => {
          const eventType = "subscription.active";
          console.log(`${eventType} webhook received:`, payload);

          try {
               const subscription = payload.data;
               await upsertSubscription(subscription, eventType);
               console.log(`${eventType} processed successfully for subscription:`, subscription.id);
          } catch (error) {
               console.error(`Error processing ${eventType}:`, error);
               throw error;
          }
     },

     onSubscriptionCanceled: async (payload) => {
          const eventType = "subscription.canceled";
          console.log(`${eventType} webhook received:`, payload);

          try {
               const subscription = payload.data;
               await upsertSubscription(subscription, eventType);
               console.log(`${eventType} processed successfully for subscription:`, subscription.id);
          } catch (error) {
               console.error(`Error processing ${eventType}:`, error);
               throw error;
          }
     },

     onSubscriptionRevoked: async (payload) => {
          const eventType = "subscription.revoked";
          console.log(`${eventType} webhook received:`, payload);

          try {
               const subscription = payload.data;
               await upsertSubscription(subscription, eventType);
               console.log(`${eventType} processed successfully for subscription:`, subscription.id);
          } catch (error) {
               console.error(`Error processing ${eventType}:`, error);
               throw error;
          }
     },
});
