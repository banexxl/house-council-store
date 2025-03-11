"use client"

import type React from "react"

import { Inter } from "next/font/google"
import { AppRouterCacheProvider } from "@mui/material-nextjs/v14-appRouter"
import { ThemeProvider } from "@mui/material/styles"
import CssBaseline from "@mui/material/CssBaseline"
import { Box } from "@mui/material"
import theme from "@/app/theme"
import Header, { type Session } from "@/components/Header"
import Footer from "@/components/Footer"
import { useEffect, useState } from "react"
import { getSession } from "@/lib/get-session"

const inter = Inter({ subsets: ["latin"] })

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<{ session: Session } | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Function to fetch session
  const fetchSession = async () => {
    setIsLoading(true)
    try {
      const sessionData = await getSession()
      setSession(sessionData?.user ? { session: sessionData } : null)
    } catch (error) {
      console.error("Error fetching session:", error)
      setSession(null)
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch session on initial load and when route changes
  useEffect(() => {
    fetchSession()
  }, [session]) // Re-fetch when route changes

  // Create a function to refresh the session that can be passed to Header
  const refreshSession = () => {
    fetchSession()
  }

  return (
    <html lang="en">
      <head>
        <title>HouseCouncil - Residential Community Management</title>
        <meta name="description" content="Simplify your house council management with our comprehensive platform." />
      </head>
      <body className={inter.className}>
        <AppRouterCacheProvider>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
              <Header
                session={session ? session.session : undefined}
                isLoading={isLoading}
                refreshSession={refreshSession}
              />
              <Box component="main" sx={{ flexGrow: 1 }}>
                {children}
              </Box>
              <Footer />
            </Box>
          </ThemeProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  )
}

