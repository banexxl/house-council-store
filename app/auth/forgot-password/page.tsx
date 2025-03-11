"use client"

import { useState } from "react"
import Link from "next/link"
import { useFormik } from "formik"
import * as Yup from "yup"
import { Box, Button, Container, Paper, TextField, Typography, Alert, CircularProgress } from "@mui/material"
import LockResetIcon from "@mui/icons-material/LockReset"


// Validation schema using Yup
const validationSchema = Yup.object({
     email: Yup.string().email("Enter a valid email").required("Email is required"),
})

export default function ForgotPasswordPage() {



     const [isSubmitted, setIsSubmitted] = useState(false)

     const formik = useFormik({
          initialValues: {
               email: "",
          },
          validationSchema: validationSchema,
          onSubmit: async (values) => {
               // In a real application, you would handle the password reset request here
               console.log("Password reset requested for:", values.email)

               // Simulate API call
               await new Promise((resolve) => setTimeout(resolve, 1500))

               // Show success message
               setIsSubmitted(true)
          },
     })

     return (
          <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
               <Box component="main" sx={{ flexGrow: 1, py: { xs: 6, md: 10 } }}>
                    <Container maxWidth="sm">
                         <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
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
                                        Enter your email address and we'll send you a link to reset your password
                                   </Typography>
                              </Box>

                              {isSubmitted ? (
                                   <Box>
                                        <Alert severity="success" sx={{ mb: 3 }}>
                                             Password reset link has been sent to your email!
                                        </Alert>
                                        <Typography variant="body2" paragraph>
                                             Please check your inbox and follow the instructions in the email to reset your password. If you don't
                                             see the email, please check your spam folder.
                                        </Typography>
                                        <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
                                             <Button variant="outlined" component={Link} href="/auth/forgot-password">
                                                  Return to Login
                                             </Button>
                                        </Box>
                                   </Box>
                              ) : (
                                   <Box component="form" onSubmit={formik.handleSubmit} noValidate>
                                        <TextField
                                             fullWidth
                                             id="email"
                                             name="email"
                                             label="Email Address"
                                             autoComplete="email"
                                             margin="normal"
                                             value={formik.values.email}
                                             onChange={formik.handleChange}
                                             onBlur={formik.handleBlur}
                                             error={formik.touched.email && Boolean(formik.errors.email)}
                                             helperText={formik.touched.email && formik.errors.email}
                                        />

                                        <Button
                                             type="submit"
                                             fullWidth
                                             variant="contained"
                                             size="large"
                                             disabled={formik.isSubmitting}
                                             sx={{ mt: 3, mb: 2 }}
                                        >
                                             {formik.isSubmitting ? <CircularProgress size={24} color="inherit" /> : "Reset Password"}
                                        </Button>

                                        <Box sx={{ textAlign: "center", mt: 2 }}>
                                             <Link href="/auth/sign-in" style={{ textDecoration: "none" }}>
                                                  <Typography variant="body2" color="primary">
                                                       Back to Login
                                                  </Typography>
                                             </Link>
                                        </Box>
                                   </Box>
                              )}
                         </Paper>
                    </Container>
               </Box>
          </Box>
     )
}

