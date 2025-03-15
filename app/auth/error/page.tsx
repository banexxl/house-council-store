import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import type { Metadata } from "next"
import AuthErrorPage from "./auth-error-page"
import { getSession } from "@/lib/get-session"

export const metadata: Metadata = {
     title: "Authentication Error | House Council",
     description: "An error occurred during authentication",
}

export default async function Page() {

     const session = await getSession();

     return (
          <>
               <Header user={session?.user ? session.user : null} />
               <AuthErrorPage />
               <Footer />
          </>
     )
}

