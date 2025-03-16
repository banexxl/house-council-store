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

// Types
export interface UserData {
     id: string
     name: string
     email: string
     phone: string
     avatar: string
     role: string
     status: string
     joinDate: string
     community: string
     unit: string
     emailVerified: boolean
     twoFactorEnabled: boolean
}

export interface SubscriptionData {
     plan: string
     status: string
     nextBillingDate: string
     amount: string
     billingCycle: string
     autoRenew: boolean
     features: string[]
}

export interface ActivityItem {
     id: string
     type: string
     description: string
     date: string
}

interface ProfileSidebarProps {
     userData: UserData
     subscriptionData: SubscriptionData
     recentActivity: ActivityItem[]
     onEditProfile: () => void
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

export default function ProfileSidebar({
     userData,
     subscriptionData,
     recentActivity,
     onEditProfile,
}: ProfileSidebarProps) {
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
                                   <Avatar src={userData.avatar} alt={userData.name} sx={{ width: 120, height: 120 }} />
                              </Badge>
                         </Box>

                         <Typography variant="h5" gutterBottom>
                              {userData.name}
                         </Typography>

                         <Chip label={userData.status} color={getStatusColor(userData.status)} size="small" sx={{ mb: 1 }} />

                         <Typography variant="body2" color="text.secondary" gutterBottom>
                              {userData.role} at {userData.community}
                         </Typography>

                         <Divider sx={{ my: 2 }} />

                         <List dense>
                              <ListItem>
                                   <ListItemIcon>
                                        <EmailIcon fontSize="small" />
                                   </ListItemIcon>
                                   <ListItemText primary={userData.email} secondary={userData.emailVerified ? "Verified" : "Not verified"} />
                                   {userData.emailVerified && <VerifiedUserIcon color="success" fontSize="small" />}
                              </ListItem>

                              <ListItem>
                                   <ListItemIcon>
                                        <PhoneIcon fontSize="small" />
                                   </ListItemIcon>
                                   <ListItemText primary={userData.phone} />
                              </ListItem>

                              <ListItem>
                                   <ListItemIcon>
                                        <ApartmentIcon fontSize="small" />
                                   </ListItemIcon>
                                   <ListItemText primary={userData.unit} />
                              </ListItem>

                              <ListItem>
                                   <ListItemIcon>
                                        <CalendarTodayIcon fontSize="small" />
                                   </ListItemIcon>
                                   <ListItemText primary="Member since" secondary={userData.joinDate} />
                              </ListItem>
                         </List>

                         <Divider sx={{ my: 2 }} />

                         <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                              <Typography variant="subtitle2">Two-Factor Authentication</Typography>
                              <Chip
                                   label={userData.twoFactorEnabled ? "Enabled" : "Disabled"}
                                   color={userData.twoFactorEnabled ? "success" : "default"}
                                   size="small"
                              />
                         </Box>
                    </CardContent>
               </Card>

               <Card elevation={2} sx={{ mt: 3 }}>
                    <CardHeader title="Subscription" titleTypographyProps={{ variant: "h6" }} />
                    <CardContent>
                         <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                              <Typography variant="h5" color="primary.main">
                                   {subscriptionData.plan}
                              </Typography>
                              <Chip label={subscriptionData.status} color={getStatusColor(subscriptionData.status)} size="small" />
                         </Box>

                         <Typography variant="body2" color="text.secondary" paragraph>
                              {subscriptionData.amount} billed {subscriptionData.billingCycle.toLowerCase()}
                         </Typography>

                         <Box sx={{ bgcolor: "background.default", p: 2, borderRadius: 1, mb: 2 }}>
                              <Typography variant="subtitle2" gutterBottom>
                                   Next billing date: {subscriptionData.nextBillingDate}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                   Auto-renewal: {subscriptionData.autoRenew ? "Enabled" : "Disabled"}
                              </Typography>
                         </Box>

                         <Typography variant="subtitle2" gutterBottom>
                              Plan Features:
                         </Typography>

                         <List dense disablePadding>
                              {subscriptionData.features.map((feature, index) => (
                                   <ListItem key={index} disablePadding sx={{ py: 0.5 }}>
                                        <ListItemIcon sx={{ minWidth: 28 }}>
                                             <CheckCircleIcon color="success" fontSize="small" />
                                        </ListItemIcon>
                                        <ListItemText primary={feature} />
                                   </ListItem>
                              ))}
                         </List>

                         <Button variant="outlined" fullWidth sx={{ mt: 2 }} component={Link} href="/pricing">
                              Manage Subscription
                         </Button>
                    </CardContent>
               </Card>

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

