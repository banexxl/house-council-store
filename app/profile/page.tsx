import { getSessionUser } from "@/app/lib/get-session";
import { Footer } from "@/app/components/footer";
import { Header } from "@/app/components/header";
import { ProfilePage } from "./profile";
import { readAccountByEmailAction } from "./account-action";
import { User } from "@supabase/supabase-js";
import { clientInitialValues } from "../types/client";
import { readEntity } from "@/app/lib/base-entity-actions";
import { readFeaturesFromSubscriptionPlanId, readSubscriptionPlanFromClientId } from "./subscription-plan-actions";
import { readAllClientsBillingInformation } from "./client-billing-information-actions";
import { redirect } from "next/navigation";

export default async function Page() {
     // Fetch user session
     const user: User | null = await getSessionUser();

     if (!user?.email) {
          redirect("/auth/sign-in");
     }

     // Fetch client data
     const { client, error } = await readAccountByEmailAction(user.email);

     if (!client) {
          return <div>Error: {error || "Failed to fetch account data"}</div>;
     }

     // Fetch related data in parallel
     const [subscriptionPlanReturnObject, role, client_status, client_type, billingInformation, features] = await Promise.all([
          readSubscriptionPlanFromClientId(client.id),
          readEntity("tblClientRoles", client.role_id),
          readEntity("tblClientStatuses", client.client_status),
          readEntity("tblClientTypes", client.type),
          readAllClientsBillingInformation(client.id),
          readFeaturesFromSubscriptionPlanId(client.subscription_plan ?? null),
     ]);

     // Merge session and client data
     const sessionAndClientDataCombined = {
          client: {
               ...clientInitialValues,
               ...client,
               role_id: role?.entity?.name ?? "",
               client_status: client_status?.entity?.name ?? "",
               type: client_type?.entity?.name ?? "",
               subscription_plan: subscriptionPlanReturnObject?.subscriptionPlan?.id ?? null,
          },
          session: { ...user },
     };

     return (
          <>
               <Header user={user} />
               <ProfilePage
                    sessionAndClientDataCombined={sessionAndClientDataCombined}
                    subscriptionPlan={subscriptionPlanReturnObject?.subscriptionPlan ?? null}
                    allClientBillingInformation={billingInformation.readAllClientBillingInformationData ?? []}
                    paymentMethods={[]}
               />
               <Footer />
          </>
     );
}
