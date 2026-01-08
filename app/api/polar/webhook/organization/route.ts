// app/api/polar/webhook/organization/route.ts
import { logServerAction } from "@/app/lib/server-logging";
import { Webhooks } from "@polar-sh/nextjs";
import { convertToSnakeCase, supabase } from "../webhook-utils";

export const runtime = "nodejs";

// ---------------------------------------------------------------------------
// Organization Webhook Handler
// ---------------------------------------------------------------------------

export const POST = Webhooks({
     webhookSecret: process.env.POLAR_WEBHOOK_SECRET_SANDBOX_ORGANIZATION!,

     onOrganizationUpdated: async (payload) => {
          const t0 = Date.now();
          console.log('Organization updated webhook received:', payload);

          try {
               const organizationData = convertToSnakeCase(payload.data);

               // Upsert organization data to database
               const { error: upsertError } = await supabase
                    .from("tblPolarOrganization")
                    .upsert(organizationData, { onConflict: "id" });

               if (upsertError) throw upsertError;

               await logServerAction({
                    user_id: null,
                    action: "Store Webhook - organization.updated received",
                    payload: {
                         organizationId: organizationData.id,
                         name: organizationData.name,
                         slug: organizationData.slug,
                         status: organizationData.status
                    },
                    status: "success",
                    error: "",
                    duration_ms: Date.now() - t0,
                    type: "internal",
               });
          } catch (e: any) {
               const err = e instanceof Error ? e : new Error(e?.message ?? "unknown error");
               await logServerAction({
                    user_id: null,
                    action: "Store Webhook - organization.updated failed",
                    payload: { type: payload.type },
                    status: "fail",
                    error: err.message,
                    duration_ms: Date.now() - t0,
                    type: "internal",
               });
               throw err;
          }
     },
});
