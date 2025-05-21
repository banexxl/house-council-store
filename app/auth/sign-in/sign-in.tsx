"use client"

import { useEffect, useState, useTransition } from "react"
import Link from "next/link"
import { useFormik } from "formik"
import {
     Backdrop,
     Box,
     Button,
     Checkbox,
     CircularProgress,
     Container,
     Divider,
     FormControlLabel,
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
import LockOutlinedIcon from "@mui/icons-material/LockOutlined"
import { signInSchema } from "./sign-in-schema"
import { checkClientExists, handleGoogleSignIn } from "./sign-in-action"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"
import Animate from "@/app/components/animation-framer-motion"
import { createBrowserClient } from "@supabase/ssr"
import { logServerAction } from "@/app/lib/server-logging"
import { logClientAction } from "@/app/lib/client-logging"

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
     const theme = useTheme()
     const [doesRequire2FA, setDoesRequire2FA] = useState(false)
     const [twoFactorCode, setTwoFactorCode] = useState("")
     const [loading, setLoading] = useState(false)
     const [isPending, startTransition] = useTransition()
     const [challengeId, setChallengeId] = useState<string>('')
     const [factorId, setFactorId] = useState<string>('')

     const supabase = createBrowserClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL as string,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
     )

     const handleNavClick = (path: string) => {
          startTransition(() => {
               router.push(path);
          });
     };

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

               const { success, error } = await checkClientExists(values)

               if (!success) {
                    toast.error(error?.message || error?.hint || error?.details || "Unknown error")
                    return
               }

               try {
                    const { data, error: signInError } = await supabase.auth.signInWithPassword({
                         email: values.email,
                         password: values.password,
                    })

                    if (signInError) {
                         toast.error(signInError.message)
                         return
                    }

                    if (!data.session.user.factors) {
                         toast.success("Sign in successful!")
                         handleNavClick("/")
                         return
                    }

                    if (data.session && data.user?.factors && data.user?.factors?.length > 0) {
                         const factor = data.user.factors.find(f => f.status === 'verified' && f.factor_type === 'totp')
                         if (!factor) {
                              toast.error("2FA required but no valid factor found.")
                              return
                         }

                         const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({ factorId: factor.id })

                         if (challengeError || !challenge?.id) {
                              toast.error("Failed to create 2FA challenge: " + (challengeError?.message || "Unknown error"))
                              return
                         }

                         setDoesRequire2FA(true)
                         setChallengeId(challenge.id)
                         setFactorId(factor.id)
                         toast.success("2FA code required. Please enter the 6-digit code.")
                    }

               } catch (err) {
                    toast.error("Unexpected error during sign in. Please try again.")
               }
          }
     })

     const handleVerify = async (e?: React.FormEvent) => {
          e?.preventDefault()
          setLoading(true)

          const { error, data } = await supabase.auth.mfa.verify({
               factorId,
               challengeId,
               code: twoFactorCode,
          })

          if (error) {
               toast.error("Invalid 2FA code: " + error.message)
               setLoading(false)
               return
          }

          const session = data.user
          if (session) {
               await logClientAction({
                    user_id: session.id,
                    action: "Sign In with 2FA - Success",
                    payload: {},
                    status: "success",
                    error: "",
                    duration_ms: 0,
                    type: "action"
               })
               toast.success("2FA verified. You're now signed in!")
               handleNavClick("/")
          } else {
               toast.error("Verification failed — no session returned.")
          }

          setLoading(false)
     }

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
                                                  <Button
                                                       type="submit"
                                                       fullWidth
                                                       variant="contained"
                                                       size="large"
                                                       loading={formik.isSubmitting}
                                                       disabled={loading || formik.isSubmitting || doesRequire2FA}
                                                  >
                                                       Sign In
                                                  </Button>
                                             </Grid>
                                             {
                                                  doesRequire2FA && (
                                                       <Grid size={{ xs: 12 }}>
                                                            <form onSubmit={handleVerify}>
                                                                 <Box sx={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
                                                                      <TextField
                                                                           label="6-digit code"
                                                                           value={twoFactorCode}
                                                                           onChange={(e) => {
                                                                                const val = e.target.value.replace(/\D/g, '').slice(0, 6)
                                                                                setTwoFactorCode(val)
                                                                           }}
                                                                           slotProps={{
                                                                                htmlInput: {
                                                                                     inputMode: 'numeric',
                                                                                     pattern: '[0-9]*',
                                                                                     maxLength: 6,
                                                                                },
                                                                           }}
                                                                           onKeyDown={(e) => {
                                                                                if (e.key === 'Enter') {
                                                                                     handleVerify();
                                                                                }
                                                                           }}
                                                                      />
                                                                      <Button
                                                                           type="submit"
                                                                           sx={{ width: '200px', mt: 2 }}
                                                                           variant="contained"
                                                                           disabled={loading}
                                                                      >
                                                                           {
                                                                                loading ? "Verifying..." : "Verify"
                                                                           }
                                                                      </Button>
                                                                 </Box>
                                                            </form>
                                                       </Grid>
                                                  )
                                             }
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
                                                            router.push('/')
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
                                             <Typography
                                                  component="span"
                                                  sx={{ cursor: "pointer" }}
                                                  variant="body2"
                                                  color="primary"
                                                  fontWeight={500}
                                                  onClick={() => handleNavClick("/auth/register")}
                                             >
                                                  Sign up
                                             </Typography>
                                        </Typography>
                                   </Box>
                              </Paper>
                         </Container>
                    </Box>
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
          </Box>
     )
}

