import type { Metadata } from "next";
import { Suspense } from "react";
import { Footer } from "@/app/components/footer";
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

export default function Page() {
     return (
          <>
               <Suspense fallback={null}>
                    <ResetPasswordPage />
               </Suspense>
               <Footer />
          </>
     );
}
