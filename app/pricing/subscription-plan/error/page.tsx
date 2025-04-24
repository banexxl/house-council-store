import { redirect } from "next/navigation"
import { getSessionUser } from "@/app/lib/get-session"
import { Header } from "@/app/components/header"
import { Footer } from "@/app/components/footer"
import SubscriptionErrorPage from "./subscription-plan-error.tsx"
import { logServerAction } from "@/app/lib/server-logging.js"

export default async function FreeTrialErrorPage() {
     // Get the user session
     const session = await getSessionUser()

     if (!session) {
          // Redirect to login if not authenticated
          redirect("/auth/sign-in")
     }

     await logServerAction({
          user_id: session ? session.id : null,
          action: 'Render Subscription Error Page',
          payload: {},
          status: 'success',
          error: '',
          duration_ms: 0,
          type: 'internal',
     })

     return (
          <>
               <Header user={session ? session : null} />
               <SubscriptionErrorPage userEmail={session.email!} />
               <Footer />
          </>
     )


}

