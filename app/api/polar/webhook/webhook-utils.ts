// app/api/polar/webhook/webhook-utils.ts
import { logServerAction } from "@/app/lib/server-logging";
import { getApartmentCountForClient } from "@/app/profile/subscription-plan-actions";
import { PolarSubscription, PolarSubscriptionStatus } from "@/app/types/polar-subscription-types";
import type { PolarOrder } from "@/app/types/polar-order-types";
import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";

// ✅ Use SERVICE ROLE for webhooks (bypasses RLS). Never use anon key here.
export const supabase = createClient(
     process.env.NEXT_PUBLIC_SUPABASE_URL!,
     process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ---------------------------------------------------------------------------
// Utility Functions
// ---------------------------------------------------------------------------

/**
 * Converts a camelCase string to snake_case
 */
function toSnakeCase(str: string): string {
     return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
}

/**
 * Recursively converts all keys in an object from camelCase to snake_case.
 * Handles nested objects and arrays. Preserves null values and special types.
 * 
 * @param obj - The object to convert (can be any payload from Polar SDK)
 * @returns The same object structure with all keys converted to snake_case
 * 
 * @example
 * const camelCase = { userId: "123", createdAt: "2024-01-01", orderData: { customerId: "456" } };
 * const snakeCase = convertToSnakeCase(camelCase);
 * // Result: { user_id: "123", created_at: "2024-01-01", order_data: { customer_id: "456" } }
 */
export function convertToSnakeCase<T = any>(obj: T): any {
     if (obj === null || obj === undefined) {
          return obj;
     }

     // Handle arrays
     if (Array.isArray(obj)) {
          return obj.map(item => convertToSnakeCase(item));
     }

     // Handle Date objects - preserve as-is
     if (obj instanceof Date) {
          return obj.toISOString();
     }

     // Handle primitive types
     if (typeof obj !== 'object') {
          return obj;
     }

     // Handle objects
     const result: Record<string, any> = {};
     for (const [key, value] of Object.entries(obj)) {
          const snakeKey = toSnakeCase(key);
          result[snakeKey] = convertToSnakeCase(value);
     }

     return result;
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type SubscriptionRecordPatch = PolarSubscription;

const SUBSCRIPTION_STATUS_VALUES: PolarSubscriptionStatus[] = [
     "incomplete",
     "incomplete_expired",
     "trialing",
     "active",
     "past_due",
     "canceled",
     "unpaid",
];

const SUBSCRIPTION_STATUS_SET = new Set(SUBSCRIPTION_STATUS_VALUES);
const SUBSCRIPTION_INTERVAL_VALUES: PolarSubscription["recurring_interval"][] = ["day", "week", "month", "year"];
const SUBSCRIPTION_INTERVAL_SET = new Set(SUBSCRIPTION_INTERVAL_VALUES);

const isRecord = (value: unknown): value is Record<string, unknown> =>
     typeof value === "object" && value !== null && !Array.isArray(value);

const ensureString = (value: unknown, fallback = ""): string =>
     typeof value === "string" && value.length > 0 ? value : fallback;

const ensureNullableString = (value: unknown): string | null =>
     typeof value === "string" && value.length > 0 ? value : null;

const ensureDateString = (value: unknown): string =>
     typeof value === "string" && value.length > 0 ? value : nowIso();

export const normalizeSubscriptionStatus = (value: unknown): PolarSubscriptionStatus => {
     if (typeof value === "string") {
          const lowered = value.toLowerCase() as PolarSubscriptionStatus;
          if (SUBSCRIPTION_STATUS_SET.has(lowered)) {
               return lowered;
          }
     }
     return "incomplete";
};

const normalizeInterval = (value: unknown): PolarSubscription["recurring_interval"] => {
     if (typeof value === "string") {
          const lowered = value.toLowerCase() as PolarSubscription["recurring_interval"];
          if (SUBSCRIPTION_INTERVAL_SET.has(lowered)) {
               return lowered;
          }
     }
     return "month";
};

const stringifyOrEmptyObject = (value: unknown): string => {
     try {
          return JSON.stringify(value ?? {});
     } catch {
          return "{}";
     }
};

interface BuildSubscriptionSnapshotArgs {
     client_id: string;
     subscription_id: string;
     apartments_count: number;
     data: any;
     statusOverride?: PolarSubscriptionStatus;
}

export function buildSubscriptionSnapshot({
     client_id,
     subscription_id,
     apartments_count,
     data,
     statusOverride,
}: BuildSubscriptionSnapshotArgs): SubscriptionRecordPatch {

     const pick = (...keys: string[]) => {
          for (const key of keys) {
               const value = data?.[key as keyof typeof data];
               if (value !== undefined) {
                    return value;
               }
          }
          return undefined;
     };

     const metadataValue = pick("metadata");
     const customFieldDataValue = pick("custom_field_data", "customFieldData");
     const pricesValue = pick("prices");
     const metersValue = pick("meters");
     const recurringIntervalCountValue = pick("recurring_interval_count", "recurringIntervalCount");
     const seatsValue = pick("seats");
     const amountValue = pick("amount", "Amount");
     const currencyValue = pick("currency", "Currency");

     const metadata = isRecord(metadataValue) ? metadataValue : {};
     const customFieldData = isRecord(customFieldDataValue) ? customFieldDataValue : {};
     const status = normalizeSubscriptionStatus(statusOverride ?? pick("status"));
     const subscriptionId = ensureString(pick("id"));
     const serializeArray = (items: unknown[]): string[] =>
          items.map((item) => (typeof item === "string" ? item : stringifyOrEmptyObject(item)));

     return {
          id: subscriptionId,
          client_id,
          subscription_id,
          polar_subscription_id: subscriptionId,
          created_at: ensureDateString(pick("createdAt", "created_at", "created")),
          updated_at: ensureDateString(pick("updatedAt", "updated_at", "updated")),
          apartment_count: typeof apartments_count === "number" ? Math.max(1, apartments_count) : 1,
          metadata,
          amount: typeof amountValue === "number" ? amountValue : 0,
          currency: ensureString((currencyValue as string | undefined) ?? "usd"),
          recurring_interval: normalizeInterval(pick("recurring_interval", "recurringInterval")),
          recurring_interval_count: typeof recurringIntervalCountValue === "number" ? recurringIntervalCountValue : 1,
          status,
          current_period_start: ensureDateString(pick("currentPeriodStart", "current_period_start")),
          current_period_end: ensureDateString(pick("currentPeriodEnd", "current_period_end", "currentPeriodEnd")),
          trial_start: ensureNullableString(pick("trial_start", "trialStart")),
          trial_end: ensureNullableString(pick("trial_end", "trialEnd")),
          cancel_at_period_end: Boolean(pick("cancel_at_period_end", "cancelAtPeriodEnd")),
          canceled_at: ensureNullableString(pick("canceled_at", "canceledAt")),
          started_at: ensureDateString(pick("startedAt", "started_at", "started")),
          ends_at: ensureNullableString(pick("ends_at", "endsAt")),
          ended_at: ensureNullableString(pick("ended_at", "endedAt")),
          customer_id: ensureString((pick("customer_id", "customerId") as string | undefined) ?? ""),
          product_id: ensureString((pick("product_id", "productId") as string | undefined) ?? ""),
          discount_id: ensureNullableString(pick("discount_id", "discountId")),
          checkout_id: ensureNullableString(pick("checkout_id", "checkoutId")),
          customer_cancellation_reason: ensureNullableString(pick("customer_cancellation_reason", "customerCancellationReason")),
          customer_cancellation_comment: ensureNullableString(pick("customer_cancellation_comment", "customerCancellationComment")),
          prices: Array.isArray(pricesValue) ? serializeArray(pricesValue) : [],
          meters: Array.isArray(metersValue) ? serializeArray(metersValue) : [],
          seats: typeof seatsValue === "number" ? seatsValue : 0,
          custom_field_data: customFieldData,
     };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function nowIso() {
     return new Date().toISOString();
}

export function extractMeta(payloadData: any) {
     const meta = payloadData?.data?.metadata
     const subscription_id = meta?.subscription_id
     const client_id = meta?.client_id
     const apartment_count = meta?.apartment_count
     return {
          client_id,
          subscription_id,
          apartment_count: typeof apartment_count === "number" ? apartment_count : undefined,
     };
}

interface InvoiceUpsertArgs {
     order: PolarOrder;
     client_id: string;
     subscription_id: string | null;
}

export async function upsertInvoiceFromOrder({ order, client_id, subscription_id }: InvoiceUpsertArgs): Promise<void> {
     function isDateTimeKey(key: string) {
          // Matches snake_case or camelCase datetime fields
          return /(_at|At|_date|Date|_time|Time)$/.test(key);
     }

     function sanitizeDateTimes(obj: any): any {
          if (Array.isArray(obj)) {
               return obj.map(sanitizeDateTimes);
          } else if (obj && typeof obj === 'object') {
               const result: Record<string, unknown> = {};
               for (const [k, v] of Object.entries(obj)) {
                    // Drop platform fee currency so we don't try to upsert a non-existent column
                    if (k === 'platform_fee_currency' || k === 'platformFeeCurrency') continue;

                    if (isDateTimeKey(k)) {
                         // Preserve real Date objects as ISO strings; keep non-empty strings as-is
                         if (v instanceof Date) {
                              result[k] = v.toISOString();
                         } else if (typeof v === 'string' && v.length > 0) {
                              result[k] = v;
                         } else if (v === null) {
                              result[k] = null;
                         } else {
                              // Unknown/empty datetime-like value -> store as null
                              result[k] = null;
                         }
                    } else {
                         result[k] = sanitizeDateTimes(v);
                    }
               }
               return result;
          }
          return obj;
     }

     const cleanedOrder = sanitizeDateTimes(order);
     const record: Record<string, unknown> = {};
     for (const [key, value] of Object.entries(cleanedOrder)) {
          record[toSnakeCase(key)] = value;
     }
     record["client_id"] = client_id;
     if (subscription_id) {
          record["subscription_id"] = subscription_id;
     }
     console.log('Record for tblInvoice update', record);

     const { error, status, count } = await supabase
          .from("tblInvoices")
          .upsert(record, { onConflict: "id" });
     // If error or no rows affected, throw
     if (error || (typeof count === "number" && count === 0)) {
          throw new Error(`Failed to upsert invoice for order ${order.id}: ${error ? error.message : "No rows updated"}`);
     }
}

/**
 * If an event arrives without metadata, try to locate client/plan
 * by looking up saved Polar ids.
 */
export async function resolveClientFromPolarCustomerId(polar_customer_id: string): Promise<{ client_id: string; subscription_id: string | null } | null> {

     await logServerAction({
          user_id: null,
          action: "Store Webhook - Resolving client from Polar IDs",
          payload: { polar_customer_id },
          status: "success",
          error: "",
          duration_ms: 0,
          type: "internal",
     });

     if (polar_customer_id) {
          const { data } = await supabase
               .from("tblClient_Subscription")
               .select("client_id, subscription_id")
               .eq("customer_id", polar_customer_id)
               .maybeSingle<{ client_id: string; subscription_id: string | null }>();

          if (data?.client_id) return data;
     }

     return null;
}

export async function getSubscriptionPlanIdForClient(clientId: string): Promise<string | null> {
     const { data } = await supabase
          .from("tblClient_Subscription")
          .select("subscription_id")
          .eq("client_id", clientId)
          .maybeSingle<{ subscription_id: string | null }>();

     return data?.subscription_id ?? null;
}

type ClientSubscriptionPatch = Partial<PolarSubscription>;

export async function patchClientSubscription(clientId: string, patch: ClientSubscriptionPatch, updateType: string): Promise<void> {
     const update: Record<string, unknown> = { updated_at: nowIso() };

     for (const [k, v] of Object.entries(patch)) {
          if (v !== undefined) update[k] = v;
     }
     console.log(`Trying to patch (${updateType})`, { clientId, update });

     const { error } = await supabase
          .from("tblClient_Subscription")
          .update(update)
          .eq("client_id", clientId);

     if (error) {
          console.log('Error patching client subscription: ', error);
          throw new Error(`Failed to patch subscription for client ${clientId}: ${error.message}`);
     }
}

export async function ensureSubscriptionRow(
     subscriptionData: PolarSubscription
): Promise<void> {
     const upsertData: Record<string, unknown> = {
          client_id: subscriptionData.client_id,
          subscription_id: subscriptionData.subscription_id,
          polar_subscription_id: subscriptionData.polar_subscription_id,
          status: subscriptionData.status,
          apartment_count: subscriptionData.apartment_count,
          metadata: subscriptionData.metadata,
          amount: subscriptionData.amount,
          currency: subscriptionData.currency,
          recurring_interval: subscriptionData.recurring_interval,
          recurring_interval_count: subscriptionData.recurring_interval_count,
          current_period_start: subscriptionData.current_period_start,
          current_period_end: subscriptionData.current_period_end,
          trial_start: subscriptionData.trial_start,
          trial_end: subscriptionData.trial_end,
          cancel_at_period_end: subscriptionData.cancel_at_period_end,
          canceled_at: subscriptionData.canceled_at,
          started_at: subscriptionData.started_at,
          ends_at: subscriptionData.ends_at,
          ended_at: subscriptionData.ended_at,
          customer_id: subscriptionData.customer_id,
          product_id: subscriptionData.product_id,
          discount_id: subscriptionData.discount_id,
          checkout_id: subscriptionData.checkout_id,
          customer_cancellation_reason: subscriptionData.customer_cancellation_reason,
          customer_cancellation_comment: subscriptionData.customer_cancellation_comment,
          prices: subscriptionData.prices,
          meters: subscriptionData.meters,
          seats: subscriptionData.seats,
          custom_field_data: subscriptionData.custom_field_data,
          created_at: subscriptionData.created_at,
          updated_at: subscriptionData.updated_at,
     };

     if (subscriptionData.order_id) {
          upsertData.order_id = subscriptionData.order_id;
     }
     console.log('Upsert Client Subscripton Data', upsertData);

     const { error } = await supabase
          .from("tblClient_Subscription")
          .upsert(upsertData, { onConflict: "client_id" });

     if (error) throw error;
}

// customer.updated payload often has email; use it to resolve your DB client
export async function resolveClientIdByEmail(email?: string | null): Promise<string | null> {
     if (!email) return null;

     const { data, error } = await supabase
          .from("tblClients")
          .select("id")
          .eq("email", email)
          .maybeSingle();

     if (error) return null;
     return data?.id ?? null;
}

// Helper to revalidate profile page after webhook processing
export function revalidateProfile() {
     revalidatePath("/profile");
}
