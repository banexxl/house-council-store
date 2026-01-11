// app/api/polar/webhook/order/route.ts
import { logServerAction } from "@/app/lib/server-logging";
import { useServerSideSupabaseAnonClient } from "@/app/lib/ss-supabase-anon-client";
import { PolarOrder } from "@/app/types/polar-order-types";
import { Webhooks } from "@polar-sh/nextjs";

export const runtime = "nodejs";

// ---------------------------------------------------------------------------
// Helper Functions
// ---------------------------------------------------------------------------

function convertOrderToPolarOrder(order: any): PolarOrder {
     return {
          id: order.id,
          createdAt: order.createdAt instanceof Date ? order.createdAt.toISOString() : order.createdAt,
          modifiedAt: order.modifiedAt instanceof Date ? order.modifiedAt.toISOString() : order.modifiedAt,
          status: order.status,
          paid: order.paid ?? false,
          subtotalAmount: order.subtotalAmount ?? order.subtotal_amount ?? 0,
          discountAmount: order.discountAmount ?? order.discount_amount ?? 0,
          netAmount: order.netAmount ?? order.net_amount ?? 0,
          taxAmount: order.taxAmount ?? order.tax_amount ?? 0,
          totalAmount: order.totalAmount ?? order.total_amount ?? 0,
          appliedBalanceAmount: order.appliedBalanceAmount ?? order.applied_balance_amount ?? 0,
          dueAmount: order.dueAmount ?? order.due_amount ?? 0,
          refundedAmount: order.refundedAmount ?? order.refunded_amount ?? 0,
          refundedTaxAmount: order.refundedTaxAmount ?? order.refunded_tax_amount ?? 0,
          currency: order.currency || "USD",
          billingReason: order.billingReason ?? order.billing_reason ?? "",
          billingName: order.billingName ?? order.billing_name ?? "",
          billingAddress: order.billingAddress ?? order.billing_address ?? {
               country: "",
               line1: "",
               line2: "",
               postalCode: "",
               city: "",
               state: ""
          },
          invoiceNumber: order.invoiceNumber ?? order.invoice_number ?? "",
          isInvoiceGenerated: order.isInvoiceGenerated ?? order.is_invoice_generated ?? false,
          customerId: order.customerId ?? order.customer_id ?? "",
          productId: order.productId ?? order.product_id ?? "",
          discountId: order.discountId ?? order.discount_id ?? null,
          subscriptionId: order.subscriptionId ?? order.subscription_id ?? null,
          checkoutId: order.checkoutId ?? order.checkout_id ?? null,
          metadata: order.metadata ?? {},
          platformFeeAmount: order.platformFeeAmount ?? order.platform_fee_amount ?? 0,
          customer: order.customer,
          userId: order.userId ?? order.user_id ?? null,
          product: order.product,
          discount: order.discount ?? null,
          subscription: order.subscription ?? null,
          items: order.items ?? [],
          description: order.description ?? "",
          seats: order.seats ?? 0,
          customFieldData: order.customFieldData ?? order.custom_field_data ?? {},
     };
}

async function upsertOrder(order: PolarOrder, eventType: string) {
     const t0 = Date.now();

     const orderData = {
          id: order.id,
          createdAt: order.createdAt,
          modifiedAt: order.modifiedAt,
          status: order.status,
          paid: order.paid,
          subtotalAmount: order.subtotalAmount,
          discountAmount: order.discountAmount,
          netAmount: order.netAmount,
          taxAmount: order.taxAmount,
          totalAmount: order.totalAmount,
          appliedBalanceAmount: order.appliedBalanceAmount,
          dueAmount: order.dueAmount,
          refundedAmount: order.refundedAmount,
          refundedTaxAmount: order.refundedTaxAmount,
          currency: order.currency,
          billingReason: order.billingReason,
          billingName: order.billingName,
          billingAddress: order.billingAddress,
          invoiceNumber: order.invoiceNumber,
          isInvoiceGenerated: order.isInvoiceGenerated,
          customerId: order.customerId,
          productId: order.productId,
          discountId: order.discountId,
          subscriptionId: order.subscriptionId,
          checkoutId: order.checkoutId,
          metadata: order.metadata,
          platformFeeAmount: order.platformFeeAmount,
          userId: order.userId,
          description: order.description,
          seats: order.seats,
          customFieldData: order.customFieldData,
     };

     const supabase = await useServerSideSupabaseAnonClient();

     const { data, error } = await supabase
          .from("tblPolarOrders")
          .upsert(orderData, { onConflict: "id" })
          .select()
          .single();

     const duration = Date.now() - t0;

     await logServerAction({
          user_id: order.customerId,
          action: `${eventType} - Upsert Order`,
          payload: orderData,
          status: error ? "fail" : "success",
          error: error?.message || "",
          duration_ms: duration,
          type: "webhook",
     });

     if (error) {
          console.error(`Error upserting order for ${eventType}:`, error);
          throw error;
     }

     return data;
}

// ---------------------------------------------------------------------------
// Order Webhook Handler
// ---------------------------------------------------------------------------

export const POST = Webhooks({
     webhookSecret: process.env.POLAR_WEBHOOK_SECRET_SANDBOX_ORDER!,

     onOrderCreated: async (payload) => {
          const eventType = "order.created";
          console.log(`${eventType} webhook received:`, payload);

          try {
               const order = convertOrderToPolarOrder(payload.data);
               await upsertOrder(order, eventType);
               console.log(`${eventType} processed successfully for order:`, order.id);
          } catch (error) {
               console.error(`Error processing ${eventType}:`, error);
               throw error;
          }
     },

     onOrderUpdated: async (payload) => {
          const eventType = "order.updated";
          console.log(`${eventType} webhook received:`, payload);

          try {
               const order = convertOrderToPolarOrder(payload.data);
               await upsertOrder(order, eventType);
               console.log(`${eventType} processed successfully for order:`, order.id);
          } catch (error) {
               console.error(`Error processing ${eventType}:`, error);
               throw error;
          }
     },

     onOrderPaid: async (payload) => {
          const eventType = "order.paid";
          console.log(`${eventType} webhook received:`, payload);

          try {
               const order = convertOrderToPolarOrder(payload.data);
               await upsertOrder(order, eventType);
               console.log(`${eventType} processed successfully for order:`, order.id);
          } catch (error) {
               console.error(`Error processing ${eventType}:`, error);
               throw error;
          }
     },
});
