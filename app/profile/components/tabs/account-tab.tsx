"use client"

import { Box, Button, Divider, TextField, Typography, Chip, Alert, Stack, Grid, InputAdornment, IconButton, LinearProgress, CircularProgress, Paper } from "@mui/material"
import EditIcon from "@mui/icons-material/Edit"
import LockIcon from "@mui/icons-material/Lock"
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser"
import LogoutIcon from "@mui/icons-material/Logout"
import { getStatusColor } from "../profile-sidebar"
import { deleteAccountAction, logoutUserAction, updateAccountAction } from "../../account-action"
import Swal from 'sweetalert2'
import { Client } from "@/app/types/client"
import { User } from "@supabase/supabase-js"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import toast from "react-hot-toast"
import { Form, Formik, useFormik } from "formik"
import * as Yup from "yup"
import { resetPassword } from "@/app/auth/reset-password/reset-password-actions"
import { calculatePasswordStrength, getStrengthColor, getStrengthLabel, validationSchema } from "@/app/auth/reset-password/reset-password-utils";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import Visibility from "@mui/icons-material/Visibility";

interface AccountTabProps {
     userData: { client: Client; session: User }
     editMode: boolean
     setEditMode: (value: boolean) => void
}

const accountSchema = Yup.object().shape({
     fullName: Yup.string().min(2, "Name must be at least 2 characters").required("Name is required"),
     phoneNumber: Yup.string().min(8, "Phone number must be at least 8 characters").required("Phone number is required"),
});

