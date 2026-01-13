// app/api/polar/webhook/route.ts
import { Webhooks } from "@polar-sh/nextjs";
import { createClient } from "@supabase/supabase-js";
import { logServerAction } from "@/app/lib/server-logging";
import { PolarCustomer } from "@/app/types/polar-customer-types";

export const runtime = "nodejs";

const supabase = createClient(
     process.env.NEXT_PUBLIC_SUPABASE_URL!,
     process.env.SB_SERVICE_KEY!
);

function mapCustomerToRow(c: PolarCustomer) {
     return {
          id: c.id!,
          email: c.email!,
          externalId: c.metadata?.userId ? String(c.metadata.userId) : null,
          name: c.name!,
          emailVerified: c.emailVerified ?? false,
          organizationId: c.organizationId ?? null,
          avatarUrl: c.avatarUrl ?? null,
          billingAddress: c.billingAddress ?? null,
          taxId: c.taxId ?? [],
          metadata: c.metadata ?? {},
          deletedAt: c.deletedAt ?? null,
          createdAt: c.createdAt ?? null,
          modifiedAt: c.modifiedAt ?? null,
     };
}

export const POST = Webhooks({
     webhookSecret: process.env.POLAR_WEBHOOK_SECRET_SANDBOX_CUSTOMER!,

     // ---------------------------
     // customer.created
     // ---------------------------
     onCustomerCreated: async (payload) => {
          const t0 = Date.now();
          const customer = payload.data;
          console.log('On customer created payload data: ', payload);

          if (!customer.metadata?.userId) {
               await logServerAction({
                    user_id: null,
                    action: "customer.created - skipped (missing userId in metadata)",
                    payload,
                    status: "success",
                    error: "Missing userId in metadata",
                    duration_ms: Date.now() - t0,
                    type: "webhook",
               });
               return;
          }

          // Check if user exists in auth.users table
          const { data: userExists } = await supabase.auth.admin.getUserById(String(customer.externalId));

          if (!userExists.user) {
               await logServerAction({
                    user_id: String(customer.externalId),
                    action: "customer.created - skipped (user not found in auth.users)",
                    payload: { userId: customer.externalId, email: customer.email },
                    status: "fail",
                    error: "User ID not found in auth.users table",
                    duration_ms: Date.now() - t0,
                    type: "webhook",
               });
               return;
          }

          const row = mapCustomerToRow(customer);

          const { data, error } = await supabase
               .from("tblPolarCustomers")
               .upsert(row, { onConflict: "email" })
               .select()
               .single();

          await logServerAction({
               user_id: customer.externalId,
               action: "customer.created - upsert tblPolarCustomers",
               payload: row,
               status: error ? "fail" : "success",
               error: error?.message || "",
               duration_ms: Date.now() - t0,
               type: "webhook",
          });

          if (error) throw error;
          return data;
     },

     // ---------------------------
     // customer.updated
     // ---------------------------
     onCustomerUpdated: async (payload) => {
          const t0 = Date.now();
          const customer = payload.data;
          console.log('On customer updated payload data: ', payload);
          // If userId is missing, avoid insert risk (userId NOT NULL) -> update-only.
          if (!customer.externalId) {
               const patch = {
                    email: customer.email,
                    name: customer.name,
                    emailVerified: customer.emailVerified ?? false,
                    organizationId: customer.organizationId ?? null,
                    avatarUrl: customer.avatarUrl ?? null,
                    billingAddress: customer.billingAddress ?? null,
                    taxId: customer.taxId ?? [],
                    metadata: customer.metadata ?? {},
                    deletedAt: customer.deletedAt ?? null,
                    createdAt: customer.createdAt ?? null,
                    modifiedAt: customer.modifiedAt ?? null,
               };

               const { data, error } = await supabase
                    .from("tblPolarCustomers")
                    .update(patch)
                    .eq("id", customer.id)
                    .select()
                    .maybeSingle();

               await logServerAction({
                    user_id: customer.externalId ? String(customer.externalId) : null,
                    action: "customer.updated - update-only (missing userId in metadata)",
                    payload: { id: customer.id, patch },
                    status: error ? "fail" : "success",
                    error: error?.message || "",
                    duration_ms: Date.now() - t0,
                    type: "webhook",
               });

               if (error) throw error;
               return data;
          }

          const row = mapCustomerToRow(customer);

          const { data, error } = await supabase
               .from("tblPolarCustomers")
               .upsert(row, { onConflict: "id" })
               .select()
               .single();

          await logServerAction({
               user_id: customer.externalId ? String(customer.externalId) : null,
               action: "customer.updated - upsert tblPolarCustomers",
               payload: row,
               status: error ? "fail" : "success",
               error: error?.message || "",
               duration_ms: Date.now() - t0,
               type: "webhook",
          });

          if (error) throw error;
          return data;
     },

     // ---------------------------
     // customer.deleted
     // ---------------------------
     onCustomerDeleted: async (payload) => {
          const t0 = Date.now();
          const customer = payload.data;
          console.log('On customer deleted payload data: ', payload);
          await logServerAction({
               user_id: customer.externalId ? String(customer.externalId) : null,
               action: "customer.deleted - Just log, delete will be done directly from app",
               payload: { id: customer.id },
               status: "success",
               error: "",
               duration_ms: Date.now() - t0,
               type: "webhook",
          });
     },

     // ---------------------------
     // customer.state_changed
     // ---------------------------
     onCustomerStateChanged: async (payload) => {
          const t0 = Date.now();
          const customer = payload.data;
          console.log('On customer state_changed payload data: ', payload);
          // Store a snapshot in metadata (safe even if event fields evolve)
          const patch = {
               modifiedAt: customer.modifiedAt ?? new Date().toISOString(),
               metadata: {
                    ...(customer.metadata ?? {}),
                    last_state_changed_at: new Date().toISOString(),
                    last_state_changed_customer: customer,
               },
          };

          const { data, error } = await supabase
               .from("tblPolarCustomers")
               .update(patch)
               .eq("id", customer.id)
               .select()
               .maybeSingle();

          await logServerAction({
               user_id: customer.externalId ? String(customer.externalId) : null,
               action: "customer.state_changed - snapshot in metadata",
               payload: { id: customer.id, patch },
               status: error ? "fail" : "success",
               error: error?.message || "",
               duration_ms: Date.now() - t0,
               type: "webhook",
          });

          if (error) throw error;
          return data;
     },
});
