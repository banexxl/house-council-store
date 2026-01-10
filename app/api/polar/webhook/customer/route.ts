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
     const supabase = await useServerSideSupabaseAnonClient();

     // Query existing customer by id or email to preserve userId and handle duplicates
     const { data: existingById } = await supabase
          .from("tblPolarCustomers")
          .select('id, userId, email')
          .eq('id', customer.id)
          .maybeSingle();

     const { data: existingByEmail } = await supabase
          .from("tblPolarCustomers")
          .select('id, userId, email')
          .eq('email', customer.email)
          .maybeSingle();

     // Determine the userId to use
     let userId = existingById?.userId || existingByEmail?.userId || customer.id;

     // If email exists with different id, delete the old record first
     if (existingByEmail && existingByEmail.id !== customer.id) {
          await supabase
               .from("tblPolarCustomers")
               .delete()
               .eq('id', existingByEmail.id);
     }

     const customerData = {
          id: customer.id,
          createdAt: customer.createdAt,
          modifiedAt: customer.modifiedAt,
          metadata: customer.metadata,
          email: customer.email,
          emailVerified: customer.emailVerified,
          name: customer.name,
          billingAddress: customer.billingAddress,
          taxId: customer.taxId,
          organizationId: customer.organizationId,
          deletedAt: customer.deletedAt,
          avatarUrl: customer.avatarUrl,
          userId: userId,
     };

     const insertable = { ...customerData };
     const { data, error } = await supabase
          .from("tblPolarCustomers")
          .upsert(insertable, { onConflict: "id" })
          .select()
          .single();

     const duration = Date.now() - t0;

     await logServerAction({
          user_id: customer.id,
          action: `${eventType} - Upsert Customer`,
          payload: customerData,
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

async function deleteCustomer(customerId: string, eventType: string) {
     const t0 = Date.now();

     const supabase = await useServerSideSupabaseAnonClient();
     const { data: customerData, error: customerError } = await supabase.from("tblPolarCustomers").select('userId').eq('id', customerId).single();

     const supabaseAdmin = await useServerSideSupabaseServiceRoleClient()
     const { data, error } = await supabaseAdmin.auth.admin.deleteUser(customerData?.userId)

     const duration = Date.now() - t0;

     await logServerAction({
          user_id: customerId,
          action: `${eventType} - Delete Customer`,
          payload: { customerId },
          status: error ? "fail" : "success",
          error: error?.message || "",
          duration_ms: duration,
          type: "webhook",
     });

     if (error) {
          await logServerAction({
               user_id: customerId,
               action: `${eventType} - Delete Customer - Failed to delete auth user ${customerData?.userId}`,
               payload: { customerId },
               status: "fail",
               error: customerError?.message || "",
               duration_ms: duration,
               type: "webhook",
          });
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
               await deleteCustomer(customer.id, eventType);
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
