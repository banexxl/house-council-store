"use client"

import { useState, useTransition } from "react"
import { useFormik } from "formik"
import {
     Backdrop,
     Box,
     Button,
     Checkbox,
     CircularProgress,
     Container,
     Divider,
     FormControl,
     FormControlLabel,
     FormHelperText,
     Grid,
     IconButton,
     InputAdornment,
     Paper,
     TextField,
     Typography,
     useTheme,
} from "@mui/material"
import Visibility from "@mui/icons-material/Visibility"
import VisibilityOff from "@mui/icons-material/VisibilityOff"
import { registrationSchema } from "./register-schema"
import { RegisterErrorType, RegisterFormValues, registerUser } from "./register-action"
import toast, { Toaster } from "react-hot-toast"
import { useRouter } from "next/navigation"
import Animate from "@/app/components/animation-framer-motion"

export const RegisterPage = () => {

     const [showPassword, setShowPassword] = useState(false)
     const [showConfirmPassword, setShowConfirmPassword] = useState(false)
     const [isPending, startTransition] = useTransition()
     const router = useRouter()
     const theme = useTheme();

     const handleNavClick = (path: string) => {
          startTransition(() => {
               router.push(path);
          });
     };

     const handleClickShowPassword = () => {
          setShowPassword(!showPassword)
     }

     const handleClickShowConfirmPassword = () => {
          setShowConfirmPassword(!showConfirmPassword)
     }

     const formik = useFormik({
          initialValues: {
               contact_person: "",
               email: "",
               confirm_email: "",
               password: "",
               confirm_password: "",
          },
          validationSchema: registrationSchema,
          onSubmit: async (values: RegisterFormValues) => {
               const { success, error }: { success: boolean, error?: RegisterErrorType } = await registerUser(values);
               if (success) {
                    toast.success("Registration successful!");
                    handleNavClick("/auth/registration-confirmation");
               }
               if (error) {
                    if (error.code === '23505') {
                         toast.error(error.details)
                    } else if (error.code === '23503') {
                         toast.error("This email has other role!")
                    } else if (error.code === '23502') {
                         toast.error("Not null violation")
                    } else if (error.code === '22P02') {
                         toast.error("Data type mismatch")
                    } else if (error.code === '23514') {
                         toast.error("Check violation")
                    } else {
                         toast.error("Client not saved: unexpected error")
                    }
               }
          },
     })

     return (
          <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh", mt: 5 }}>
               <Animate>
                    <Box component="main" sx={{ flexGrow: 1, py: { xs: 6, md: 10 } }}>
                         <Container maxWidth="sm">
                              <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
                                   <Box sx={{ textAlign: "center", mb: 4 }}>
                                        <Typography variant="h4" component="h1" gutterBottom>
                                             Create an Account
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                             Join NestLink to manage your residential community efficiently
                                        </Typography>
                                   </Box>

                                   <Box component="form" onSubmit={formik.handleSubmit}>
                                        <Grid container spacing={3}>
                                             {/* Each field container has a fixed height to prevent layout shifts */}
                                             <Grid size={{ xs: 12 }}>
                                                  <Box sx={{ height: "65px" }}>
                                                       <TextField
                                                            fullWidth
                                                            id="contact_person"
                                                            name="contact_person"
                                                            label="Full Name"
                                                            value={formik.values.contact_person}
                                                            onChange={formik.handleChange}
                                                            onBlur={formik.handleBlur}
                                                            error={formik.touched.contact_person && Boolean(formik.errors.contact_person)}
                                                            helperText={formik.touched.contact_person && formik.errors.contact_person}
                                                       />
                                                  </Box>
                                             </Grid>

                                             <Grid size={{ xs: 12 }}>
                                                  <Box sx={{ height: "65px" }}>
                                                       <TextField
                                                            fullWidth
                                                            id="email"
                                                            name="email"
                                                            label="Email Address"
                                                            type="email"
                                                            value={formik.values.email}
                                                            onChange={formik.handleChange}
                                                            onBlur={formik.handleBlur}
                                                            error={formik.touched.email && Boolean(formik.errors.email)}
                                                            helperText={formik.touched.email && formik.errors.email}
                                                       />
                                                  </Box>
                                             </Grid>

                                             <Grid size={{ xs: 12 }}>
                                                  <Box sx={{ height: "65px" }}>
                                                       <TextField
                                                            fullWidth
                                                            id="confirm_email"
                                                            name="confirm_email"
                                                            label="Confirm Email Address"
                                                            type="email"
                                                            value={formik.values.confirm_email}
                                                            onChange={formik.handleChange}
                                                            onBlur={formik.handleBlur}
                                                            error={formik.touched.confirm_email && Boolean(formik.errors.confirm_email)}
                                                            helperText={formik.touched.confirm_email && formik.errors.confirm_email}
                                                       />
                                                  </Box>
                                             </Grid>

                                             <Grid size={{ xs: 12 }}>
                                                  <Box sx={{ height: "65px" }}>
                                                       <TextField
                                                            fullWidth
                                                            id="password"
                                                            name="password"
                                                            label="Password"
                                                            type={showPassword ? "text" : "password"}
                                                            value={formik.values.password}
                                                            onChange={formik.handleChange}
                                                            onBlur={formik.handleBlur}
                                                            error={formik.touched.password && Boolean(formik.errors.password)}
                                                            helperText={formik.touched.password && formik.errors.password}
                                                            slotProps={{
                                                                 input: {
                                                                      endAdornment: (
                                                                           <InputAdornment position="end">
                                                                                <IconButton aria-label="toggle password visibility" onClick={handleClickShowPassword} edge="end">
                                                                                     {showPassword ? <VisibilityOff /> : <Visibility />}
                                                                                </IconButton>
                                                                           </InputAdornment>
                                                                      ),
                                                                 },
                                                                 formHelperText: {
                                                                      style: { width: "120%" } // Ensure the helper text takes the full width},
                                                                 }
                                                            }}
                                                       />
                                                  </Box>
                                             </Grid>

                                             <Grid size={{ xs: 12 }}>
                                                  <Box sx={{ height: "65px" }}>
                                                       <TextField
                                                            fullWidth
                                                            id="confirm_password"
                                                            name="confirm_password"
                                                            label="Confirm Password"
                                                            type={showConfirmPassword ? "text" : "password"}
                                                            value={formik.values.confirm_password}
                                                            onChange={formik.handleChange}
                                                            onBlur={formik.handleBlur}
                                                            error={formik.touched.confirm_password && Boolean(formik.errors.confirm_password)}
                                                            helperText={formik.touched.confirm_password && formik.errors.confirm_password}
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
                                                                 }
                                                            }}
                                                       />
                                                  </Box>
                                             </Grid>

                                             <Grid size={{ xs: 12 }}>
                                                  <Button
                                                       type="submit"
                                                       fullWidth
                                                       variant="contained"
                                                       size="large"
                                                       sx={{ mt: 2 }}
                                                       disabled={formik.isSubmitting}
                                                  >
                                                       {formik.isSubmitting ? "Creating Account..." : "Create Account"}
                                                  </Button>
                                             </Grid>
                                        </Grid>
                                   </Box>

                                   <Divider sx={{ my: 4 }} />

                                   <Box sx={{ textAlign: "center" }}>
                                        <Typography variant="body2" component="div">
                                             Already have an account?{" "}
                                             <Button
                                                  variant="text"
                                                  onClick={() => handleNavClick("/auth/sign-in")}
                                                  color="primary"
                                                  sx={{ fontWeight: 500, textTransform: "none", padding: 0, minWidth: "auto" }}
                                             >
                                                  Sign in
                                             </Button>
                                        </Typography>
                                   </Box>
                              </Paper>
                         </Container>
                    </Box>
                    <Toaster />
               </Animate>
               <Backdrop
                    sx={{
                         color: '#fff',
                         zIndex: (theme) => theme.zIndex.drawer + 1,
                    }}
                    open={isPending}
               >
                    <CircularProgress sx={{ color: theme.palette.primary.main }} />
               </Backdrop>
          </Box >
     )
}