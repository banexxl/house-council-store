'use server'

import type { Metadata } from "next";
import { getSessionUser } from "@/app/lib/get-session";
import { Footer } from "@/app/components/footer";
import { Header } from "@/app/components/header";
import { ResetPasswordPage } from "./reset-password";
import { buildCanonicalUrl } from "@/app/lib/seo";

const canonicalUrl = buildCanonicalUrl("/auth/reset-password");

export const metadata: Metadata = {
     title: "Create New Password | NestLink",
     description: "Set a new password to secure your NestLink account and return to your dashboard.",
     alternates: { canonical: canonicalUrl },
     robots: { index: false, follow: false },
     openGraph: {
          title: "Create New Password | NestLink",
          description: "Finish resetting your NestLink password securely.",
          url: canonicalUrl,
          siteName: "NestLink",
          type: "website",
     },
     twitter: {
          card: "summary",
          title: "Create New Password | NestLink",
          description: "Update your NestLink password securely.",
     },
};

export default async function Page() {

     const user = await getSessionUser();

     return (
          <>
               <Header user={user || null} />
               <ResetPasswordPage />
               <Footer />
          </>
     );
}
