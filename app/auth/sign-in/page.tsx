import type { Metadata } from "next";
import { Suspense } from "react";
import { buildCanonicalUrl } from "@/app/lib/seo";

import { Footer } from "@/app/components/footer";
import { LoginPage } from "./sign-in";

const canonicalUrl = buildCanonicalUrl("/auth/sign-in");

export const metadata: Metadata = {
     title: "Sign In to NestLink – Building Management & Communication Platform",
     description:
          "Access your NestLink account to manage building announcements, tenant communication, voting, incident reporting, and service requests. Secure login for building managers and community administrators.",
     alternates: { canonical: canonicalUrl },
     robots: { index: false, follow: false },
     openGraph: {
          title: "Sign In to NestLink",
          description: "Log in to your NestLink account for building management and tenant communication.",
          url: canonicalUrl,
          siteName: "NestLink",
          type: "website",
     },
     twitter: {
          card: "summary",
          title: "Sign In to NestLink",
          description: "Access your NestLink account for building management.",
     },
};

export default function Page() {
     return (
          <>
               <Suspense fallback={null}>
                    <LoginPage />
               </Suspense>
               <Footer />
          </>

     )
}
