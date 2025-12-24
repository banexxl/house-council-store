import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { getSessionUser } from "@/app/lib/get-session"
import { Header } from "@/app/components/header"
import { Footer } from "@/app/components/footer"
import SubscriptionErrorPage from "./subscription-plan-error.tsx"
import { logServerAction } from "@/app/lib/server-logging"
import { buildCanonicalUrl } from "@/app/lib/seo"

const canonicalUrl = buildCanonicalUrl("/pricing/subscription-plan-purchase/error");

export const metadata: Metadata = {
     title: "Subscription Error | NestLink",
     description: "Something went wrong while activating your NestLink subscription. Try again or contact support.",
     alternates: { canonical: canonicalUrl },
     robots: { index: false, follow: false },
     openGraph: {
          title: "Subscription Error | NestLink",
          description: "An issue occurred while processing your NestLink subscription.",
          url: canonicalUrl,
          siteName: "NestLink",
          type: "website",
     },
     twitter: {
          card: "summary",
          title: "Subscription Error | NestLink",
          description: "Resolve issues processing your NestLink subscription.",
     },
}

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

