"use client"

import { useState, useTransition } from "react"
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
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"
import Animate from "@/app/components/animation-framer-motion"
import { createBrowserClient } from "@supabase/ssr"
import { logClientAction } from "@/app/lib/client-logging"
import { checkUserPermissionServer } from "./check-user-server-action"
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";


// Custom multi-colored Google icon
const GoogleMultiColorIcon = (props: any) => (
     <svg width="20" height="20" viewBox="0 0 46 46" {...props}>
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
          <path clipPath="url(#b)" fill="#FBBC05" d="M0 37V9l17 14z" />
          <path clipPath="url(#b)" fill="#EA4335" d="M0 9l17 14 7-6.1L48 14V0H0z" />
          <path clipPath="url(#b)" fill="#34A853" d="M0 37l30-23 7.9 1L48 0v48H0z" />
          <path clipPath="url(#b)" fill="#4285F4" d="M48 48L17 24l-4-3 35-10z" />
     </svg>
)

export const LoginPage = () => {
     const [showPassword, setShowPassword] = useState(false)
     const [googleSignInLoading, setGoogleSignInLoading] = useState(false)
     const router = useRouter()
     const theme = useTheme()
     const [doesRequire2FA, setDoesRequire2FA] = useState(false)
     const [twoFactorCode, setTwoFactorCode] = useState("")
     const [loading, setLoading] = useState(false)
     const [isPending, startTransition] = useTransition()
     const [challengeId, setChallengeId] = useState<string>("")
     const [factorId, setFactorId] = useState<string>("")
     const searchParams = useSearchParams();
     const mfaParam = searchParams.get("mfa"); // "1" when middleware forces MFA

     useEffect(() => {
          const run = async () => {
               if (mfaParam !== "1") return;

               // show OTP UI
               setDoesRequire2FA(true);

               // get factors + challenge again (challenge must be fresh after refresh)
               const { data: factorsData, error: factorsErr } = await supabase.auth.mfa.listFactors();
               if (factorsErr) return;

               const totp = factorsData?.totp?.find((f) => f.status === "verified");
               if (!totp) return;

               const { data: ch, error: chErr } = await supabase.auth.mfa.challenge({ factorId: totp.id });
               if (chErr || !ch?.id) return;

               setFactorId(totp.id);
               setChallengeId(ch.id);
          };

          run();
          // eslint-disable-next-line react-hooks/exhaustive-deps
     }, [mfaParam]);


     const supabase = createBrowserClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL as string,
          process.env.NEXT_PUBLIC_SB_CLIENT_KEY as string
     )

     const handleNavClick = (path: string) => {
          startTransition(() => {
               router.push(path)
          })
     }

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
               const { success, error } = await checkUserPermissionServer(values.email);

               if (!success) {
                    toast.error(error?.message || error?.hint || error?.details || "Unknown error");
                    return;
               }

               setLoading(true);
               try {
                    const { data, error: signInError } = await supabase.auth.signInWithPassword({
                         email: values.email,
                         password: values.password,
                    });

                    if (signInError) {
                         toast.error(signInError.message);
                         return;
                    }

                    // We have a session now (AAL1 typically).
                    if (!data.session) {
                         toast.error("No session returned from sign in.");
                         return;
                    }

                    // If you WANT to require 2FA when user has TOTP enabled:
                    const { data: factorsData, error: factorsErr } = await supabase.auth.mfa.listFactors();
                    if (factorsErr) {
                         toast.error("Failed to load 2FA factors: " + factorsErr.message);
                         return;
                    }

                    const totpFactor = factorsData?.totp?.find((f) => f.status === "verified");
                    if (totpFactor) {
                         // Create a real challenge
                         const { data: challengeData, error: challengeErr } = await supabase.auth.mfa.challenge({
                              factorId: totpFactor.id,
                         });

                         if (challengeErr || !challengeData?.id) {
                              toast.error("Failed to create 2FA challenge: " + (challengeErr?.message ?? "Unknown"));
                              return;
                         }

                         // Show OTP UI (do NOT redirect yet)
                         setDoesRequire2FA(true);
                         setFactorId(totpFactor.id);
                         setChallengeId(challengeData.id);

                         toast("Enter the 6-digit code from your authenticator.");
                         return;
                    }

                    // No TOTP factor -> proceed normally
                    toast.success("Sign in successful!");
                    handleNavClick("/");
               } catch (err) {
                    toast.error("Unexpected error during sign in. Please try again.");
               } finally {
                    setLoading(false);
               }
          },

     })

     const handleVerify = async (e?: React.FormEvent) => {
          e?.preventDefault();
          setLoading(true);

          try {
               const { data, error } = await supabase.auth.mfa.verify({
                    factorId,
                    challengeId,
                    code: twoFactorCode,
               });

               if (error) {
                    toast.error("Invalid 2FA code: " + error.message);
                    return;
               }

               // After verify, Supabase updates the session (AAL2).
               // `data` may contain session/user depending on supabase-js version,
               // but the safest is to just fetch the session.
               const { data: sessionData, error: sessionErr } = await supabase.auth.getSession();
               if (sessionErr || !sessionData.session) {
                    toast.error("2FA verified, but session is missing.");
                    return;
               }

               await logClientAction({
                    user_id: sessionData.session.user.id,
                    action: "Sign In with 2FA - Success",
                    payload: {},
                    status: "success",
                    error: "",
                    duration_ms: 0,
                    type: "action",
               });

               toast.success("2FA verified. You're now signed in!");
               handleNavClick("/");
          } finally {
               setLoading(false);
          }
     };


     const handleGoogleSignIn = async (): Promise<{ success: boolean; error?: any }> => {
          setGoogleSignInLoading(true)
          const start = Date.now()
          const { data: authData, error: authError } = await supabase.auth.signInWithOAuth({
               provider: "google",
               options: {
                    redirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/auth/callback`,
               },
          })

          if (authError) {
               await logClientAction({
                    user_id: null,
                    action: "Signing in with Google failed (client)",
                    payload: {},
                    status: "fail",
                    error: authError.message || "Unknown error",
                    duration_ms: Date.now() - start,
                    type: "auth",
               })
               return { success: false, error: authError }
          }

          if (authData?.url) {
               await logClientAction({
                    user_id: null,
                    action: "Google OAuth redirect initiated (client)",
                    payload: { authData },
                    status: "success",
                    error: "",
                    duration_ms: Date.now() - start,
                    type: "auth",
               })
               return { success: true }
          }

          await logClientAction({
               user_id: null,
               action: "Google OAuth redirect failed (client)",
               payload: { authData },
               status: "fail",
               error: "Redirect URL is null",
               duration_ms: Date.now() - start,
               type: "auth",
          })
          setGoogleSignInLoading(false)
          return { success: false, error: { message: "Redirect URL is null." } }
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

                                   {/* SIGN IN FORM */}
                                   <Box component="form" onSubmit={formik.handleSubmit} noValidate sx={{ mb: 2 }}>
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
                                                                           <IconButton onClick={handleClickShowPassword} edge="end">
                                                                                {showPassword ? <VisibilityOff /> : <Visibility />}
                                                                           </IconButton>
                                                                      </InputAdornment>
                                                                 ),
                                                            },
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
                                                       disabled={loading || formik.isSubmitting || doesRequire2FA}
                                                  >
                                                       Sign In
                                                  </Button>
                                             </Grid>
                                        </Grid>
                                   </Box>

                                   {/* OTP INPUT + VERIFY BUTTON */}
                                   {doesRequire2FA && (
                                        <Grid size={{ xs: 12 }}>
                                             <form onSubmit={handleVerify}>
                                                  <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                                       <TextField
                                                            label="6-digit code"
                                                            value={twoFactorCode}
                                                            onChange={(e) => {
                                                                 const val = e.target.value.replace(/\D/g, "").slice(0, 6)
                                                                 setTwoFactorCode(val)
                                                            }}
                                                            slotProps={{
                                                                 htmlInput: {
                                                                      inputMode: "numeric",
                                                                      pattern: "[0-9]*",
                                                                      maxLength: 6,
                                                                 },
                                                            }}
                                                       />
                                                       <Button
                                                            type="submit"
                                                            sx={{ width: "200px", mt: 2 }}
                                                            variant="contained"
                                                            disabled={loading}
                                                       >
                                                            {loading ? "Verifying..." : "Verify OTP"}
                                                       </Button>
                                                  </Box>
                                             </form>
                                        </Grid>
                                   )}

                                   {/* OR divider */}
                                   <Box sx={{ mt: 4, mb: 2 }}>
                                        <Divider>
                                             <Typography variant="body2" color="text.secondary" sx={{ px: 1 }}>
                                                  OR
                                             </Typography>
                                        </Divider>
                                   </Box>

                                   {/* GOOGLE SIGN IN */}
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
                                                            router.push("/")
                                                       }
                                                       if (error) {
                                                            setGoogleSignInLoading(false)
                                                            toast.error(error.message ?? error.hint ?? error.details)
                                                       }
                                                  }}
                                             >
                                                  <Typography variant="body2">Continue with Google</Typography>
                                             </Button>
                                        </Grid>
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
                    sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
                    open={isPending}
               >
                    <CircularProgress sx={{ color: theme.palette.primary.main }} />
               </Backdrop>
          </Box>
     )
}
