import { getSessionUser } from "@/app/lib/get-session";

import { Footer } from "@/app/components/footer";
import { Header } from "@/app/components/header";
import { PricingPage } from "./pricing";
import { readSubscriptionPlansByStatus, readClientSubscriptionPlanFromClientId } from "../profile/subscription-plan-actions";
import { logServerAction } from "../lib/server-logging";
import { readAccountByEmailAction } from "../profile/account-action";


export default async function Page() {

  const user = await getSessionUser();
  const { client, error } = await readAccountByEmailAction(user?.email!);
  const { subscriptionPlanData } = await readSubscriptionPlansByStatus('Active')
  const { clientSubscriptionPlanData } = await readClientSubscriptionPlanFromClientId(client?.id!)

  return (
    <>
      <Header user={user ? user : null} />
      <PricingPage subscriptionPlans={subscriptionPlanData || []} clientSubscriptionPlanData={clientSubscriptionPlanData} />
      <Footer />
    </>

  )
}
