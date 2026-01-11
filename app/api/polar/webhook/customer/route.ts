// app/api/polar/webhook/route.ts
import { Webhooks } from "@polar-sh/nextjs";
import { createClient } from "@supabase/supabase-js";
import { logServerAction } from "@/app/lib/server-logging"; // adjust path if needed

export const runtime = "nodejs";

// ✅ Service role for webhooks (bypasses RLS)
const supabase = createClient(
     process.env.NEXT_PUBLIC_SUPABASE_URL!,
     process.env.SUPABASE_SERVICE_ROLE_KEY!
);

type PolarCustomerPayload = {
     id: string;                 // Polar customer id (uuid)
     externalId: string | null;  // we will set this to Supabase auth user id
     email: string;
     name: string;

     emailVerified?: boolean | null;
     organizationId?: string | null;
     avatarUrl?: string | null;

     billingAddress?: any | null;
     taxId?: string[] | null;

     metadata?: Record<string, any> | null;

     createdAt?: string | null;
     modifiedAt?: string | null;
     deletedAt?: string | null;
};

function mapPolarCustomerToRow(c: PolarCustomerPayload) {
     return {
          customerId: c.id, // ✅ NOT NULL

          // Required in your schema:
          userId: c.externalId!, // ✅ NOT NULL (we enforce below)

          email: c.email,
          name: c.name,
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

async function upsertCustomer(eventType: string, customer: PolarCustomerPayload) {
     const t0 = Date.now();

     // If you don’t set externalId during create, you cannot insert because userId is NOT NULL.
     if (!customer.externalId) {
          await logServerAction({
               user_id: null,
               action: `${eventType} - Customer skipped (missing externalId)`,
               payload: customer,
               status: "fail",
               error: "Polar customer.externalId is null; cannot map to tblPolarCustomers.userId (NOT NULL). Ensure you set externalId=userId when creating customer.",
               duration_ms: Date.now() - t0,
               type: "webhook",
          });
          return;
     }

     const row = mapPolarCustomerToRow(customer);

     const { data, error } = await supabase
          .from("tblPolarCustomers")
          .upsert(row, { onConflict: "customerId" })
          .select()
          .single();

     await logServerAction({
          user_id: customer.externalId,
          action: `${eventType} - Upsert Polar Customer`,
          payload: row,
          status: error ? "fail" : "success",
          error: error?.message || "",
          duration_ms: Date.now() - t0,
          type: "webhook",
     });

     if (error) throw error;
     return data;
}

export const POST = Webhooks({
     webhookSecret: process.env.POLAR_WEBHOOK_SECRET_SANDBOX!, // or POLAR_WEBHOOK_SECRET
     onPayload: async (payload: any) => {
          const eventType = String(payload?.type ?? "");
          const data = payload?.data ?? {};

          if (
               eventType === "customer.created" ||
               eventType === "customer.updated" ||
               eventType === "customer.deleted"
          ) {
               await upsertCustomer(eventType, data as PolarCustomerPayload);
               return;
          }

          // Optional log for other event types
          await logServerAction({
               user_id: null,
               action: `Polar Webhook - Ignored (${eventType})`,
               payload,
               status: "success",
               error: "",
               duration_ms: 0,
               type: "webhook",
          });
     },
});
