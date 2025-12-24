import type { Metadata } from "next";
import { getSessionUser } from "@/app/lib/get-session";
import FreeTrialConfirmation from "./free-trial-confirmation";
import { readClientSubscriptionPlanFromClientId, readSubscriptionPlanFeatures } from "@/app/profile/subscription-plan-actions";
import { Header } from "@/app/components/header";
import { Footer } from "@/app/components/footer";
import { readAccountByEmailAction } from "@/app/profile/account-action";
import { logServerAction } from "@/app/lib/server-logging";
import { buildCanonicalUrl, getBaseUrl } from "@/app/lib/seo";

const baseUrl = getBaseUrl();
const canonicalUrl = buildCanonicalUrl("/pricing/subscription-plan-purchase");

export const metadata: Metadata = {
     title: "Start Your Free Trial | House Council Subscription",
     description:
          "Confirm your House Council free trial, review billing cycle details, and get set up with subscription management tools.",
     alternates: {
          canonical: canonicalUrl,
     },
     openGraph: {
          title: "Start Your Free Trial | House Council Subscription",
          description:
               "Secure your House Council free trial and review pricing before activating your subscription plan.",
          url: canonicalUrl,
          siteName: "House Council",
          type: "website",
     },
     twitter: {
          card: "summary_large_image",
          title: "Start Your Free Trial | House Council Subscription",
          description:
               "Confirm your House Council free trial and review pricing details before activation.",
     },
     robots: {
          index: true,
          follow: true,
     },
};

export default async function FreeTrialPage({ searchParams, }: { searchParams: Promise<{ plan_id: string, billing_cycle: 'monthly' | 'annually' }> }) {

     const { plan_id, billing_cycle } = await searchParams;


     // Get the user session
     const user = await getSessionUser()

     const [subscriptionPlan, clientSubscription] = await Promise.all([
          readSubscriptionPlanFeatures(plan_id),
          readClientSubscriptionPlanFromClientId(user?.id!),
     ])

     const { client } = await readAccountByEmailAction(user?.email!)

     await logServerAction({
          user_id: user ? user.id : null,
          action: 'Render Subscription Page',
          payload: { plan_id },
          status: 'success',
          error: '',
          duration_ms: 0,
          type: 'internal',
     })

     const plan = subscriptionPlan?.subscriptionPlanFeatures;

     const structuredData = {
          "@context": "https://schema.org",
          "@type": "Service",
          name: plan?.name ? `${plan.name} plan free trial` : "Subscription plan free trial",
          description: plan?.description || "Confirm your free trial and review subscription billing details.",
          provider: {
               "@type": "Organization",
               name: "House Council",
               url: baseUrl,
          },
          offers: {
               "@type": "Offer",
               priceCurrency: "USD",
               price: billing_cycle === "monthly"
                    ? plan?.monthly_total_price_per_apartment
                    : plan?.total_price_per_apartment_with_discounts,
               availability: "https://schema.org/InStock",
               url: `${canonicalUrl}?plan_id=${plan_id}&billing_cycle=${billing_cycle}`,
          },
     };

     return (
          <>
               <Header user={user ? user : null} />
               <script
                    type="application/ld+json"
                    // Structured data to help search engines understand the free trial offer
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
               />
               <FreeTrialConfirmation
                    subscriptionPlan={subscriptionPlan!.subscriptionPlanFeatures!}
                    billingCycle={billing_cycle}
                    clientSubscription={clientSubscription.clientSubscriptionPlanData!}
                    userEmail={user?.email!}
                    client={client!}
               />
               <Footer />
          </>
     )
}

