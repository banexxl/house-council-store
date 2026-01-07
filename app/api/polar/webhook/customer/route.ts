// app/api/polar/webhook/customer/route.ts
import { logServerAction } from "@/app/lib/server-logging";
import { Webhooks } from "@polar-sh/nextjs";
import { convertToSnakeCase, resolveClientIdByEmail, patchClientSubscription, revalidateProfile } from "../webhook-utils";

export const runtime = "nodejs";

// ---------------------------------------------------------------------------
// Customer Webhook Handler
// ---------------------------------------------------------------------------

export const POST = Webhooks({
     webhookSecret: process.env.POLAR_WEBHOOK_SECRET_SANDBOX_CUSTOMER!,

     onCustomerCreated: async (payload) => {
          const t0 = Date.now();
          console.log('Customer created webhook received:', payload);

          await logServerAction({
               user_id: null,
               action: "Store Webhook - customer.created received",
               payload: { customerId: payload.data.id },
               status: "success",
               error: "",
               duration_ms: Date.now() - t0,
               type: "internal",
          });
     },

     onCustomerUpdated: async (payload) => {
          const t0 = Date.now();
          console.log('Customer updated webhook received:', payload);

          const customerData = convertToSnakeCase(payload.data);
          const polarCustomerId = customerData.id;

          // Type narrowing: check if data has email property
          if ('email' in customerData && typeof customerData.email === 'string') {
               const email = customerData.email;
               const resolvedClientId = await resolveClientIdByEmail(email);

               if (!resolvedClientId) {
                    await logServerAction({
                         user_id: null,
                         action: "Store Webhook - customer.updated could not resolve client by email",
                         payload: { email, polarCustomerId },
                         status: "fail",
                         error: "No client found for email",
                         duration_ms: Date.now() - t0,
                         type: "internal",
                    });
                    return;
               }

               try {
                    await patchClientSubscription(resolvedClientId, {
                         customer_id: polarCustomerId,
                    }, "customer.updated");

                    revalidateProfile();

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
                    const err = e instanceof Error ? e : new Error(e?.message ?? "unknown error");
                    await logServerAction({
                         user_id: null,
                         action: "Store Webhook - customer.updated patch failed",
                         payload: { polarCustomerId },
                         status: "fail",
                         error: err.message,
                         duration_ms: Date.now() - t0,
                         type: "internal",
                    });
                    throw err;
               }
          }
     },

     onCustomerDeleted: async (payload) => {
          const t0 = Date.now();
          console.log('Customer deleted webhook received:', payload);

          await logServerAction({
               user_id: null,
               action: "Store Webhook - customer.deleted received",
               payload: { customerId: payload.data.id },
               status: "success",
               error: "",
               duration_ms: Date.now() - t0,
               type: "internal",
          });
     },

     onCustomerStateChanged: async (payload) => {
          const t0 = Date.now();
          console.log('Customer state changed webhook received:', payload);

          await logServerAction({
               user_id: null,
               action: "Store Webhook - customer.state_changed received",
               payload: { customerId: payload.data.id },
               status: "success",
               error: "",
               duration_ms: Date.now() - t0,
               type: "internal",
          });
     },
});
