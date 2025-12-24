import { Header } from "@/app/components/header"
import { Footer } from "@/app/components/footer"
import type { Metadata } from "next"
import AuthErrorPage from "./auth-error-page"
import { getSessionUser } from "@/app/lib/get-session"
import { buildCanonicalUrl } from "@/app/lib/seo"

const canonicalUrl = buildCanonicalUrl("/auth/error");

export const metadata: Metadata = {
     title: "Authentication Error | NestLink",
     description: "An error occurred during authentication. Try again or contact support.",
     alternates: { canonical: canonicalUrl },
     robots: { index: false, follow: false },
     openGraph: {
          title: "Authentication Error | NestLink",
          description: "An error occurred during authentication. Try again or contact support.",
          url: canonicalUrl,
          siteName: "NestLink",
          type: "website",
     },
     twitter: {
          card: "summary",
          title: "Authentication Error | NestLink",
          description: "An authentication issue occurred. Please retry.",
     },
}

export default async function Page() {

     const user = await getSessionUser();

     return (
          <>
               <Header user={user ? user : null} />
               <AuthErrorPage />
               <Footer />
          </>
     )
}

