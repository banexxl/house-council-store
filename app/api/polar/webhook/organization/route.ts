// app/api/polar/webhook/organization/route.ts
import { logServerAction } from "@/app/lib/server-logging";
import { Webhooks } from "@polar-sh/nextjs";

export const runtime = "nodejs";

// ---------------------------------------------------------------------------
// Organization Webhook Handler
// ---------------------------------------------------------------------------

export const POST = Webhooks({
     webhookSecret: process.env.POLAR_WEBHOOK_SECRET_SANDBOX!,

     onOrganizationUpdated: async (payload) => {
          const t0 = Date.now();
          console.log('Organization updated webhook received:', payload);

          await logServerAction({
               user_id: null,
               action: "Store Webhook - organization.updated received",
               payload: { organizationId: payload.data.id },
               status: "success",
               error: "",
               duration_ms: Date.now() - t0,
               type: "internal",
          });
     },
});
