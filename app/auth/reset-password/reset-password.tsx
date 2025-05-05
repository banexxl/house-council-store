"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { useFormik } from "formik"
import Animate from "@/app/components/animation-framer-motion"
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
import { Toaster } from "react-hot-toast"
import { resetPassword } from "./reset-password-actions"
import { createBrowserClient } from '@supabase/ssr'
import { calculatePasswordStrength, getStrengthColor, getStrengthLabel, validationSchemaNoOldPassword } from "./reset-password-utils"

export const ResetPasswordPage = () => {

     const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
     const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
     const email = useSearchParams().get("email") || ""
     const token = useSearchParams().get("token") || ""

     const supabase = createBrowserClient(supabaseUrl, supabaseKey);


     const [showPassword, setShowPassword] = useState(false)
     const [showConfirmPassword, setShowConfirmPassword] = useState(false)
     const [isSubmitted, setIsSubmitted] = useState(false)
     const [passwordStrength, setPasswordStrength] = useState(0)
     const [isVerifying, setVerifying] = useState(true)
     const [isTokenValid, setIsTokenValid] = useState(true)

     useEffect(() => {
          const verify = async () => {
               if (!email || !token) {
                    setVerifying(false)
                    setIsTokenValid(false)
                    return
               }

               const { data, error } = await supabase.auth.verifyOtp({
                    email,
                    token,
                    type: "recovery",
               })

               if (error) {
                    setIsTokenValid(false)
               } else {
                    const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
                    setIsTokenValid(!!sessionData.session)
               }

               setVerifying(false)
          }

          verify()
     }, [email, token])

     const handleClickShowPassword = () => {
          setShowPassword(!showPassword)
     }

     const handleClickShowConfirmPassword = () => {
          setShowConfirmPassword(!showConfirmPassword)
     }

     const formik = useFormik({
          initialValues: {
               newPassword: "",
               confirmPassword: "",
          },
          validationSchema: validationSchemaNoOldPassword,
          onSubmit: async (values) => {
               try {
                    // Call the server action to reset the password
                    const result = await resetPassword(email, values.newPassword)

                    if (!result.success) {
                         formik.setErrors({ newPassword: result.error })
                    }
                    setIsSubmitted(true)
               } catch (error) {
                    formik.setErrors({ newPassword: "Failed to reset password. Please try again." })
               }
          },
     })

     // Update password strength when password changes
     useEffect(() => {
          setPasswordStrength(calculatePasswordStrength(formik.values.newPassword))
     }, [formik.values.newPassword])


     // Show error if token is invalid
     if (!isTokenValid) {
          return (
               <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh", mt: 5 }}>
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
          <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh", mt: 5 }}>
               <Animate>
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
                                             <Typography variant="body1" >
                                                  Your password has been successfully reset.
                                             </Typography>
                                             <Typography variant="body2" color="text.secondary" >
                                                  You can now log in to your account with your new password.
                                             </Typography>
                                             <Button variant="contained" component={Link} href="/auth/sign-in" sx={{ mt: 2 }}>
                                                  Login
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
                                                       id="newPassword"
                                                       name="newPassword"
                                                       label="New Password"
                                                       type={showPassword ? "text" : "password"}
                                                       margin="normal"
                                                       value={formik.values.newPassword}
                                                       onChange={formik.handleChange}
                                                       onBlur={formik.handleBlur}
                                                       error={formik.touched.newPassword && Boolean(formik.errors.newPassword)}
                                                       helperText={formik.touched.newPassword && formik.errors.newPassword}
                                                       slotProps={{
                                                            input: {
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
                                                                 )
                                                            }
                                                       }}

                                                  />

                                                  {formik.values.newPassword && (
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
                                                       slotProps={{
                                                            input: {
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
                                                            },
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
               </Animate>
               <Toaster />
          </Box>
     )
}

