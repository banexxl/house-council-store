"use client"

import type React from "react"

import { Inter } from "next/font/google"
import { ThemeProvider } from "@mui/material/styles"
import CssBaseline from "@mui/material/CssBaseline"
import { Box } from "@mui/material"
import theme from "@/app/theme"
import { Toaster } from "react-hot-toast"
// import { useCookieFocusChecker } from "@/app/components/cookie-checker"


const inter = Inter({ subsets: ["latin"] })

export default function RootLayout({ children }: { children: React.ReactNode }) {

  // useCookieFocusChecker()

  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh", mt: 5 }}>
            <Box component="main" sx={{ flexGrow: 1, backgroundColor: "#f7f1e6" }}>
              {children}
            </Box>
          </Box>
          <Toaster position="top-center" />
        </ThemeProvider>
      </body>
    </html>
  )
}
