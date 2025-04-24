import { Header } from "@/app/components/header"
import { Footer } from "@/app/components/footer"
import type { Metadata } from "next"
import AuthErrorPage from "./auth-error-page"
import { getSessionUser } from "@/app/lib/get-session"
import { logServerAction } from "@/app/lib/server-logging"

export const metadata: Metadata = {
     title: "Authentication Error | Nest Link",
     description: "An error occurred during authentication",
}

export default async function Page() {

     const user = await getSessionUser();

     await logServerAction({
          user_id: user ? user.id : null,
          action: 'Rendering auth error page with users SESSION id',
          payload: {},
          status: 'success',
          error: '',
          duration_ms: 0,
          type: 'internal'
     })

     return (
          <>
               <Header user={user ? user : null} />
               <AuthErrorPage />
               <Footer />
          </>
     )
}

