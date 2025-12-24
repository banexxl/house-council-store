import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { getSessionUser } from "@/app/lib/get-session"
import { Header } from "@/app/components/header"
import { Footer } from "@/app/components/footer"
import SubscriptionSuccessPage from "./subscription-plan-success"
import { logServerAction } from "@/app/lib/server-logging"
import { readClientSubscriptionPlanFromClientId } from "@/app/profile/subscription-plan-actions"
import { readAccountByEmailAction } from "@/app/profile/account-action"
import { buildCanonicalUrl } from "@/app/lib/seo"

const canonicalUrl = buildCanonicalUrl("/pricing/subscription-plan-purchase/success");

export const metadata: Metadata = {
     title: "Subscription Confirmed | NestLink",
     description: "Your NestLink subscription is active. Continue to your dashboard to manage your building community.",
     alternates: { canonical: canonicalUrl },
     robots: { index: false, follow: false },
     openGraph: {
          title: "Subscription Confirmed | NestLink",
          description: "Your NestLink plan is active. Go to your dashboard to get started.",
          url: canonicalUrl,
          siteName: "NestLink",
          type: "website",
     },
     twitter: {
          card: "summary",
          title: "Subscription Confirmed | NestLink",
          description: "Your NestLink subscription is active.",
     },
}

export default async function FreeTrialSuccessPage() {
     // Get the user session
     const session = await getSessionUser()

     // Fetch client data
     const { client, error } = await readAccountByEmailAction(session?.email!);

     const dashboardUrl = process.env.NEXT_PUBLIC_DASHBOARD_URL!

     const { clientSubscriptionPlanData } = await readClientSubscriptionPlanFromClientId(client?.id!)

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
               <SubscriptionSuccessPage userEmail={session.email!} planId={""} planName={clientSubscriptionPlanData?.subscription_plan.name!} isTrial={false} dashboardUrl={dashboardUrl} />
               <Footer />
          </>
     )


}

