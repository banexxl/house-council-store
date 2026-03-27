"use client"

import type React from "react"

import { ThemeProvider } from "@mui/material/styles"
import CssBaseline from "@mui/material/CssBaseline"
import { Box } from "@mui/material"
import theme from "@/app/theme"
import { Toaster } from "react-hot-toast"

export function Providers({ children }: { children: React.ReactNode }) {
     return (
          <ThemeProvider theme={theme}>
               <CssBaseline />
               <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh", mt: 5 }}>
                    <Box component="main" sx={{ flexGrow: 1, backgroundColor: "#f7f1e6" }}>
                         {children}
                    </Box>
               </Box>
               <Toaster position="top-center" />
          </ThemeProvider>
     )
}
