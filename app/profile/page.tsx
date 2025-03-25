import { getSessionUser } from "@/lib/get-session";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { ProfilePage } from "./profile";
import { readAccountByEmailAction } from "./account-action";
import { User } from "@supabase/supabase-js";
import { clientInitialValues } from "../types/client";
import { readEntity } from "@/lib/base-entity-actions";
import { readSubscriptionPlan } from "./subscription-plan-actions";

export default async function Page() {
     // Fetch user session
     const user: User | null = await getSessionUser();

     if (!user?.email) {
          return <div>Error: No user session</div>;
     }

     // Fetch client data
     const { client, error } = await readAccountByEmailAction(user.email);

     if (!client) {
          return <div>Error: {error || "Failed to fetch account data"}</div>;
     }

     // Fetch related data in parallel
     const [subscriptionPlanReturnObject, role, client_status, client_type] = await Promise.all([
          readSubscriptionPlan(client.subscription_plan ?? undefined),
          readEntity("tblClientRoles", client.role_id),
          readEntity("tblClientStatuses", client.client_status),
          readEntity("tblClientTypes", client.type),
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
               <ProfilePage sessionAndClientDataCombined={sessionAndClientDataCombined} subscriptionPlan={subscriptionPlanReturnObject?.subscriptionPlan} />
               <Footer />
          </>
     );
}
