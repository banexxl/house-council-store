import type { Metadata } from "next";
import { getSessionUser } from "@/app/lib/get-session";

import { Footer } from "@/app/components/footer";
import { Header } from "@/app/components/header";
import { PrivacyPage } from "./privacy";
import { buildCanonicalUrl } from "@/app/lib/seo";

const canonicalUrl = buildCanonicalUrl("/privacy-policy");

export const metadata: Metadata = {
  title: "Privacy Policy – NestLink Building Management & Tenant Communication Software",
  description:
    "Learn how NestLink protects user data for building managers and tenants. Review our data security practices, privacy commitments, GDPR compliance, and how information is handled across the web dashboard, mobile app, and all services.",
  alternates: {
    canonical: canonicalUrl,
  },
  openGraph: {
    title: "Privacy Policy | NestLink Building Platform",
    description:
      "Details on data handling, security, and privacy for NestLink users on web and mobile.",
    url: canonicalUrl,
    siteName: "NestLink",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Privacy Policy | NestLink",
    description:
      "Understand how NestLink manages user data across web and mobile experiences.",
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
      <PrivacyPage />
      <Footer />
    </>

  )
}
