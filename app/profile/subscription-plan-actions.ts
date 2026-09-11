'use server'

import { unstable_cache } from "next/cache";
import { Feature } from "../types/feature";
import { logServerAction } from "../lib/server-logging";
import { useServerSideSupabaseAnonClient } from "../lib/ss-supabase-anon-client";
import { getCacheableServiceRoleClient } from "../lib/ss-supabase-cacheable-client";
import { polarCustomerTag, polarProductTag } from "../lib/polar-cache-tags";
import { PolarSubscription } from "../types/polar-subscription-types";
import { PolarProduct, PolarProductPrice } from "../types/polar-product-types";
import { PolarOrder } from "../types/polar-order-types";

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
     subscriptionPlans?: PolarProduct[]
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

     await logServerAction({
          user_id: null,
          action: "Read All Subscription Plans",
          payload: { count: subscriptionPlans?.length ?? 0 },
          status: "success",
          error: "",
          duration_ms: 0,
          type: "db",
     });

     return {
          success: true,
          subscriptionPlans: subscriptionPlans as PolarProduct[],
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

     const getCachedSubscription = unstable_cache(
          async (id: string) => {
               const supabase = getCacheableServiceRoleClient();
               return supabase
                    .from("tblPolarSubscriptions")
                    .select(`*`)
                    .eq("customerId", id)
                    //find the one with the greatest currentPeriodStart
                    .order("currentPeriodStart", { ascending: false })
                    .limit(1)
                    .single();
          },
          ["customer-subscription", customerId],
          { tags: [polarCustomerTag(customerId)], revalidate: 300 }
     );

     const { data: customerSubscriptionPlanData, error: customerSubscriptionDataError } = await getCachedSubscription(customerId);

     if (customerSubscriptionDataError) {
          await logServerAction({
               user_id: null,
               action: 'Read Customer Subscription Plan - Customer Subscription Not Created Yet!',
               payload: { customerId },
               status: 'success',
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

export const getApartmentCountForCustomer = async (customerId: string): Promise<number> => {
     const getCachedApartmentCount = unstable_cache(
          async (id: string) => {
               const supabase = getCacheableServiceRoleClient();
               // Join apartments -> buildings to filter by customerId
               return supabase
                    .from("tblApartments")
                    .select("id, tblBuildings!inner(customerId)", { count: "exact", head: true })
                    .eq("tblBuildings.customerId", id);
          },
          ["apartment-count", customerId],
          { tags: [polarCustomerTag(customerId)], revalidate: 300 }
     );

     const { count, error } = await getCachedApartmentCount(customerId);

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

export const readProductFromSubscriptionId = async (subscriptionPlanId: string): Promise<{ success: boolean, product?: PolarProduct, error?: string }> => {
     if (!subscriptionPlanId) {
          await logServerAction({
               user_id: null,
               action: 'Read Product from Subscription ID - ID not provided',
               payload: { subscriptionPlanId },
               status: 'fail',
               error: "Subscription plan ID is required",
               duration_ms: 0,
               type: 'db'
          });
          return { success: false, error: "Subscription plan ID is required" };
     }

     const getCachedProduct = unstable_cache(
          async (id: string) => {
               const supabase = getCacheableServiceRoleClient();
               return supabase
                    .from("tblPolarProducts")
                    .select(`*`)
                    .eq("id", id)
                    .single();
          },
          ["product-from-subscription", subscriptionPlanId],
          { tags: [polarProductTag(subscriptionPlanId)], revalidate: 300 }
     );

     const { data: product, error: productError } = await getCachedProduct(subscriptionPlanId);

     if (productError) {
          await logServerAction({
               user_id: null,
               action: 'Read Product from Subscription ID - Query Failed',
               payload: { subscriptionPlanId, error: productError.message },
               status: 'fail',
               error: productError.message,
               duration_ms: 0,
               type: 'db'
          });
          return { success: false, error: productError.message };
     }

     if (!product) {
          await logServerAction({
               user_id: null,
               action: 'Read Product from Subscription ID - Not Found',
               payload: { subscriptionPlanId },
               status: 'fail',
               error: "Product not found",
               duration_ms: 0,
               type: 'db'
          });
          return { success: false, error: "Product not found" };
     }

     await logServerAction({
          user_id: null,
          action: 'Read Product from Subscription ID - Success',
          payload: { subscriptionPlanId, productId: product.id },
          status: 'success',
          error: '',
          duration_ms: 0,
          type: 'db'
     });

     return { success: true, product };
}

export const readOrdersByCustomerId = async (customerId: string): Promise<{
     success: boolean;
     orders?: PolarOrder[];
     error?: string;
}> => {
     if (!customerId) {
          return { success: false, error: "Customer ID is required" };
     }

     const getCachedOrders = unstable_cache(
          async (id: string) => {
               const supabase = getCacheableServiceRoleClient();
               return supabase
                    .from("tblPolarOrders")
                    .select("*")
                    .eq("customerId", id)
                    .order("createdAt", { ascending: false });
          },
          ["orders-by-customer", customerId],
          { tags: [polarCustomerTag(customerId)], revalidate: 300 }
     );

     const { data: orders, error: ordersError } = await getCachedOrders(customerId);

     if (ordersError) {
          await logServerAction({
               user_id: null,
               action: "Read Orders by Customer ID - Query Failed",
               payload: { customerId, error: ordersError.message },
               status: "fail",
               error: ordersError.message,
               duration_ms: 0,
               type: "db",
          });
          return { success: false, error: ordersError.message };
     }

     await logServerAction({
          user_id: null,
          action: "Read Orders by Customer ID - Success",
          payload: { customerId, orderCount: orders?.length ?? 0 },
          status: "success",
          error: "",
          duration_ms: 0,
          type: "db",
     });

     return { success: true, orders: orders as PolarOrder[] ?? [] };
};
