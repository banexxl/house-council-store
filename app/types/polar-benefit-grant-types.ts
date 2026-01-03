export type PolarBenefitGrantEventType =
     | "benefit_grant.created"
     | "benefit_grant.cycled"
     | "benefit_grant.updated"
     | "benefit_grant.revoked";

export type PolarBenefitGrantEvent =
     | PolarBenefitGrantCreatedEvent
     | PolarBenefitGrantCycledEvent
     | PolarBenefitGrantUpdatedEvent
     | PolarBenefitGrantRevokedEvent;

export interface PolarBenefitGrantEventBase<TType extends PolarBenefitGrantEventType> {
     type: TType;
     timestamp: string;
     data: PolarBenefitGrant;
}

export interface PolarBenefitGrantCreatedEvent extends PolarBenefitGrantEventBase<"benefit_grant.created"> { }
export interface PolarBenefitGrantCycledEvent extends PolarBenefitGrantEventBase<"benefit_grant.cycled"> { }
export interface PolarBenefitGrantUpdatedEvent extends PolarBenefitGrantEventBase<"benefit_grant.updated"> { }
export interface PolarBenefitGrantRevokedEvent extends PolarBenefitGrantEventBase<"benefit_grant.revoked"> { }

export interface PolarBenefitGrant {
     id: string;
     created_at: string;
     modified_at: string;
     is_granted: boolean;
     is_revoked: boolean;
     subscription_id: string;
     order_id: string;
     customer_id: string;
     benefit_id: string;
     customer: PolarBenefitGrantCustomer;
     benefit: PolarBenefitGrantBenefit;
     properties: PolarBenefitGrantProperties;
     previous_properties: PolarBenefitGrantProperties | null;
     granted_at: string | null;
     revoked_at: string | null;
     error: PolarBenefitGrantError | null;
}

export interface PolarBenefitGrantCustomer {
     id: string;
     created_at: string;
     modified_at: string;
     metadata: Record<string, unknown>;
     external_id: string;
     email: string;
     email_verified: boolean;
     name: string;
     billing_address: PolarBenefitGrantCustomerAddress;
     tax_id: string[];
     organization_id: string;
     deleted_at: string | null;
     avatar_url: string | null;
}

export interface PolarBenefitGrantCustomerAddress {
     country: string;
     line1: string;
     line2: string;
     postal_code: string;
     city: string;
     state: string;
}

export interface PolarBenefitGrantBenefit {
     id: string;
     created_at: string;
     modified_at: string;
     type: string;
     description: string;
     selectable: boolean;
     deletable: boolean;
     organization_id: string;
     metadata: Record<string, unknown>;
     properties: PolarBenefitGrantBenefitProperties;
}

export interface PolarBenefitGrantBenefitProperties {
     guild_id?: string;
     role_id?: string;
     kick_member?: boolean;
     guild_token?: string;
     [key: string]: unknown;
}

export interface PolarBenefitGrantProperties {
     account_id?: string;
     guild_id?: string;
     role_id?: string;
     granted_account_id?: string;
     [key: string]: unknown;
}

export interface PolarBenefitGrantError {
     message: string;
     type: string;
     timestamp: string;
}
