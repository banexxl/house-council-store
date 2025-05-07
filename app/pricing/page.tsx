import { getSessionUser } from "@/app/lib/get-session";

import { Footer } from "@/app/components/footer";
import { Header } from "@/app/components/header";
import { PricingPage } from "./pricing";
import { readAllSubscriptionPlans, readClientSubscriptionPlan } from "../profile/subscription-plan-actions";
import { logServerAction } from "../lib/server-logging";
import { readAccountByEmailAction } from "../profile/account-action";


export default async function Page() {

  const user = await getSessionUser();

  const { subscriptionPlanData } = await readAllSubscriptionPlans()

  // Fetch client data
  const { client, error } = await readAccountByEmailAction(user?.email!);

  const { clientSubscriptionPlanData } = await readClientSubscriptionPlan(client?.id!)

  await logServerAction({
    user_id: user ? user.id : null,
    action: 'Render Pricing Page',
    payload: {},
    status: 'success',
    error: '',
    duration_ms: 0,
    type: 'internal',
  })

  return (
    <>
      <Header user={user ? user : null} />
      <PricingPage subscriptionPlans={subscriptionPlanData || []} clientSubscriptionPlanData={clientSubscriptionPlanData} />
      <Footer />
    </>

  )
}
