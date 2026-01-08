// app/api/polar/webhook/product/route.ts
import { Webhooks } from "@polar-sh/nextjs";
import { createClient } from "@supabase/supabase-js";
import { logServerAction } from "@/app/lib/server-logging";

export const runtime = "nodejs";

// ✅ Use SERVICE ROLE for webhooks (bypasses RLS)
const supabase = createClient(
     process.env.NEXT_PUBLIC_SUPABASE_URL!,
     process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ---------------------------------------------------------------------------
// Types (lightweight / resilient)
// ---------------------------------------------------------------------------

type PolarInterval = "day" | "week" | "month" | "year";

type PolarProductPayload = {
     id: string;
     created_at?: string;
     modified_at?: string;

     trial_interval?: PolarInterval | null;
     trial_interval_count?: number | null;

     name: string;
     description?: string | null;

     recurring_interval?: PolarInterval | null;
     recurring_interval_count?: number | null;

     is_recurring?: boolean | null;
     is_archived?: boolean | null;

     organization_id: string;

     metadata?: Record<string, unknown> | null;

     prices?: Array<{
          id: string;
          created_at?: string;
          modified_at?: string;
          source: string;
          amount_type: string;
          is_archived?: boolean | null;
          product_id: string;
          type: string;
          recurring_interval?: PolarInterval | null;
          price_currency: string;
          price_amount: number;
          legacy?: boolean | null;
     }> | null;

     benefits?: Array<{
          id: string;
          created_at?: string;
          modified_at?: string;
          type: string;
          description?: string | null;
          selectable?: boolean | null;
          deletable?: boolean | null;
          organization_id: string;
          metadata?: Record<string, unknown> | null;
          properties?: Record<string, string> | null;
     }> | null;

     medias?: Array<{
          id: string;
          organization_id: string;
          name: string;
          path: string;
          mime_type: string;
          size: number;
          storage_version?: string | null;
          checksum_etag?: string | null;
          checksum_sha256_base64?: string | null;
          checksum_sha256_hex?: string | null;
          last_modified_at?: string | null;
          version?: string | null;
          service?: string | null;
          is_uploaded?: boolean | null;
          created_at?: string | null;
          size_readable?: string | null;
          public_url?: string | null;
     }> | null;

     attached_custom_fields?: Array<{
          custom_field_id: string;
          order?: number | null;
          required?: boolean | null;
          custom_field?: {
               id: string;
               created_at?: string;
               modified_at?: string;
               metadata?: Record<string, unknown> | null;
               type: string;
               slug: string;
               name: string;
               organization_id: string;
               properties?: Record<string, unknown> | null; // we store as jsonb
          } | null;
     }> | null;
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function nowIso() {
     return new Date().toISOString();
}

async function syncProductToDb(product: PolarProductPayload, eventLabel: string) {
     const t0 = Date.now();

     const productId = product.id;

     // Normalize arrays
     const prices = product.prices ?? [];
     const benefits = product.benefits ?? [];
     const medias = product.medias ?? [];
     const attachedCustomFields = product.attached_custom_fields ?? [];

     // Extract IDs for linkage where schema lacks FK (benefits)
     const benefitIds = benefits.map((b) => b.id);

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

          organizationId: product.organization_id,

          // Preserve existing metadata + add benefitIds snapshot
          metadata: {
               ...(product.metadata ?? {}),
               benefitIds,
          },
     };

     const { error: prodErr } = await supabase
          .from('tblPolarProducts')
          .upsert(productRow, { onConflict: "id" });

     if (prodErr) {
          await logServerAction({
               user_id: null,
               action: `Polar Product Webhook - upsert product failed (${eventLabel})`,
               payload: { productId, error: prodErr.message },
               status: "fail",
               error: prodErr.message,
               duration_ms: Date.now() - t0,
               type: "internal",
          });
          throw prodErr;
     }

     // 2) Sync Prices (upsert + delete removed for this product)
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
               priceAmount: p.price_amount,

               legacy: Boolean(p.legacy),
          }));

          const { error: priceUpsertErr } = await supabase
               .from("tblPolarProductPrices")
               .upsert(priceRows, { onConflict: "id" });

          if (priceUpsertErr) throw priceUpsertErr;
     }

     // Delete prices that are no longer present (per product)
     {
          const incomingPriceIds = prices.map((p) => p.id);

          if (incomingPriceIds.length === 0) {
               // If Polar sends empty list, remove all local prices for this product
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

     // 3) Upsert Benefits (no product FK in schema → store standalone + benefitIds in product.metadata)
     if (benefits.length > 0) {
          const benefitRows = benefits.map((b) => ({
               id: b.id,

               createdAt: b.created_at ?? nowIso(),
               modifiedAt: b.modified_at ?? nowIso(),

               type: b.type,
               description: b.description ?? null,

               selectable: Boolean(b.selectable),
               deletable: Boolean(b.deletable),

               organizationId: b.organization_id,
               metadata: b.metadata ?? {},
               properties: b.properties ?? {},
          }));

          const { error: benefitErr } = await supabase
               .from("tblPolarProductBenefits")
               .upsert(benefitRows, { onConflict: "id" });

          if (benefitErr) throw benefitErr;
     }

     // 4) Upsert Medias (standalone)
     if (medias.length > 0) {
          const mediaRows = medias.map((m) => ({
               id: m.id,
               organizationId: m.organization_id,

               name: m.name,
               path: m.path,
               mimeType: m.mime_type,

               size: m.size,
               storageVersion: m.storage_version ?? null,

               checksumEtag: m.checksum_etag ?? null,
               checksumSha256Base64: m.checksum_sha256_base64 ?? null,
               checksumSha256Hex: m.checksum_sha256_hex ?? null,

               lastModifiedAt: m.last_modified_at ?? null,
               version: m.version ?? null,
               service: m.service ?? null,

               isUploaded: Boolean(m.is_uploaded),
               createdAt: m.created_at ?? nowIso(),

               sizeReadable: m.size_readable ?? null,
               publicUrl: m.public_url ?? null,
          }));

          const { error: mediaErr } = await supabase
               .from("tblPolarProductMedias")
               .upsert(mediaRows, { onConflict: "id" });

          if (mediaErr) throw mediaErr;
     }

     // 5) Upsert Custom Fields + Sync AttachedCustomFields (per product)
     const customFieldsToUpsert = attachedCustomFields
          .map((acf) => acf.custom_field)
          .filter(Boolean) as NonNullable<PolarProductPayload["attached_custom_fields"]>[number]["custom_field"][];

     if (customFieldsToUpsert.length > 0) {
          const customFieldRows = customFieldsToUpsert.map((cf) => ({
               id: cf ? cf.id : undefined,

               createdAt: cf ? cf.created_at ?? nowIso() : nowIso(),
               modifiedAt: cf ? cf.modified_at ?? nowIso() : nowIso(),

               metadata: cf ? cf.metadata ?? {} : {},
               type: cf ? cf.type : undefined,
               slug: cf ? cf.slug : undefined,
               name: cf ? cf.name : undefined,

               organizationId: cf ? cf.organization_id : undefined,

               // store whole object as jsonb; matches our schema
               properties: cf ? cf.properties ?? {} : {},
          }));

          const { error: cfErr } = await supabase
               .from("tblPolarProductCustomFields")
               .upsert(customFieldRows, { onConflict: "id" });

          if (cfErr) throw cfErr;
     }

     // Upsert attached_custom_fields mapping (this table DOES link productId + customFieldId)
     if (attachedCustomFields.length > 0) {
          const attachedRows = attachedCustomFields.map((acf) => ({
               productId: productId,
               customFieldId: acf.custom_field_id,
               order: acf.order ?? 0,
               required: Boolean(acf.required),
          }));

          // Because our table has a surrogate "id" PK but a UNIQUE(productId, customFieldId),
          // we need onConflict on that unique constraint. PostgREST accepts the column list.
          const { error: acfErr } = await supabase
               .from("tblPolarProductAttachedCustomFields")
               .upsert(attachedRows, { onConflict: "productId,customFieldId" });

          if (acfErr) throw acfErr;
     }

     // Delete attached custom fields that are no longer present (per product)
     {
          const incomingCustomFieldIds = attachedCustomFields.map((x) => x.custom_field_id);

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

     // Log success
     await logServerAction({
          user_id: null,
          action: `Polar Product Webhook - synced (${eventLabel})`,
          payload: {
               productId,
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

// ---------------------------------------------------------------------------
// Webhook Handler
// ---------------------------------------------------------------------------

export const POST = Webhooks({
     webhookSecret: process.env.POLAR_WEBHOOK_SECRET_SANDBOX_PRODUCT!,

     onProductCreated: async (payload) => {
          console.log("Product created webhook received:", payload);
          const product = payload.data as unknown as PolarProductPayload;
          await syncProductToDb(product, "product.created");
     },

     onProductUpdated: async (payload) => {
          console.log("Product updated webhook received:", payload);
          const product = payload.data as unknown as PolarProductPayload;
          await syncProductToDb(product, "product.updated");
     },
});
