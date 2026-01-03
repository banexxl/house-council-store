export type PolarProductEventType =
     | "product.created"
     | "product.updated";

export type PolarProductEvent =
     | PolarProductCreatedEvent
     | PolarProductUpdatedEvent;

export interface PolarProductEventBase<TType extends PolarProductEventType> {
     type: TType;
     timestamp: string;
     data: PolarProduct;
}

export interface PolarProductCreatedEvent extends PolarProductEventBase<"product.created"> { }
export interface PolarProductUpdatedEvent extends PolarProductEventBase<"product.updated"> { }

export type PolarProductInterval = "day" | "week" | "month" | "year";

export interface PolarProduct {
     id: string;
     created_at: string;
     modified_at: string;
     trial_interval: PolarProductInterval;
     trial_interval_count: number;
     name: string;
     description: string;
     recurring_interval: PolarProductInterval;
     recurring_interval_count: number;
     is_recurring: boolean;
     is_archived: boolean;
     organization_id: string;
     metadata: Record<string, unknown>;
     prices: PolarProductPrice[];
     benefits: PolarProductBenefit[];
     medias: PolarProductMedia[];
     attached_custom_fields: PolarProductAttachedCustomField[];
}

export interface PolarProductPrice {
     created_at: string;
     modified_at: string;
     id: string;
     source: string;
     amount_type: string;
     is_archived: boolean;
     product_id: string;
     type: string;
     recurring_interval: PolarProductInterval;
     price_currency: string;
     price_amount: number;
     legacy: boolean;
}

export interface PolarProductBenefit {
     id: string;
     created_at: string;
     modified_at: string;
     type: string;
     description: string;
     selectable: boolean;
     deletable: boolean;
     organization_id: string;
     metadata: Record<string, unknown>;
     properties: Record<string, string>;
}

export interface PolarProductMedia {
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

export interface PolarProductAttachedCustomField {
     custom_field_id: string;
     custom_field: PolarProductCustomField;
     order: number;
     required: boolean;
}

export interface PolarProductCustomField {
     created_at: string;
     modified_at: string;
     id: string;
     metadata: Record<string, unknown>;
     type: string;
     slug: string;
     name: string;
     organization_id: string;
     properties: PolarProductCustomFieldProperties;
}

export interface PolarProductCustomFieldProperties {
     form_label: string;
     form_help_text: string;
     form_placeholder: string;
     textarea: boolean;
     min_length: number;
     max_length: number;
}
