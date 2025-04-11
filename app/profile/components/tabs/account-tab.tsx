"use client"

import { Box, Button, Divider, TextField, Typography, Chip, Alert, Stack } from "@mui/material"
import Grid from "@mui/material/Grid2"
import Link from "next/link"
import EditIcon from "@mui/icons-material/Edit"
import LockIcon from "@mui/icons-material/Lock"
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser"
import LogoutIcon from "@mui/icons-material/Logout"
import { getStatusColor } from "../profile-sidebar"
import { deleteAccountAction } from "../../account-action"
import Swal from 'sweetalert2'
import { Client } from "@/app/types/client"
import { User } from "@supabase/supabase-js"
import { logoutUserAction } from "../../logout-action"
import { useRouter } from "next/navigation"

interface AccountTabProps {
     userData: { client: Client; session: User }
     editMode: boolean
     setEditMode: (value: boolean) => void
}


export default function AccountTab({ userData, editMode, setEditMode }: AccountTabProps) {

     const router = useRouter()

     const onDeleteAccountClick = () => {

          Swal.fire({
               title: "Are you sure?",
               text: "You won't be able to revert this!",
               icon: "warning",
               showCancelButton: true,
               confirmButtonColor: "#3085d6",
               showLoaderOnConfirm: true,
               cancelButtonColor: "#d33",
               confirmButtonText: "Yes, delete it!",
               preConfirm: async () => {
                    const deleteAccount = await deleteAccountAction(userData.session.id, userData.client.email);
                    if (deleteAccount.success) {
                         Swal.fire({
                              title: "Deleted!",
                              text: "Your file has been deleted.",
                              icon: "success"
                         });
                    } else {
                         Swal.fire({
                              title: "Error!",
                              text: "Error deleting account. Please contact support.",
                              icon: "error"
                         });
                    }
               }
          }).then(async (result: any) => {
               if (result.isConfirmed) {

               }
          });
     }

     const handleSignOut = async () => {
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
                    <Box component="form">
                         <Alert severity="info" sx={{ mb: 3 }}>
                              Edit your profile information below. Fields marked with * are required.
                         </Alert>

                         <Grid container spacing={3}>
                              <Grid size={{ xs: 12, md: 6 }}>
                                   <TextField fullWidth label="Full Name" defaultValue={userData.client.name} required />
                              </Grid>

                              <Grid size={{ xs: 12, md: 6 }}>
                                   <TextField fullWidth label="Email" type="email" defaultValue={userData.client.email} required />
                              </Grid>

                              <Grid size={{ xs: 12, md: 6 }}>
                                   <TextField fullWidth label="Phone Number" defaultValue={userData.client.phone} />
                              </Grid>

                              <Grid size={{ xs: 12, md: 6 }}>
                                   <TextField fullWidth label="Role" defaultValue={userData.client.role_id} />
                              </Grid>

                              <Grid size={{ xs: 12 }}>
                                   <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
                                        <Button variant="outlined" onClick={() => setEditMode(false)}>
                                             Cancel
                                        </Button>
                                        <Button variant="contained" onClick={() => setEditMode(false)}>
                                             Save Changes
                                        </Button>
                                   </Box>
                              </Grid>
                         </Grid>
                    </Box>
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
                                   <Typography variant="body1">{userData.client.id}</Typography>
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

                              <Grid size={{ xs: 12, md: 6 }}>
                                   <Typography variant="subtitle2" color="text.secondary">
                                        Role
                                   </Typography>
                                   <Typography variant="body1">{userData.client.role_id}</Typography>
                              </Grid>
                         </Grid>

                         <Divider sx={{ my: 3 }} />

                         <Box>
                              <Typography variant="h6" gutterBottom>
                                   Account Actions
                              </Typography>

                              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                                   <Button variant="outlined" component={Link} href="/auth/reset-password" startIcon={<LockIcon />}>
                                        Change Password
                                   </Button>
                                   <Button variant="outlined" color="error" onClick={onDeleteAccountClick}>
                                        Delete Account
                                   </Button>
                                   <Button
                                        variant="outlined"
                                        color="error"
                                        startIcon={<LogoutIcon />}
                                        onClick={handleSignOut}
                                   >
                                        Sign out
                                   </Button>
                              </Stack>
                         </Box>
                    </Box>
               )}
          </>
     )
}

