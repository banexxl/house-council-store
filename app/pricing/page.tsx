import { getSessionUser } from "@/app/lib/get-session";

import { Footer } from "@/app/components/footer";
import { Header } from "@/app/components/header";
import { PricingPage } from "./pricing";
import { readSubscriptionPlansByStatus, readClientSubscriptionPlanFromClientId } from "../profile/subscription-plan-actions";
import { logServerAction } from "../lib/server-logging";
import { readAccountByEmailAction } from "../profile/account-action";


export default async function Page() {
  const user = await getSessionUser();

  if (!user?.email) {
    throw new Error("User email is required");
  }

  // Start independent call
  const subscriptionPlansPromise = readSubscriptionPlansByStatus('Active');

  // Start dependent chain
  const { client, error } = await readAccountByEmailAction(user.email);
  if (!client?.id) {
    throw new Error("Client not found");
  }

  const clientSubscriptionPlanPromise = readClientSubscriptionPlanFromClientId(client.id);

  // Await all parallel promises
  const [{ subscriptionPlanData }, { clientSubscriptionPlanData }] = await Promise.all([
    subscriptionPlansPromise,
    clientSubscriptionPlanPromise,
  ]);

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
