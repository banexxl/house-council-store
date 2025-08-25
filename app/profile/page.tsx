'use server'

import { getSessionUser } from "@/app/lib/get-session";
import { Footer } from "@/app/components/footer";
import { Header } from "@/app/components/header";
import { ProfilePage } from "./profile";
import { readAccountByEmailAction, readClientRecentActivityAction } from "./account-action";
import { User } from "@supabase/supabase-js";
import { clientInitialValues } from "../types/client";
import { readClientSubscriptionPlanFromClientId, readSubscriptionPlanFeatures } from "./subscription-plan-actions";
import { readAllClientsBillingInformation } from "./client-billing-information-actions";
import { redirect } from "next/navigation";
import { readAllClientPaymentsAction, readAllCurrenciesAction, readAllPaymentMethodsAction } from "./client-payment-actions";
import { useServerSideSupabaseServiceRoleClient } from "../lib/ss-supabase-service-role-client";

export default async function Page() {
     // Fetch user session
     const user: User | null = await getSessionUser();

     if (!user?.email) {
          // Server-side redirect to sign-in page
          return redirect("/auth/sign-in");
     }

     // Fetch client data
     const { client, error } = await readAccountByEmailAction(user.email);

     if (!client) {
          const supabase = await useServerSideSupabaseServiceRoleClient();
          supabase.auth.signOut()
          return redirect("/auth/sign-in")
     }

     // Fetch related data in parallel
     const [clientSubscriptionObject, billingInformation, recentActivity, clientPayments, currencies, paymentMethodsData] = await Promise.all([
          readClientSubscriptionPlanFromClientId(client.id),
          readAllClientsBillingInformation(client.id),
          readClientRecentActivityAction(user.email, client.id),
          readAllClientPaymentsAction(client.id),
          readAllCurrenciesAction(),
          readAllPaymentMethodsAction(),
     ])


     const subsrciptionFeatures = await readSubscriptionPlanFeatures(clientSubscriptionObject.clientSubscriptionPlanData?.subscription_plan_id ?? null)

     // Merge session and client data
     const sessionAndClientDataCombined = {
          client: {
               ...clientInitialValues,
               ...client,
          },
          session: { ...user },
     };

     const binCheckerAPIKey = process.env.NEXT_PUBLIC_BIN_CHECKER_API_KEY

     return (
          <>
               <Header user={user} />
               <ProfilePage
                    sessionAndClientDataCombined={sessionAndClientDataCombined}
                    clientSubscriptionObject={clientSubscriptionObject?.clientSubscriptionPlanData! ?? null}
                    allClientBillingInformation={billingInformation.readAllClientBillingInformationData ?? []}
                    clientPayments={clientPayments.data ?? []}
                    paymentMethods={paymentMethodsData.paymentMethods!}
                    recentActivity={recentActivity.data ?? []}
                    binCheckerAPIKey={binCheckerAPIKey ?? ""}
                    subsrciptioFeatures={subsrciptionFeatures?.subscriptionPlanFeatures ?? null}
                    currencies={currencies.currencies ?? []}
               />
               <Footer />
          </>
     );
}
