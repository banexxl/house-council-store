// app/api/polar/webhook/customer/route.ts
import { logServerAction } from "@/app/lib/server-logging";
import { useServerSideSupabaseAnonClient } from "@/app/lib/ss-supabase-anon-client";
import { useServerSideSupabaseServiceRoleClient } from "@/app/lib/ss-supabase-service-role-client";
import { PolarCustomer, PolarCustomerState } from "@/app/types/polar-customer-types";
import { Webhooks } from "@polar-sh/nextjs";

export const runtime = "nodejs";

// ---------------------------------------------------------------------------
// Helper Functions
// ---------------------------------------------------------------------------

function convertCustomerToPolarCustomer(customer: any): PolarCustomer {
     return {
          id: customer.id,
          createdAt: customer.createdAt instanceof Date ? customer.createdAt.toISOString() : customer.createdAt,
          modifiedAt: customer.modifiedAt instanceof Date ? customer.modifiedAt.toISOString() : customer.modifiedAt,
          metadata: customer.metadata || {},
          email: customer.email,
          emailVerified: customer.emailVerified ?? customer.email_verified ?? false,
          name: customer.name,
          billingAddress: customer.billingAddress || customer.billing_address || {
               country: "",
               line1: "",
               line2: "",
               postalCode: "",
               city: "",
               state: ""
          },
          taxId: customer.taxId || customer.tax_id || [],
          organizationId: customer.organizationId || customer.organization_id || "",
          deletedAt: customer.deletedAt instanceof Date
               ? customer.deletedAt.toISOString()
               : customer.deletedAt || null,
          avatarUrl: customer.avatarUrl || customer.avatar_url || null,
     };
}

async function upsertCustomer(customer: PolarCustomer, eventType: string) {
     const t0 = Date.now();
     const supabase = await useServerSideSupabaseAnonClient(); // ideally SERVICE ROLE in webhooks

     // Map Polar payload -> DB columns
     const row = {
          customerId: customer.id,                 // <-- Polar customer id stored here

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

     // IMPORTANT: customerId must be UNIQUE for onConflict to work.
     const { data, error } = await supabase
          .from("tblPolarCustomers")
          .upsert(row, { onConflict: "customerId" })
          .select()
          .single();

     const duration = Date.now() - t0;

     await logServerAction({
          user_id: customer.id, // (this is Polar id; if you want supabase user id, store that separately)
          action: `${eventType} - Upsert Customer`,
          payload: row,
          status: error ? "fail" : "success",
          error: error?.message || "",
          duration_ms: duration,
          type: "webhook",
     });

     if (error) {
          console.error(`Error upserting customer for ${eventType}:`, error);
          throw error;
     }

     return data;
}

// ---------------------------------------------------------------------------
// Customer Webhook Handler
// ---------------------------------------------------------------------------

export const POST = Webhooks({
     webhookSecret: process.env.POLAR_WEBHOOK_SECRET_SANDBOX_CUSTOMER!,

     onCustomerCreated: async (payload) => {
          const eventType = "customer.created";
          console.log(`${eventType} webhook received:`, payload);

          try {
               const customer = convertCustomerToPolarCustomer(payload.data);
               await upsertCustomer(customer, eventType);
               console.log(`${eventType} processed successfully for customer:`, customer.id);
          } catch (error) {
               console.error(`Error processing ${eventType}:`, error);
               throw error;
          }
     },

     onCustomerUpdated: async (payload) => {
          const eventType = "customer.updated";
          console.log(`${eventType} webhook received:`, payload);

          try {
               const customer = convertCustomerToPolarCustomer(payload.data);
               await upsertCustomer(customer, eventType);
               console.log(`${eventType} processed successfully for customer:`, customer.id);
          } catch (error) {
               console.error(`Error processing ${eventType}:`, error);
               throw error;
          }
     },

     onCustomerDeleted: async (payload) => {
          const eventType = "customer.deleted";
          console.log(`${eventType} webhook received:`, payload);

          try {
               const customer = convertCustomerToPolarCustomer(payload.data);
               await upsertCustomer(customer, eventType);
               console.log(`${eventType} processed successfully for customer:`, customer.id);
          } catch (error) {
               console.error(`Error processing ${eventType}:`, error);
               throw error;
          }
     },

     onCustomerStateChanged: async (payload) => {
          const eventType = "customer.state_changed";
          console.log(`${eventType} webhook received:`, payload);

          try {
               const customer = convertCustomerToPolarCustomer(payload.data);
               await upsertCustomer(customer, eventType);
               console.log(`${eventType} processed successfully for customer:`, customer.id);
          } catch (error) {
               console.error(`Error processing ${eventType}:`, error);
               throw error;
          }
     },
});
