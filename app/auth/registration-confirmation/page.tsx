"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import {
     Box,
     Button,
     Container,
     Paper,
     Typography,
     TextField,
     InputAdornment,
     CircularProgress,
     Alert,
     Divider,
     Collapse,
} from "@mui/material"
import EmailIcon from "@mui/icons-material/Email"
import MarkEmailReadIcon from "@mui/icons-material/MarkEmailRead"
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline"
import { resendRegistrationEmail } from "./resend-email-action"

export default function RegistrationConfirmationPage() {
     const [email, setEmail] = useState("")
     const [isResending, setIsResending] = useState(false)
     const [resendSuccess, setResendSuccess] = useState(false)
     const [resendError, setResendError] = useState(false)
     const [showResendForm, setShowResendForm] = useState(false)

     const handleResendEmail = async (e: React.FormEvent) => {
          e.preventDefault()

          if (!email) return

          setIsResending(true)
          setResendSuccess(false)
          setResendError(false)

          // Simulate API call to resend confirmation email
          try {
               // In a real app, this would be an actual API call
               await resendRegistrationEmail(email)
               setResendSuccess(true)
          } catch (error) {
               setResendError(true)
          } finally {
               setIsResending(false)
          }
     }

     return (
          <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
               <Box component="main" sx={{ flexGrow: 1, py: { xs: 6, md: 10 } }}>
                    <Container maxWidth="md">
                         <Paper
                              elevation={3}
                              sx={{
                                   p: { xs: 3, md: 6 },
                                   borderRadius: 2,
                                   textAlign: "center",
                              }}
                         >
                              <Box sx={{ display: "flex", justifyContent: "center", mb: 4 }}>
                                   <MarkEmailReadIcon color="primary" sx={{ fontSize: 80 }} />
                              </Box>

                              <Typography variant="h4" component="h1" gutterBottom>
                                   Check Your Email
                              </Typography>

                              <Typography variant="body1" sx={{ mb: 3, maxWidth: 600, mx: "auto" }}>
                                   Thank you for registering with HouseCouncil! We've sent a confirmation email to your inbox. Please check
                                   your email and click on the verification link to activate your account.
                              </Typography>

                              <Box
                                   sx={{
                                        bgcolor: "secondary.light",
                                        p: 3,
                                        borderRadius: 2,
                                        mb: 4,
                                        maxWidth: 600,
                                        mx: "auto",
                                   }}
                              >
                                   <Typography
                                        variant="subtitle1"
                                        gutterBottom
                                        sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}
                                   >
                                        <ErrorOutlineIcon sx={{ mr: 1 }} /> Important:
                                   </Typography>
                                   <Typography variant="body2">
                                        • The confirmation link will expire in 24 hours
                                        <br />• If you don't see the email, please check your spam or junk folder
                                        <br />• Make sure to add <strong>noreply@housecouncil.com</strong> to your contacts
                                   </Typography>
                              </Box>

                              <Collapse in={resendSuccess}>
                                   <Alert severity="success" sx={{ mb: 3, maxWidth: 600, mx: "auto" }}>
                                        Confirmation email has been resent successfully!
                                   </Alert>
                              </Collapse>

                              <Collapse in={resendError}>
                                   <Alert severity="error" sx={{ mb: 3, maxWidth: 600, mx: "auto" }}>
                                        There was an error resending the confirmation email. Please try again.
                                   </Alert>
                              </Collapse>

                              <Box sx={{ mb: 4 }}>
                                   {!showResendForm ? (
                                        <Button variant="text" color="primary" onClick={() => setShowResendForm(true)}>
                                             Didn't receive the email? Resend confirmation
                                        </Button>
                                   ) : (
                                        <Box component="form" onSubmit={handleResendEmail} sx={{ maxWidth: 400, mx: "auto" }}>
                                             <Typography variant="subtitle2" sx={{ mb: 2, textAlign: "left" }}>
                                                  Enter your email address to resend the confirmation:
                                             </Typography>
                                             <TextField
                                                  fullWidth
                                                  type="email"
                                                  placeholder="Your email address"
                                                  value={email}
                                                  onChange={(e) => setEmail(e.target.value)}
                                                  required
                                                  sx={{ mb: 2 }}
                                                  slotProps={{
                                                       input: {
                                                            startAdornment: (
                                                                 <InputAdornment position="start">
                                                                      <EmailIcon />
                                                                 </InputAdornment>
                                                            ),
                                                       }
                                                  }
                                                  }
                                             />
                                             <Button
                                                  type="submit"
                                                  variant="contained"
                                                  color="primary"
                                                  disabled={isResending || !email}
                                                  sx={{ minWidth: 120 }}
                                             >
                                                  {isResending ? <CircularProgress size={24} /> : "Resend Email"}
                                             </Button>
                                        </Box>
                                   )}
                              </Box>

                              <Divider sx={{ my: 4, maxWidth: 600, mx: "auto" }} />

                              <Typography variant="body2" color="text.secondary">
                                   If you continue to have issues, please{" "}
                                   <Link href="/contact" style={{ color: "primary" }}>
                                        contact our support team
                                   </Link>
                                   .
                              </Typography>

                              <Box sx={{ mt: 4 }}>
                                   <Button variant="outlined" component={Link} href="/">
                                        Return to Home Page
                                   </Button>
                              </Box>
                         </Paper>
                    </Container>
               </Box>
          </Box>
     )
}

