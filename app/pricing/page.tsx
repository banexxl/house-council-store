import { getSessionUser } from "@/app/lib/get-session";

import { Footer } from "@/app/components/footer";
import { Header } from "@/app/components/header";
import { PricingPage } from "./pricing";
import { readAllSubscriptionPlans } from "../profile/subscription-plan-actions";
import { logServerAction } from "../lib/server-logging";


export default async function Page() {

  const user = await getSessionUser();

  const { subscriptionPlanData } = await readAllSubscriptionPlans()

  await logServerAction({
    user_id: user ? user.id : null,
    action: 'Render Pricing Page',
    payload: {},
    status: 'success',
    error: '',
    duration_ms: 0
  })

  return (
    <>
      <Header user={user ? user : null} />
      <PricingPage subscriptionPlans={subscriptionPlanData || []} />
      <Footer />
    </>

  )
}
