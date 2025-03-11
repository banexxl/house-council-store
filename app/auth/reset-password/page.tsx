"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useFormik } from "formik"
import * as Yup from "yup"
import {
     Box,
     Button,
     Container,
     Paper,
     TextField,
     Typography,
     Alert,
     CircularProgress,
     IconButton,
     InputAdornment,
     LinearProgress,
     Stepper,
     Step,
     StepLabel,
} from "@mui/material"
import Visibility from "@mui/icons-material/Visibility"
import VisibilityOff from "@mui/icons-material/VisibilityOff"
import LockResetIcon from "@mui/icons-material/LockReset"
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline"
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline"

// Validation schema using Yup
const validationSchema = Yup.object({
     password: Yup.string()
          .min(8, "Password must be at least 8 characters")
          .required("Password is required")
          .matches(
               /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
               "Password must contain at least one uppercase letter, one lowercase letter, and one number",
          ),
     confirmPassword: Yup.string()
          .oneOf([Yup.ref("password")], "Passwords must match")
          .required("Confirm password is required"),
})

// Password strength calculation
const calculatePasswordStrength = (password: string): number => {
     if (!password) return 0

     let strength = 0

     // Length check
     if (password.length >= 8) strength += 25

     // Character type checks
     if (/[A-Z]/.test(password)) strength += 25 // Uppercase
     if (/[a-z]/.test(password)) strength += 25 // Lowercase
     if (/[0-9]/.test(password)) strength += 25 // Numbers
     if (/[^A-Za-z0-9]/.test(password)) strength += 25 // Special characters

     return Math.min(100, strength)
}

// Get color based on password strength
const getStrengthColor = (strength: number): string => {
     if (strength < 30) return "error.main"
     if (strength < 70) return "warning.main"
     return "success.main"
}

// Get label based on password strength
const getStrengthLabel = (strength: number): string => {
     if (strength < 30) return "Weak"
     if (strength < 70) return "Medium"
     return "Strong"
}

