"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useFormik } from "formik"
import * as Yup from "yup"
import { Box, Button, Container, Paper, Typography, TextField, CircularProgress, Divider } from "@mui/material"
import LockResetIcon from "@mui/icons-material/LockReset"
import { sendPasswordResetEmail } from "./forgot-password-actions"
import Animate from "@/app/components/animation-framer-motion"
import toast from "react-hot-toast"
import { createBrowserClient } from "@supabase/ssr"

// Validation schema using Yup
const validationSchema = Yup.object({
     email: Yup.string().email("Please enter a valid email address").required("Email is required"),
})

export default function ForgotPasswordPage() {
     const router = useRouter()
     const [isSubmitting, setIsSubmitting] = useState(false)

     const supabase = createBrowserClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL as string,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
     )

     useEffect(() => {
          (async () => {
               try {
                    const { data, error } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel()
                    if (error) {
                         throw error
                    }

                    if (data.nextLevel === 'aal2' && data.nextLevel !== data.currentLevel) {
                         supabase.auth.signOut()
                         router.refresh()
                         toast.error('Your account needs 2FA authentication. Please sign in again.')
                    }
               } finally {
                    // Cleanup or additional logic if needed
               }
          })()
     }, [])


     const formik = useFormik({
          initialValues: {
               email: "",
          },
          validationSchema: validationSchema,
          onSubmit: async (values) => {
               setIsSubmitting(true)
               try {
                    const result = await sendPasswordResetEmail(values.email)
               } catch (error) {
                    console.error("Error in forgot password submission:", error)
               } finally {
                    setIsSubmitting(false)
               }
          },
     })

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
               <Animate>
                    <Container maxWidth="sm">
                         <Paper
                              elevation={3}
                              sx={{
                                   p: 4,
                                   borderRadius: 2,
                              }}
                         >
                              <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", mb: 4 }}>
                                   <Box
                                        sx={{
                                             bgcolor: "primary.main",
                                             color: "primary.contrastText",
                                             borderRadius: "50%",
                                             p: 1,
                                             mb: 2,
                                        }}
                                   >
                                        <LockResetIcon />
                                   </Box>
                                   <Typography variant="h4" component="h1" gutterBottom>
                                        Forgot Password
                                   </Typography>
                                   <Typography variant="body2" color="text.secondary" textAlign="center">
                                        Enter your email address and we'll send you instructions to reset your password.
                                   </Typography>
                              </Box>

                              <Box component="form" onSubmit={formik.handleSubmit} noValidate>
                                   <TextField
                                        fullWidth
                                        id="email"
                                        name="email"
                                        label="Email Address"
                                        type="email"
                                        autoComplete="email"
                                        margin="normal"
                                        value={formik.values.email}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        error={formik.touched.email && Boolean(formik.errors.email)}
                                        helperText={formik.touched.email && formik.errors.email}
                                        disabled={isSubmitting}
                                   />

                                   <Button
                                        type="submit"
                                        fullWidth
                                        variant="contained"
                                        size="large"
                                        disabled={isSubmitting}
                                        sx={{ mt: 3, mb: 2 }}
                                   >
                                        {isSubmitting ? (
                                             <>
                                                  <CircularProgress size={24} sx={{ mr: 1 }} color="inherit" />
                                                  Sending...
                                             </>
                                        ) : (
                                             "Send Reset Instructions"
                                        )}
                                   </Button>
                              </Box>

                              <Divider sx={{ my: 3 }} />

                              <Box sx={{ textAlign: "center" }}>
                                   <Button variant="text" onClick={() => router.push("/auth/sign-in")} disabled={isSubmitting}>
                                        Back to Login
                                   </Button>
                              </Box>
                         </Paper>
                    </Container>
               </Animate>
          </Box>
     )
}
