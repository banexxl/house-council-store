"use client"

import type React from "react"

import { useState } from "react"
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
} from "@mui/material"
import EditIcon from "@mui/icons-material/Edit"
import LockIcon from "@mui/icons-material/Lock"
import SecurityIcon from "@mui/icons-material/Security"
import MoreVertIcon from "@mui/icons-material/MoreVert"
import CheckCircleIcon from "@mui/icons-material/CheckCircle"
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera"
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser"
import EmailIcon from "@mui/icons-material/Email"
import PhoneIcon from "@mui/icons-material/Phone"
import ApartmentIcon from "@mui/icons-material/Apartment"
import CalendarTodayIcon from "@mui/icons-material/CalendarToday"
import { logoutUserAction } from "../logout-action"
import toast from "react-hot-toast"
import { useRouter } from "next/navigation"
import { Client, clientInitialValues } from "@/app/types/client"
import { User } from "@supabase/supabase-js"
import { SubscriptionPlan } from "@/app/types/subscription-plan"
import { Feature } from "@/app/types/feature"

export interface ActivityItem {
     id: string
     type: string
     description: string
     date: string
}

interface ProfileSidebarProps {
     userData: { client: Client; session: User }
     subscriptionData: SubscriptionPlan | null
     recentActivity: ActivityItem[]
     onEditProfile: () => void
     subscriptionFeatures?: Feature[]
}

export const getStatusColor = (status: string) => {
     switch (status.toLowerCase()) {
          case "active":
               return "success"
          case "pending":
               return "warning"
          case "suspended":
               return "error"
          default:
               return "default"
     }
}

export default function ProfileSidebar({ userData, subscriptionData, recentActivity, onEditProfile, subscriptionFeatures }: ProfileSidebarProps) {

     const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null)
     const router = useRouter()

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
                              <MenuItem component={Link} href="/auth/reset-password" onClick={handleMenuClose}>
                                   <ListItemIcon>
                                        <LockIcon fontSize="small" />
                                   </ListItemIcon>
                                   <ListItemText>Change Password</ListItemText>
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
                                        <IconButton
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
                                             <PhotoCameraIcon sx={{ fontSize: 16 }} />
                                        </IconButton>
                                   }
                              >
                                   <Avatar src={userData.client.avatar} alt={userData.client.name} sx={{ width: 120, height: 120 }} />
                              </Badge>
                         </Box>

                         <Typography variant="h5" gutterBottom>
                              {userData.client.name}
                         </Typography>

                         <Chip label={userData.client.client_status} color={getStatusColor(userData.client.client_status)} size="small" sx={{ mb: 1 }} />

                         <Typography variant="body2" color="text.secondary" gutterBottom>
                              {userData.client.role_id}
                         </Typography>

                         <Divider sx={{ my: 2 }} />

                         <List dense>
                              <ListItem>
                                   <ListItemIcon>
                                        <EmailIcon fontSize="small" />
                                   </ListItemIcon>
                                   <ListItemText primary={userData.client.email} secondary={userData.client.is_verified ? "Verified" : "Not verified"} />
                                   {userData.client.is_verified && <VerifiedUserIcon color="success" fontSize="small" />}
                              </ListItem>

                              <ListItem>
                                   <ListItemIcon>
                                        <PhoneIcon fontSize="small" />
                                   </ListItemIcon>
                                   <ListItemText primary={userData.client.phone} />
                              </ListItem>

                              <ListItem>
                                   <ListItemIcon>
                                        <CalendarTodayIcon fontSize="small" />
                                   </ListItemIcon>
                                   <ListItemText
                                        primary="Member since"
                                        secondary={new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(userData.session.created_at))}
                                   />
                              </ListItem>
                         </List>

                         <Divider sx={{ my: 2 }} />

                         {/* <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                              <Typography variant="subtitle2">Two-Factor Authentication</Typography>
                              <Chip
                                   label={userData.twoFactorEnabled ? "Enabled" : "Disabled"}
                                   color={userData.twoFactorEnabled ? "success" : "default"}
                                   size="small"
                              />
                         </Box> */}
                    </CardContent>
               </Card>

               {subscriptionData ? (
                    <Card elevation={2} sx={{ mt: 3 }}>
                         <CardHeader title="Subscription" sx={{ variant: "h6" }} />
                         <CardContent>
                              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                                   <Typography variant="h5" color="primary.main">
                                        {subscriptionData.name}
                                   </Typography>
                                   {/* <Chip label={subscriptionData.status_id} color={getStatusColor(subscriptionData.status_id)} size="small" /> */}
                              </Box>

                              <Typography variant="body2" color="text.secondary">
                                   {subscriptionData.base_price_per_month} billed {subscriptionData.is_billed_yearly ? "annually" : "monthly"}
                              </Typography>

                              <Box sx={{ bgcolor: "background.default", borderRadius: 1, mb: 2 }}>
                                   {userData.client.next_billing_date ? (
                                        <Typography variant="subtitle2" gutterBottom>
                                             Next billing date: {new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(userData.client.next_billing_date))}
                                        </Typography>
                                   ) : (
                                        <Typography variant="subtitle2" gutterBottom>
                                             Next billing date: N/A
                                        </Typography>
                                   )}
                                   {/* <Typography variant="body2" color="text.secondary">
                                   Auto-renewal: {subscriptionData.autoRenew ? "Enabled" : "Disabled"}
                              </Typography> */}
                              </Box>

                              <Typography variant="subtitle2" gutterBottom>
                                   Plan Features:
                              </Typography>

                              <List dense disablePadding>
                                   {subscriptionFeatures && subscriptionFeatures?.length > 0 && subscriptionFeatures!.map((feature, index) => (
                                        <ListItem key={index} disablePadding sx={{ py: 0.5 }}>
                                             <ListItemIcon sx={{ minWidth: 28 }}>
                                                  <CheckCircleIcon color="success" fontSize="small" />
                                             </ListItemIcon>
                                             <ListItemText primary={`${feature.name}`} />
                                             {/* <ListItemText primary={`${feature.base_price_per_month} / Monthly`} /> */}
                                        </ListItem>
                                   ))}
                              </List>

                              <Button variant="outlined" fullWidth sx={{ mt: 2 }} component={Link} href="/pricing">
                                   Manage Subscription
                              </Button>
                         </CardContent>
                    </Card>
               ) : (
                    <Card elevation={2} sx={{ mt: 3 }}>
                         <CardHeader title="Subscription" sx={{ variant: "h6" }} />
                         <CardContent>
                              <Typography variant="body2" color="text.secondary">
                                   No active subscription found.
                              </Typography>
                         </CardContent>
                    </Card>
               )}
               <Card elevation={2} sx={{ mt: 3 }}>
                    <CardHeader title={<Typography variant="h6">Recent Activity</Typography>} />
                    <CardContent sx={{ px: 0 }}>
                         <List dense>
                              {recentActivity.map((activity) => (
                                   <ListItem key={activity.id} sx={{ px: 3 }}>
                                        <ListItemText primary={activity.description} secondary={activity.date} />
                                   </ListItem>
                              ))}
                         </List>

                         <Divider />

                         <Box sx={{ textAlign: "center", py: 1 }}>
                              <Button variant="text" size="small">
                                   View All Activity
                              </Button>
                         </Box>
                    </CardContent>
               </Card>
          </>
     )
}

