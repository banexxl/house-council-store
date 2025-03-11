"use client"

import type React from "react"
import { Inter } from 'next/font/google'
import { AppRouterCacheProvider } from "@mui/material-nextjs/v14-appRouter"
import { ThemeProvider } from "@mui/material/styles"
import CssBaseline from "@mui/material/CssBaseline"
import { Box } from "@mui/material"
import theme from "@/app/theme"
import Header, { type User } from "@/components/Header"
import Footer from "@/components/Footer"
import { useEffect, useState, useRef } from "react"
import { getSession } from "@/lib/get-session"
import { useSessionUpdater } from "@/lib/client-session-update"

const inter = Inter({ subsets: ["latin"] })


export default function RootLayout({ children }: { children: React.ReactNode }) {

  const [session, setSession] = useState<{ user: User } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const initialFetchDone = useRef(false);

  const fetchSession = async () => {
    setIsLoading(true);
    try {
      const sessionData = await getSession();
      setSession(sessionData);
    } catch (error) {
      console.error("Error fetching session:", error);
      setSession(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!initialFetchDone.current) {
      fetchSession();
      initialFetchDone.current = true;
    }
  }, []);

  // Use cookie change detector
  useSessionUpdater(fetchSession);

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
            <Header session={session} isLoading={isLoading} refreshSession={fetchSession} />
            <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
              {children}
              <Footer />
            </Box>
          </ThemeProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  )
}

