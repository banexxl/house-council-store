import { Footer } from "@/app/components/footer"
import type { Metadata } from "next"
import { Suspense } from "react"
import AuthErrorPage from "./auth-error-page"
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

export default function Page() {
     return (
          <>
               <Suspense fallback={null}>
                    <AuthErrorPage />
               </Suspense>
               <Footer />
          </>
     )
}

