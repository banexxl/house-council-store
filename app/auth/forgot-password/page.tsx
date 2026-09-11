import type { Metadata } from "next";

import { Footer } from "@/app/components/footer";
import ForgotPasswordPage from "./forgot-password";
import { buildCanonicalUrl } from "@/app/lib/seo";

const canonicalUrl = buildCanonicalUrl("/auth/forgot-password");

export const metadata: Metadata = {
     title: "Reset Password | NestLink",
     description: "Request a secure password reset link to regain access to your NestLink account.",
     alternates: { canonical: canonicalUrl },
     robots: { index: false, follow: false },
     openGraph: {
          title: "Reset Password | NestLink",
          description: "Start your password reset for NestLink.",
          url: canonicalUrl,
          siteName: "NestLink",
          type: "website",
     },
     twitter: {
          card: "summary",
          title: "Reset Password | NestLink",
          description: "Request a password reset for your NestLink account.",
     },
};

export default function Page() {
     return (
          <>
               <ForgotPasswordPage />
               <Footer />
          </>

     )
}
