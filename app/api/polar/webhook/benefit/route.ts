// app/api/polar/webhook/benefit/route.ts
import { logServerAction } from "@/app/lib/server-logging";
import { Webhooks } from "@polar-sh/nextjs";
import { convertToSnakeCase } from "../webhook-utils";

export const runtime = "nodejs";

// ---------------------------------------------------------------------------
// Benefit Webhook Handler
// ---------------------------------------------------------------------------

export const POST = Webhooks({
     webhookSecret: process.env.POLAR_WEBHOOK_SECRET_SANDBOX_BENEFIT!,

     onBenefitCreated: async (payload) => {
          const t0 = Date.now();
          console.log('Benefit created webhook received:', payload);

          const benefitData = convertToSnakeCase(payload.data);

          await logServerAction({
               user_id: null,
               action: "Store Webhook - benefit.created received",
               payload: { benefitId: benefitData.id },
               status: "success",
               error: "",
               duration_ms: Date.now() - t0,
               type: "internal",
          });
     },

     onBenefitUpdated: async (payload) => {
          const t0 = Date.now();
          console.log('Benefit updated webhook received:', payload);

          const benefitData = convertToSnakeCase(payload.data);

          await logServerAction({
               user_id: null,
               action: "Store Webhook - benefit.updated received",
               payload: { benefitId: benefitData.id },
               status: "success",
               error: "",
               duration_ms: Date.now() - t0,
               type: "internal",
          });
     },

     onBenefitGrantCreated: async (payload) => {
          const t0 = Date.now();
          console.log('Benefit grant created webhook received:', payload);

          const benefitGrantData = convertToSnakeCase(payload.data);

          await logServerAction({
               user_id: null,
               action: "Store Webhook - benefit_grant.created received",
               payload: { benefitGrantId: benefitGrantData.id },
               status: "success",
               error: "",
               duration_ms: Date.now() - t0,
               type: "internal",
          });
     },

     onBenefitGrantUpdated: async (payload) => {
          const t0 = Date.now();
          console.log('Benefit grant updated webhook received:', payload);

          const benefitGrantData = convertToSnakeCase(payload.data);

          await logServerAction({
               user_id: null,
               action: "Store Webhook - benefit_grant.updated received",
               payload: { benefitGrantId: benefitGrantData.id },
               status: "success",
               error: "",
               duration_ms: Date.now() - t0,
               type: "internal",
          });
     },

     onBenefitGrantRevoked: async (payload) => {
          const t0 = Date.now();
          console.log('Benefit grant revoked webhook received:', payload);

          const benefitGrantData = convertToSnakeCase(payload.data);

          await logServerAction({
               user_id: null,
               action: "Store Webhook - benefit_grant.revoked received",
               payload: { benefitGrantId: benefitGrantData.id },
               status: "success",
               error: "",
               duration_ms: Date.now() - t0,
               type: "internal",
          });
     },
});
