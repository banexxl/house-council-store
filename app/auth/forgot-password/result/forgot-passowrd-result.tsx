"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Box, Button, Container, Paper, Typography, Divider, Alert } from "@mui/material"
import CheckCircleIcon from "@mui/icons-material/CheckCircle"
import CancelIcon from "@mui/icons-material/Cancel"

export function ForgotPasswordResult() {

     const router = useRouter()

     const searchParams = useSearchParams()
     const success = searchParams.get("success") === "true"
     const message = searchParams.get("message") || ""

     return (
          <Box
               sx={{
                    display: "flex",
                    minHeight: "calc(100vh - 200px)",
                    alignItems: "center",
                    justifyContent: "center",
                    bgcolor: "grey.50",
                    px: 2,
                    py: 6,
               }}
          >
               <Container maxWidth="sm">
                    <Paper
                         elevation={3}
                         sx={{
                              p: 4,
                              borderRadius: 2,
                              textAlign: "center",
                         }}
                    >
                         <Box sx={{ mb: 3, display: "flex", justifyContent: "center" }}>
                              {success ? (
                                   <CheckCircleIcon sx={{ fontSize: 80, color: "success.main" }} />
                              ) : (
                                   <CancelIcon sx={{ fontSize: 80, color: "error.main" }} />
                              )}
                         </Box>

                         <Typography variant="h4" component="h1" gutterBottom>
                              {success ? "Email Sent" : "Email Not Found"}
                         </Typography>

                         <Typography variant="body1" color="text.secondary" >
                              {success
                                   ? "We've sent password reset instructions to your email."
                                   : "We couldn't find an account with that email address."}
                         </Typography>

                         <Typography variant="body1" sx={{ mt: 2 }}>
                              {message}
                         </Typography>

                         {success && (
                              <Alert severity="info" sx={{ mt: 3, mb: 3, textAlign: "left" }}>
                                   <Typography variant="body2">
                                        Please check your inbox and spam folder for the password reset link.
                                   </Typography>
                                   <Typography variant="body2" sx={{ mt: 1 }}>
                                        The link will expire in 24 hours.
                                   </Typography>
                              </Alert>
                         )}

                         <Divider sx={{ my: 3 }} />

                         <Box sx={{ display: "flex", justifyContent: "center", gap: 2 }}>
                              {success ? (
                                   <Button variant="contained" size="large" fullWidth onClick={() => router.push("/auth/sign-in")}>
                                        Return to Login
                                   </Button>
                              ) : (
                                   <>
                                        <Button
                                             variant="outlined"
                                             size="large"
                                             sx={{ flex: 1 }}
                                             onClick={() => router.push("/auth/forgot-password")}
                                        >
                                             Try Again
                                        </Button>
                                        <Button variant="contained" size="large" sx={{ flex: 1 }} onClick={() => router.push("/auth/register")}>
                                             Create Account
                                        </Button>
                                   </>
                              )}
                         </Box>
                    </Paper>
               </Container>
          </Box>
     )
}
