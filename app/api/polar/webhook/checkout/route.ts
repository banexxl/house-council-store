// app/api/polar/webhook/checkout/route.ts
import { logServerAction } from "@/app/lib/server-logging";
import { useServerSideSupabaseAnonClient } from "@/app/lib/ss-supabase-anon-client";
import { Webhooks } from "@polar-sh/nextjs";

export const runtime = "nodejs";

// ---------------------------------------------------------------------------
// Checkout Webhook Handler
// ---------------------------------------------------------------------------

export const POST = Webhooks({
     webhookSecret: process.env.POLAR_WEBHOOK_SECRET_SANDBOX_CHECKOUT!,

     onCheckoutCreated: async (payload) => {
          const t0 = Date.now();
          console.log('Checkout created webhook received:', JSON.stringify(payload, null, 2));
          const supabase = await useServerSideSupabaseAnonClient();
          try {
               // Extract and structure checkout data
               const checkoutData = {
                    id: payload.data.id,
                    created_at: payload.data.createdAt,
                    modified_at: payload.data.modifiedAt,
                    payment_processor: payload.data.paymentProcessor,
                    status: payload.data.status,
                    client_secret: payload.data.clientSecret,
                    url: payload.data.url,
                    expires_at: payload.data.expiresAt,
                    success_url: payload.data.successUrl,
                    embed_origin: payload.data.embedOrigin,
                    amount: payload.data.amount,
                    tax_amount: payload.data.taxAmount,
                    currency: payload.data.currency,
                    total_amount: payload.data.totalAmount,
                    product_id: payload.data.productId,
                    discount_id: payload.data.discountId,
                    allow_discount_codes: payload.data.allowDiscountCodes,
                    is_discount_applicable: payload.data.isDiscountApplicable,
                    is_free_product_price: payload.data.isFreeProductPrice,
                    is_payment_required: payload.data.isPaymentRequired,
                    is_payment_setup_required: payload.data.isPaymentSetupRequired,
                    is_payment_form_required: payload.data.isPaymentFormRequired,
                    customer_id: payload.data.customerId,
                    customer_name: payload.data.customerName,
                    customer_email: payload.data.customerEmail,
                    customer_ip_address: payload.data.customerIpAddress,
                    customer_billing_address: payload.data.customerBillingAddress,
                    customer_tax_id: payload.data.customerTaxId,
                    payment_processor_metadata: payload.data.paymentProcessorMetadata,
                    metadata: payload.data.metadata,
                    product: payload.data.product,
                    product_price: payload.data.productPrice,
                    discount: payload.data.discount,
                    subscription_id: payload.data.subscriptionId,
                    attached_custom_fields: payload.data.attachedCustomFields,
                    customer_metadata: payload.data.customerMetadata,
               };

               console.log('Structured checkout data:', JSON.stringify(checkoutData, null, 2));

               // Upsert checkout data to database
               const { data, error: upsertError } = await supabase
                    .from("tblPolarCheckout")
                    .upsert(checkoutData, { onConflict: "id" })
                    .select();

               console.log('Upsert result:', { data, error: upsertError });

               if (upsertError) {
                    console.error('Upsert error details:', JSON.stringify(upsertError, null, 2));
                    throw upsertError;
               }

               await logServerAction({
                    user_id: payload.data.customerId || null,
                    action: "Store Webhook - checkout.created success",
                    payload: { checkout_id: payload.data.id },
                    status: "success",
                    error: "",
                    duration_ms: Date.now() - t0,
                    type: "webhook",
               });

          } catch (e: any) {
               console.error('Checkout created error:', e);
               const err = e instanceof Error ? e : new Error(e?.message ?? JSON.stringify(e) ?? "unknown error");
               await logServerAction({
                    user_id: null,
                    action: "Store Webhook - checkout.created failed",
                    payload: { type: payload.type, error: err.message },
                    status: "fail",
                    error: err.message,
                    duration_ms: Date.now() - t0,
                    type: "webhook",
               });
               throw err;
          }
     },

     onCheckoutUpdated: async (payload) => {
          const t0 = Date.now();
          console.log('Checkout updated webhook received:', JSON.stringify(payload, null, 2));
          const supabase = await useServerSideSupabaseAnonClient();
          try {
               // Extract and structure checkout data
               const checkoutData = {
                    id: payload.data.id,
                    created_at: payload.data.createdAt,
                    modified_at: payload.data.modifiedAt,
                    payment_processor: payload.data.paymentProcessor,
                    status: payload.data.status,
                    client_secret: payload.data.clientSecret,
                    url: payload.data.url,
                    expires_at: payload.data.expiresAt,
                    success_url: payload.data.successUrl,
                    embed_origin: payload.data.embedOrigin,
                    amount: payload.data.amount,
                    tax_amount: payload.data.taxAmount,
                    currency: payload.data.currency,
                    total_amount: payload.data.totalAmount,
                    product_id: payload.data.productId,
                    discount_id: payload.data.discountId,
                    allow_discount_codes: payload.data.allowDiscountCodes,
                    is_discount_applicable: payload.data.isDiscountApplicable,
                    is_free_product_price: payload.data.isFreeProductPrice,
                    is_payment_required: payload.data.isPaymentRequired,
                    is_payment_setup_required: payload.data.isPaymentSetupRequired,
                    is_payment_form_required: payload.data.isPaymentFormRequired,
                    customer_id: payload.data.customerId,
                    customer_name: payload.data.customerName,
                    customer_email: payload.data.customerEmail,
                    customer_ip_address: payload.data.customerIpAddress,
                    customer_billing_address: payload.data.customerBillingAddress,
                    customer_tax_id: payload.data.customerTaxId,
                    payment_processor_metadata: payload.data.paymentProcessorMetadata,
                    metadata: payload.data.metadata,
                    product: payload.data.product,
                    discount: payload.data.discount,
                    subscription_id: payload.data.subscriptionId,
                    attached_custom_fields: payload.data.attachedCustomFields,
                    customer_metadata: payload.data.customerMetadata,
               };

               console.log('Structured checkout data:', JSON.stringify(checkoutData, null, 2));

               // Upsert checkout data to database
               const { data, error: upsertError } = await supabase
                    .from("tblPolarCheckout")
                    .upsert(checkoutData, { onConflict: "id" })
                    .select();

               console.log('Upsert result:', { data, error: upsertError });

               if (upsertError) {
                    console.error('Upsert error details:', JSON.stringify(upsertError, null, 2));
                    throw upsertError;
               }

               await logServerAction({
                    user_id: payload.data.customerId || null,
                    action: "Store Webhook - checkout.updated success",
                    payload: { checkout_id: payload.data.id },
                    status: "success",
                    error: "",
                    duration_ms: Date.now() - t0,
                    type: "webhook",
               });

          } catch (e: any) {
               console.error('Checkout updated error:', e);
               const err = e instanceof Error ? e : new Error(e?.message ?? JSON.stringify(e) ?? "unknown error");
               await logServerAction({
                    user_id: null,
                    action: "Store Webhook - checkout.updated failed",
                    payload: { type: payload.type, error: err.message },
                    status: "fail",
                    error: err.message,
                    duration_ms: Date.now() - t0,
                    type: "webhook",
               });
               throw err;
          }
     }
});