export default function AccountTab({ userData, editMode, setEditMode }: AccountTabProps) {

     const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
     const [confirmText, setConfirmText] = useState("");
     const [showPasswordChange, setShowPasswordChange] = useState(false);
     const [resetingPassword, setResetingPassword] = useState(false);
     const handleClickShowPassword = () => {
          setShowPassword(!showPassword)
     }

     const handleClickShowConfirmPassword = () => {
          setShowConfirmPassword(!showConfirmPassword)
     }
     const [showPassword, setShowPassword] = useState(false)
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
               Swal.fire({
                    title: "Error!",
                    text: "There was a problem deleting your account.",
                    icon: "error"
               });
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
               password: "",
               confirmPassword: "",
          },
          validationSchema: validationSchema,

          onSubmit: async (values) => {
               setResetingPassword(true)
               try {
                    const resetPasswordResponse = await resetPassword(userData.client.email, values.password);
                    if (resetPasswordResponse.success) {
                         toast.success("Password reset successfully.", {
                              // position: "top-center",
                         });
                    } else {
                         toast.error("Error resetting password: " + resetPasswordResponse.error, {
                              // position: "top-center",
                         });
                    }
               } catch (error) {
                    toast.error("Error resetting password: " + error, {
                         // position: "top-center",
                    });
                    formik.setErrors({ password: "Failed to reset password. Please try again." })
               } finally {
                    setIsSubmitted(true)
                    setResetingPassword(false)
               }
          },
     })

     // Update password strength when password changes
     useEffect(() => {
          setPasswordStrength(calculatePasswordStrength(formik.values.password))
     }, [formik.values.password])

     return (
          <>
               {editMode ? (
                    <Box>
                         <Alert severity="info" sx={{ mb: 3 }}>
                              Edit your profile information below. Fields marked with * are required.
                         </Alert>

                         <Formik
                              initialValues={{
                                   fullName: userData.client.name || '',
                                   phoneNumber: userData.client.phone || ''
                              }}
                              onSubmit={async (values, { setSubmitting }) => {
                                   setSubmitting(true);
                                   try {
                                        const updateAccountActionResponse = await updateAccountAction(userData.client.id, {
                                             name: values.fullName,
                                             phone: values.phoneNumber
                                        });

                                        if (updateAccountActionResponse.success) {
                                             toast.success("Account updated successfully.");
                                             setEditMode(false);
                                        } else {
                                             toast.error("Error updating account: " + updateAccountActionResponse.error);
                                        }
                                   } catch (error) {
                                        toast.error("Error updating account: " + error);
                                   } finally {
                                        setSubmitting(false);
                                   }
                              }}
                              validationSchema={
                                   accountSchema
                              }
                         >
                              {({ values, handleChange, isSubmitting, errors }) => (
                                   <Form>
                                        <Grid container spacing={3}>
                                             <Grid size={{ xs: 12, md: 6 }}>
                                                  <TextField
                                                       fullWidth
                                                       label="Email"
                                                       type="email"
                                                       name="email"
                                                       value={userData.client.email}
                                                       disabled
                                                       required
                                                  />
                                             </Grid>

                                             <Grid size={{ xs: 12, md: 6 }}>
                                                  <TextField
                                                       fullWidth
                                                       label="Full Name"
                                                       name="fullName"
                                                       value={values.fullName}
                                                       onChange={handleChange}
                                                       error={!!errors.fullName}
                                                       helperText={errors.fullName || ""}
                                                       required
                                                  />
                                             </Grid>

                                             <Grid size={{ xs: 12, md: 6 }}>
                                                  <TextField
                                                       fullWidth
                                                       label="Phone Number"
                                                       name="phoneNumber"
                                                       value={values.phoneNumber}
                                                       onChange={handleChange}
                                                       error={!!errors.phoneNumber}
                                                       helperText={errors.phoneNumber || ""}
                                                  />
                                             </Grid>

                                             <Grid size={{ xs: 12, md: 6 }}>
                                                  <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
                                                       <Button variant="outlined" onClick={() => setEditMode(false)}>
                                                            Cancel
                                                       </Button>
                                                       <Button
                                                            variant="contained"
                                                            disabled={isSubmitting}
                                                            type="submit"
                                                       >
                                                            {isSubmitting ? "Saving..." : "Save Changes"}
                                                       </Button>

                                                  </Box>
                                             </Grid>
                                        </Grid>
                                   </Form>
                              )}
                         </Formik>
                    </Box >
               ) : (
                    <Box>
                         <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
                              <Typography variant="h5">Account Information</Typography>
                              <Button variant="outlined" startIcon={<EditIcon />} onClick={() => setEditMode(true)}>
                                   Edit Profile
                              </Button>
                         </Box>

                         <Grid container spacing={3}>
                              <Grid size={{ xs: 12, md: 6 }}>
                                   <Typography variant="subtitle2" color="text.secondary">
                                        User ID
                                   </Typography>
                                   <Typography variant="body1">{userData.client.id.slice(-12)}</Typography>
                              </Grid>

                              <Grid size={{ xs: 12, md: 6 }}>
                                   <Typography variant="subtitle2" color="text.secondary">
                                        Status
                                   </Typography>
                                   <Chip label={userData.client.client_status} color={getStatusColor(userData.client.client_status)} size="small" />
                              </Grid>

                              <Grid size={{ xs: 12, md: 6 }}>
                                   <Typography variant="subtitle2" color="text.secondary">
                                        Full Name
                                   </Typography>
                                   <Typography variant="body1">{userData.client.name}</Typography>
                              </Grid>

                              <Grid size={{ xs: 12, md: 6 }}>
                                   <Typography variant="subtitle2" color="text.secondary">
                                        Email
                                   </Typography>
                                   <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                        <Typography variant="body1">{userData.client.email}</Typography>
                                        {userData.client.is_verified && <VerifiedUserIcon color="success" fontSize="small" />}
                                   </Box>
                              </Grid>

                              <Grid size={{ xs: 12, md: 6 }}>
                                   <Typography variant="subtitle2" color="text.secondary">
                                        Phone Number
                                   </Typography>
                                   <Typography variant="body1">{userData.client.phone}</Typography>
                              </Grid>

                              <Grid size={{ xs: 12, md: 6 }}>
                                   <Typography variant="subtitle2" color="text.secondary">
                                        Member Since
                                   </Typography>
                                   <Typography variant="body1">
                                        {new Intl.DateTimeFormat("en-US", {
                                             year: "numeric",
                                             month: "short",
                                             day: "numeric",
                                             hour: "2-digit",
                                             minute: "2-digit",
                                        }).format(new Date(userData.session.created_at))}
                                   </Typography>
                              </Grid>

                         </Grid>

                         <Divider sx={{ my: 3 }} />

                         <Box>
                              <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
                                   Account Actions
                              </Typography>

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
                                                       },
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
                    </Box >
               )
               }
          </>
     )
}

