// app/api/polar/webhook/route.ts
import { Webhooks } from "@polar-sh/nextjs";
import { createClient } from "@supabase/supabase-js";
import { logServerAction } from "@/app/lib/server-logging"; // adjust path if different

export const runtime = "nodejs";

// Service role for webhooks (bypasses RLS)
const supabase = createClient(
     process.env.NEXT_PUBLIC_SUPABASE_URL!,
     process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// --------------------
// Types (minimal)
// --------------------
type PolarCustomerPayload = {
     id: string; // Polar customer id (uuid string)
     createdAt?: string | null;
     modifiedAt?: string | null;
     deletedAt?: string | null;

     metadata?: Record<string, any> | null;
     externalId?: string | null;

     email: string;
     emailVerified?: boolean | null;
     name: string;

     billingAddress?: any | null;
     taxId?: string[] | null;

     organizationId?: string | null;
     avatarUrl?: string | null;
};

function mapPolarCustomerToRow(c: PolarCustomerPayload) {
     return {
          customerId: c.id, // <-- your new column that stores Polar id

          // Your table columns (camelCase quoted in Postgres)
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

          // Your NOT NULL column: only include if present
          // (we set externalId=userId at registration, so it should be present for your customers)
          ...(c.externalId ? { userId: c.externalId } : {}),
     };
}

async function upsertPolarCustomer(eventType: string, customer: PolarCustomerPayload) {
     const t0 = Date.now();

     const row = mapPolarCustomerToRow(customer);

     // IMPORTANT:
     // If externalId is missing, we should NOT attempt an insert because userId is NOT NULL in your schema.
     // In that case, do update-only by customerId.
     const q = customer.externalId
          ? supabase.from("tblPolarCustomers").upsert(row, { onConflict: "customerId" })
          : supabase.from("tblPolarCustomers").update(row).eq("customerId", customer.id);

     const { data, error } = await q.select().maybeSingle();

     await logServerAction({
          user_id: customer.externalId ?? null, // Supabase user id if you set externalId
          action: `${eventType} - Upsert Polar Customer`,
          payload: { customer, mappedRow: row },
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

          // Only handle customer.* here (you can extend this later)
          if (eventType === "customer.created" || eventType === "customer.updated" || eventType === "customer.deleted") {
               await upsertPolarCustomer(eventType, data as PolarCustomerPayload);
               return;
          }

          // Optionally log other events
          await logServerAction({
               user_id: null,
               action: `Polar Webhook - Ignored Event (${eventType})`,
               payload,
               status: "success",
               error: "",
               duration_ms: 0,
               type: "webhook",
          });
     },
});
