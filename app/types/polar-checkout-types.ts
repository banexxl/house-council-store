export interface CheckoutCreated {
     type: "checkout.created";
     timestamp: string;
     data: CheckoutData;
}

export interface CheckoutUpdated {
     type: "checkout.updated";
     timestamp: string;
     data: CheckoutData;
}

export interface CustomerSeatAssigned {
     type: "customer_seat.assigned";
     timestamp: string;
     data: CustomerSeatAssignment;
}

export interface CustomerSeatClaimed {
     type: "customer_seat.claimed";
     timestamp: string;
     data: CustomerSeatAssignment;
}

export interface CustomerSeatRevoked {
     type: "customer_seat.revoked";
     timestamp: string;
     data: CustomerSeatAssignment;
}

export interface CustomerSeatAssignment {
     created_at: string;
     modified_at: string;
     id: string;
     status: string;
     subscription_id: string;
     order_id: string;
     customer_id: string;
     customer_email: string;
     invitation_token_expires_at: string | null;
     claimed_at: string | null;
     revoked_at: string | null;
     seat_metadata: Record<string, unknown>;
}

export interface CheckoutData {
     id: string;
     created_at: string;
     modified_at: string;
     payment_processor: string;
     status: string;
     client_secret: string;
     url: string;
     expires_at: string;
     success_url: string;
     return_url: string;
     embed_origin: string;
     amount: number;
     discount_amount: number;
     net_amount: number;
     tax_amount: number;
     total_amount: number;
     currency: string;
     allow_trial: boolean;
     active_trial_interval: string;
     active_trial_interval_count: number;
     trial_end: string;
     organization_id: string;
     product_id: string;
     product_price_id: string;
     discount_id: string;
     allow_discount_codes: boolean;
     require_billing_address: boolean;
     is_discount_applicable: boolean;
     is_free_product_price: boolean;
     is_payment_required: boolean;
     is_payment_setup_required: boolean;
     is_payment_form_required: boolean;
     customer_id: string;
     is_business_customer: boolean;
     customer_name: string;
     customer_email: string;
     customer_ip_address: string;
     customer_billing_name: string;
     customer_billing_address: CustomerBillingAddress;
     customer_tax_id: string;
     payment_processor_metadata: Record<string, unknown>;
     billing_address_fields: BillingAddressFields;
     trial_interval: string;
     trial_interval_count: number;
     metadata: Record<string, unknown>;
     external_customer_id: string;
     customer_external_id: string;
     products: CheckoutProduct[];
     product: CheckoutProduct;
     product_price: CheckoutPrice;
     prices: Record<string, unknown>;
     discount: CheckoutDiscount;
     subscription_id: string;
     attached_custom_fields: CheckoutAttachedCustomField[];
     customer_metadata: Record<string, unknown>;
     custom_field_data: Record<string, unknown>;
     seats: number;
     price_per_seat: number;
}

export interface CustomerBillingAddress {
     country: string;
     line1: string;
     line2: string;
     postal_code: string;
     city: string;
     state: string;
}

export interface BillingAddressFields {
     country: string;
     state: string;
     city: string;
     postal_code: string;
     line1: string;
     line2: string;
}

export interface CheckoutProduct {
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
     prices: CheckoutPrice[];
     benefits: CheckoutBenefit[];
     medias: CheckoutMedia[];
}

export interface CheckoutPrice {
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

export interface CheckoutBenefit {
     id: string;
     created_at: string;
     modified_at: string;
     type: string;
     description: string;
     selectable: boolean;
     deletable: boolean;
     organization_id: string;
}

export interface CheckoutMedia {
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

export interface CheckoutDiscount {
     duration: string;
     type: string;
     amount: number;
     currency: string;
     id: string;
     name: string;
     code: string;
}

export interface CheckoutAttachedCustomField {
     custom_field_id: string;
     custom_field: CheckoutCustomField;
     order: number;
     required: boolean;
}

export interface CheckoutCustomField {
     created_at: string;
     modified_at: string;
     id: string;
     metadata: Record<string, unknown>;
     type: string;
     slug: string;
     name: string;
     organization_id: string;
     properties: CheckoutCustomFieldProperties;
}

export interface CheckoutCustomFieldProperties {
     form_label: string;
     form_help_text: string;
     form_placeholder: string;
     textarea: boolean;
     min_length: number;
     max_length: number;
}
