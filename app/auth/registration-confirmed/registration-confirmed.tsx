"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"
import {
     Box,
     Button,
     Container,
     Paper,
     Typography,
     Divider,
     List,
     ListItem,
     ListItemIcon,
     ListItemText,
     Alert,
} from "@mui/material"
import CheckCircleIcon from "@mui/icons-material/CheckCircle"
import ErrorIcon from "@mui/icons-material/Error"
import LoginIcon from "@mui/icons-material/Login"
import PersonIcon from "@mui/icons-material/Person"
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import BiotechIcon from '@mui/icons-material/Biotech';
import Animate from "@/app/components/animation-framer-motion"
import toast from "react-hot-toast"
import { createBrowserClient } from "@supabase/ssr"
import { useEffect, useState } from "react"
import { resendRegistrationEmail } from "../registration-confirmation/resend-email-action"

export const RegistrationConfirmedPage = () => {
     const searchParams = useSearchParams()
     const errorCode = searchParams.get("error_code")
     const errorDescription = searchParams.get("error_description")
     const [resendingConfirmation, setResendingConfirmation] = useState(false)
     const [authEmail, setAuthEmail] = useState<string | null>(null)

     // Try to get email from auth session if not in URL params
     useEffect(() => {
          const getAuthEmail = async () => {
               try {
                    const supabase = createBrowserClient(
                         process.env.NEXT_PUBLIC_SUPABASE_URL as string,
                         process.env.NEXT_PUBLIC_SB_CLIENT_KEY as string
                    )
                    const { data: { user }, error } = await supabase.auth.getUser()
                    if (user?.email) {
                         setAuthEmail(user.email)
                    }
                    supabase.auth.signOut()
               } catch (err) {
                    console.error("Failed to get auth user:", err)
               }
          }
          getAuthEmail()
     }, [])

     const isError = !!errorCode

     const handleResendEmail = async () => {
          if (!authEmail) {
               toast.error("Email not found. Please try registering again.")
               return
          }

          setResendingConfirmation(true)
          try {
               const success = await resendRegistrationEmail(authEmail)
               if (success) {
                    toast.success("Confirmation email sent! Check your inbox.")
               } else {
                    toast.error("Failed to resend email. Please try again.")
               }
          } catch (err) {
               toast.error("Error: " + (err instanceof Error ? err.message : String(err)))
          } finally {
               setResendingConfirmation(false)
          }
     }

     return (
          <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh", mt: 5 }}>
               <Animate>
                    <Box component="main" sx={{ flexGrow: 1, py: { xs: 6, md: 10 } }}>
                         <Container maxWidth="md">
                              <Paper elevation={3} sx={{ p: { xs: 3, md: 5 }, textAlign: "center" }}>
                                   {isError ? (
                                        <>
                                             <Box sx={{ color: "error.main", mb: 3 }}>
                                                  <ErrorIcon sx={{ fontSize: 70 }} />
                                             </Box>

                                             <Typography variant="h3" gutterBottom sx={{ color: "error.main" }}>
                                                  Email Confirmation Failed
                                             </Typography>

                                             <Typography variant="h6" sx={{ mb: 3, color: "text.secondary" }}>
                                                  {errorDescription || "Unable to confirm your email"}
                                             </Typography>

                                             <Alert severity="warning" sx={{ mb: 3, maxWidth: 600, mx: "auto", textAlign: "left" }}>
                                                  {errorCode === "otp_expired" && (
                                                       <>Your confirmation link has expired. Please request a new one.</>
                                                  )}
                                                  {errorCode === "access_denied" && !errorDescription?.includes("expired") && (
                                                       <>Your confirmation link is invalid or has been used already.</>
                                                  )}
                                             </Alert>

                                             <Box sx={{ my: 3, display: "flex", gap: 2, justifyContent: "center", flexWrap: "wrap" }}>
                                                  <Button
                                                       variant="contained"
                                                       size="large"
                                                       onClick={handleResendEmail}
                                                       disabled={resendingConfirmation || !authEmail}
                                                  >
                                                       {resendingConfirmation ? "Resending..." : "Resend Confirmation Email"}
                                                  </Button>
                                                  <Button
                                                       variant="outlined"
                                                       size="large"
                                                       component={Link}
                                                       href="/auth/sign-in"
                                                       startIcon={<LoginIcon />}
                                                  >
                                                       Back to Sign In
                                                  </Button>
                                             </Box>
                                        </>
                                   ) : (
                                        <>
                                             <Box sx={{ color: "success.main", mb: 3 }}>
                                                  <CheckCircleIcon sx={{ fontSize: 70 }} />
                                             </Box>

                                             <Typography variant="h3" gutterBottom>
                                                  Registration Successful!
                                             </Typography>

                                             <Typography variant="h6" sx={{ mb: 3 }}>
                                                  Welcome to NestLink!
                                             </Typography>

                                             <Typography variant="body1" sx={{ maxWidth: 600, mx: "auto" }}>
                                                  Your account has been successfully created. You can now log in and start using our services.
                                             </Typography>

                                             <Box sx={{ my: 4 }}>
                                                  <Button
                                                       variant="contained"
                                                       size="large"
                                                       component={Link}
                                                       href="/auth/sign-in"
                                                       startIcon={<LoginIcon />}
                                                       sx={{ px: 4, py: 1.5 }}
                                                  >
                                                       Go to Login
                                                  </Button>
                                             </Box>

                                             <Divider sx={{ my: 4, maxWidth: 600, mx: "auto" }}>
                                                  <Typography variant="body2" color="text.secondary">
                                                       NEXT STEPS
                                                  </Typography>
                                             </Divider>

                                             <Box sx={{ maxWidth: 600, mx: "auto", textAlign: "left", mb: 4 }}>
                                                  <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                                                       After verifying your email, you can:
                                                  </Typography>

                                                  <List>
                                                       <ListItem>
                                                            <ListItemIcon>
                                                                 <PersonIcon color="primary" />
                                                            </ListItemIcon>
                                                            <ListItemText
                                                                 primary="Sign in and Set Up Your Profile"
                                                                 secondary="Add your personal information and preferences to customize your experience."
                                                            />
                                                       </ListItem>

                                                       <ListItem>
                                                            <ListItemIcon>
                                                                 <AttachMoneyIcon color="primary" />
                                                            </ListItemIcon>
                                                            <ListItemText
                                                                 primary="Purchase a subscription"
                                                                 secondary="Choose a plan that fits your needs and join our community."
                                                            />
                                                       </ListItem>

                                                       <ListItem>
                                                            <ListItemIcon>
                                                                 <BiotechIcon color="primary" />
                                                            </ListItemIcon>
                                                            <ListItemText
                                                                 primary="Get a Free Trial"
                                                                 secondary="Try our service for free and explore its features."
                                                            />
                                                       </ListItem>
                                                  </List>
                                             </Box>

                                             <Box sx={{ display: "flex", justifyContent: "center", gap: 2, flexWrap: "wrap" }}>
                                                  <Button variant="outlined" component={Link} href="/">
                                                       Return to Home Page
                                                  </Button>
                                                  <Button variant="outlined" component={Link} href="/contact">
                                                       Contact Support
                                                  </Button>
                                             </Box>
                                        </>
                                   )}
                              </Paper>
                         </Container>
                    </Box>
               </Animate>
          </Box>
     )
}