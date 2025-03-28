import { redirect } from "next/navigation"
import { getSessionUser } from "@/app/lib/get-session"
import { Header } from "@/app/components/header"
import { Footer } from "@/app/components/footer"
import FreeTrialError from "./free-trial-error"

export default async function FreeTrialErrorPage() {
     // Get the user session
     const session = await getSessionUser()

     if (!session) {
          // Redirect to login if not authenticated
          redirect("/auth/sign-in")
     }

     return (
          <>
               <Header user={session ? session : null} />
               <FreeTrialError userEmail={session.email!} />
               <Footer />
          </>
     )


}

