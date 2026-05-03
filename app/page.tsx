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
  keywords: [
    "property management app",
    "building management system",
    "apartment management software",
    "tenant management app",
    "landlord app",
    "real estate management platform",
    "housing management system",
    "rental management app",
    "property admin software",
    "building administration app",
    "tenant portal",
    "tenant tracking",
    "tenant database",
    "tenant communication app",
    "tenant records management",
    "tenant billing system",
    "tenant onboarding",
    "tenant profiles",
    "tenant directory",
    "tenant access management",
    "apartment tracking",
    "unit management system",
    "apartment listing management",
    "flat management app",
    "occupancy tracking",
    "apartment allocation",
    "unit availability tracker",
    "apartment status tracking",
    "multi-unit property software",
    "building amenities tracking",
    "property features management",
    "elevator management",
    "parking management system",
    "heating system tracking",
    "facility management app",
    "building infrastructure management",
    "maintenance tracking system",
    "maintenance management app",
    "repair tracking system",
    "issue reporting app",
    "task management for buildings",
    "work order management",
    "maintenance requests",
    "building service tracking",
    "facility maintenance software",
    "building communication app",
    "tenant messaging system",
    "property notifications",
    "community app for residents",
    "building announcements",
    "internal communication platform",
    "chat for tenants",
    "landlord tenant communication",
    "rent tracking",
    "payment management system",
    "tenant billing",
    "invoice management",
    "subscription management",
    "expense tracking",
    "building financial management",
    "rent reminders",
    "payment notifications",
    "property dashboard",
    "building analytics",
    "real estate reporting",
    "admin panel property management",
    "KPI tracking real estate",
    "building insights",
    "tenant analytics",
    "occupancy reports",
    "secure tenant access",
    "role-based access control",
    "building security app",
    "access management system",
    "authentication system",
    "user permissions management",
    "SaaS property management",
    "cloud property management software",
    "web-based building management",
    "scalable real estate platform",
    "modern property tech",
    "proptech solution",
    "digital property management",
    "mobile property management app",
    "tenant mobile app",
    "landlord mobile dashboard",
    "responsive admin panel",
    "cross-platform real estate app",
    "app for managing tenants and apartments",
    "software for building administration",
    "how to manage tenants digitally",
    "best app for landlords and tenants",
    "apartment and building management system",
    "track tenants and payments app",
    "property management app with dashboard",
    "tenant communication and billing app",
    "building maintenance tracking software",
    "Nest Link property management",
    "Nest Link tenant app",
    "Nest Link building system",
    "Nest Link real estate platform",
    "Nest Link SaaS"
  ],
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
