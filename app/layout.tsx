import type React from "react"

import { Inter } from "next/font/google"
import { Providers } from "@/app/providers"
// import { useCookieFocusChecker } from "@/app/components/cookie-checker"


const inter = Inter({ subsets: ["latin"] })

export default function RootLayout({ children }: { children: React.ReactNode }) {

  // useCookieFocusChecker()

  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
      </head>
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
