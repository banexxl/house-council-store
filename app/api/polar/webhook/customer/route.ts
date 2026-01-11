// app/api/polar/webhook/route.ts
import { Webhooks } from "@polar-sh/nextjs";
import { createClient } from "@supabase/supabase-js";
import { logServerAction } from "@/app/lib/server-logging";

export const runtime = "nodejs";

// --------------------
// Env guards
// --------------------
function mustEnv(name: string): string {
     const v = process.env[name];
     if (!v || !v.trim()) throw new Error(`[polar webhook] Missing env var: ${name}`);
     return v;
}

// Use the exact name you confirmed
const POLAR_WEBHOOK_SECRET = mustEnv("POLAR_WEBHOOK_SECRET_SANDBOX_CUSTOMER");

// ✅ Service role for webhooks
const supabase = createClient(
     mustEnv("NEXT_PUBLIC_SUPABASE_URL"),
     mustEnv("SUPABASE_SERVICE_ROLE_KEY")
);

// --------------------
// Types (minimal; tolerant to extra fields)
// --------------------
type PolarCustomerPayload = {
     id: string; // Polar customer id
     externalId: string | null; // should be Supabase auth.user.id if you set it during create
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

type PolarCustomerSeatPayload = {
     id: string; // seat id (uuid)
     customerId: string; // Polar customer id (uuid)
     // Some Polar payloads may include these; keep optional:
     userId?: string | null; // could be your app's user id depending on your flow
     metadata?: Record<string, any> | null;
     createdAt?: string | null;
     modifiedAt?: string | null;
     // Sometimes status/state might exist
     status?: string | null;
};

// --------------------
// Helpers
// --------------------
function mapCustomerToRow(c: PolarCustomerPayload) {
     return {
          customerId: c.id,
          userId: c.externalId!, // required in your schema

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

async function logEvent(opts: {
     user_id: string | null;
     action: string;
     payload: any;
     status: "success" | "fail";
     error?: string;
     duration_ms: number;
}) {
     await logServerAction({
          user_id: opts.user_id,
          action: opts.action,
          payload: opts.payload,
          status: opts.status,
          error: opts.error ?? "",
          duration_ms: opts.duration_ms,
          type: "webhook",
     });
}

// --------------------
// Customer event handlers
// --------------------
async function handleCustomerCreated(customer: PolarCustomerPayload) {
     const t0 = Date.now();

     if (!customer.externalId) {
          await logEvent({
               user_id: null,
               action: "customer.created - skipped (missing externalId)",
               payload: customer,
               status: "fail",
               error:
                    "customer.externalId is null; cannot insert because tblPolarCustomers.userId is NOT NULL. Ensure you set externalId=userId when creating Polar customer.",
               duration_ms: Date.now() - t0,
          });
          return;
     }

     const row = mapCustomerToRow(customer);

     const { data, error } = await supabase
          .from("tblPolarCustomers")
          .upsert(row, { onConflict: "customerId" })
          .select()
          .single();

     await logEvent({
          user_id: customer.externalId,
          action: "customer.created - upsert tblPolarCustomers",
          payload: row,
          status: error ? "fail" : "success",
          error: error?.message,
          duration_ms: Date.now() - t0,
     });

     if (error) throw error;
     return data;
}

async function handleCustomerUpdated(customer: PolarCustomerPayload) {
     const t0 = Date.now();

     // We prefer externalId but for updates it might be missing in some edge cases.
     // Since customerId is NOT NULL in your DB row, we can update by customerId only.
     const row = {
          customerId: customer.id,
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
          ...(customer.externalId ? { userId: customer.externalId } : {}),
     };

     const { data, error } = await supabase
          .from("tblPolarCustomers")
          .upsert(row, { onConflict: "customerId" }) // safe: if row exists update; if not exists requires userId (externalId)
          .select()
          .maybeSingle();

     // If insert failed due to missing userId, you’ll see error + log.
     await logEvent({
          user_id: customer.externalId ?? null,
          action: "customer.updated - upsert tblPolarCustomers",
          payload: row,
          status: error ? "fail" : "success",
          error: error?.message,
          duration_ms: Date.now() - t0,
     });

     if (error) throw error;
     return data;
}

async function handleCustomerDeleted(customer: PolarCustomerPayload) {
     const t0 = Date.now();

     // Polar usually sets deletedAt. We "soft delete" by updating deletedAt.
     const patch = {
          deletedAt: customer.deletedAt ?? new Date().toISOString(),
          modifiedAt: customer.modifiedAt ?? new Date().toISOString(),
          // optional snapshot fields
          email: customer.email,
          name: customer.name,
          metadata: customer.metadata ?? {},
     };

     const { data, error } = await supabase
          .from("tblPolarCustomers")
          .update(patch)
          .eq("customerId", customer.id)
          .select()
          .maybeSingle();

     await logEvent({
          user_id: customer.externalId ?? null,
          action: "customer.deleted - mark deletedAt",
          payload: { customerId: customer.id, patch },
          status: error ? "fail" : "success",
          error: error?.message,
          duration_ms: Date.now() - t0,
     });

     if (error) throw error;
     return data;
}

async function handleCustomerStateChanged(customer: PolarCustomerPayload) {
     const t0 = Date.now();

     // Since you didn’t show the exact schema for state_changed, we store the whole event in metadata
     // and also update modifiedAt. This keeps it future-proof.
     const patch = {
          modifiedAt: customer.modifiedAt ?? new Date().toISOString(),
          metadata: {
               ...(customer.metadata ?? {}),
               last_state_changed_at: new Date().toISOString(),
               // store the latest customer snapshot as well:
               last_state_changed_customer: customer,
          },
     };

     const { data, error } = await supabase
          .from("tblPolarCustomers")
          .update(patch)
          .eq("customerId", customer.id)
          .select()
          .maybeSingle();

     await logEvent({
          user_id: customer.externalId ?? null,
          action: "customer.state_changed - store snapshot",
          payload: { customerId: customer.id, patch },
          status: error ? "fail" : "success",
          error: error?.message,
          duration_ms: Date.now() - t0,
     });

     if (error) throw error;
     return data;
}

// --------------------
// Seat event handlers
// --------------------
async function handleSeatAssigned(seat: PolarCustomerSeatPayload) {
     const t0 = Date.now();

     const row = {
          seatId: seat.id,
          customerId: seat.customerId,
          userId: seat.userId ?? null,
          status: "assigned",
          metadata: seat.metadata ?? {},
          createdAt: seat.createdAt ?? null,
          modifiedAt: seat.modifiedAt ?? null,
     };

     const { data, error } = await supabase
          .from("tblPolarCustomerSeats")
          .upsert(row, { onConflict: "seatId" })
          .select()
          .single();

     await logEvent({
          user_id: seat.userId ?? null,
          action: "customer_seat.assigned - upsert seat",
          payload: row,
          status: error ? "fail" : "success",
          error: error?.message,
          duration_ms: Date.now() - t0,
     });

     if (error) throw error;
     return data;
}

async function handleSeatClaimed(seat: PolarCustomerSeatPayload) {
     const t0 = Date.now();

     const patch = {
          userId: seat.userId ?? null,
          status: "claimed",
          metadata: seat.metadata ?? {},
          modifiedAt: seat.modifiedAt ?? new Date().toISOString(),
     };

     const { data, error } = await supabase
          .from("tblPolarCustomerSeats")
          .update(patch)
          .eq("seatId", seat.id)
          .select()
          .maybeSingle();

     await logEvent({
          user_id: seat.userId ?? null,
          action: "customer_seat.claimed - update seat",
          payload: { seatId: seat.id, patch },
          status: error ? "fail" : "success",
          error: error?.message,
          duration_ms: Date.now() - t0,
     });

     if (error) throw error;
     return data;
}

async function handleSeatRevoked(seat: PolarCustomerSeatPayload) {
     const t0 = Date.now();

     const patch = {
          status: "revoked",
          metadata: seat.metadata ?? {},
          modifiedAt: seat.modifiedAt ?? new Date().toISOString(),
     };

     const { data, error } = await supabase
          .from("tblPolarCustomerSeats")
          .update(patch)
          .eq("seatId", seat.id)
          .select()
          .maybeSingle();

     await logEvent({
          user_id: seat.userId ?? null,
          action: "customer_seat.revoked - update seat",
          payload: { seatId: seat.id, patch },
          status: error ? "fail" : "success",
          error: error?.message,
          duration_ms: Date.now() - t0,
     });

     if (error) throw error;
     return data;
}

// --------------------
// Dispatcher
// --------------------
async function dispatchEvent(eventType: string, payloadData: any) {
     switch (eventType) {
          case "customer.created":
               return handleCustomerCreated(payloadData as PolarCustomerPayload);

          case "customer.updated":
               return handleCustomerUpdated(payloadData as PolarCustomerPayload);

          case "customer.deleted":
               return handleCustomerDeleted(payloadData as PolarCustomerPayload);

          case "customer.state_changed":
               return handleCustomerStateChanged(payloadData as PolarCustomerPayload);

          case "customer_seat.assigned":
               return handleSeatAssigned(payloadData as PolarCustomerSeatPayload);

          case "customer_seat.claimed":
               return handleSeatClaimed(payloadData as PolarCustomerSeatPayload);

          case "customer_seat.revoked":
               return handleSeatRevoked(payloadData as PolarCustomerSeatPayload);

          default:
               return;
     }
}

export const POST = Webhooks({
     webhookSecret: POLAR_WEBHOOK_SECRET,
     onPayload: async (payload: any) => {
          const eventType = String(payload?.type ?? "");
          const data = payload?.data ?? {};

          // Useful debug during setup:
          console.log("[polar webhook]", eventType, {
               data
          });

          await dispatchEvent(eventType, data);

          // Optional: log ignored events too
          if (
               ![
                    "customer.created",
                    "customer.updated",
                    "customer.deleted",
                    "customer.state_changed",
                    "customer_seat.assigned",
                    "customer_seat.claimed",
                    "customer_seat.revoked",
               ].includes(eventType)
          ) {
               await logServerAction({
                    user_id: null,
                    action: `Polar Webhook - Ignored (${eventType})`,
                    payload,
                    status: "success",
                    error: "",
                    duration_ms: 0,
                    type: "webhook",
               });
          }
     },
});
