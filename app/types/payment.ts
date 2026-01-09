import * as Yup from 'yup';
import type { PolarOrder } from './polar-order-types';

export type InvoiceStatus =
     | 'processing'
     | 'failed'
     | 'chargeback'
     | 'succeeded'
     | 'pending'
     | 'refunded'
     | 'cancelled'
     | 'disputed';

export interface Invoice {
     id?: string;
     created_at: string;
     updated_at: string;
     total_paid: number;
     invoice_number: string;
     subscription_plan?: string | null;
     client: string;
     billing_information?: string | null;
     status: InvoiceStatus;
     currency: string;
     refunded_at?: string | null;
     is_recurring: boolean;
     tax_percentage: number;
     notes?: string | null;
     invoice_url?: string | null;
     polar_order_id?: string | null;
     polar_order_status?: string | null;
     polar_order_payload?: Record<string, unknown> | PolarOrder | null;
     metadata?: Record<string, unknown>;
}

export const invoiceInitialValues: Invoice = {
     id: '',
     created_at: new Date().toISOString(),
     updated_at: new Date().toISOString(),
     total_paid: 0,
     invoice_number: '',
     subscription_plan: '',
     client: '',
     billing_information: '',
     status: 'pending',
     currency: '',
     refunded_at: null,
     is_recurring: true,
     tax_percentage: 18,
     notes: '',
     invoice_url: '',
     polar_order_id: null,
     polar_order_status: null,
     polar_order_payload: null,
     metadata: {},
};

export const invoiceSchema = Yup.object().shape({
     created_at: Yup.string().required('Created at is required'),
     updated_at: Yup.string().required('Updated at is required'),
     total_paid: Yup.number().required('Total paid is required'),
     invoice_number: Yup.string().required('Invoice number is required'),
     subscription_plan: Yup.string().required('Subscription plan is required'),
     client: Yup.string().nullable().required('Client is required'),
     billing_information: Yup.string().required('Billing information is required'),
     status: Yup.string().oneOf(['processing', 'failed', 'chargeback', 'succeeded', 'pending', 'refunded', 'cancelled', 'disputed']).required('Invoice status is required'),
     currency: Yup.string().required('Currency is required'),
     refunded_at: Yup.string().nullable(),
     is_recurring: Yup.boolean(),
     tax_percentage: Yup.number().required('Tax percentage is required').min(0, 'Tax percentage cannot be negative').max(100, 'Tax percentage cannot exceed 100'),
});

export type Payment = Invoice;
export const paymentInitialValues = invoiceInitialValues;
export const paymentSchema = invoiceSchema;

const ORDER_EVENT_STATUS_OVERRIDE: Record<string, InvoiceStatus> = {
     'order.created': 'pending',
     'order.updated': 'pending',
     'order.paid': 'succeeded',
     'order.refunded': 'refunded',
};

const ORDER_STATUS_FALLBACK: Record<string, InvoiceStatus> = {
     paid: 'succeeded',
     succeeded: 'succeeded',
     refunded: 'refunded',
     canceled: 'cancelled',
     cancelled: 'cancelled',
     open: 'pending',
     draft: 'processing',
     pending: 'pending',
     uncollectible: 'failed',
     failed: 'failed',
};

const MINOR_UNIT_DIVISOR = 100;

const toMajorCurrency = (amount?: number | null): number => {
     if (typeof amount !== 'number' || Number.isNaN(amount)) return 0;
     return Math.round(amount) / MINOR_UNIT_DIVISOR;
};

const deriveNetPaidAmount = (order: PolarOrder): number => {
     const total = typeof order.total_amount === 'number' ? order.total_amount : 0;
     const due = typeof order.due_amount === 'number' ? order.due_amount : 0;
     const refunded = typeof order.refunded_amount === 'number' ? order.refunded_amount : 0;
     const collected = Math.max(0, total - due);
     const net = Math.max(0, collected - refunded);
     return toMajorCurrency(net);
};

const deriveInvoiceStatus = (eventType: string, order: PolarOrder): InvoiceStatus => {
     const override = ORDER_EVENT_STATUS_OVERRIDE[eventType];
     if (override) return override;
     if (order.paid) return 'succeeded';
     const key = order.status?.toLowerCase();
     if (key && ORDER_STATUS_FALLBACK[key]) {
          return ORDER_STATUS_FALLBACK[key];
     }
     return 'processing';
};

const deriveTaxPercentage = (order: PolarOrder): number => {
     const taxableBase = Math.max(0, (order.subtotal_amount ?? 0) - (order.discount_amount ?? 0));
     if (!taxableBase) return 0;
     const ratio = (order.tax_amount ?? 0) / taxableBase;
     if (!Number.isFinite(ratio)) return 0;
     return Math.max(0, Math.round(ratio * 10000) / 100);
};

const ensureString = (value: unknown, fallback: string): string =>
     typeof value === 'string' && value.length > 0 ? value : fallback;

interface BuildInvoiceRecordArgs {
     eventType: string;
     order: PolarOrder;
     clientId: string;
     subscriptionPlanId?: string | null;
     currencyId: string;
     billingInformationId?: string | null;
     nowIso?: () => string;
}

export type InvoiceUpsertPayload = Omit<Invoice, 'id'>;

export function buildInvoiceUpsertPayloadFromOrder({
     eventType,
     order,
     clientId,
     subscriptionPlanId,
     currencyId,
     billingInformationId,
     nowIso = () => new Date().toISOString(),
}: BuildInvoiceRecordArgs): InvoiceUpsertPayload {
     const createdAt = ensureString(order.created_at, nowIso());
     const updatedAt = ensureString(order.modified_at, createdAt);
     const invoiceNumber = ensureString(order.invoice_number, `polar-${order.id}`);

     const payload: InvoiceUpsertPayload = {
          client: clientId,
          invoice_number: invoiceNumber,
          status: deriveInvoiceStatus(eventType, order),
          total_paid: deriveNetPaidAmount(order),
          created_at: createdAt,
          updated_at: updatedAt,
          is_recurring: Boolean(order.subscription_id),
          tax_percentage: deriveTaxPercentage(order),
          notes: order.billing_reason ?? order.description ?? `Polar order ${order.id}`,
          currency: currencyId,
          polar_order_id: order.id,
          polar_order_status: order.status ?? null,
          polar_order_payload: order,
          metadata: order.metadata ?? {},
          refunded_at: null,
     };

     if (subscriptionPlanId) {
          payload.subscription_plan = subscriptionPlanId;
     }

     if (billingInformationId) {
          payload.billing_information = billingInformationId;
     }

     if (eventType === 'order.refunded' && (order.refunded_amount ?? 0) > 0) {
          payload.refunded_at = ensureString(order.modified_at, nowIso());
     }

     return payload;
}
