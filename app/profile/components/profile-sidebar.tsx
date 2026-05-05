"use client"

import type React from "react"

import { useEffect, useState } from "react"
import Link from "next/link"
import {
     Box,
     Button,
     Card,
     CardContent,
     CardHeader,
     Divider,
     IconButton,
     List,
     ListItem,
     ListItemIcon,
     ListItemText,
     Typography,
     Avatar,
     Chip,
     Badge,
     Menu,
     MenuItem,
     CircularProgress,
} from "@mui/material"
import EditIcon from "@mui/icons-material/Edit"
import LockIcon from "@mui/icons-material/Lock"
import SecurityIcon from "@mui/icons-material/Security"
import MoreVertIcon from "@mui/icons-material/MoreVert"
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera"
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser"
import EmailIcon from "@mui/icons-material/Email"
import CalendarTodayIcon from "@mui/icons-material/CalendarToday"
import toast from "react-hot-toast"
import { useRouter } from "next/navigation"
import { User } from "@supabase/supabase-js"
import { logoutUserAction, updateAccountAction } from "../account-action"
import { deleteClientAvatarAction, uploadClientAvatarAction } from "@/app/lib/sb-storage"
import { PolarSubscriptionStatus } from "@/app/types/polar-subscription-types"
import { PolarCustomer } from "@/app/types/polar-customer-types"

export interface ActivityItem {
     id: string
     user_id: string
     type: string
     action: string
     created_at: string
}

interface ProfileSidebarProps {
     userData: { customer: PolarCustomer; session: User }
     recentActivity: ActivityItem[] | undefined
     onEditProfile: () => void
}

export const getStatusColor = (status?: PolarSubscriptionStatus) => {
     switch ((status ?? "").toLowerCase()) {
          case "incomplete":
               return "warning"
          case "incomplete_expired":
               return "error"
          case "trialing":
               return "info"
          case "active":
               return "success"
          case "past_due":
               return "warning"
          case "canceled":
               return "error"
          case "unpaid":
               return "error"
          default:
               return "default"
     }
}

