import type { Metadata } from "next";
import { getSessionUser } from "@/app/lib/get-session";

import { Footer } from "@/app/components/footer";
import { Header } from "@/app/components/header";
import { TermsPage } from "./terms"
import { buildCanonicalUrl } from "@/app/lib/seo";

const canonicalUrl = buildCanonicalUrl("/terms-and-conditions");

export const metadata: Metadata = {
  title: "Terms of Service – NestLink Building & Community Management Platform",
  description:
    "Review the terms and conditions for NestLink. Learn about subscription agreements, user roles and permissions, acceptable use policies, subscription management, billing, and the complete legal terms governing use of our building communication platform.",
  alternates: {
    canonical: canonicalUrl,
  },
  openGraph: {
    title: "Terms and Conditions | NestLink",
    description:
      "The terms that govern use of NestLink for building managers and tenants.",
    url: canonicalUrl,
    siteName: "NestLink",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Terms and Conditions | NestLink",
    description:
      "Read the NestLink terms for subscriptions and building communication features.",
  },
  robots: {
    index: true,
    follow: true,
  },
};


export default async function Page() {

  const user = await getSessionUser();

  return (
    <>
      <Header user={user ? user : null} />
      <TermsPage />
      <Footer />
    </>

  )
}
