export type PolarOrganizationEventType = "organization.updated";

export interface PolarOrganizationEvent {
     type: "organization.updated";
     timestamp: string;
     data: PolarOrganization;
}

export interface PolarOrganization {
     id: string;
     created_at: string;
     modified_at: string;
     name: string;
     slug: string;
     avatar_url: string;
     proration_behavior: "invoice" | "none";
     allow_customer_updates: boolean;
     email: string;
     website: string;
     socials: PolarOrganizationSocial[];
     status: string;
     details_submitted_at: string | null;
     feature_settings: PolarOrganizationFeatureSettings;
     subscription_settings: PolarOrganizationSubscriptionSettings;
     notification_settings: PolarOrganizationNotificationSettings;
     customer_email_settings: PolarOrganizationCustomerEmailSettings;
}

export interface PolarOrganizationSocial {
     platform: string;
     url: string;
}

export interface PolarOrganizationFeatureSettings {
     issue_funding_enabled: boolean;
     seat_based_pricing_enabled: boolean;
     revops_enabled: boolean;
     wallets_enabled: boolean;
}

export interface PolarOrganizationSubscriptionSettings {
     allow_multiple_subscriptions: boolean;
     allow_customer_updates: boolean;
     proration_behavior: "invoice" | "none";
     benefit_revocation_grace_period: number;
     prevent_trial_abuse: boolean;
}

export interface PolarOrganizationNotificationSettings {
     new_order: boolean;
     new_subscription: boolean;
}

export interface PolarOrganizationCustomerEmailSettings {
     order_confirmation: boolean;
     subscription_cancellation: boolean;
     subscription_confirmation: boolean;
     subscription_cycled: boolean;
     subscription_past_due: boolean;
     subscription_revoked: boolean;
     subscription_uncanceled: boolean;
     subscription_updated: boolean;
}
