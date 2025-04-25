'use server'

import { useServerSideSupabaseServiceRoleClient } from "@/app/lib/ss-supabase-service-role-client";
import { SubscriptionPlan } from "../types/subscription-plan";
import { Feature } from "../types/feature";
import { logServerAction } from "../lib/server-logging";

export const readSubscriptionPlanById = async (id: string | null): Promise<{
     readSubscriptionPlanSuccess: boolean; subscriptionPlan?: SubscriptionPlan; readSubscriptionPlanError?: string;
}> => {
     if (!id) {
          return { readSubscriptionPlanSuccess: false, readSubscriptionPlanError: "Subscription plan ID is required" };
     }

     const supabase = await useServerSideSupabaseServiceRoleClient();
     const userId = (await supabase.auth.getUser()).data.user?.id;
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
          await logServerAction({
               user_id: userId ? userId : '',
               action: 'Read Subscription Plan by ID',
               payload: { id },
               status: 'fail',
               error: planError.message,
               duration_ms: 0,
               type: 'db'
          })
          return { readSubscriptionPlanSuccess: false, readSubscriptionPlanError: planError.message };
     }

     // Extract features from the subscription plan and exclude tblSubscriptionPlans_Features
     const features = subscriptionPlan.tblSubscriptionPlans_Features.map((relation: any) => relation.tblFeatures);

     // Return the subscription plan without tblSubscriptionPlans_Features
     const { tblSubscriptionPlans_Features, ...restOfSubscriptionPlan } = subscriptionPlan;

     await logServerAction({
          user_id: null,
          action: 'Read Subscription Plan by ID',
          payload: { id },
          status: 'success',
          error: '',
          duration_ms: 0,
          type: 'db'
     })

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
     const userId = (await supabase.auth.getUser()).data.user?.id;
     const { data: subscriptionPlans, error: planError } = await supabase
          .from("tblSubscriptionPlans")
          .select(`
      *,
      tblSubscriptionPlans_Features (
        feature_id,
        tblFeatures (*)
      )
    `)
          .order("total_price_per_month", { ascending: true });

     if (planError) {
          await logServerAction({
               user_id: userId ? userId : '',
               action: 'Read All Subscription Plans',
               payload: {},
               status: 'fail',
               error: planError.message,
               duration_ms: 0,
               type: 'db'
          })
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

     await logServerAction({
          user_id: null,
          action: 'Read All Subscription Plans',
          payload: {},
          status: 'success',
          error: '',
          duration_ms: 0,
          type: 'db'
     })

     return {
          readAllSubscriptionPlansSuccess: true,
          subscriptionPlanData: plansWithFeatures,
     };
};

export const unubscribeAction = async (id: string): Promise<{ success: boolean, error?: string }> => {
     const supabase = await useServerSideSupabaseServiceRoleClient();
     const userId = (await supabase.auth.getUser()).data.user?.id;
     const { data, error } = await supabase.from('tblSubscriptionPlans').delete().eq('id', id);
     if (error) {
          await logServerAction({
               user_id: userId ? userId : '',
               action: 'Unsubscribe Action',
               payload: { id },
               status: 'fail',
               error: error.message,
               duration_ms: 0,
               type: 'action'
          })
          return { success: false, error: error.message }
     }
     await logServerAction({
          user_id: null,
          action: 'Unsubscribe Action',
          payload: { id },
          status: 'success',
          error: '',
          duration_ms: 0,
          type: 'action'
     })
     return { success: true }
}

export const readSubscriptionPlanFromClientId = async (clientId: string): Promise<{ success: boolean, subscriptionPlan?: SubscriptionPlan | null, error?: string }> => {

     if (!clientId) {
          await logServerAction({
               user_id: clientId ? clientId : null,
               action: 'Read Subscription Plan from Client ID',
               payload: { clientId },
               status: 'fail',
               error: "Client ID is required",
               duration_ms: 0,
               type: 'db'
          })
          return { success: false, error: "Client ID is required" };
     }

     const supabase = await useServerSideSupabaseServiceRoleClient();

     const { data: clientData, error: clientError } = await supabase
          .from("tblClients")
          .select("subscription_plan")
          .eq("id", clientId)
          .single();

     if (clientError || !clientData?.subscription_plan) {
          await logServerAction({
               user_id: clientId ? clientId : null,
               action: 'Read Subscription Plan from Client ID',
               payload: { clientId },
               status: 'fail',
               error: clientError ? clientError.message : "Client does not have a subscription plan",
               duration_ms: 0,
               type: 'db'
          })
          return { success: false, error: clientError ? clientError.message : "Client does not have a subscription plan", subscriptionPlan: null };
     }

     const { data: subscriptionPlan, error: planError } = await supabase
          .from("tblSubscriptionPlans")
          .select("*")
          .eq("id", clientData.subscription_plan)
          .single();

     if (planError) {
          await logServerAction({
               user_id: clientId ? clientId : null,
               action: 'Read Subscription Plan from Client ID',
               payload: { clientId },
               status: 'fail',
               error: planError.message,
               duration_ms: 0,
               type: 'db'
          })
          return { success: false, error: planError.message, subscriptionPlan: null };
     }

     await logServerAction({
          user_id: clientId ? clientId : null,
          action: 'Read Subscription Plan from Client ID',
          payload: { clientId },
          status: 'success',
          error: '',
          duration_ms: 0,
          type: 'db'
     })

     return { success: true, subscriptionPlan };
}

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

     const supabase = await useServerSideSupabaseServiceRoleClient();
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
