import * as Yup from 'yup';
import { Feature } from './feature';

export type SubscriptionPlan = {
     id?: string;
     created_at: Date;
     updated_at: Date;
     name: string;
     description: string;
     status_id: string;
     is_billed_annually: boolean;
     annual_discount_percentage: number;
     is_discounted: boolean;
     discount_percentage: number;
     features?: Feature[];
     base_price: number;
     monthly_total_price_per_apartment: number;
     total_price_per_apartment_with_discounts: number;
     polar_product_id_monthly: string;
     polar_product_id_annually: string;
};

export const subscriptionPlanInitialValues: SubscriptionPlan = {
     created_at: new Date(),
     updated_at: new Date(),
     name: '',
     description: '',
     status_id: '',
     is_billed_annually: false,
     annual_discount_percentage: 0,
     is_discounted: false,
     discount_percentage: 0,
     features: [],
     base_price: 0,
     monthly_total_price_per_apartment: 0,
     total_price_per_apartment_with_discounts: 0,
     polar_product_id_monthly: '',
     polar_product_id_annually: ''
};

export const subscriptionPlanValidationSchema = Yup.object({
     name: Yup.string().required("Required"),
     description: Yup.string(),
     status_id: Yup.string().required("Required"),
     is_billed_annually: Yup.boolean(),
     annually_discount_percentage: Yup.number().min(0, "Must be positive").max(100, "Must be 100 or less"),
     is_discounted: Yup.boolean(),
     discount_percentage: Yup.number().min(0, "Must be positive").max(100, "Must be 100 or less"),
     base_price: Yup.number().min(0, "Must be positive").max(1000000, "Must be 1,000,000 or less"),
     monthly_total_price_per_apartment: Yup.number().min(0, "Must be positive").max(1000000, "Must be 1,000,000 or less"),
     total_price_per_apartment_with_discounts: Yup.number().min(0, "Must be positive").max(1000000, "Must be 1,000,000 or less")
})
