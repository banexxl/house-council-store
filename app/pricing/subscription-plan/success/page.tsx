import { redirect } from "next/navigation"
import { getSessionUser } from "@/app/lib/get-session"
import { Header } from "@/app/components/header"
import { Footer } from "@/app/components/footer"
import SubscriptionSuccessPage from "./subscription-plan-success"

export default async function FreeTrialSuccessPage() {
     // Get the user session
     const session = await getSessionUser()

     if (!session) {
          // Redirect to login if not authenticated
          redirect("/auth/sign-in")
     }

     return (
          <>
               <Header user={session ? session : null} />
               <SubscriptionSuccessPage userEmail={session.email!} planId={""} planName={""} isTrial={false} />
               <Footer />
          </>
     )


}

