'use server'

import type { Metadata } from "next";
import { getSessionUser } from "@/app/lib/get-session";
import HomePage from "./home";
import { Footer } from "@/app/components/footer";
import { Header } from "@/app/components/header";
import { buildCanonicalUrl } from "@/app/lib/seo";

const canonicalUrl = buildCanonicalUrl("/");

export const metadata: Metadata = {
  title: "NestLink | House Council Platform for Buildings, Tenants, and Members",
  description:
    "Run announcements, polls, incident reporting, and tenant communication in one place with NestLink’s web dashboard and mobile app.",
  alternates: {
    canonical: canonicalUrl,
  },
  openGraph: {
    title: "NestLink | House Council Platform for Buildings, Tenants, and Members",
    description:
      "Manage building communication, polls, and service requests with NestLink’s web dashboard and tenant mobile experience.",
    url: canonicalUrl,
    siteName: "NestLink",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "NestLink | House Council Platform",
    description:
      "Run announcements, polls, and incident reporting for your building community with NestLink.",
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
      <HomePage />
      <Footer />
    </>

  )
}
