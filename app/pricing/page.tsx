import type { Metadata } from "next";
import { getSessionUser } from "@/app/lib/get-session";

import { Footer } from "@/app/components/footer";
import { Header } from "@/app/components/header";
import { PricingPage } from "./pricing";
import { readActivePolarProducts, readClientSubscriptionPlanFromClientId, getApartmentCountForClient } from "../profile/subscription-plan-actions";
import { readAccountByEmailAction } from "../profile/account-action";
import { buildCanonicalUrl } from "@/app/lib/seo";

const canonicalUrl = buildCanonicalUrl("/pricing");

export const metadata: Metadata = {
  title: "NestLink Pricing | Simple Plans for Building Communities",
  description:
    "See NestLink pricing, pay-per-apartment rates, and member seats for managing building communication, polls, and service requests.",
  alternates: {
    canonical: canonicalUrl,
  },
  openGraph: {
    title: "NestLink Pricing | Simple Plans for Building Communities",
    description:
      "Compare NestLink plans and pick the right pay-per-apartment option for your building with web dashboard and tenant mobile access.",
    url: canonicalUrl,
    siteName: "NestLink",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "NestLink Pricing | Building Platform",
    description:
      "Review NestLink plans for announcements, polls, and tenant communication across web and mobile.",
  },
};


export default async function Page() {

  const user = await getSessionUser();
  const { client, error } = await readAccountByEmailAction(user?.email!);
  const { polarProducts } = await readActivePolarProducts();
  const { clientSubscriptionPlanData } = await readClientSubscriptionPlanFromClientId(client?.id!)
  const apartmentCountResult = client?.id ? await getApartmentCountForClient(client.id) : 0;

  return (
    <>
      <Header user={user ? user : null} />
      <PricingPage
        polarProducts={polarProducts || []}
        clientSubscriptionPlanData={clientSubscriptionPlanData}
        apartmentCount={apartmentCountResult || 0}
        client={client || null}
      />
      <Footer />
    </>

  )
}
