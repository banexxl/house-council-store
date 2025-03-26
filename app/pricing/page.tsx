import { getSessionUser } from "@/app/lib/get-session";

import { Footer } from "@/app/components/footer";
import { Header } from "@/app/components/header";
import { PricingPage } from "./pricing";
import { readAllSubscriptionPlans } from "../profile/subscription-plan-actions";


export default async function Page() {

  const user = await getSessionUser();

  const { subscriptionPlanData } = await readAllSubscriptionPlans()

  console.log('subscriptionPlanData', subscriptionPlanData);


  return (
    <>
      <Header user={user ? user : null} />
      <PricingPage />
      <Footer />
    </>

  )
}
