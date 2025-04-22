"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useFormik } from "formik"
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
import LockOutlinedIcon from "@mui/icons-material/LockOutlined"
import { signInSchema } from "./sign-in-schema"
import { handleGoogleSignIn, signInUser } from "./sign-in-action"
import { useRouter } from "next/navigation"
import toast, { Toaster } from "react-hot-toast"
import Animate from "@/app/components/animation-framer-motion"

// Custom multi-colored Google icon as an SVG component
const GoogleMultiColorIcon = (props: any) => (
     <svg
          width="20"
          height="20"
          viewBox="0 0 46 46"
          {...props}
     >
          <defs>
               <path
                    id="a"
                    d="M44.5 20H42V20H24v6h11.8C34.4 32 30 36 24 36
        c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 
        3.1l4.7-4.7C33.2 7 28.9 5 24 5 13.5 5 5 13.5 5 
        24s8.5 19 19 19 19-8.5 19-19c0-1.3-.1-2.7-.5-4z"
               />
          </defs>
          <clipPath id="b">
               <use xlinkHref="#a" overflow="visible" />
          </clipPath>
          <path
               clipPath="url(#b)"
               fill="#FBBC05"
               d="M0 37V9l17 14z"
          />
          <path
               clipPath="url(#b)"
               fill="#EA4335"
               d="M0 9l17 14 7-6.1L48 14V0H0z"
          />
          <path
               clipPath="url(#b)"
               fill="#34A853"
               d="M0 37l30-23 7.9 1L48 0v48H0z"
          />
          <path
               clipPath="url(#b)"
               fill="#4285F4"
               d="M48 48L17 24l-4-3 35-10z"
          />
     </svg>
);


export const LoginPage = () => {

     const [showPassword, setShowPassword] = useState(false)
     const [googleSignInLoading, setGoogleSignInLoading] = useState(false)
     const router = useRouter()



     const handleClickShowPassword = () => {
          setShowPassword(!showPassword)
     }

     const formik = useFormik({
          initialValues: {
               email: "",
               password: "",
               rememberMe: false,
          },
          validationSchema: signInSchema,
          onSubmit: async (values) => {
               const signInUserResponse = await signInUser(values)

               if (signInUserResponse.success) {
                    toast.success("Sign in successful!")
                    router.push("/profile")
               }

               if (signInUserResponse.error) {
                    toast.error(signInUserResponse.error.message ?
                         signInUserResponse.error.message : signInUserResponse.error.hint ?
                              signInUserResponse.error.hint : signInUserResponse.error.details
                    )
               }
          },
     })

     return (
          <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh", mt: 5 }}>
               <Animate>
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
                                             <Grid size={{ xs: 12 }}>
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

                                             <Grid size={{ xs: 12 }}>
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
                                                                 ),
                                                            }
                                                       }}
                                                  />
                                             </Grid>

                                             <Grid size={{ xs: 12 }}>
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
                                                       <Link href="/auth/forgot-password" style={{ textDecoration: "none" }}>
                                                            <Typography variant="body2" color="primary">
                                                                 Forgot password?
                                                            </Typography>
                                                       </Link>
                                                  </Box>
                                             </Grid>

                                             <Grid size={{ xs: 12 }}>
                                                  <Button type="submit" fullWidth variant="contained" size="large" loading={formik.isSubmitting}>
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
                                        <Grid size={{ xs: 12 }}>
                                             <Button
                                                  fullWidth
                                                  variant="outlined"
                                                  startIcon={<GoogleMultiColorIcon />}
                                                  sx={{
                                                       display: "flex",
                                                       alignItems: "center",
                                                       justifyContent: "center",
                                                       backgroundColor: "white",
                                                       border: "1px solid #dcdcdc",
                                                       color: "rgba(0, 0, 0, 0.54)",
                                                       textTransform: "none",
                                                       fontWeight: 500,
                                                       fontSize: "0.875rem",
                                                       py: 1,
                                                       borderRadius: 1,
                                                       boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                                                       "&:hover": {
                                                            backgroundColor: "#f7f7f7",
                                                            borderColor: "#dcdcdc",
                                                       },
                                                  }}
                                                  onClick={async () => {
                                                       setGoogleSignInLoading(true)
                                                       const { success, error } = await handleGoogleSignIn()
                                                       if (success) {
                                                            setGoogleSignInLoading(false)
                                                            router.push('/profile')
                                                       }
                                                       if (error) {
                                                            setGoogleSignInLoading(false)
                                                            toast.error(error.message ? error.message : error.hint ? error.hint : error.details)
                                                       }
                                                  }}
                                                  loading={googleSignInLoading}
                                             >
                                                  <Typography variant="body2">
                                                       Continue with Google
                                                  </Typography>
                                             </Button>
                                        </Grid>

                                        {/* <Grid size={{ xs: 12 }}>
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
                                   </Grid> */}
                                        {/* 
                                   <Grid size={{ xs: 12 }}>
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
                                   </Grid> */}
                                   </Grid>

                                   <Box sx={{ mt: 4, textAlign: "center" }}>
                                        <Typography variant="body2">
                                             Don't have an account?{" "}
                                             <Link href="/auth/register" style={{ textDecoration: "none", color: "primary" }}>
                                                  <Typography component="span" variant="body2" color="primary" fontWeight={500}>
                                                       Sign up
                                                  </Typography>
                                             </Link>
                                        </Typography>
                                   </Box>
                              </Paper>
                         </Container>
                    </Box>
               </Animate>
          </Box>
     )
}

