import type { Metadata } from "next";
import { getSessionUser } from "@/app/lib/get-session";

import { Footer } from "@/app/components/footer";
import { Header } from "@/app/components/header";
import { RegistrationConfirmedPage } from "./registration-confirmed";
import { activateAccount } from "./registration-confirmed-action";
import { redirect } from "next/navigation";
import { buildCanonicalUrl } from "@/app/lib/seo";

const canonicalUrl = buildCanonicalUrl("/auth/registration-confirmed");

export const metadata: Metadata = {
     title: "Registration Confirmed | NestLink",
     description: "Your NestLink account is confirmed. Continue to sign in and set up your building workspace.",
     alternates: { canonical: canonicalUrl },
     robots: { index: false, follow: false },
     openGraph: {
          title: "Registration Confirmed | NestLink",
          description: "Account verification complete. Sign in to your NestLink dashboard.",
          url: canonicalUrl,
          siteName: "NestLink",
          type: "website",
     },
     twitter: {
          card: "summary",
          title: "Registration Confirmed | NestLink",
          description: "Your NestLink account is ready. Sign in to continue.",
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
