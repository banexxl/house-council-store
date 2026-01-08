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
     createdAt: string;
     modifiedAt: string;
     trialInterval: PolarProductInterval;
     trialIntervalCount: number;
     name: string;
     description: string;
     recurringInterval: PolarProductInterval;
     recurringIntervalCount: number;
     isRecurring: boolean;
     isArchived: boolean;
     organizationId: string;
     metadata: Record<string, unknown>;
     prices: PolarProductPrice[];
     benefits: PolarProductBenefit[];
     medias: PolarProductMedia[];
     attached_custom_fields: PolarProductAttachedCustomField[];
}

export interface PolarProductPrice {
     createdAt: string;
     modifiedAt: string;
     id: string;
     source: string;
     amountType: string;
     isArchived: boolean;
     productId: string;
     type: string;
     recurringInterval: PolarProductInterval;
     priceCurrency: string;
     priceAmount: number;
     legacy: boolean;
}

export interface PolarProductBenefit {
     id: string;
     createdAt: string;
     modifiedAt: string;
     type: string;
     description: string;
     selectable: boolean;
     deletable: boolean;
     organizationId: string;
     metadata: Record<string, unknown>;
     properties: Record<string, string>;
}

export interface PolarProductMedia {
     id: string;
     organizationId: string;
     name: string;
     path: string;
     mimeType: string;
     size: number;
     storageVersion: string;
     checksumEtag: string;
     checksumSha256Base64: string;
     checksumSha256Hex: string;
     lastModifiedAt: string;
     version: string;
     service: string;
     isUploaded: boolean;
     createdAt: string;
     sizeReadable: string;
     publicUrl: string;
}

export interface PolarProductAttachedCustomField {
     customFieldId: string;
     customField: PolarProductCustomField;
     order: number;
     required: boolean;
}

export interface PolarProductCustomField {
     createdAt: string;
     modifiedAt: string;
     id: string;
     metadata: Record<string, unknown>;
     type: string;
     slug: string;
     name: string;
     organizationId: string;
     properties: PolarProductCustomFieldProperties;
}

export interface PolarProductCustomFieldProperties {
     formLabel: string;
     formHelpText: string;
     formPlaceholder: string;
     textarea: boolean;
     minLength: number;
     maxLength: number;
}
