export type PolarSubscriptionEventType =
     | "subscription.created"
     | "subscription.updated"
     | "subscription.active"
     | "subscription.canceled"
     | "subscription.uncanceled"
     | "subscription.revoked"
     | "subscription.past_due";

export type PolarSubscriptionEvent =
     | PolarSubscriptionCreatedEvent
     | PolarSubscriptionUpdatedEvent
     | PolarSubscriptionActiveEvent
     | PolarSubscriptionCanceledEvent
     | PolarSubscriptionUncanceledEvent
     | PolarSubscriptionRevokedEvent
     | PolarSubscriptionPastDueEvent;

export interface PolarSubscriptionEventBase<TType extends PolarSubscriptionEventType> {
     type: TType;
     timestamp: string;
     data: PolarSubscription;
}

export interface PolarSubscriptionCreatedEvent extends PolarSubscriptionEventBase<"subscription.created"> { }
export interface PolarSubscriptionUpdatedEvent extends PolarSubscriptionEventBase<"subscription.updated"> { }
export interface PolarSubscriptionActiveEvent extends PolarSubscriptionEventBase<"subscription.active"> { }
export interface PolarSubscriptionCanceledEvent extends PolarSubscriptionEventBase<"subscription.canceled"> { }
export interface PolarSubscriptionUncanceledEvent extends PolarSubscriptionEventBase<"subscription.uncanceled"> { }
export interface PolarSubscriptionRevokedEvent extends PolarSubscriptionEventBase<"subscription.revoked"> { }
export interface PolarSubscriptionPastDueEvent extends PolarSubscriptionEventBase<"subscription.past_due"> { }

export interface PolarSubscription {
     id: string;
     created_at: string;
     modified_at: string;
     metadata: Record<string, unknown>;
     amount: number;
     currency: string;
     recurring_interval: string;
     recurring_interval_count: number;
     status: PolarSubscriptionStatus;
     current_period_start: string;
     current_period_end: string;
     trial_start: string | null;
     trial_end: string | null;
     cancel_at_period_end: boolean;
     canceled_at: string | null;
     started_at: string;
     ends_at: string | null;
     ended_at: string | null;
     customer_id: string;
     product_id: string;
     discount_id: string | null;
     checkout_id: string | null;
     customer_cancellation_reason: string | null;
     customer_cancellation_comment: string | null;
     discount: PolarSubscriptionDiscount | null;
     customer: PolarSubscriptionCustomer;
     product: PolarSubscriptionProduct;
     prices: PolarSubscriptionPrice[];
     meters: PolarSubscriptionMeter[];
     seats: number;
     custom_field_data: Record<string, unknown>;
}

export type PolarSubscriptionStatus =
     | "incomplete"
     | "incomplete_expired"
     | "trialing"
     | "active"
     | "past_due"
     | "canceled"
     | "unpaid";

export interface PolarSubscriptionCustomer {
     id: string;
     created_at: string;
     modified_at: string;
     metadata: Record<string, unknown>;
     external_id: string;
     email: string;
     email_verified: boolean;
     name: string;
     billing_address: PolarSubscriptionCustomerAddress;
     tax_id: string[];
     organization_id: string;
     deleted_at: string | null;
     avatar_url: string | null;
}

export interface PolarSubscriptionCustomerAddress {
     country: string;
     line1: string;
     line2: string;
     postal_code: string;
     city: string;
     state: string;
}

export interface PolarSubscriptionProduct {
     id: string;
     created_at: string;
     modified_at: string;
     trial_interval: string;
     trial_interval_count: number;
     name: string;
     description: string;
     recurring_interval: string;
     recurring_interval_count: number;
     is_recurring: boolean;
     is_archived: boolean;
     organization_id: string;
     metadata: Record<string, unknown>;
     prices: PolarSubscriptionPrice[];
     benefits: PolarSubscriptionProductBenefit[];
     medias: PolarSubscriptionProductMedia[];
     attached_custom_fields: PolarSubscriptionProductAttachedCustomField[];
}

export interface PolarSubscriptionProductBenefit {
     id: string;
     created_at: string;
     modified_at: string;
     type: string;
     description: string;
     selectable: boolean;
     deletable: boolean;
     organization_id: string;
     metadata: Record<string, unknown>;
     properties: Record<string, unknown>;
}

export interface PolarSubscriptionProductMedia {
     id: string;
     organization_id: string;
     name: string;
     path: string;
     mime_type: string;
     size: number;
     storage_version: string;
     checksum_etag: string;
     checksum_sha256_base64: string;
     checksum_sha256_hex: string;
     last_modified_at: string;
     version: string;
     service: string;
     is_uploaded: boolean;
     created_at: string;
     size_readable: string;
     public_url: string;
}

export interface PolarSubscriptionProductAttachedCustomField {
     custom_field_id: string;
     custom_field: PolarSubscriptionCustomField;
     order: number;
     required: boolean;
}

export interface PolarSubscriptionCustomField {
     created_at: string;
     modified_at: string;
     id: string;
     metadata: Record<string, unknown>;
     type: string;
     slug: string;
     name: string;
     organization_id: string;
     properties: PolarSubscriptionCustomFieldProperties;
}

export interface PolarSubscriptionCustomFieldProperties {
     form_label: string;
     form_help_text: string;
     form_placeholder: string;
     textarea: boolean;
     min_length: number;
     max_length: number;
}

export interface PolarSubscriptionDiscount {
     duration: string;
     type: string;
     amount: number;
     currency: string;
     created_at: string;
     modified_at: string;
     id: string;
     metadata: Record<string, unknown>;
     name: string;
     code: string;
     starts_at: string;
     ends_at: string;
     max_redemptions: number;
     redemptions_count: number;
     organization_id: string;
}

export interface PolarSubscriptionPrice {
     created_at: string;
     modified_at: string;
     id: string;
     source: string;
     amount_type: string;
     is_archived: boolean;
     product_id: string;
     type: string;
     recurring_interval: string;
     price_currency: string;
     price_amount: number;
     legacy: boolean;
}

export interface PolarSubscriptionMeter {
     created_at: string;
     modified_at: string;
     id: string;
     consumed_units: number;
     credited_units: number;
     amount: number;
     meter_id: string;
     meter: PolarSubscriptionMeterDefinition;
}

export interface PolarSubscriptionMeterDefinition {
     metadata: Record<string, unknown>;
     created_at: string;
     modified_at: string;
     id: string;
     name: string;
     filter: PolarSubscriptionMeterFilter;
     aggregation: PolarSubscriptionMeterAggregation;
     organization_id: string;
     archived_at: string | null;
}

export interface PolarSubscriptionMeterFilter {
     conjunction: string;
     clauses: PolarSubscriptionMeterFilterClause[];
}

export interface PolarSubscriptionMeterFilterClause {
     property: string;
     operator: string;
     value: string | number | boolean | null;
}

export interface PolarSubscriptionMeterAggregation {
     func: string;
}
