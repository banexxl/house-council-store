'use server'

import { ClientSubscription, SubscriptionPlan } from "../types/subscription-plan";
import { Feature } from "../types/feature";
import { logServerAction } from "../lib/server-logging";
import { useServerSideSupabaseAnonClient } from "../lib/ss-supabase-anon-client";


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

export const readSubscriptionPlansByStatus = async (
     status: string
): Promise<{
     readAllSubscriptionPlansSuccess: boolean;
     subscriptionPlanData?: (SubscriptionPlan & { features: any[] })[];
     readAllSubscriptionPlansError?: string;
}> => {
     const supabase = await useServerSideSupabaseAnonClient();
     const userId = (await supabase.auth.getUser()).data.user?.id;
     const { data: subscriptionPlans, error: planError } = await supabase
          .from("tblSubscriptionPlans")
          .select(`*,
         tblSubscriptionPlans_Features (
           feature_id,
           tblFeatures (*)
         )
       `)
          .eq('status', status)
          .order("monthly_total_price_per_apartment", { ascending: true });

     if (planError) {
          await logServerAction({
               user_id: userId ?? "",
               action: "Read All Subscription Plans",
               payload: { status },
               status: "fail",
               error: planError.message,
               duration_ms: 0,
               type: "db",
          });
          return {
               readAllSubscriptionPlansSuccess: false,
               readAllSubscriptionPlansError: planError.message,
          };
     }

     // Filter by status name
     const filteredPlans = (subscriptionPlans || []).filter(
          (plan: any) => plan.status === status
     );

     // Flatten features into a simple array
     const plansWithFeatures = filteredPlans.map((plan: any) => ({
          ...plan,
          features: plan.tblSubscriptionPlans_Features.map(
               (pf: any) => pf.tblFeatures
          ),
     }));

     await logServerAction({
          user_id: null,
          action: "Read All Subscription Plans",
          payload: { status },
          status: "success",
          error: "",
          duration_ms: 0,
          type: "db",
     });

     return {
          readAllSubscriptionPlansSuccess: true,
          subscriptionPlanData: plansWithFeatures,
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

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const readClientSubscriptionPlanFromClientId = async (
     clientId: string
): Promise<{
     success: boolean;
     clientSubscriptionPlanData?: (ClientSubscription & { subscription_plan: SubscriptionPlan }) | null;
     error?: string;
}> => {
     const t0 = Date.now();

     if (!clientId) {
          await logServerAction({
               user_id: null,
               action: "Read Client Subscription Plan",
               payload: { clientId },
               status: "fail",
               error: "Client ID is required",
               duration_ms: Date.now() - t0,
               type: "db",
          });
          return { success: false, error: "Client ID is required" };
     }

     const supabase = await useServerSideSupabaseAnonClient();

     const maxAttempts = 8;          // ~18s total with backoff below
     const baseDelayMs = 500;

     let lastErr: any = null;

     for (let attempt = 1; attempt <= maxAttempts; attempt++) {
          const { data, error } = await supabase
               .from("tblClient_Subscription")
               .select(
                    `
        *,
        subscription_plan:subscription_plan_id (*)
      `
               )
               .eq("client_id", clientId)
               .maybeSingle(); // ✅ 0 rows => data=null, error=null

          // Found it ✅
          if (data) {
               await logServerAction({
                    user_id: null,
                    action: "Read Client Subscription Plan",
                    payload: { clientId, attempt },
                    status: "success",
                    error: "",
                    duration_ms: Date.now() - t0,
                    type: "db",
               });
               return { success: true, clientSubscriptionPlanData: data };
          }

          // Hard error (RLS, bad query, etc.)
          if (error) {
               lastErr = error;

               // Optional: only retry on transient-ish errors
               // If you want: retry only on 429/5xx; otherwise break immediately.
               // PostgREST errors don't always have status; guard carefully.
               const status = (error as any)?.status;
               const isTransient = status === 429 || (typeof status === "number" && status >= 500);

               if (!isTransient) break;
          }

          // Not found yet (or transient) → wait and retry
          if (attempt < maxAttempts) {
               const delay = baseDelayMs * attempt; // linear backoff
               await sleep(delay);
               continue;
          }
     }

     const msg =
          lastErr?.message ??
          "Client subscription data not found (timed out waiting for webhook update)";

     await logServerAction({
          user_id: null,
          action: "Read Client Subscription Plan",
          payload: { clientId },
          status: "fail",
          error: msg,
          duration_ms: Date.now() - t0,
          type: "db",
     });

     return { success: false, error: msg, clientSubscriptionPlanData: null };
};


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

