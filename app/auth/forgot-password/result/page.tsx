import type { Metadata } from "next";
import { getSessionUser } from "@/app/lib/get-session";

import { Footer } from "@/app/components/footer";
import { Header } from "@/app/components/header";
import { ForgotPasswordResult } from "./forgot-passowrd-result";
import { buildCanonicalUrl } from "@/app/lib/seo";

const canonicalUrl = buildCanonicalUrl("/auth/forgot-password/result");

export const metadata: Metadata = {
     title: "Password Reset Status | NestLink",
     description: "See the status of your NestLink password reset request and next steps.",
     alternates: { canonical: canonicalUrl },
     robots: { index: false, follow: false },
     openGraph: {
          title: "Password Reset Status | NestLink",
          description: "Status update for your NestLink password reset.",
          url: canonicalUrl,
          siteName: "NestLink",
          type: "website",
     },
     twitter: {
          card: "summary",
          title: "Password Reset Status | NestLink",
          description: "View your NestLink password reset status.",
     },
};

export default async function Page() {

     const user = await getSessionUser();

     return (
          <>
               <Header user={user ? user : null} />
               <ForgotPasswordResult />
               <Footer />
          </>

     )
}
