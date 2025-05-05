import { redirect } from "next/navigation"
import { getSessionUser } from "@/app/lib/get-session"
import { Header } from "@/app/components/header"
import { Footer } from "@/app/components/footer"
import SubscriptionSuccessPage from "./subscription-plan-success"
import { logServerAction } from "@/app/lib/server-logging"

export default async function FreeTrialSuccessPage() {
     // Get the user session
     const session = await getSessionUser()

     const dashboardUrl = process.env.NEXT_PUBLIC_DASHBOARD_URL!

     if (!session) {
          // Redirect to login if not authenticated
          redirect("/auth/sign-in")
     }

     await logServerAction({
          user_id: session ? session.id : null,
          action: 'Render Subscription Success Page',
          payload: {},
          status: 'success',
          error: '',
          duration_ms: 0,
          type: 'internal',
     })

     return (
          <>
               <Header user={session ? session : null} />
               <SubscriptionSuccessPage userEmail={session.email!} planId={""} planName={""} isTrial={false} dashboardUrl={dashboardUrl} />
               <Footer />
          </>
     )


}

