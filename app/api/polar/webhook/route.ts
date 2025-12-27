import { Webhooks } from "@polar-sh/nextjs";

// IMPORTANT: implement your DB updates inside onPayload
export const POST = Webhooks({
     webhookSecret: process.env.POLAR_WEBHOOK_SECRET!,
     onPayload: async (payload) => {
          // payload.type will tell you what happened
          // Example: mark payment succeeded, update subscription status, etc.

          // You will typically:
          // 1) read payload.data.metadata.clientId + subscriptionPlanId
          // 2) upsert subscription/payment records in Supabase/DB
          // 3) store order id / invoice url if available
     },
});
