"use client"

import type React from "react"

import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter"
import { ThemeProvider } from "@mui/material/styles"
import CssBaseline from "@mui/material/CssBaseline"
import { Box } from "@mui/material"
import theme from "@/app/theme"
import { Toaster } from "react-hot-toast"
import { HEADER_HEIGHT } from "@/app/lib/layout-constants"

export function Providers({ children }: { children: React.ReactNode }) {
     return (
          <AppRouterCacheProvider options={{ enableCssLayer: true }}>
               <ThemeProvider theme={theme}>
                    <CssBaseline />
                    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
                         <Box component="main" sx={{ flexGrow: 1, pt: `${HEADER_HEIGHT}px`, backgroundColor: "background.default" }}>
                              {children}
                         </Box>
                    </Box>
                    <Toaster position="top-center" toastOptions={{
                         duration: 2000,
                         style: {
                              borderRadius: "10px",
                              fontWeight: 600,
                         },
                    }} />
               </ThemeProvider>
          </AppRouterCacheProvider>
     )
}
