import type { Metadata } from "next";

import { Footer } from "@/app/components/footer";
import { ContactPage } from "./contact";
import { buildCanonicalUrl } from "@/app/lib/seo";

const canonicalUrl = buildCanonicalUrl("/contact");

export const metadata: Metadata = {
  title: "Contact NestLink – Demo, Pricing & Support for Building Communities",
  description:
    "Get in touch with the NestLink team. Schedule a product demo, ask questions about pricing, get onboarding help, or contact support for building management and tenant communication software.",
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

export default function Page() {
  const mapKey = process.env.NEXT_PUBLIC_GOOGLE_MAP_API_KEY

  return (
    <>
      <ContactPage mapKey={mapKey ? mapKey : ""} />
      <Footer />
    </>
  )
}
