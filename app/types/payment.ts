import * as Yup from 'yup';

export type Payment = {
     id: string; // uuid
     created_at: string; // ISO timestamp
     updated_at: string; // ISO timestamp
     total_cost: number;
     total_paid: number;
     invoice_number: string;
     subscription_plan: string; // uuid
     client: string; // uuid
     billing_information: string; // uuid
     status: string; // uuid
     currency: string
     refunded_at: string;
     is_recurring: boolean;
}

export const paymentInitialValues: Payment = {
     id: '',
     created_at: new Date().toISOString(),
     updated_at: new Date().toISOString(),
     total_cost: 0,
     total_paid: 0,
     invoice_number: '',
     subscription_plan: '',
     client: '',
     billing_information: '',
     status: '',
     currency: '',
     refunded_at: '',
     is_recurring: true,
};

export const paymentSchema = Yup.object().shape({
     created_at: Yup.string().required('Created at is required'),
     updated_at: Yup.string().required('Updated at is required'),
     total_cost: Yup.number().required('Total cost is required'),
     total_paid: Yup.number().required('Total paid is required'),
     invoice_number: Yup.string().required('Invoice number is required'),
     subscription_plan: Yup.string().required('Subscription plan is required'),
     client: Yup.string().nullable().required('Client is required'),
     billing_information: Yup.string().required('Billing information is required'),
     status: Yup.string().nullable().required('Payment status is required'),
     currency: Yup.string().required('Currency is required'),
     refunded_at: Yup.string().nullable(),
     is_recurring: Yup.boolean(),
});