export default function ProfileSidebar({ userData, recentActivity, onEditProfile }: ProfileSidebarProps) {

     const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null)
     const [imageLoading, setImageLoading] = useState<boolean>(false)
     const router = useRouter()
     const [memberSince, setMemberSince] = useState<string | null>(null);
     const [formattedActivities, setFormattedActivities] = useState<
          { id: string; action: string; formattedDate: string }[]
     >([]);

     useEffect(() => {
          const formattedDate = new Intl.DateTimeFormat(undefined, {
               dateStyle: "medium",
               timeStyle: "short",
          }).format(new Date(userData.session.created_at));
          setMemberSince(formattedDate);
     }, [userData.session.created_at]);

     useEffect(() => {
          if (!recentActivity) return;

          const updated = recentActivity.map((activity) => {
               const date = activity.created_at
                    ? new Date(activity.created_at.replace(" ", "T"))
                    : null;

               const formattedDate = date
                    ? new Intl.DateTimeFormat(undefined, {
                         year: "numeric",
                         month: "2-digit",
                         day: "2-digit",
                         hour: "2-digit",
                         minute: "2-digit",
                         second: "2-digit",
                         hour12: false,
                    }).format(date)
                    : "Invalid time value";

               return {
                    id: activity.id,
                    action: activity.action,
                    formattedDate,
               };
          });

          setFormattedActivities(updated);
     }, [recentActivity]);

     const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
          setMenuAnchorEl(event.currentTarget)
     }

     const handleMenuClose = () => {
          setMenuAnchorEl(null)
     }

     const handleLogout = async () => {
          handleMenuClose()
          try {
               const logoutUserResponse = await logoutUserAction()
               if (!logoutUserResponse) {
                    toast.success("You have been logged out successfully!")
                    router.push("/")
               }
          } catch (error) {
               toast.error("Error logging out")
          }
     }

     const handleUpdateAvatar = async (file: File) => {
          setImageLoading(true);

          try {
               const reader = new FileReader();

               reader.onloadend = async () => {
                    const base64String = reader.result?.toString();

                    if (!base64String) {
                         toast.error("Failed to read file.");
                         setImageLoading(false);
                         return;
                    }

                    const extension = file.name.split('.').pop()!;
                    const formData = new FormData();

                    formData.append('file', base64String);
                    formData.append('title', userData.customer.name ?? 'avatar');
                    formData.append('extension', extension);
                    formData.append('fileName', file.name);
                    formData.append('folderName', userData.customer.externalId!); // or use a unique ID

                    const uploadResponse = await uploadClientAvatarAction(formData);

                    if (uploadResponse.success && uploadResponse.path) {
                         const updateAccountActionResponse = await updateAccountAction(userData.customer.id, {
                              avatarUrl: uploadResponse.path,
                         });

                         if (updateAccountActionResponse.success) {
                              toast.success("Avatar updated successfully.");
                         } else {
                              toast.error("Failed to update account");
                         }
                    } else {
                         toast.error("Upload failed");
                    }

                    setImageLoading(false);
               };

               reader.readAsDataURL(file);
          } catch (error) {
               setImageLoading(false);
               toast.error("Unexpected error: " + error);
          }
     };

     const handleDeleteAvatar = async () => {
          try {
               const res = await deleteClientAvatarAction();

               if (res.success) {
                    toast.success("Avatar deleted.");
               } else {
                    toast.error(res.message);
               }
          } catch (error) {
               toast.error("Error deleting avatar");
          }
     };

     return (
          <>
               <Card elevation={2}>
                    <CardContent sx={{ textAlign: "center", position: "relative", pt: 6, pb: 4 }}>
                         <IconButton
                              sx={{
                                   position: "absolute",
                                   top: 8,
                                   right: 8,
                              }}
                              onClick={handleMenuOpen}
                         >
                              <MoreVertIcon />
                         </IconButton>

                         <Menu anchorEl={menuAnchorEl} open={Boolean(menuAnchorEl)} onClose={handleMenuClose}>
                              <MenuItem
                                   onClick={() => {
                                        onEditProfile()
                                        handleMenuClose()
                                   }}
                              >
                                   <ListItemIcon>
                                        <EditIcon fontSize="small" />
                                   </ListItemIcon>
                                   <ListItemText>Edit Profile</ListItemText>
                              </MenuItem>
                              <MenuItem component={Link} href="/auth/forgot-password" onClick={handleMenuClose}>
                                   <ListItemIcon>
                                        <LockIcon fontSize="small" />
                                   </ListItemIcon>
                                   <ListItemText>Forgot password</ListItemText>
                              </MenuItem>
                              <Divider />
                              <MenuItem onClick={handleLogout} sx={{ color: "error.main" }}>
                                   <ListItemIcon>
                                        <SecurityIcon fontSize="small" color="error" />
                                   </ListItemIcon>
                                   <ListItemText>Logout</ListItemText>
                              </MenuItem>
                         </Menu>

                         <Box sx={{ position: "relative", width: 120, height: 120, mx: "auto", mb: 2 }}>
                              <Badge
                                   overlap="circular"
                                   anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                                   badgeContent={
                                        <>
                                             <input
                                                  accept="image/*"
                                                  type="file"
                                                  style={{ display: "none" }}
                                                  id="upload-button"
                                                  onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                                                       const file = event.target.files?.[0];
                                                       if (file) {
                                                            setImageLoading(true); // Show loader early
                                                            const img = new Image();
                                                            img.src = URL.createObjectURL(file);
                                                            img.onload = () => {
                                                                 const { width, height } = img;
                                                                 if (file.size <= 5000000 && width <= 5000 && height <= 5000) {
                                                                      handleUpdateAvatar(file);
                                                                 } else {
                                                                      setImageLoading(false);
                                                                      toast.error("Image must be < 5MB and < 5000x5000px");
                                                                 }
                                                            };
                                                       }
                                                  }}
                                             />
                                             <label htmlFor="upload-button">
                                                  <IconButton
                                                       component="span"
                                                       sx={{
                                                            bgcolor: "primary.main",
                                                            color: "white",
                                                            "&:hover": {
                                                                 bgcolor: "primary.dark",
                                                            },
                                                            width: 32,
                                                            height: 32,
                                                       }}
                                                  >
                                                       {imageLoading ? (
                                                            <CircularProgress size={16} color="inherit" />
                                                       ) : (
                                                            <PhotoCameraIcon sx={{ fontSize: 16 }} />
                                                       )}
                                                  </IconButton>
                                             </label>
                                        </>
                                   }
                              >
                                   <Avatar
                                        src={userData.customer.avatarUrl!}
                                        alt={userData.customer.name ?? 'avatar'}
                                        sx={{ width: 120, height: 120 }}
                                        onClick={() => handleDeleteAvatar()}
                                   />
                              </Badge>
                         </Box>
                         <Typography variant="h5" gutterBottom>
                              {userData.customer.name}
                         </Typography>
                         {/* <Chip
                              label={userData.customer.client_status}
                              size="small"
                              sx={{
                                   mb: 1,
                                   color: "common.white",
                                   bgcolor: userData.customer.client_status === "active" ? "success.main" : "warning.dark",
                              }}
                         />
                         <Typography variant="body2" color="text.secondary" gutterBottom>
                              {userData.customer.updated_at
                                   ? `Last updated ${new Intl.DateTimeFormat(undefined, {
                                        dateStyle: "medium",
                                        timeStyle: "short",
                                   }).format(new Date(userData.customer.updated_at))}`
                                   : "No updates yet"}
                         </Typography> */}

                         <Divider sx={{ my: 2 }} />

                         <List >

                              <ListItem>
                                   <ListItemIcon>
                                        <EmailIcon fontSize="small" />
                                   </ListItemIcon>
                                   <ListItemText
                                        primary={
                                             <Typography variant="body2" noWrap sx={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                                  {userData.customer.email}
                                             </Typography>
                                        }
                                        secondary={userData.session.confirmed_at ? "Verified" : "Not verified"}
                                   />
                                   {userData.customer.emailVerified &&
                                        <VerifiedUserIcon color="success" fontSize="small" />}
                              </ListItem>

                              <ListItem>
                                   <ListItemIcon>
                                        <CalendarTodayIcon fontSize="small" />
                                   </ListItemIcon>
                                   {memberSince && (
                                        <ListItemText primary="Member since" secondary={memberSince} />
                                   )}
                              </ListItem>
                         </List>

                         <Divider sx={{ my: 2 }} />
                    </CardContent>
               </Card>


               <Card elevation={2} sx={{ mt: 3 }}>
                    <CardHeader title={<Typography variant="h6">Recent Activity</Typography>} />
                    <CardContent sx={{ px: 0 }}>
                         <List dense>
                              {
                                   recentActivity?.length === 0 || !recentActivity ? (
                                        <ListItem sx={{ px: 3 }}>
                                             <Typography variant="body2" color="text.secondary">
                                                  No recent activity found.
                                             </Typography>
                                        </ListItem>
                                   ) : (
                                        formattedActivities.map((activity) => (
                                             <ListItem key={activity.id} sx={{ px: 3 }}>
                                                  <ListItemText
                                                       primary={activity.action}
                                                       secondary={activity.formattedDate}
                                                  />
                                             </ListItem>
                                        ))
                                   )
                              }
                         </List>
                    </CardContent>
               </Card>
          </>
     )
}

