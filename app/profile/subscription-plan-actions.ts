'use server'

import { SubscriptionPlan } from "../types/subscription-plan";
import { Feature } from "../types/feature";
import { logServerAction } from "../lib/server-logging";
import { useServerSideSupabaseAnonClient } from "../lib/ss-supabase-anon-client";
import { PolarSubscription } from "../types/polar-subscription-types";
import { PolarProduct, PolarProductPrice } from "../types/polar-product-types";


export const readSubscriptionPlanFeatures = async (
     id: string | null
): Promise<{
     readSubscriptionPlanFeaturesSuccess: boolean;
     subscriptionPlanFeatures?: SubscriptionPlan & { features: Feature[] };
     readSubscriptionPlanFeaturesError?: string;
}> => {
     if (!id) {
          return {
               readSubscriptionPlanFeaturesSuccess: false,
               readSubscriptionPlanFeaturesError: "Subscription plan ID is required",
          };
     }

     const supabase = await useServerSideSupabaseAnonClient();
     const userId = (await supabase.auth.getUser()).data.user?.id;

     const { data: subscriptionPlan, error } = await supabase
          .from("tblPolarProducts")
          .select(`
      *,
      tblPolarProductBenefits (*)
    `)
          .eq("id", id)
          .single();

     if (error || !subscriptionPlan) {
          await logServerAction({
               user_id: userId || '',
               action: 'Read Subscription Plan by ID',
               payload: { id },
               status: 'fail',
               error: error?.message || 'Not found',
               duration_ms: 0,
               type: 'db',
          });

          return {
               readSubscriptionPlanFeaturesSuccess: false,
               readSubscriptionPlanFeaturesError: error?.message || 'Subscription plan not found',
          };
     }

     // Convert Polar benefits to features structure
     const features: Feature[] = subscriptionPlan.tblPolarProductBenefits?.map(
          (benefit: any) => ({
               id: benefit.id,
               name: benefit.description || '',
               description: benefit.description || ''
          })
     ) || [];

     const { tblPolarProductBenefits, ...planData } = subscriptionPlan;

     await logServerAction({
          user_id: null,
          action: 'Read Subscription Plan by ID',
          payload: { id },
          status: 'success',
          error: '',
          duration_ms: 0,
          type: 'db',
     });

     return {
          readSubscriptionPlanFeaturesSuccess: true,
          subscriptionPlanFeatures: {
               ...planData,
               features,
          },
     };
};

export const readActivePolarProducts = async (): Promise<{
     readAllSubscriptionPlansSuccess: boolean;
     polarProducts?: (PolarProduct & { prices: PolarProductPrice[] })[];
     readAllSubscriptionPlansError?: string;
}> => {
     const supabase = await useServerSideSupabaseAnonClient();
     const userId = (await supabase.auth.getUser()).data.user?.id;

     // Fetch active products (camelCase columns)
     const { data: products, error: productError } = await supabase
          .from("tblPolarProducts")
          .select(`*`)
          .eq('isArchived', false)
          .order("createdAt", { ascending: true });

     if (productError) {
          await logServerAction({
               user_id: userId ?? "",
               action: "Read Active Polar Products",
               payload: {},
               status: "fail",
               error: productError.message,
               duration_ms: 0,
               type: "db",
          });
          return {
               readAllSubscriptionPlansSuccess: false,
               readAllSubscriptionPlansError: productError.message,
          };
     }

     if (!products || products.length === 0) {
          return {
               readAllSubscriptionPlansSuccess: true,
               polarProducts: [],
          };
     }

     // Fetch prices for all products
     const productIds = products.map((p: any) => p.id);
     const { data: prices, error: pricesError } = await supabase
          .from("tblPolarProductPrices")
          .select(`*`)
          .in('productId', productIds)
          .eq('isArchived', false);

     // Combine products with their prices
     const productsWithPrices = products.map((product: any) => ({
          ...product,
          prices: (prices || []).filter((p: any) => p.productId === product.id),
     }));

     await logServerAction({
          user_id: null,
          action: "Read Active Polar Products",
          payload: { count: productsWithPrices.length },
          status: "success",
          error: "",
          duration_ms: 0,
          type: "db",
     });

     return {
          readAllSubscriptionPlansSuccess: true,
          polarProducts: productsWithPrices,
     };
};

