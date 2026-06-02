import type React from "react"
import { getSessionUser } from "@/app/lib/get-session"
import { Providers } from "@/app/providers"
import { Header } from "@/app/components/header"

export const revalidate = 60; // ISR: revalidate every 60 seconds

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser()
  // useCookieFocusChecker()

  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap"
        />
        {/* Google tag (gtag.js) */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=AW-18137335805"></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'AW-18137335805');
            `,
          }}
        />
      </head>
      <body>
        <Providers>
          <Header key={user?.id || "guest"} user={user ? user : null} />
          {children}
        </Providers>
      </body>
    </html>
  )
}
