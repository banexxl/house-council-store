// app/api/polar/webhook/product/route.ts
import { Webhooks } from "@polar-sh/nextjs";
import { createClient } from "@supabase/supabase-js";
import { logServerAction } from "@/app/lib/server-logging";

export const runtime = "nodejs";

// ✅ service role (bypasses RLS)
const supabase = createClient(
     process.env.NEXT_PUBLIC_SUPABASE_URL!,
     process.env.SUPABASE_ANON_KEY!
);

// ------------------------------------------------------------
// Helpers
// ------------------------------------------------------------
function toIso(v: unknown): string {
     if (!v) return new Date().toISOString();
     if (v instanceof Date) return v.toISOString();
     if (typeof v === "string") return v;
     // Polar sometimes gives Date-like objects; fallback:
     try {
          return new Date(v as any).toISOString();
     } catch {
          return new Date().toISOString();
     }
}

function toNumericString(v: unknown): string {
     // Polar metered pricing uses strings like "100.000000000000"
     if (typeof v === "number") return String(v);
     if (typeof v === "string") return v;
     return "0";
}

// ------------------------------------------------------------
// Core sync
// ------------------------------------------------------------
async function syncProductToDb(product: any, eventLabel: string) {
     const t0 = Date.now();

     const productId: string | undefined = product?.id;
     const organizationId: string | undefined = product?.organizationId;

     if (!productId) throw new Error("Missing data.id");
     if (!organizationId) throw new Error("Missing data.organizationId");

     // 1) Upsert product
     const productRow = {
          id: productId,
          createdAt: toIso(product?.createdAt),
          modifiedAt: toIso(product?.modifiedAt),

          trialInterval: product?.trialInterval ?? null,
          trialIntervalCount: product?.trialIntervalCount ?? null,

          name: product?.name ?? "",
          description: product?.description ?? null,

          recurringInterval: product?.recurringInterval ?? null,
          recurringIntervalCount: product?.recurringIntervalCount ?? null,

          isRecurring: Boolean(product?.isRecurring),
          isArchived: Boolean(product?.isArchived),

          organizationId, // ✅ NOT NULL column
          metadata: product?.metadata ?? {},
     };

     const { error: prodErr } = await supabase
          .from("tblPolarProducts")
          .upsert(productRow, { onConflict: "id" });

     if (prodErr) {
          await logServerAction({
               user_id: null,
               action: `Polar Product Webhook - product upsert failed (${eventLabel})`,
               payload: {
                    productId,
                    organizationId,
                    dbError: prodErr.message,
                    productRow,
               },
               status: "fail",
               error: prodErr.message,
               duration_ms: Date.now() - t0,
               type: "internal",
          });
          throw prodErr;
     }

     // 2) Prices (upsert + delete removed for this product)
     const prices: any[] = Array.isArray(product?.prices) ? product.prices : [];

     if (prices.length > 0) {
          const priceRows = prices.map((p) => ({
               id: p.id,

               createdAt: toIso(p.createdAt),
               modifiedAt: toIso(p.modifiedAt),

               source: p.source,
               amountType: p.amountType, // e.g. "metered_unit"
               isArchived: Boolean(p.isArchived),

               productId: p.productId ?? productId,
               type: p.type, // e.g. "recurring"
               recurringInterval: p.recurringInterval ?? null,

               priceCurrency: p.priceCurrency,
               // ✅ Store unitAmount into priceAmount since your table has only priceAmount
               priceAmount: toNumericString(p.priceAmount ?? p.unitAmount ?? 0),

               legacy: Boolean(p.legacy),
          }));

          const { error: priceErr } = await supabase
               .from("tblPolarProductPrices")
               .upsert(priceRows, { onConflict: "id" });

          if (priceErr) throw priceErr;
     }

     // delete removed prices
     {
          const incomingIds = prices.map((p) => p?.id).filter(Boolean) as string[];

          if (incomingIds.length === 0) {
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
                    .not("id", "in", `(${incomingIds.map((x) => `"${x}"`).join(",")})`);

               if (error) throw error;
          }
     }

     // 3) Attached custom fields (sync mapping)
     // NOTE: In your schema, tblPolarProductAttachedCustomFields has:
     // productId, customFieldId, order, required (and a UNIQUE(productId, customFieldId))
     const attachedCustomFields: any[] = Array.isArray(product?.attachedCustomFields)
          ? product.attachedCustomFields
          : [];

     // Upsert custom fields themselves (if included)
     const customFields = attachedCustomFields
          .map((x) => x?.customField)
          .filter(Boolean);

     if (customFields.length > 0) {
          const customFieldRows = customFields.map((cf) => ({
               id: cf.id,
               createdAt: toIso(cf.createdAt),
               modifiedAt: toIso(cf.modifiedAt),
               metadata: cf.metadata ?? {},
               type: cf.type,
               slug: cf.slug,
               name: cf.name,
               organizationId: cf.organizationId ?? organizationId,
               properties: cf.properties ?? {},
          }));

          const { error: cfErr } = await supabase
               .from("tblPolarProductCustomFields")
               .upsert(customFieldRows, { onConflict: "id" });

          if (cfErr) throw cfErr;
     }

     // Upsert mapping rows
     if (attachedCustomFields.length > 0) {
          const mappingRows = attachedCustomFields.map((x) => ({
               productId,
               customFieldId: x.customFieldId,
               order: x.order ?? 0,
               required: Boolean(x.required),
          }));

          const { error: mapErr } = await supabase
               .from("tblPolarProductAttachedCustomFields")
               .upsert(mappingRows, { onConflict: "productId,customFieldId" });

          if (mapErr) throw mapErr;
     }

     // Delete removed mappings
     {
          const incomingCustomFieldIds = attachedCustomFields
               .map((x) => x?.customFieldId)
               .filter(Boolean) as string[];

          if (incomingCustomFieldIds.length === 0) {
               const { error } = await supabase
                    .from("tblPolarProductAttachedCustomFields")
                    .delete()
                    .eq("productId", productId);

               if (error) throw error;
          } else {
               const { error } = await supabase
                    .from("tblPolarProductAttachedCustomFields")
                    .delete()
                    .eq("productId", productId)
                    .not(
                         "customFieldId",
                         "in",
                         `(${incomingCustomFieldIds.map((x) => `"${x}"`).join(",")})`
                    );

               if (error) throw error;
          }
     }

     // 4) Benefits + medias (standalone upsert)
     const benefits: any[] = Array.isArray(product?.benefits) ? product.benefits : [];
     if (benefits.length > 0) {
          const benefitRows = benefits.map((b) => ({
               id: b.id,
               createdAt: toIso(b.createdAt),
               modifiedAt: toIso(b.modifiedAt),
               type: b.type,
               description: b.description ?? null,
               selectable: Boolean(b.selectable),
               deletable: Boolean(b.deletable),
               organizationId: b.organizationId ?? organizationId,
               metadata: b.metadata ?? {},
               properties: b.properties ?? {},
          }));

          const { error: benErr } = await supabase
               .from("tblPolarProductBenefits")
               .upsert(benefitRows, { onConflict: "id" });

          if (benErr) throw benErr;
     }

     const medias: any[] = Array.isArray(product?.medias) ? product.medias : [];
     if (medias.length > 0) {
          const mediaRows = medias.map((m) => ({
               id: m.id,
               organizationId: m.organizationId ?? organizationId,
               name: m.name,
               path: m.path,
               mimeType: m.mimeType,
               size: m.size,
               storageVersion: m.storageVersion ?? null,
               checksumEtag: m.checksumEtag ?? null,
               checksumSha256Base64: m.checksumSha256Base64 ?? null,
               checksumSha256Hex: m.checksumSha256Hex ?? null,
               lastModifiedAt: m.lastModifiedAt ? toIso(m.lastModifiedAt) : null,
               version: m.version ?? null,
               service: m.service ?? null,
               isUploaded: Boolean(m.isUploaded),
               createdAt: toIso(m.createdAt),
               sizeReadable: m.sizeReadable ?? null,
               publicUrl: m.publicUrl ?? null,
          }));

          const { error: medErr } = await supabase
               .from("tblPolarProductMedias")
               .upsert(mediaRows, { onConflict: "id" });

          if (medErr) throw medErr;
     }

     await logServerAction({
          user_id: null,
          action: `Polar Product Webhook - synced (${eventLabel})`,
          payload: {
               productId,
               organizationId,
               prices: prices.length,
               benefits: benefits.length,
               medias: medias.length,
               attachedCustomFields: attachedCustomFields.length,
          },
          status: "success",
          error: "",
          duration_ms: Date.now() - t0,
          type: "internal",
     });
}

// ------------------------------------------------------------
// Webhook handler
// ------------------------------------------------------------
export const POST = Webhooks({
     webhookSecret: process.env.POLAR_WEBHOOK_SECRET_SANDBOX_PRODUCT!,

     onProductCreated: async (payload) => {
          console.log("Product created payload:", payload);
          await syncProductToDb(payload.data, "product.created");
     },

     onProductUpdated: async (payload) => {
          console.log("Product updated payload:", payload);
          await syncProductToDb(payload.data, "product.updated");
     },
});
