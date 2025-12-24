import type { Metadata } from "next";
import { getSessionUser } from "@/app/lib/get-session";

import { Footer } from "@/app/components/footer";
import { LoginPage } from "./sign-in";
import { Header } from "@/app/components/header";
import { buildCanonicalUrl } from "@/app/lib/seo";

const canonicalUrl = buildCanonicalUrl("/auth/sign-in");

export const metadata: Metadata = {
     title: "Sign In | NestLink",
     description: "Access your NestLink dashboard to manage buildings, members, and tenants.",
     alternates: { canonical: canonicalUrl },
     robots: { index: false, follow: false },
     openGraph: {
          title: "Sign In | NestLink",
          description: "Log in to manage your building communication and tenant workflows.",
          url: canonicalUrl,
          siteName: "NestLink",
          type: "website",
     },
     twitter: {
          card: "summary",
          title: "Sign In | NestLink",
          description: "Access your NestLink dashboard.",
     },
};

export default async function Page() {

     const user = await getSessionUser();

     return (
          <>
               <Header user={user ? user : null} />
               <LoginPage />
               <Footer />
          </>

     )
}
