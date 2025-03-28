import { redirect } from "next/navigation"
import FreeTrialSuccess from "./free-trial-success"
import { getSessionUser } from "@/app/lib/get-session"
import { Header } from "@/app/components/header"
import { Footer } from "@/app/components/footer"

export default async function FreeTrialSuccessPage() {
     // Get the user session
     const session = await getSessionUser()

     if (!session) {
          // Redirect to login if not authenticated
          redirect("/login")
     }

     return (
          <>
               <Header user={session ? session : null} />
               <FreeTrialSuccess userEmail={session.email!} />
               <Footer />
          </>
     )


}

