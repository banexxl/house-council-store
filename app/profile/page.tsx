import { getSessionUser } from "@/app/lib/get-session";
import { Footer } from "@/app/components/footer";
import { Header } from "@/app/components/header";
import { ProfilePage } from "./profile";
import { readAccountByEmailAction, readClientRecentActivityAction } from "./account-action";
import { User } from "@supabase/supabase-js";
import { clientInitialValues } from "../types/client";
import { readEntity } from "@/app/lib/base-entity-actions";
import { readClientSubscriptionPlan, readSubscriptionPlanFeatures } from "./subscription-plan-actions";
import { readAllClientsBillingInformation } from "./client-billing-information-actions";
import { redirect } from "next/navigation";
import { logServerAction } from "../lib/server-logging";
import { readAllClientPaymentsAction } from "./client-payment-actions";

export default async function Page() {
     // Fetch user session
     const user: User | null = await getSessionUser();

     await logServerAction({
          user_id: user ? user.id : null,
          action: 'Rendering Profile Page',
          payload: {},
          status: 'success',
          error: '',
          duration_ms: 0,
          type: 'internal'
     })

     if (!user?.email) {
          redirect("/auth/sign-in");
     }

     // Fetch client data
     const { client, error } = await readAccountByEmailAction(user.email);

     if (!client) {
          return <div>Error: {error || "Failed to fetch account data"}</div>;
     }

     // Fetch related data in parallel
     const [clientSubscriptionObject, role, client_status, client_type, billingInformation, recentActivity, clientPayments] = await Promise.all([
          readClientSubscriptionPlan(client.id),
          readEntity("tblClientRoles", client.role_id),
          readEntity("tblClientStatuses", client.client_status),
          readEntity("tblClientTypes", client.type),
          readAllClientsBillingInformation(client.id),
          readClientRecentActivityAction(user.email, client.id),
          readAllClientPaymentsAction(client.id),
     ])


     const subsrciptionFeatures = await readSubscriptionPlanFeatures(clientSubscriptionObject.clientSubscriptionPlanData?.subscription_plan_id ?? null)

     // Merge session and client data
     const sessionAndClientDataCombined = {
          client: {
               ...clientInitialValues,
               ...client,
               role_id: role?.entity?.name ?? "",
               client_status: client_status?.entity?.name ?? "",
               type: client_type?.entity?.name ?? "",
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
                    paymentMethods={[]}
                    recentActivity={recentActivity.data ?? []}
                    binCheckerAPIKey={binCheckerAPIKey ?? ""}
                    subsrciptioFeatures={subsrciptionFeatures?.subscriptionPlanFeatures ?? null}
               />
               <Footer />
          </>
     );
}
