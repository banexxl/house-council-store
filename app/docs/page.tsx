import type { Metadata } from "next";

import { Footer } from "@/app/components/footer";
import { DocsPage } from "./docs";
import { buildCanonicalUrl } from "@/app/lib/seo";

const canonicalUrl = buildCanonicalUrl("/docs");

export const metadata: Metadata = {
  title: "NestLink Documentation – Building & Tenant Communication Platform",
  description:
    "Get started with NestLink's comprehensive documentation. Learn how to set up buildings, manage tenants, create announcements, run polls, track incidents, and configure roles and permissions.",
  alternates: {
    canonical: canonicalUrl,
  },
  openGraph: {
    title: "NestLink Product Docs | Building Communication Platform",
    description:
      "Learn how to set up buildings, tenants, and workflows in NestLink with guides on announcements, polls, and incident reporting.",
    url: canonicalUrl,
    siteName: "NestLink",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "NestLink Product Docs",
    description:
      "Docs for configuring NestLink: announcements, polls, tenant access, and incident reporting.",
  },
};

export default function Page() {
  return (
    <>
      <DocsPage />
      <Footer />
    </>
  )
}
