import type { Metadata } from "next";
import { getSessionUser } from "@/app/lib/get-session";
import { buildCanonicalUrl } from "@/app/lib/seo";

import { Footer } from "@/app/components/footer";
import { Header } from "@/app/components/header";
import { RegistrationConfirmationPage } from "./registration-confirmation";

const canonicalUrl = buildCanonicalUrl("/auth/registration-confirmation");

export const metadata: Metadata = {
     title: "Verify Your Email – Complete Your NestLink Registration",
     description:
          "Check your inbox for a confirmation email from NestLink. Click the verification link to complete your account registration and unlock access to building management tools.",
     alternates: { canonical: canonicalUrl },
     robots: { index: false, follow: false },
     openGraph: {
          title: "Verify Your Email – NestLink",
          description: "Complete your NestLink registration by verifying your email address.",
          url: canonicalUrl,
          siteName: "NestLink",
          type: "website",
     },
     twitter: {
          card: "summary",
          title: "Verify Your Email – NestLink",
          description: "Confirm your email to activate your NestLink account.",
     },
};

export default async function Page() {

     const user = await getSessionUser();

     return (
          <>
               <Header user={user ? user : null} />
               <RegistrationConfirmationPage />
               <Footer />
          </>

     )
}
