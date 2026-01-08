// app/api/polar/webhook/product/route.ts
import { Webhooks } from "@polar-sh/nextjs";
import { createClient } from "@supabase/supabase-js";
import { logServerAction } from "@/app/lib/server-logging";

export const runtime = "nodejs";

const supabase = createClient(
     process.env.NEXT_PUBLIC_SUPABASE_URL!,
     process.env.SUPABASE_SERVICE_ROLE_KEY!
);

type PolarInterval = "day" | "week" | "month" | "year";

type PolarPricePayload = {
     id: string;
     created_at: string;
     modified_at: string | null;
     source: string;
     amount_type: string;
     is_archived: boolean;
     product_id: string;
     type: string;
     recurring_interval: PolarInterval | null;
     price_currency: string;

     // ✅ metered pricing fields (from your payload)
     unit_amount: string; // "100.000000000000"
     cap_amount: string | null;
     meter_id: string | null;
     meter?: { id: string; name: string } | null;
};

type PolarProductPayload = {
     id: string;
     created_at: string;
     modified_at: string;

     trial_interval: PolarInterval | null;
     trial_interval_count: number | null;

     name: string;
     description: string | null;

     recurring_interval: PolarInterval | null;
     recurring_interval_count: number | null;

     is_recurring: boolean;
     is_archived: boolean;

     organization_id: string; // ✅ present

     metadata: Record<string, unknown> | null;

     prices: PolarPricePayload[];
     benefits: any[];
     medias: any[];
     attached_custom_fields: any[];
};

function nowIso() {
     return new Date().toISOString();
}

/**
 * Convert Polar's unit_amount string ("100.000000000000") into numeric.
 * Supabase numeric(12,2) would round, but we keep more precision in code then let DB cast.
 */
function toNumericString(v: unknown): string {
     if (typeof v === "number") return String(v);
     if (typeof v === "string") return v;
     return "0";
}

async function syncProductToDb(product: PolarProductPayload, eventLabel: string) {
     const t0 = Date.now();
     const productId = product.id;

     // 1) Upsert Product
     const productRow = {
          id: product.id,

          createdAt: product.created_at ?? nowIso(),
          modifiedAt: product.modified_at ?? nowIso(),

          trialInterval: product.trial_interval ?? null,
          trialIntervalCount: product.trial_interval_count ?? null,

          name: product.name,
          description: product.description ?? null,

          recurringInterval: product.recurring_interval ?? null,
          recurringIntervalCount: product.recurring_interval_count ?? null,

          isRecurring: Boolean(product.is_recurring),
          isArchived: Boolean(product.is_archived),

          // ✅ FIX: map organization_id -> organizationId (NOT NULL)
          organizationId: product.organization_id,

          metadata: product.metadata ?? {},
     };

     const { error: prodErr } = await supabase
          .from("tblPolarProducts")
          .upsert(productRow, { onConflict: "id" });

     if (prodErr) {
          await logServerAction({
               user_id: null,
               action: `Polar Product Webhook - product upsert failed (${eventLabel})`,
               payload: { productId, error: prodErr.message },
               status: "fail",
               error: prodErr.message,
               duration_ms: Date.now() - t0,
               type: "internal",
          });
          throw prodErr;
     }

     // 2) Sync Prices (upsert + delete removed)
     const prices = product.prices ?? [];

     if (prices.length > 0) {
          const priceRows = prices.map((p) => ({
               id: p.id,

               createdAt: p.created_at ?? nowIso(),
               modifiedAt: p.modified_at ?? nowIso(),

               source: p.source,
               amountType: p.amount_type,
               isArchived: Boolean(p.is_archived),

               productId: p.product_id, // should equal product.id
               type: p.type,
               recurringInterval: p.recurring_interval ?? null,

               priceCurrency: p.price_currency,

               /**
                * ✅ IMPORTANT:
                * Your table currently has "priceAmount" numeric(12,2).
                * For metered_unit, Polar sends unit_amount as a STRING with high precision.
                * We'll store unit_amount into priceAmount (rounded by DB to 2 decimals).
                */
               priceAmount: toNumericString(p.unit_amount),

               legacy: false,

               /**
                * OPTIONAL: store metered-specific fields inside a JSON blob.
                * If you want this persisted, you need to ADD a column in tblPolarProductPrices,
                * e.g. "metadata" jsonb.
                *
                * For now we encode it into product metadata (see below), OR ignore.
                */
          }));

          const { error: priceUpsertErr } = await supabase
               .from("tblPolarProductPrices")
               .upsert(priceRows, { onConflict: "id" });

          if (priceUpsertErr) throw priceUpsertErr;
     }

     // Delete prices not present anymore (per product)
     {
          const incomingPriceIds = prices.map((p) => p.id);

          if (incomingPriceIds.length === 0) {
               const { error } = await supabase
                    .from("tblPolarProductPrices")
                    .delete()
                    .eq("productId", productId);

               if (error) throw error;
          } else {
               const { error } = await supabase
                    .from("tblPolarProductPrices")
                    .delete()
                    .eq("productId", productId)
                    .not("id", "in", `(${incomingPriceIds.map((x) => `"${x}"`).join(",")})`);

               if (error) throw error;
          }
     }

     // 3) Store metered price details somewhere
     // Since tblPolarProductPrices lacks columns for meter_id/cap_amount/meter,
     // we store a snapshot into tblPolarProducts.metadata under "polarPricesExtra".
     {
          const polarPricesExtra = prices.map((p) => ({
               id: p.id,
               unit_amount: p.unit_amount,
               cap_amount: p.cap_amount,
               meter_id: p.meter_id,
               meter: p.meter ?? null,
               amount_type: p.amount_type,
          }));

          const { error: metaErr } = await supabase
               .from("tblPolarProducts")
               .update({
                    metadata: {
                         ...(product.metadata ?? {}),
                         polarPricesExtra,
                    },
                    modifiedAt: product.modified_at ?? nowIso(),
               })
               .eq("id", productId);

          if (metaErr) throw metaErr;
     }

     // 4) Benefits / Medias / Attached custom fields
     // Your payload currently sends these empty arrays; leaving logic out for brevity.
     // If you want them synced too, tell me if you want:
     // - benefits linked to product via a junction table, OR stored as standalone only
     // - medias linked to product via a junction table, OR stored as standalone only

     await logServerAction({
          user_id: null,
          action: `Polar Product Webhook - synced (${eventLabel})`,
          payload: {
               productId,
               organizationId: product.organization_id,
               prices: prices.length,
          },
          status: "success",
          error: "",
          duration_ms: Date.now() - t0,
          type: "internal",
     });
}

export const POST = Webhooks({
     webhookSecret: process.env.POLAR_WEBHOOK_SECRET_SANDBOX_PRODUCT!,

     onProductCreated: async (payload) => {
          const product = payload.data as unknown as PolarProductPayload;
          await syncProductToDb(product, "product.created");
     },

     onProductUpdated: async (payload) => {
          const product = payload.data as unknown as PolarProductPayload;
          await syncProductToDb(product, "product.updated");
     },
});
