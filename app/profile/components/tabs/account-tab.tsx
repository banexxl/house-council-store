"use client"

import { Box, Button, Divider, TextField, Typography, Chip, Alert, Stack, Grid, InputAdornment, IconButton, LinearProgress, CircularProgress, Paper } from "@mui/material"
import EditIcon from "@mui/icons-material/Edit"
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
import { resetPasswordWithOldPassword } from "@/app/auth/reset-password/reset-password-actions"
import { calculatePasswordStrength, getStrengthColor, getStrengthLabel, validationSchemaWithOldPassword } from "@/app/auth/reset-password/reset-password-utils";

interface AccountTabProps {
     userData: { client: Client; session: User }
     editMode: boolean
     setEditMode: (value: boolean) => void
}

const accountSchema = Yup.object().shape({
     fullName: Yup.string().min(2, "Name must be at least 2 characters").required("Name is required"),
     mobilePhoneNumber: Yup.string().min(8, "Mobile phone number must be at least 8 characters").required("Mobile phone number is required"),
});

export default function AccountTab({ userData, editMode, setEditMode }: AccountTabProps) {

     const [signoutLoading, setSignoutLoading] = useState(false)
     const router = useRouter()

     const handleSignOut = async () => {
          setSignoutLoading(true)
          try {
               logoutUserAction();
               router.refresh();

          } catch (error) {
               console.error("Error signing out:", error);
          }
     };

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
                                   mobilePhoneNumber: userData.client.mobile_phone || ''
                              }}
                              onSubmit={async (values, { setSubmitting }) => {
                                   setSubmitting(true);
                                   try {
                                        const updateAccountActionResponse = await updateAccountAction(userData.client.id, {
                                             name: values.fullName,
                                             mobile_phone: values.mobilePhoneNumber
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
                                                       label="Mobile phone number"
                                                       name="mobilePhoneNumber"
                                                       value={values.mobilePhoneNumber}
                                                       onChange={handleChange}
                                                       error={!!errors.mobilePhoneNumber}
                                                       helperText={errors.mobilePhoneNumber || ""}
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
                              <Box sx={{ display: "flex", gap: 2 }}>
                                   <Button variant="outlined" startIcon={<EditIcon />} onClick={() => setEditMode(true)}>
                                        Edit Profile
                                   </Button>
                                   <Button
                                        variant="outlined"
                                        color="error"
                                        startIcon={<LogoutIcon />}
                                        onClick={handleSignOut}
                                        loading={signoutLoading}
                                   >
                                        Sign out
                                   </Button>
                              </Box>
                         </Box>

                         <Grid container spacing={3}>
                              <Grid size={{ xs: 12, md: 6 }}>
                                   <Typography variant="subtitle2" color="text.secondary">
                                        User ID
                                   </Typography>
                                   <Typography variant="body1">{userData.client.id.slice(-12).toUpperCase()}</Typography>
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
                                        Mobile Phone Number
                                   </Typography>
                                   <Typography variant="body1">{userData.client.mobile_phone}</Typography>
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

                    </Box >
               )
               }
          </>
     )
}

