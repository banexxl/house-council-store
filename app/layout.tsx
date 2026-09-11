import type React from "react"
import Script from "next/script"
import { Providers } from "@/app/providers"
import { Header } from "@/app/components/header"
import { plusJakartaSans } from "@/app/lib/fonts"

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      </head>
      <body className={plusJakartaSans.variable}>
        {/* Google tag (gtag.js) */}
        <Script async src="https://www.googletagmanager.com/gtag/js?id=AW-18137335805" strategy="afterInteractive" />
        <Script id="gtag-init" strategy="afterInteractive">
          {`
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'AW-18137335805');
          `}
        </Script>
        <Providers>
          <Header />
          {children}
        </Providers>
      </body>
    </html>
  )
}
