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
          .from("tblSubscriptionPlans")
          .select(`
      *,
      tblSubscriptionPlans_Features (
        tblFeatures (*)
      )
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

     // Normalize: rename tblSubscriptionPlans_Features → features
     const features: Feature[] = subscriptionPlan.tblSubscriptionPlans_Features?.map(
          (relation: { tblFeatures: Feature }) => relation.tblFeatures
     ) || [];

     const { tblSubscriptionPlans_Features, ...planData } = subscriptionPlan;

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
     polarProducts?: (PolarProduct & { prices: PolarProductPrice[], benefits: any[], medias: any[] })[];
     readAllSubscriptionPlansError?: string;
}> => {
     const supabase = await useServerSideSupabaseAnonClient();
     const userId = (await supabase.auth.getUser()).data.user?.id;

     // Fetch active products
     const { data: products, error: productError } = await supabase
          .from("tblPolarProducts")
          .select(`*`)
          .eq('is_archived', false)
          .order("created_at", { ascending: true });

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
          .in('product_id', productIds)
          .eq('is_archived', false);

     if (pricesError) {
          await logServerAction({
               user_id: userId ?? "",
               action: "Read Polar Product Prices",
               payload: { productIds },
               status: "fail",
               error: pricesError.message,
               duration_ms: 0,
               type: "db",
          });
          return {
               readAllSubscriptionPlansSuccess: false,
               readAllSubscriptionPlansError: pricesError.message,
          };
     }

     // Fetch benefits for all products
     const { data: benefits } = await supabase
          .from("tblPolarProductBenefits")
          .select(`*`)
          .in('organization_id', products.map((p: any) => p.organization_id));

     // Fetch medias for all products
     const { data: medias } = await supabase
          .from("tblPolarProductMedias")
          .select(`*`)
          .in('organization_id', products.map((p: any) => p.organization_id));

     // Combine products with their prices, benefits, and medias
     const productsWithDetails = products.map((product: any) => ({
          ...product,
          prices: (prices || []).filter((p: any) => p.product_id === product.id),
          benefits: (benefits || []).filter((b: any) => b.organization_id === product.organization_id),
          medias: (medias || []).filter((m: any) => m.organization_id === product.organization_id),
     }));

     await logServerAction({
          user_id: null,
          action: "Read Active Polar Products",
          payload: { count: productsWithDetails.length },
          status: "success",
          error: "",
          duration_ms: 0,
          type: "db",
     });

     return {
          readAllSubscriptionPlansSuccess: true,
          polarProducts: productsWithDetails,
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
          .from("tblSubscriptionPlans")
          .select(`
      *,
          tblSubscriptionPlans_Features (
          feature_id,
          tblFeatures (*)
          )
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
     // Extract features from the subscription plan and exclude tblSubscriptionPlans_Features
     const features = subscriptionPlan.tblSubscriptionPlans_Features.map((relation: any) => relation.tblFeatures);
     // Return the subscription plan without tblSubscriptionPlans_Features
     const { tblSubscriptionPlans_Features, ...restOfSubscriptionPlan } = subscriptionPlan;

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
          .from("tblSubscriptionPlans")
          .select(`
               *,
               tblSubscriptionPlans_Features (
                    tblFeatures (*)
               )
          `)
          .order("created_at", { ascending: true });

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

     // Flatten features into a simple array
     const plansWithFeatures = (subscriptionPlans || []).map((plan: any) => ({
          ...plan,
          features: plan.tblSubscriptionPlans_Features?.map(
               (pf: any) => pf.tblFeatures
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

export const readClientSubscriptionPlanFromClientId = async (clientId: string): Promise<{ success: boolean, clientSubscriptionPlanData?: PolarSubscription & { subscription_plan: SubscriptionPlan } | null, error?: string }> => {

     if (!clientId) {
          await logServerAction({
               user_id: null,
               action: 'Read Client Subscription Plan - Client ID not provided',
               payload: { clientId },
               status: 'fail',
               error: "Client ID is required",
               duration_ms: 0,
               type: 'db'
          })
          return { success: false, error: "Client ID is required" };
     }
     const supabase = await useServerSideSupabaseAnonClient(); // Use the server-side Supabase client

     const { data: clientSubscriptionPlanData, error: clientSubscriptionDataError } = await supabase
          .from("tblClient_Subscription")
          .select(`
    *,
    subscription_plan:subscription_id (*)
  `)
          .eq("client_id", clientId)
          .single();

     if (clientSubscriptionDataError) {
          await logServerAction({
               user_id: null,
               action: 'Read Client Subscription Plan - Client Subscription Not Created',
               payload: { clientId },
               status: 'fail',
               error: clientSubscriptionDataError.message,
               duration_ms: 0,
               type: 'db'
          })
          return { success: false, error: clientSubscriptionDataError.message, clientSubscriptionPlanData: null };
     }

     if (!clientSubscriptionPlanData) {
          await logServerAction({
               user_id: null,
               action: 'Read Client Subscription Plan - Not Found',
               payload: { clientId },
               status: 'fail',
               error: "Client subscription data not found",
               duration_ms: 0,
               type: 'db'
          })
          return { success: false, error: "Client subscription data not found", clientSubscriptionPlanData: null };
     }
     await logServerAction({
          user_id: null,
          action: 'Read Client Subscription Plan - Success',
          payload: { clientId },
          status: 'success',
          error: '',
          duration_ms: 0,
          type: 'db'
     })

     return { success: true, clientSubscriptionPlanData };

}

export async function getApartmentCountForClient(clientId: string): Promise<number> {
     const supabase = await useServerSideSupabaseAnonClient();
     // Join apartments -> buildings to filter by client_id
     const { count, error } = await supabase
          .from("tblApartments")
          .select("id, tblBuildings!inner(client_id)", { count: "exact", head: true })
          .eq("tblBuildings.client_id", clientId);

     if (error) {
          await logServerAction({
               user_id: null,
               action: "Store Webhook - Apartment count query failed",
               payload: { clientId },
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

