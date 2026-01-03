export type PolarCustomerEventType =
     | "customer.created"
     | "customer.updated"
     | "customer.deleted"
     | "customer.state_changed"
     | "customer_seat.assigned"
     | "customer_seat.claimed"
     | "customer_seat.revoked";

export interface PolarCustomerEvent {
     type: "customer.created";
     timestamp: string;
     data: PolarCustomer;
}

export interface PolarCustomerUpdatedEvent {
     type: "customer.updated";
     timestamp: string;
     data: PolarCustomer;
}

export interface PolarCustomerDeletedEvent {
     type: "customer.deleted";
     timestamp: string;
     data: PolarCustomer;
}

export interface PolarCustomerStateChangedEvent {
     type: "customer.state_changed";
     timestamp: string;
     data: PolarCustomerState;
}

export type PolarCustomerSeatEventType =
     | "customer_seat.assigned"
     | "customer_seat.claimed"
     | "customer_seat.revoked";

export interface PolarCustomerSeatEvent<T extends PolarCustomerSeatEventType = PolarCustomerSeatEventType> {
     type: T;
     timestamp: string;
     data: Record<string, unknown>;
}

export interface PolarCustomerState extends PolarCustomer {
     active_subscriptions: PolarCustomerSubscription[];
     granted_benefits: PolarGrantedBenefit[];
     active_meters: PolarActiveMeter[];
}

export interface PolarCustomerSubscription {
     id: string;
     created_at: string;
     modified_at: string;
     metadata: Record<string, unknown>;
     status: string;
     amount: number;
     currency: string;
     recurring_interval: string;
     current_period_start: string;
     current_period_end: string;
     trial_start: string | null;
     trial_end: string | null;
     cancel_at_period_end: boolean;
     canceled_at: string | null;
     started_at: string;
     ends_at: string | null;
     product_id: string;
     discount_id: string | null;
     meters: PolarCustomerMeter[];
     custom_field_data: Record<string, unknown>;
}

export interface PolarCustomerMeter {
     created_at: string;
     modified_at: string;
     id: string;
     consumed_units: number;
     credited_units: number;
     amount: number;
     meter_id: string;
}

export interface PolarGrantedBenefit {
     id: string;
     created_at: string;
     modified_at: string;
     granted_at: string;
     benefit_id: string;
     benefit_type: string;
     benefit_metadata: Record<string, unknown>;
     properties: Record<string, string>;
}

export interface PolarActiveMeter {
     id: string;
     created_at: string;
     modified_at: string;
     meter_id: string;
     consumed_units: number;
     credited_units: number;
     balance: number;
}

export interface PolarCustomer {
     id: string;
     created_at: string;
     modified_at: string;
     metadata: Record<string, unknown>;
     external_id: string;
     email: string;
     email_verified: boolean;
     name: string;
     billing_address: PolarCustomerAddress;
     tax_id: string[];
     organization_id: string;
     deleted_at: string | null;
     avatar_url: string | null;
}

export interface PolarCustomerAddress {
     country: string;
     line1: string;
     line2: string;
     postal_code: string;
     city: string;
     state: string;
}
