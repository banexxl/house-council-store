"use client"

import { useState } from "react"
import Link from "next/link"
import { useFormik } from "formik"
import * as Yup from "yup"
import {
     Box,
     Button,
     Checkbox,
     Container,
     Divider,
     FormControlLabel,
     Grid,
     IconButton,
     InputAdornment,
     Paper,
     TextField,
     Typography,
} from "@mui/material"
import Visibility from "@mui/icons-material/Visibility"
import VisibilityOff from "@mui/icons-material/VisibilityOff"
import GoogleIcon from "@mui/icons-material/Google"
import FacebookIcon from "@mui/icons-material/Facebook"
import AppleIcon from "@mui/icons-material/Apple"
import LockOutlinedIcon from "@mui/icons-material/LockOutlined"
import Header from "@/components/Header"
import Footer from "@/components/Footer"

// Validation schema using Yup
const validationSchema = Yup.object({
     email: Yup.string().email("Enter a valid email").required("Email is required"),
     password: Yup.string().required("Password is required"),
})

export default function LoginPage() {
     const [showPassword, setShowPassword] = useState(false)

     const handleClickShowPassword = () => {
          setShowPassword(!showPassword)
     }

     const formik = useFormik({
          initialValues: {
               email: "",
               password: "",
               rememberMe: false,
          },
          validationSchema: validationSchema,
          onSubmit: (values) => {
               // In a real application, you would handle the login here
               console.log("Login submitted:", values)
               // For demo purposes, let's simulate a successful login
               alert("Login successful!")
          },
     })

     return (
          <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
               <Header />

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
                                        <LockOutlinedIcon />
                                   </Box>
                                   <Typography variant="h4" component="h1" gutterBottom>
                                        Sign In
                                   </Typography>
                                   <Typography variant="body2" color="text.secondary">
                                        Welcome back! Please enter your details
                                   </Typography>
                              </Box>

                              <Box component="form" onSubmit={formik.handleSubmit} noValidate>
                                   <Grid container spacing={3}>
                                        <Grid item xs={12}>
                                             <TextField
                                                  fullWidth
                                                  id="email"
                                                  name="email"
                                                  label="Email Address"
                                                  autoComplete="email"
                                                  value={formik.values.email}
                                                  onChange={formik.handleChange}
                                                  onBlur={formik.handleBlur}
                                                  error={formik.touched.email && Boolean(formik.errors.email)}
                                                  helperText={formik.touched.email && formik.errors.email}
                                             />
                                        </Grid>

                                        <Grid item xs={12}>
                                             <TextField
                                                  fullWidth
                                                  id="password"
                                                  name="password"
                                                  label="Password"
                                                  type={showPassword ? "text" : "password"}
                                                  autoComplete="current-password"
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
                                        </Grid>

                                        <Grid item xs={12}>
                                             <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                                  <FormControlLabel
                                                       control={
                                                            <Checkbox
                                                                 id="rememberMe"
                                                                 name="rememberMe"
                                                                 color="primary"
                                                                 checked={formik.values.rememberMe}
                                                                 onChange={formik.handleChange}
                                                            />
                                                       }
                                                       label={<Typography variant="body2">Remember me</Typography>}
                                                  />
                                                  <Link href="/forgot-password" style={{ textDecoration: "none" }}>
                                                       <Typography variant="body2" color="primary">
                                                            Forgot password?
                                                       </Typography>
                                                  </Link>
                                             </Box>
                                        </Grid>

                                        <Grid item xs={12}>
                                             <Button type="submit" fullWidth variant="contained" size="large" disabled={formik.isSubmitting}>
                                                  Sign In
                                             </Button>
                                        </Grid>
                                   </Grid>
                              </Box>

                              <Box sx={{ mt: 4, mb: 2 }}>
                                   <Divider>
                                        <Typography variant="body2" color="text.secondary" sx={{ px: 1 }}>
                                             OR
                                        </Typography>
                                   </Divider>
                              </Box>

                              <Grid container spacing={2}>
                                   <Grid item xs={12}>
                                        <Button
                                             fullWidth
                                             variant="outlined"
                                             startIcon={<GoogleIcon />}
                                             sx={{ justifyContent: "flex-start", py: 1 }}
                                        >
                                             <Typography variant="body2" sx={{ ml: 1 }}>
                                                  Continue with Google
                                             </Typography>
                                        </Button>
                                   </Grid>

                                   <Grid item xs={12}>
                                        <Button
                                             fullWidth
                                             variant="outlined"
                                             startIcon={<FacebookIcon />}
                                             sx={{ justifyContent: "flex-start", py: 1 }}
                                        >
                                             <Typography variant="body2" sx={{ ml: 1 }}>
                                                  Continue with Facebook
                                             </Typography>
                                        </Button>
                                   </Grid>

                                   <Grid item xs={12}>
                                        <Button
                                             fullWidth
                                             variant="outlined"
                                             startIcon={<AppleIcon />}
                                             sx={{ justifyContent: "flex-start", py: 1 }}
                                        >
                                             <Typography variant="body2" sx={{ ml: 1 }}>
                                                  Continue with Apple
                                             </Typography>
                                        </Button>
                                   </Grid>
                              </Grid>

                              <Box sx={{ mt: 4, textAlign: "center" }}>
                                   <Typography variant="body2">
                                        Don't have an account?{" "}
                                        <Link href="/register" style={{ textDecoration: "none", color: "primary" }}>
                                             <Typography component="span" variant="body2" color="primary" fontWeight={500}>
                                                  Sign up
                                             </Typography>
                                        </Link>
                                   </Typography>
                              </Box>
                         </Paper>
                    </Container>
               </Box>

               <Footer />
          </Box>
     )
}

