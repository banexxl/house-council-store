export type PolarRefundEventType =
     | "refund.created"
     | "refund.updated";

export type PolarRefundEvent =
     | PolarRefundCreatedEvent
     | PolarRefundUpdatedEvent;

export interface PolarRefundEventBase<TType extends PolarRefundEventType> {
     type: TType;
     timestamp: string;
     data: PolarRefund;
}

export interface PolarRefundCreatedEvent extends PolarRefundEventBase<"refund.created"> { }
export interface PolarRefundUpdatedEvent extends PolarRefundEventBase<"refund.updated"> { }

export interface PolarRefund {
     id: string;
     created_at: string;
     modified_at: string;
     metadata: Record<string, unknown>;
     status: "pending" | "succeeded" | "failed" | "canceled";
     reason: string;
     amount: number;
     tax_amount: number;
     currency: string;
     organization_id: string;
     order_id: string;
     subscription_id: string;
     customer_id: string;
     revoke_benefits: boolean;
}
