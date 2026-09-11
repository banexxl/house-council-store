import type { Metadata } from "next";
import { RegisterPage } from "./register";
import { Footer } from "@/app/components/footer";
import { buildCanonicalUrl } from "@/app/lib/seo";

const canonicalUrl = buildCanonicalUrl("/auth/register");

export const metadata: Metadata = {
     title: "Create a NestLink Account – Building Management & Community Platform",
     description: "Sign up for a free NestLink account to manage your building. Get instant access to a web dashboard for announcements, tenant communication, incident reporting, voting, and service management. No credit card required.",
     alternates: { canonical: canonicalUrl },
     robots: { index: false, follow: false },
     openGraph: {
          title: "Create Account | NestLink",
          description: "Start a NestLink account to manage your building community.",
          url: canonicalUrl,
          siteName: "NestLink",
          type: "website",
     },
     twitter: {
          card: "summary",
          title: "Create Account | NestLink",
          description: "Sign up to use NestLink’s building communication platform.",
     },
};

export default function Page() {
     return (
          <>
               <RegisterPage />
               <Footer />
          </>

     )
}
