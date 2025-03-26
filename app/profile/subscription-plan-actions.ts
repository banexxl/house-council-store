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

/**
 * Reads all subscription plans from the database.
 * @returns {Promise<{readAllSubscriptionPlansSuccess: boolean, subscriptionPlanData?: SubscriptionPlan[], readAllSubscriptionPlansError?: string}>}
 * A promise that resolves to an object with the following properties:
 * - `readAllSubscriptionPlansSuccess`: A boolean indicating whether the subscription plans were read successfully.
 * - `subscriptionPlanData`: An array of subscription plans, if successful.
 * - `readAllSubscriptionPlansError`: The error message, if any occurred during the reading process.
 */

export const readAllSubscriptionPlans = async (): Promise<{
     readAllSubscriptionPlansSuccess: boolean; subscriptionPlanData?: SubscriptionPlan[]; readAllSubscriptionPlansError?: string;
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

     if (planError) {
          return { readAllSubscriptionPlansSuccess: false, readAllSubscriptionPlansError: planError.message };
     }

     return { readAllSubscriptionPlansSuccess: true, subscriptionPlanData: subscriptionPlans };  // Return the subscription plans
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
