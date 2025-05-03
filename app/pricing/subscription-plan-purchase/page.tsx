import { getSessionUser } from "@/app/lib/get-session";
import FreeTrialConfirmation from "./free-trial-confirmation";
import { readClientSubscriptionPlan, readSubscriptionPlanById } from "@/app/profile/subscription-plan-actions";
import { Header } from "@/app/components/header";
import { Footer } from "@/app/components/footer";
import { readAccountByEmailAction } from "@/app/profile/account-action";
import { logServerAction } from "@/app/lib/server-logging";


export default async function FreeTrialPage({ searchParams, }: { searchParams: Promise<{ plan_id: string, billing_cycle: 'monthly' | 'annually' }> }) {

     const { plan_id, billing_cycle } = await searchParams;


     // Get the user session
     const user = await getSessionUser()

     const [subscriptionPlan, clientSubscription] = await Promise.all([
          readSubscriptionPlanById(plan_id),
          readClientSubscriptionPlan(user?.id!),
     ])

     const { client } = await readAccountByEmailAction(user?.email!)

     await logServerAction({
          user_id: user ? user.id : null,
          action: 'Render Subscription Page',
          payload: { plan_id },
          status: 'success',
          error: '',
          duration_ms: 0,
          type: 'internal',
     })

     return (
          <>
               <Header user={user ? user : null} />
               <FreeTrialConfirmation
                    subscriptionPlan={subscriptionPlan!.subscriptionPlan!}
                    billingCycle={billing_cycle}
                    clientSubscription={clientSubscription.clientSubscriptionPlanData!}
                    userEmail={user?.email!}
                    client={client!}
               />
               <Footer />
          </>
     )
}

