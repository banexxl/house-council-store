"use client"

import type React from "react"

import { Inter } from "next/font/google"
import { ThemeProvider } from "@mui/material/styles"
import CssBaseline from "@mui/material/CssBaseline"
import { Box } from "@mui/material"
import theme from "@/app/theme"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import { useEffect, useState } from "react"
import { getSession } from "@/lib/get-session"
import { User } from "@supabase/supabase-js"

const inter = Inter({ subsets: ["latin"] })

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<{ user: User } | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Function to fetch session
  const fetchSession = async () => {
    setIsLoading(true)
    try {
      const sessionData = await getSession()
      setSession(sessionData ?? null)
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
  }, [])

  // Create a function to refresh the session that can be passed to Header
  const refreshSession = (): Promise<void> => {
    return fetchSession()
  }

  return (
    <html lang="en">
      <head>
        <title>HouseCouncil - Residential Community Management</title>
        <meta name="description" content="Simplify your house council management with our comprehensive platform." />
      </head>
      <body className={inter.className}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
            <Header
              user={session ? session.user : null}
              isLoading={isLoading}
              refreshSession={refreshSession}
            />
            <Box component="main" sx={{ flexGrow: 1 }}>
              {children}
            </Box>
            <Footer />
          </Box>
        </ThemeProvider>
      </body>
    </html>
  )
}

