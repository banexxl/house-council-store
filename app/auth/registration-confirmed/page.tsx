import type { Metadata } from "next";
import { Suspense } from "react";
import { buildCanonicalUrl } from "@/app/lib/seo";

import { Footer } from "@/app/components/footer";
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

export default function Page() {
     return (
          <>
               <Suspense fallback={null}>
                    <RegistrationConfirmedPage />
               </Suspense>
               <Footer />
          </>

     )
}