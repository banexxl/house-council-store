import type { Metadata } from "next";
import { getSessionUser } from "@/app/lib/get-session";

import { Footer } from "@/app/components/footer";
import { Header } from "@/app/components/header";
import { RegistrationConfirmationPage } from "./registration-confirmation";
import { buildCanonicalUrl } from "@/app/lib/seo";

const canonicalUrl = buildCanonicalUrl("/auth/registration-confirmation");

export const metadata: Metadata = {
     title: "Confirm Your Email | NestLink",
     description: "Check your inbox to confirm your NestLink account and start managing your building community.",
     alternates: { canonical: canonicalUrl },
     robots: { index: false, follow: false },
     openGraph: {
          title: "Confirm Your Email | NestLink",
          description: "Confirm your NestLink account to access the building communication dashboard.",
          url: canonicalUrl,
          siteName: "NestLink",
          type: "website",
     },
     twitter: {
          card: "summary",
          title: "Confirm Your Email | NestLink",
          description: "Verify your NestLink account to continue setup.",
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
