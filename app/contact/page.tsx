import type { Metadata } from "next";
import { getSessionUser } from "@/app/lib/get-session";

import { Footer } from "@/app/components/footer";
import { Header } from "@/app/components/header";
import { ContactPage } from "./contact";
import { buildCanonicalUrl } from "@/app/lib/seo";

const canonicalUrl = buildCanonicalUrl("/contact");

export const metadata: Metadata = {
  title: "Contact NestLink | Schedule a Demo or Get Support",
  description:
    "Reach the NestLink team for product questions, demos, or support for your building community platform.",
  alternates: {
    canonical: canonicalUrl,
  },
  openGraph: {
    title: "Contact NestLink | Schedule a Demo or Get Support",
    description:
      "Talk with NestLink about pricing, onboarding, and product questions for your building community.",
    url: canonicalUrl,
    siteName: "NestLink",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact NestLink | Demo or Support",
    description:
      "Get in touch with NestLink for demos, onboarding help, or support.",
  },
};

export default async function Page() {

  const user = await getSessionUser();

  const mapKey = process.env.NEXT_PUBLIC_GOOGLE_MAP_API_KEY

  return (
    <>
      <Header user={user ? user : null} />
      <ContactPage mapKey={mapKey ? mapKey : ""} />
      <Footer />
    </>

  )
}
