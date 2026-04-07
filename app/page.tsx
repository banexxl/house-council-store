import type { Metadata } from "next";
import { getSessionUser } from "@/app/lib/get-session";
import HomePage from "./home";
import { Footer } from "@/app/components/footer";
import { Header } from "@/app/components/header";
import { buildCanonicalUrl } from "@/app/lib/seo";

const canonicalUrl = buildCanonicalUrl("/");

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL!),
  title: "NestLink – Building Management & Tenant Communication Software",
  description:
    "Run announcements, polls, incident reporting, and tenant communication in one place with NestLink’s web dashboard and mobile app.",
  alternates: {
    canonical: canonicalUrl,
  },
  openGraph: {
    title: "NestLink | House Council Platform for Buildings, Tenants, and Building managers",
    description:
      "Manage building communication, polls, and service requests with NestLink’s web dashboard and tenant mobile experience.",
    url: canonicalUrl,
    siteName: "NestLink",
    type: "website",
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'NestLink – Building Management Software',
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "NestLink | House Council Platform",
    description:
      "Run announcements, polls, and incident reporting for your building community with NestLink.",
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default async function Page() {

  const user = await getSessionUser();

  const organizationLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "NestLink",
    "url": process.env.NEXT_PUBLIC_BASE_URL,
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web, iOS, Android",
    "description": "Building management and tenant communication platform for apartment buildings and housing communities.",
    "featureList": [
      "Building Manager Web Dashboard",
      "Tenant Mobile App",
      "Announcements & Notifications",
      "Polls & Voting",
      "Incident & Service Reporting with Photos",
      "Role-based Permissions"
    ],
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD",
      "description": "Free trial available. Subscription priced per apartment/unit."
    }
  };

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Is NestLink web-only or mobile-only?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Both. Clients use the web dashboard, and tenants have mobile + web access with consistent permissions."
        }
      },
      {
        "@type": "Question",
        "name": "How does incident reporting work?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Tenants submit a report (optionally with photos). Clients manage progress and close it when resolved."
        }
      },
      {
        "@type": "Question",
        "name": "How do you price it?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "It is priced per apartment/unit, with no limit on tenants."
        }
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
      />
      <Header user={user ? user : null} />
      <HomePage />
      <Footer />
    </>

  )
}