export const readFeaturesFromSubscriptionPlanId = async (subscriptionPlanId: string | null): Promise<{ success: boolean, features?: Feature[], error?: string }> => {

     if (!subscriptionPlanId) {
          await logServerAction({
               user_id: null,
               action: 'Read Features from Subscription Plan ID',
               payload: { subscriptionPlanId },
               status: 'fail',
               error: "Subscription plan ID is required",
               duration_ms: 0,
               type: 'db'
          })
          return { success: false, error: "Subscription plan ID is required" };
     }

     const supabase = await useServerSideSupabaseAnonClient();
     const userId = (await supabase.auth.getUser()).data.user?.id;
     const { data: subscriptionPlan, error: planError } = await supabase
          .from("tblPolarProducts")
          .select(`
      *,
          tblPolarProductBenefits (*)
    `)
          .eq("id", subscriptionPlanId)
          .single();

     if (planError) {
          await logServerAction({
               user_id: userId ? userId : '',
               action: 'Read Features from Subscription Plan ID',
               payload: { subscriptionPlanId },
               status: 'fail',
               error: planError.message,
               duration_ms: 0,
               type: 'db'
          })
          return { success: false, error: planError.message };
     }
     if (!subscriptionPlan) {
          await logServerAction({
               user_id: userId ? userId : '',
               action: 'Read Features from Subscription Plan ID',
               payload: { subscriptionPlanId },
               status: 'fail',
               error: "Subscription plan not found",
               duration_ms: 0,
               type: 'db'
          })
          return { success: false, error: "Subscription plan not found" };
     }
     // Convert Polar benefits to features structure
     const features = subscriptionPlan.tblPolarProductBenefits?.map((benefit: any) => ({
          id: benefit.id,
          name: benefit.description || '',
          description: benefit.description || ''
     })) || [];
     // Return the subscription plan without tblPolarProductBenefits
     const { tblPolarProductBenefits, ...restOfSubscriptionPlan } = subscriptionPlan;

     await logServerAction({
          user_id: null,
          action: 'Read Features from Subscription Plan ID',
          payload: { subscriptionPlanId },
          status: 'success',
          error: '',
          duration_ms: 0,
          type: 'db'
     })

     return { success: true, features };
}

export const readAllSubscriptionPlans = async (): Promise<{
     success: boolean;
     subscriptionPlans?: (SubscriptionPlan & { features: Feature[] })[];
     error?: string;
}> => {
     const supabase = await useServerSideSupabaseAnonClient();
     const userId = (await supabase.auth.getUser()).data.user?.id;

     const { data: subscriptionPlans, error: planError } = await supabase
          .from("tblPolarProducts")
          .select(`
               *,
               tblPolarProductBenefits (*)
          `)
          .eq('isArchived', false)
          .order("createdAt", { ascending: true });

     if (planError) {
          await logServerAction({
               user_id: userId ?? "",
               action: "Read All Subscription Plans",
               payload: {},
               status: "fail",
               error: planError.message,
               duration_ms: 0,
               type: "db",
          });
          return {
               success: false,
               error: planError.message,
          };
     }

     // Convert Polar benefits to features structure
     const plansWithFeatures = (subscriptionPlans || []).map((plan: any) => ({
          ...plan,
          features: plan.tblPolarProductBenefits?.map(
               (benefit: any) => ({
                    id: benefit.id,
                    name: benefit.description || '',
                    description: benefit.description || ''
               })
          ) || [],
     }));

     await logServerAction({
          user_id: null,
          action: "Read All Subscription Plans",
          payload: { count: plansWithFeatures.length },
          status: "success",
          error: "",
          duration_ms: 0,
          type: "db",
     });

     return {
          success: true,
          subscriptionPlans: plansWithFeatures,
     };
};

export const readCustomerSubscriptionPlanFromCustomerId = async (customerId: string): Promise<{ success: boolean, customerSubscriptionPlanData?: PolarSubscription, error?: string }> => {

     if (!customerId) {
          await logServerAction({
               user_id: null,
               action: 'Read Customer Subscription Plan - Customer ID not provided',
               payload: { customerId },
               status: 'fail',
               error: "Customer ID is required",
               duration_ms: 0,
               type: 'db'
          })
          return { success: false, error: "Customer ID is required" };
     }
     const supabase = await useServerSideSupabaseAnonClient(); // Use the server-side Supabase customer
     console.log('customerId', customerId);

     const { data: customerSubscriptionPlanData, error: customerSubscriptionDataError } = await supabase
          .from("tblPolarSubscriptions")
          .select(`*`)
          .eq("customerId", customerId)
          .single();
     console.log('customerSubscriptionPlanData', customerSubscriptionPlanData);

     if (customerSubscriptionDataError) {
          await logServerAction({
               user_id: null,
               action: 'Read Customer Subscription Plan - Customer Subscription Not Created',
               payload: { customerId },
               status: 'fail',
               error: customerSubscriptionDataError.message,
               duration_ms: 0,
               type: 'db'
          })
          return { success: false, error: customerSubscriptionDataError.message, customerSubscriptionPlanData: undefined };
     }

     if (!customerSubscriptionPlanData) {
          await logServerAction({
               user_id: null,
               action: 'Read Customer Subscription Plan - Not Found',
               payload: { customerId },
               status: 'fail',
               error: "Customer subscription data not found",
               duration_ms: 0,
               type: 'db'
          })
          return { success: false, error: "Customer subscription data not found", customerSubscriptionPlanData: undefined };
     }
     await logServerAction({
          user_id: null,
          action: 'Read Customer Subscription Plan - Success',
          payload: { customerId },
          status: 'success',
          error: '',
          duration_ms: 0,
          type: 'db'
     })

     return { success: true, customerSubscriptionPlanData };

}

export async function getApartmentCountForCustomer(customerId: string): Promise<number> {
     const supabase = await useServerSideSupabaseAnonClient();
     // Join apartments -> buildings to filter by customerId
     const { count, error } = await supabase
          .from("tblApartments")
          .select("id, tblBuildings!inner(customerId)", { count: "exact", head: true })
          .eq("tblBuildings.customerId", customerId);

     if (error) {
          await logServerAction({
               user_id: null,
               action: "Store Webhook - Apartment count query failed",
               payload: { customerId },
               status: "fail",
               error: error.message,
               duration_ms: 0,
               type: "internal",
          });
          // Fail safe: don't block webhook writes
          return 0;
     }

     return count ?? 0;
}

