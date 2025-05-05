"use client"

import { Box, Button, Card, CardContent, Chip, Typography, List, ListItem, ListItemText, Stack, Alert, InputAdornment, TextField, LinearProgress, IconButton, CircularProgress } from "@mui/material"
import LogoutIcon from "@mui/icons-material/Logout"
import Link from "next/link"
import LockIcon from "@mui/icons-material/Lock"
import { Client } from "@/app/types/client"
import { User } from "@supabase/supabase-js"
import { Visibility, VisibilityOff } from "@mui/icons-material"
import { useEffect, useState } from "react"
import { calculatePasswordStrength, getStrengthColor, getStrengthLabel, validationSchemaWithOldPassword } from "@/app/auth/reset-password/reset-password-utils"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"
import { deleteAccountAction, logoutUserAction } from "../../account-action"
import Swal from "sweetalert2"
import { useFormik } from "formik"
import { resetPasswordWithOldPassword } from "@/app/auth/reset-password/reset-password-actions"

interface SecurityTabProps {
     userData: { client: Client; session: User }
}

export default function SecurityTab({ userData }: SecurityTabProps) {

     const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
     const [confirmText, setConfirmText] = useState("");
     const [showPasswordChange, setShowPasswordChange] = useState(false);
     const [resetingPassword, setResetingPassword] = useState(false);

     const handleClickShowNewPassword = () => {
          setShowNewPassword(!showNewPassword)
     }
     const handleClickShowOldPassword = () => {
          setShowOldPassword(!showOldPassword)
     }

     const handleClickShowConfirmPassword = () => {
          setShowConfirmPassword(!showConfirmPassword)
     }

     const [showOldPassword, setShowOldPassword] = useState(false)
     const [showNewPassword, setShowNewPassword] = useState(false)
     const [showConfirmPassword, setShowConfirmPassword] = useState(false)
     const [isSubmitted, setIsSubmitted] = useState(false)
     const [passwordStrength, setPasswordStrength] = useState(0)
     const [signoutLoading, setSignoutLoading] = useState(false)
     const [isVerifying, setVerifying] = useState(true)

     const router = useRouter()

     const handleConfirmDelete = async () => {
          const deleteAccount = await deleteAccountAction(userData.session.id, userData.client.email);
          if (deleteAccount.success) {
               toast.success("Account deleted successfully.");
               logoutUserAction();
               router.push("/");
          } else {
               toast.error("There was a problem deleting your account.");
          }
     };
     const handleSignOut = async () => {
          setSignoutLoading(true)
          try {
               logoutUserAction();
               router.refresh();

          } catch (error) {
               console.error("Error signing out:", error);
          }
     };

     const formik = useFormik({
          initialValues: {
               oldPassword: "",
               newPassword: "",
               confirmPassword: "",
          },
          validationSchema: validationSchemaWithOldPassword,

          onSubmit: async (values) => {
               setResetingPassword(true)
               try {
                    const resetPasswordResponse = await resetPasswordWithOldPassword(userData.client.email, values.oldPassword, values.newPassword);
                    if (resetPasswordResponse.success) {
                         toast.success("Password reset successfully.")
                         formik.resetForm()
                         setShowPasswordChange(false)
                    } else {
                         toast.error("Error resetting password: " + resetPasswordResponse.error, {
                              // position: "top-center",
                         });
                    }
               } catch (error) {
                    toast.error("Error resetting password: " + error, {
                         // position: "top-center",
                    });
                    formik.setErrors({ newPassword: "Failed to reset password. Please try again." })
               } finally {
                    setIsSubmitted(true)
                    setResetingPassword(false)
               }
          },
     })

     // Update password strength when password changes
     useEffect(() => {
          setPasswordStrength(calculatePasswordStrength(formik.values.newPassword))
     }, [formik.values.newPassword])

     return (
          <>
               <Typography variant="h5" gutterBottom>
                    Security Settings
               </Typography>

               <Card variant="outlined" sx={{ mb: 4 }}>
                    <CardContent>
                         <Typography variant="h6" gutterBottom>
                              Password
                         </Typography>

                         <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                              It's a good idea to use a strong password that you don't use elsewhere.
                         </Typography>

                         <Box>

                              <Stack direction="row" spacing={2} justifyContent="space-between">
                                   <Box sx={{ display: "flex", justifyContent: "flex-start", gap: 2 }}>
                                        <Button variant="outlined" onClick={() => {
                                             setShowPasswordChange(!showPasswordChange)
                                             setShowDeleteConfirm(false)
                                        }} startIcon={<LockIcon />}>
                                             Change Password
                                        </Button>
                                   </Box>
                                   <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
                                        <Button
                                             variant="outlined"
                                             color="error"
                                             startIcon={<LogoutIcon />}
                                             onClick={handleSignOut}
                                             loading={signoutLoading}
                                        >
                                             Sign out
                                        </Button>
                                        <Button variant="outlined" color="error" onClick={() => {
                                             setShowDeleteConfirm(!showDeleteConfirm)
                                             setShowPasswordChange(false)
                                        }}>
                                             Delete Account
                                        </Button>

                                   </Box>
                              </Stack>

                              {showPasswordChange && (
                                   // <Box sx={{ display: "flex", flexDirection: "column" }}>
                                   <Box component="main" sx={{ flexGrow: 1, py: { xs: 6, md: 5 } }}>
                                        <Box component="form" onSubmit={formik.handleSubmit} noValidate>
                                             <TextField
                                                  fullWidth
                                                  id="oldPassword"
                                                  name="oldPassword"
                                                  label="Current Password"
                                                  type={showOldPassword ? "text" : "password"}
                                                  margin="normal"
                                                  value={formik.values.oldPassword}
                                                  onChange={formik.handleChange}
                                                  onBlur={formik.handleBlur}
                                                  error={formik.touched.oldPassword && Boolean(formik.errors.oldPassword)}
                                                  helperText={formik.touched.oldPassword && formik.errors.oldPassword}
                                                  slotProps={{
                                                       input: {
                                                            endAdornment: (
                                                                 <InputAdornment position="end">
                                                                      <IconButton
                                                                           aria-label="toggle password visibility"
                                                                           onClick={handleClickShowOldPassword}
                                                                           edge="end"
                                                                      >
                                                                           {showOldPassword ? <VisibilityOff /> : <Visibility />}
                                                                      </IconButton>
                                                                 </InputAdornment>
                                                            ),
                                                       },
                                                  }}
                                             />


                                             <TextField
                                                  fullWidth
                                                  id="newPassword"
                                                  name="newPassword"
                                                  label="New Password"
                                                  type={showNewPassword ? "text" : "password"}
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
                                                                           onClick={handleClickShowNewPassword}
                                                                           edge="end"
                                                                      >
                                                                           {showNewPassword ? <VisibilityOff /> : <Visibility />}
                                                                      </IconButton>
                                                                 </InputAdornment>
                                                            ),
                                                       },
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
                                                  loading={resetingPassword}
                                             >
                                                  {formik.isSubmitting ? <CircularProgress size={24} color="inherit" /> : "Reset Password"}
                                             </Button>
                                        </Box>
                                   </Box>
                                   // </Box>
                              )}
                              {showDeleteConfirm && (
                                   <Stack spacing={2} sx={{ mt: 2 }}>
                                        <Typography color="error">
                                             Type <strong>delete</strong> below to confirm account deletion:
                                        </Typography>
                                        <TextField
                                             fullWidth
                                             variant="outlined"
                                             value={confirmText}
                                             onChange={(e) => setConfirmText(e.target.value)}
                                             placeholder="Type 'delete' to confirm"
                                             size="small"
                                        />
                                        <Stack direction="row" spacing={2}>
                                             <Button
                                                  variant="contained"
                                                  color="error"
                                                  disabled={confirmText !== "delete"}
                                                  onClick={handleConfirmDelete}
                                             >
                                                  Confirm Delete
                                             </Button>
                                             <Button
                                                  variant="outlined"
                                                  onClick={() => {
                                                       setShowDeleteConfirm(false);
                                                       setConfirmText("");
                                                  }}
                                             >
                                                  Cancel
                                             </Button>
                                        </Stack>
                                   </Stack>
                              )}

                         </Box >
                    </CardContent>
               </Card>

               <Card variant="outlined" sx={{ mb: 4 }}>
                    <CardContent>
                         <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                              <Typography variant="h6">Two-Factor Authentication</Typography>
                              {/* <Chip
                                   label={userData.twoFactorEnabled ? "Enabled" : "Disabled"}
                                   color={userData.twoFactorEnabled ? "success" : "default"}
                              /> */}
                         </Box>

                         <Typography variant="body2" color="text.secondary" paragraph>
                              Add an extra layer of security to your account by requiring both your password and a verification code from
                              your mobile phone.
                         </Typography>

                         {/* <Button variant={userData.twoFactorEnabled ? "outlined" : "contained"}>
                              {userData.twoFactorEnabled ? "Disable" : "Enable"} Two-Factor Authentication
                         </Button> */}
                    </CardContent>
               </Card>

               <Card variant="outlined">
                    <CardContent>
                         <Typography variant="h6" gutterBottom>
                              Active Sessions
                         </Typography>

                         <Typography variant="body2" color="text.secondary" paragraph>
                              These are the devices that are currently logged into your account.
                         </Typography>

                         <List>
                              <ListItem divider>
                                   <ListItemText
                                        primary="Chrome on Windows"
                                        secondary="Current session • Boston, MA • Last active: Just now"
                                   />
                                   <Chip label="Current" size="small" color="primary" />
                              </ListItem>
                              <ListItem divider>
                                   <ListItemText primary="Safari on iPhone" secondary="Boston, MA • Last active: 2 hours ago" />
                                   <Button size="small" color="error">
                                        Logout
                                   </Button>
                              </ListItem>
                              <ListItem>
                                   <ListItemText primary="Chrome on MacBook" secondary="Boston, MA • Last active: Yesterday" />
                                   <Button size="small" color="error">
                                        Logout
                                   </Button>
                              </ListItem>
                         </List>

                         <Button variant="outlined" color="error" sx={{ mt: 2 }}>
                              Logout of All Devices
                         </Button>
                    </CardContent>
               </Card>
          </>
     )
}

