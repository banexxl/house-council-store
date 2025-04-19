"use client"

import type React from "react"

import { Inter } from "next/font/google"
import { ThemeProvider } from "@mui/material/styles"
import CssBaseline from "@mui/material/CssBaseline"
import { Box } from "@mui/material"
import theme from "@/app/theme"
import { usePathname } from "next/navigation"
import { AnimatePresence } from "framer-motion"
import Animate from "@/app/components/animation-framer-motion"
import { Toaster } from "react-hot-toast"
// import { useCookieFocusChecker } from "@/app/components/cookie-checker"


const inter = Inter({ subsets: ["latin"] })

export default function RootLayout({ children }: { children: React.ReactNode }) {

  const pathname = usePathname()

  // useCookieFocusChecker()

  return (
    <html lang="en">
      <head>
        <title>NestLink - Residential Community Management</title>
        <meta
          name="description"
          content="Simplify your house council management with our comprehensive platform."
        />
      </head>
      <body className={inter.className}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh", mt: 5 }}>
            <AnimatePresence mode="wait">
              <Animate key={pathname}>
                <Box component="main" sx={{ flexGrow: 1 }}>
                  {children}
                </Box>
              </Animate>
            </AnimatePresence>
          </Box>
          <Toaster position="top-center" />
        </ThemeProvider>
      </body>
    </html>
  )
}
