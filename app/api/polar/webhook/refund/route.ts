// app/api/polar/webhook/refund/route.ts
import { logServerAction } from "@/app/lib/server-logging";
import { Webhooks } from "@polar-sh/nextjs";

export const runtime = "nodejs";

// ---------------------------------------------------------------------------
// Refund Webhook Handler (To be implemented)
// ---------------------------------------------------------------------------

export const POST = Webhooks({
     webhookSecret: process.env.POLAR_WEBHOOK_SECRET_SANDBOX!,

     // TODO: Implement refund webhook handlers
     // onRefundCreated: async (payload) => { ... },
});
