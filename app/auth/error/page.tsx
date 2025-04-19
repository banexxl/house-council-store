import { Header } from "@/app/components/header"
import { Footer } from "@/app/components/footer"
import type { Metadata } from "next"
import AuthErrorPage from "./auth-error-page"
import { getSessionUser } from "@/app/lib/get-session"

export const metadata: Metadata = {
     title: "Authentication Error | Nest Link",
     description: "An error occurred during authentication",
}

export default async function Page() {

     const user = await getSessionUser();

     return (
          <>
               <Header user={user ? user : null} />
               <AuthErrorPage />
               <Footer />
          </>
     )
}