export default function ResetPasswordPage() {
     const router = useRouter()

     const [showPassword, setShowPassword] = useState(false)
     const [showConfirmPassword, setShowConfirmPassword] = useState(false)
     const [isSubmitted, setIsSubmitted] = useState(false)
     const [isTokenValid, setIsTokenValid] = useState<boolean | null>(null)
     const [isTokenChecking, setIsTokenChecking] = useState(true)
     const [passwordStrength, setPasswordStrength] = useState(0)


     const handleClickShowPassword = () => {
          setShowPassword(!showPassword)
     }

     const handleClickShowConfirmPassword = () => {
          setShowConfirmPassword(!showConfirmPassword)
     }

     const formik = useFormik({
          initialValues: {
               password: "",
               confirmPassword: "",
          },
          validationSchema: validationSchema,
          onSubmit: async (values) => {
               try {
                    // In a real application, you would send the new password and token to your backend


                    // Simulate API call
                    await new Promise((resolve) => setTimeout(resolve, 1500))

                    // Show success message
                    setIsSubmitted(true)
               } catch (error) {
                    console.error("Error resetting password:", error)
                    // Handle error (show error message, etc.)
               }
          },
     })

     // Update password strength when password changes
     useEffect(() => {
          setPasswordStrength(calculatePasswordStrength(formik.values.password))
     }, [formik.values.password])

     // Show loading state while checking token
     if (isTokenChecking) {
          return (
               <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
                    <Box component="main" sx={{ flexGrow: 1, py: { xs: 6, md: 10 } }}>
                         <Container maxWidth="sm">
                              <Paper elevation={3} sx={{ p: 4, borderRadius: 2, textAlign: "center" }}>
                                   <CircularProgress sx={{ mb: 2 }} />
                                   <Typography variant="h6">Verifying your reset link...</Typography>
                                   <Typography variant="body2" color="text.secondary">
                                        Please wait while we validate your password reset link.
                                   </Typography>
                              </Paper>
                         </Container>
                    </Box>
               </Box>
          )
     }

     // Show error if token is invalid
     if (isTokenValid === false) {
          return (
               <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
                    <Box component="main" sx={{ flexGrow: 1, py: { xs: 6, md: 10 } }}>
                         <Container maxWidth="sm">
                              <Paper elevation={3} sx={{ p: 4, borderRadius: 2, textAlign: "center" }}>
                                   <Box sx={{ color: "error.main", mb: 2 }}>
                                        <ErrorOutlineIcon sx={{ fontSize: 60 }} />
                                   </Box>
                                   <Typography variant="h5" gutterBottom>
                                        Invalid or Expired Link
                                   </Typography>
                                   <Typography variant="body1" >
                                        The password reset link you clicked is invalid or has expired.
                                   </Typography>
                                   <Typography variant="body2" color="text.secondary" >
                                        Password reset links are valid for 24 hours. Please request a new password reset link.
                                   </Typography>
                                   <Button variant="contained" component={Link} href="/auth/forgot-password" sx={{ mt: 2 }}>
                                        Request New Reset Link
                                   </Button>
                              </Paper>
                         </Container>
                    </Box>
               </Box>
          )
     }

     return (
          <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
               <Box component="main" sx={{ flexGrow: 1, py: { xs: 6, md: 10 } }}>
                    <Container maxWidth="sm">
                         <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
                              <Stepper activeStep={isSubmitted ? 1 : 0} sx={{ mb: 4 }}>
                                   <Step>
                                        <StepLabel>Reset Password</StepLabel>
                                   </Step>
                                   <Step>
                                        <StepLabel>Complete</StepLabel>
                                   </Step>
                              </Stepper>

                              {isSubmitted ? (
                                   <Box sx={{ textAlign: "center" }}>
                                        <Box sx={{ color: "success.main", mb: 2 }}>
                                             <CheckCircleOutlineIcon sx={{ fontSize: 60 }} />
                                        </Box>
                                        <Typography variant="h5" gutterBottom>
                                             Password Reset Successful
                                        </Typography>
                                        <Typography variant="body1" paragraph>
                                             Your password has been successfully reset.
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" paragraph>
                                             You can now log in to your account with your new password.
                                        </Typography>
                                        <Button variant="contained" component={Link} href="/auth/sign-in" sx={{ mt: 2 }}>
                                             Go to Login
                                        </Button>
                                   </Box>
                              ) : (
                                   <>
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
                                                  Reset Your Password
                                             </Typography>
                                             <Typography variant="body2" color="text.secondary" textAlign="center">
                                                  Please enter your new password below
                                             </Typography>
                                        </Box>

                                        <Box component="form" onSubmit={formik.handleSubmit} noValidate>
                                             <TextField
                                                  fullWidth
                                                  id="password"
                                                  name="password"
                                                  label="New Password"
                                                  type={showPassword ? "text" : "password"}
                                                  margin="normal"
                                                  value={formik.values.password}
                                                  onChange={formik.handleChange}
                                                  onBlur={formik.handleBlur}
                                                  error={formik.touched.password && Boolean(formik.errors.password)}
                                                  helperText={formik.touched.password && formik.errors.password}
                                                  InputProps={{
                                                       endAdornment: (
                                                            <InputAdornment position="end">
                                                                 <IconButton
                                                                      aria-label="toggle password visibility"
                                                                      onClick={handleClickShowPassword}
                                                                      edge="end"
                                                                 >
                                                                      {showPassword ? <VisibilityOff /> : <Visibility />}
                                                                 </IconButton>
                                                            </InputAdornment>
                                                       ),
                                                  }}
                                             />

                                             {formik.values.password && (
                                                  <Box sx={{ mt: 1, mb: 2 }}>
                                                       <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}>
                                                            <Typography variant="caption">Password strength:</Typography>
                                                            <Typography variant="caption" sx={{ color: getStrengthColor(passwordStrength) }}>
                                                                 {getStrengthLabel(passwordStrength)}
                                                            </Typography>
                                                       </Box>
                                                       <LinearProgress
                                                            variant="determinate"
                                                            value={passwordStrength}
                                                            sx={{
                                                                 height: 8,
                                                                 borderRadius: 4,
                                                                 bgcolor: "grey.200",
                                                                 "& .MuiLinearProgress-bar": {
                                                                      bgcolor: getStrengthColor(passwordStrength),
                                                                 },
                                                            }}
                                                       />
                                                  </Box>
                                             )}

                                             <TextField
                                                  fullWidth
                                                  id="confirmPassword"
                                                  name="confirmPassword"
                                                  label="Confirm New Password"
                                                  type={showConfirmPassword ? "text" : "password"}
                                                  margin="normal"
                                                  value={formik.values.confirmPassword}
                                                  onChange={formik.handleChange}
                                                  onBlur={formik.handleBlur}
                                                  error={formik.touched.confirmPassword && Boolean(formik.errors.confirmPassword)}
                                                  helperText={formik.touched.confirmPassword && formik.errors.confirmPassword}
                                                  InputProps={{
                                                       endAdornment: (
                                                            <InputAdornment position="end">
                                                                 <IconButton
                                                                      aria-label="toggle confirm password visibility"
                                                                      onClick={handleClickShowConfirmPassword}
                                                                      edge="end"
                                                                 >
                                                                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                                                                 </IconButton>
                                                            </InputAdornment>
                                                       ),
                                                  }}
                                             />

                                             <Alert severity="info" sx={{ mt: 2, mb: 3 }}>
                                                  Your password must be at least 8 characters long and include uppercase letters, lowercase letters,
                                                  and numbers.
                                             </Alert>

                                             <Button
                                                  type="submit"
                                                  fullWidth
                                                  variant="contained"
                                                  size="large"
                                                  disabled={formik.isSubmitting}
                                                  sx={{ mt: 2 }}
                                             >
                                                  {formik.isSubmitting ? <CircularProgress size={24} color="inherit" /> : "Reset Password"}
                                             </Button>
                                        </Box>
                                   </>
                              )}
                         </Paper>
                    </Container>
               </Box>
          </Box>
     )
}

