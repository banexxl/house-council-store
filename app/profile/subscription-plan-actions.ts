'use server'

import { useServerSideSupabaseServiceRoleClient } from "@/app/lib/ss-supabase-service-role-client";
import { SubscriptionPlan } from "../types/subscription-plan";

/**
 * Reads a subscription plan from the database.
 * @param {string} id The id of the subscription plan to read.
 * @returns {Promise<{readSubscriptionPlanSuccess: boolean, subscriptionPlan?: SubscriptionPlan, readSubscriptionPlanError?: string}>}
 * A promise that resolves to an object with the following properties:
 * - `readSubscriptionPlanSuccess`: A boolean indicating whether the subscription plan was read successfully.
 * - `subscriptionPlan`: The subscription plan that was read, if successful.
 * - `readSubscriptionPlanError`: The error that occurred, if any.
 */
export const readSubscriptionPlanById = async (id: string | null): Promise<{
     readSubscriptionPlanSuccess: boolean; subscriptionPlan?: SubscriptionPlan; readSubscriptionPlanError?: string;
}> => {
     if (!id) {
          return { readSubscriptionPlanSuccess: false, readSubscriptionPlanError: "Subscription plan ID is required" };
     }

     const supabase = await useServerSideSupabaseServiceRoleClient();

     // Fetch the subscription plan along with its features using a join
     const { data: subscriptionPlan, error: planError } = await supabase
          .from("tblSubscriptionPlans")
          .select(`
      *,
      tblSubscriptionPlans_Features (
        feature_id,
        tblFeatures (*)
      )
    `)
          .eq("id", id)
          .single();

     if (planError) {
          return { readSubscriptionPlanSuccess: false, readSubscriptionPlanError: planError.message };
     }

     // Extract features from the subscription plan and exclude tblSubscriptionPlans_Features
     const features = subscriptionPlan.tblSubscriptionPlans_Features.map((relation: any) => relation.tblFeatures);

     // Return the subscription plan without tblSubscriptionPlans_Features
     const { tblSubscriptionPlans_Features, ...restOfSubscriptionPlan } = subscriptionPlan;
     console.log('restOfSubscriptionPlan', restOfSubscriptionPlan);
     console.log('features', features);


     return {
          readSubscriptionPlanSuccess: true,
          subscriptionPlan: { ...restOfSubscriptionPlan, features },
     };
};

export const readAllSubscriptionPlans = async (): Promise<{
     readAllSubscriptionPlansSuccess: boolean;
     subscriptionPlanData?: (SubscriptionPlan & { features: any[] })[];
     readAllSubscriptionPlansError?: string;
}> => {
     const supabase = await useServerSideSupabaseServiceRoleClient();

     const { data: subscriptionPlans, error: planError } = await supabase
          .from("tblSubscriptionPlans")
          .select(`
      *,
      tblSubscriptionPlans_Features (
        feature_id,
        tblFeatures (*)
      )
    `);

     console.log("subscriptionPlans", subscriptionPlans);
     console.log("planError", planError);

     if (planError) {
          return {
               readAllSubscriptionPlansSuccess: false,
               readAllSubscriptionPlansError: planError.message,
          };
     }

     // Flatten features into a simple `features` array
     const plansWithFeatures = subscriptionPlans?.map((plan) => ({
          ...plan,
          features: plan.tblSubscriptionPlans_Features.map(
               (pf: any) => pf.tblFeatures
          ),
     }));

     return {
          readAllSubscriptionPlansSuccess: true,
          subscriptionPlanData: plansWithFeatures,
     };
};


export const unubscribeAction = async (id: string): Promise<{ success: boolean, error?: string }> => {
     const supabase = await useServerSideSupabaseServiceRoleClient();
     const { data, error } = await supabase.from('tblSubscriptionPlans').delete().eq('id', id);
     if (error) {
          return { success: false, error: error.message }
     }
     return { success: true }
}

export const readSubscriptionPlanFromClientId = async (clientId: string): Promise<{ success: boolean, subscriptionPlan?: SubscriptionPlan | null, error?: string }> => {

     if (!clientId) {         // Check if clientId is provided
          return { success: false, error: "Client ID is required" };
     }     // Fetch the subscription plan for the client
     const supabase = await useServerSideSupabaseServiceRoleClient();
     const { data: subscriptionPlan, error: planError } = await supabase
          .from("tblSubscriptionPlans")
          .select(`*`)
          .eq("client_id", clientId)
          .single();
     if (planError) {
          return { success: false, error: planError.message, subscriptionPlan: null };
     }
     console.log('subscriptionPlans', subscriptionPlan);
     console.log('planError', planError);


     return { success: true, subscriptionPlan };
}
