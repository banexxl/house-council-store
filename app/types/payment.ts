import * as Yup from 'yup';

export type Payment = {
     id?: string; // uuid
     created_at: string; // ISO timestamp
     updated_at: string; // ISO timestamp
     total_paid: number;
     invoice_number: string;
     subscription_plan: string; // uuid
     client: string; // uuid
     billing_information: string; // uuid
     status: string; // uuid
     currency: string;
     refunded_at: string | null;
     is_recurring: boolean;
     tax_percentage: number; // percentage value
}

export const paymentInitialValues: Payment = {
     id: '',
     created_at: new Date().toISOString(),
     updated_at: new Date().toISOString(),
     total_paid: 0,
     invoice_number: '',
     subscription_plan: '',
     client: '',
     billing_information: '',
     status: '',
     currency: '',
     refunded_at: '',
     is_recurring: true,
     tax_percentage: 18
};

export const paymentSchema = Yup.object().shape({
     created_at: Yup.string().required('Created at is required'),
     updated_at: Yup.string().required('Updated at is required'),
     total_paid: Yup.number().required('Total paid is required'),
     invoice_number: Yup.string().required('Invoice number is required'),
     subscription_plan: Yup.string().required('Subscription plan is required'),
     client: Yup.string().nullable().required('Client is required'),
     billing_information: Yup.string().required('Billing information is required'),
     status: Yup.string().nullable().required('Payment status is required'),
     currency: Yup.string().required('Currency is required'),
     refunded_at: Yup.string().nullable(),
     is_recurring: Yup.boolean(),
     tax_percentage: Yup.number().required('Tax percentage is required').min(0, 'Tax percentage cannot be negative').max(100, 'Tax percentage cannot exceed 100'),
});
