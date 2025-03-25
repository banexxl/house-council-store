"use client"

import { useEffect } from "react"
import Link from "next/link"
import { Box, Button, Container, Typography, Paper } from "@mui/material"
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline"
import ReplayIcon from "@mui/icons-material/Replay"
import HomeIcon from "@mui/icons-material/Home"
import { Header } from "@/app/components/header"
import { getSessionUser } from "@/app/lib/get-session"

export default async function Error({
     error,
     reset,
}: {
     error: Error & { digest?: string }
     reset: () => void
}) {
     useEffect(() => {
          // Log the error to an error reporting service
          console.error(error)
     }, [error])

     const user = await getSessionUser();

     return (
          <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
               <Header user={user ? user : null} />
               <Box
                    component="main"
                    sx={{
                         flexGrow: 1,
                         display: "flex",
                         alignItems: "center",
                         py: { xs: 6, md: 10 },
                    }}
               >
                    <Container maxWidth="md">
                         <Paper
                              elevation={3}
                              sx={{
                                   p: { xs: 4, md: 6 },
                                   borderRadius: 2,
                                   textAlign: "center",
                                   bgcolor: "background.paper",
                              }}
                         >
                              <Box sx={{ mb: 4 }}>
                                   <ErrorOutlineIcon
                                        sx={{
                                             fontSize: { xs: 80, md: 120 },
                                             color: "error.main",
                                             opacity: 0.8,
                                        }}
                                   />
                              </Box>

                              <Typography
                                   variant="h3"
                                   component="h1"
                                   gutterBottom
                                   sx={{
                                        fontSize: { xs: "1.75rem", md: "2.5rem" },
                                        fontWeight: 700,
                                   }}
                              >
                                   Something Went Wrong
                              </Typography>

                              <Typography
                                   variant="body1"
                                   color="text.secondary"
                                   paragraph
                                   sx={{
                                        maxWidth: 500,
                                        mx: "auto",
                                        mb: 4,
                                   }}
                              >
                                   We apologize for the inconvenience. An unexpected error has occurred. Our team has been notified and is
                                   working to fix the issue.
                              </Typography>

                              {error.digest && (
                                   <Typography variant="caption" display="block" color="text.secondary" sx={{ mb: 4 }}>
                                        Error ID: {error.digest}
                                   </Typography>
                              )}

                              <Box
                                   sx={{
                                        display: "flex",
                                        flexDirection: { xs: "column", sm: "row" },
                                        justifyContent: "center",
                                        gap: 2,
                                   }}
                              >
                                   <Button variant="contained" onClick={reset} startIcon={<ReplayIcon />} sx={{ minWidth: 200 }}>
                                        Try Again
                                   </Button>

                                   <Button variant="outlined" component={Link} href="/" startIcon={<HomeIcon />} sx={{ minWidth: 200 }}>
                                        Back to Home
                                   </Button>
                              </Box>
                         </Paper>
                    </Container>
               </Box>
          </Box>
     )
}

