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
     client_id: string | null;
     subscription_id: string;
     polar_subscription_id: string;
     created_at: string;
     modified_at: string;
     apartment_count: number;
     metadata: Record<string, unknown>;
     amount: number;
     currency: string;
     recurring_interval: "day" | "week" | "month" | "year";
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
     prices: string[];
     meters: string[];
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

