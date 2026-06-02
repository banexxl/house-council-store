import type { Metadata } from "next";
import { getSessionUser } from "@/app/lib/get-session";
import { buildCanonicalUrl } from "@/app/lib/seo";

import { Footer } from "@/app/components/footer";
import { Header } from "@/app/components/header";
import { RegistrationConfirmedPage } from "./registration-confirmed";

const canonicalUrl = buildCanonicalUrl("/auth/registration-confirmed");

export const metadata: Metadata = {
     title: "Registration Complete – Welcome to NestLink",
     description:
          "Your NestLink account has been successfully created and verified. Log in to your dashboard and start setting up your first building community with announcements, tenant communication, and management tools.",
     alternates: { canonical: canonicalUrl },
     robots: { index: false, follow: false },
     openGraph: {
          title: "Registration Complete – Welcome to NestLink",
          description: "Your NestLink account is ready. Start managing your building community.",
          url: canonicalUrl,
          siteName: "NestLink",
          type: "website",
     },
     twitter: {
          card: "summary",
          title: "Welcome to NestLink",
          description: "Your registration is complete. Log in to get started.",
     },
};

export default async function Page() {

     const user = await getSessionUser();

     return (
          <>
               <Header user={user ? user : null} />
               <RegistrationConfirmedPage />
               <Footer />
          </>

     )
}