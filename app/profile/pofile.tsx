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
     Container,
     Divider,
     IconButton,
     List,
     ListItem,
     ListItemIcon,
     ListItemText,
     Paper,
     Stack,
     Switch,
     Tab,
     Tabs,
     TextField,
     Typography,
     Avatar,
     Chip,
     Table,
     TableBody,
     TableCell,
     TableContainer,
     TableHead,
     TableRow,
     Badge,
     Menu,
     MenuItem,
     Alert,
} from "@mui/material"
import Grid from "@mui/material/Grid2"
import EditIcon from "@mui/icons-material/Edit"
import LockIcon from "@mui/icons-material/Lock"
import CreditCardIcon from "@mui/icons-material/CreditCard"
import ReceiptIcon from "@mui/icons-material/Receipt"
import NotificationsIcon from "@mui/icons-material/Notifications"
import SecurityIcon from "@mui/icons-material/Security"
import ApartmentIcon from "@mui/icons-material/Apartment"
import MoreVertIcon from "@mui/icons-material/MoreVert"
import CheckCircleIcon from "@mui/icons-material/CheckCircle"
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera"
import DownloadIcon from "@mui/icons-material/Download"
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser"
import EmailIcon from "@mui/icons-material/Email"
import PhoneIcon from "@mui/icons-material/Phone"
import CalendarTodayIcon from "@mui/icons-material/CalendarToday"
import { logoutUserAction } from "./logout-action"
import toast, { Toaster } from "react-hot-toast"
import { useRouter } from "next/navigation"


// Mock data for the profile
const userData = {
     id: "usr_12345",
     name: "Sarah Johnson",
     email: "sarah.johnson@example.com",
     phone: "+1 (555) 123-4567",
     avatar: "/placeholder.svg?height=150&width=150",
     role: "Council President",
     status: "Active",
     joinDate: "January 15, 2023",
     community: "Oakwood Residences",
     unit: "Apartment 302",
     emailVerified: true,
     twoFactorEnabled: true,
}

// Mock data for subscription
const subscriptionData = {
     plan: "Standard",
     status: "Active",
     nextBillingDate: "February 15, 2024",
     amount: "$59.00",
     billingCycle: "Monthly",
     autoRenew: true,
     features: [
          "Up to 150 units/residents",
          "Advanced financial tools",
          "Voting system",
          "Maintenance requests",
          "Priority email support",
     ],
}

// Mock data for payment history
const paymentHistory = [
     { id: "inv_8765", date: "January 15, 2024", amount: "$59.00", status: "Paid", method: "Visa •••• 4242" },
     { id: "inv_7654", date: "December 15, 2023", amount: "$59.00", status: "Paid", method: "Visa •••• 4242" },
     { id: "inv_6543", date: "November 15, 2023", amount: "$59.00", status: "Paid", method: "Visa •••• 4242" },
     { id: "inv_5432", date: "October 15, 2023", amount: "$59.00", status: "Paid", method: "Visa •••• 4242" },
     { id: "inv_4321", date: "September 15, 2023", amount: "$59.00", status: "Paid", method: "Visa •••• 4242" },
]

// Mock data for payment methods
const paymentMethods = [
     { id: "pm_1234", type: "Visa", last4: "4242", expiry: "12/25", default: true },
     { id: "pm_5678", type: "Mastercard", last4: "5555", expiry: "09/24", default: false },
]

// Mock data for notification preferences
const notificationPreferences = [
     { id: "notif_1", type: "Email Notifications", description: "Receive important updates via email", enabled: true },
     { id: "notif_2", type: "SMS Notifications", description: "Receive urgent alerts via text message", enabled: true },
     {
          id: "notif_3",
          type: "Community Announcements",
          description: "Get notified about new announcements",
          enabled: true,
     },
     {
          id: "notif_4",
          type: "Payment Reminders",
          description: "Receive reminders before payment due dates",
          enabled: true,
     },
     { id: "notif_5", type: "Maintenance Updates", description: "Get updates on maintenance requests", enabled: false },
     { id: "notif_6", type: "Event Reminders", description: "Receive reminders about upcoming events", enabled: true },
     {
          id: "notif_7",
          type: "Voting Notifications",
          description: "Get notified about new votes and results",
          enabled: true,
     },
]

// Mock data for recent activity
const recentActivity = [
     { id: "act_1", type: "Payment", description: "Monthly subscription payment", date: "January 15, 2024" },
     { id: "act_2", type: "Login", description: "Successful login from new device", date: "January 12, 2024" },
     { id: "act_3", type: "Document", description: "Uploaded 'Community Guidelines.pdf'", date: "January 10, 2024" },
     { id: "act_4", type: "Vote", description: "Voted on 'Playground Renovation'", date: "January 5, 2024" },
     { id: "act_5", type: "Profile", description: "Updated profile information", date: "December 28, 2023" },
]

interface TabPanelProps {
     children?: React.ReactNode
     index: number
     value: number
}

function TabPanel(props: TabPanelProps) {
     const { children, value, index, ...other } = props

     return (
          <div
               role="tabpanel"
               hidden={value !== index}
               id={`profile-tabpanel-${index}`}
               aria-labelledby={`profile-tab-${index}`}
               {...other}
          >
               {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
          </div>
     )
}

export const ProfilePage = () => {

     const [tabValue, setTabValue] = useState(0)
     const [editMode, setEditMode] = useState(false)
     const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null)
     const [notificationSettings, setNotificationSettings] = useState(notificationPreferences)
     const router = useRouter()



     const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
          setTabValue(newValue)
     }

     const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
          setMenuAnchorEl(event.currentTarget)
     }

     const handleMenuClose = () => {
          setMenuAnchorEl(null)
     }

     const handleNotificationToggle = (id: string) => {
          setNotificationSettings((prevSettings) =>
               prevSettings.map((setting) => (setting.id === id ? { ...setting, enabled: !setting.enabled } : setting)),
          )
     }

     const handleLogout = async () => {
          handleMenuClose();
          try {
               const logoutUserResponse = await logoutUserAction();
               if (!logoutUserResponse) {
                    toast.success("You have been logged out successfully!");
                    router.push("/");
               }
          } catch (error) {
               toast.error("Error logging out");
          }
     }

     const getStatusColor = (status: string) => {
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

     const getPaymentStatusColor = (status: string) => {
          switch (status.toLowerCase()) {
               case "paid":
                    return "success"
               case "pending":
                    return "warning"
               case "failed":
                    return "error"
               default:
                    return "default"
          }
     }

     return (
          <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
               <Box component="main" sx={{ flexGrow: 1, py: { xs: 4, md: 6 } }}>
                    <Container maxWidth="lg">
                         <Grid container spacing={4}>
                              {/* Profile Sidebar */}
                              <Grid size={{ xs: 12, md: 4 }}>
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
                                                            setEditMode(true)
                                                            handleMenuClose()
                                                       }}
                                                  >
                                                       <ListItemIcon>
                                                            <EditIcon fontSize="small" />
                                                       </ListItemIcon>
                                                       <ListItemText>Edit Profile</ListItemText>
                                                  </MenuItem>
                                                  <MenuItem component={Link} href="/reset-password" onClick={handleMenuClose}>
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
                                                       <ListItemText
                                                            primary={userData.email}
                                                            secondary={userData.emailVerified ? "Verified" : "Not verified"}
                                                       />
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
                                                  <Chip
                                                       label={subscriptionData.status}
                                                       color={getStatusColor(subscriptionData.status)}
                                                       size="small"
                                                  />
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
                              </Grid>

                              {/* Main Content */}
                              <Grid size={{ xs: 12, md: 8 }}>
                                   <Paper elevation={2} sx={{ mb: 3 }}>
                                        <Tabs
                                             value={tabValue}
                                             onChange={handleTabChange}
                                             variant="scrollable"
                                             scrollButtons="auto"
                                             sx={{
                                                  borderBottom: 1,
                                                  borderColor: "divider",
                                                  px: 2,
                                             }}
                                        >
                                             <Tab label="Account" icon={<EditIcon />} iconPosition="start" />
                                             <Tab label="Billing" icon={<CreditCardIcon />} iconPosition="start" />
                                             <Tab label="Payments" icon={<ReceiptIcon />} iconPosition="start" />
                                             <Tab label="Notifications" icon={<NotificationsIcon />} iconPosition="start" />
                                             <Tab label="Security" icon={<SecurityIcon />} iconPosition="start" />
                                        </Tabs>

                                        <Box sx={{ px: 3 }}>
                                             {/* Account Tab */}
                                             <TabPanel value={tabValue} index={0}>
                                                  {editMode ? (
                                                       <Box component="form">
                                                            <Alert severity="info" sx={{ mb: 3 }}>
                                                                 Edit your profile information below. Fields marked with * are required.
                                                            </Alert>

                                                            <Grid container spacing={3}>
                                                                 <Grid size={{ xs: 12, md: 6 }}>
                                                                      <TextField fullWidth label="Full Name" defaultValue={userData.name} required />
                                                                 </Grid>

                                                                 <Grid size={{ xs: 12, md: 6 }}>
                                                                      <TextField fullWidth label="Email" type="email" defaultValue={userData.email} required />
                                                                 </Grid>

                                                                 <Grid size={{ xs: 12, md: 6 }}>
                                                                      <TextField fullWidth label="Phone Number" defaultValue={userData.phone} />
                                                                 </Grid>

                                                                 <Grid size={{ xs: 12, md: 6 }}>
                                                                      <TextField fullWidth label="Unit/Apartment" defaultValue={userData.unit} />
                                                                 </Grid>

                                                                 <Grid size={{ xs: 12 }}>
                                                                      <TextField fullWidth label="Role" defaultValue={userData.role} />
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
                                                                      <Typography variant="body1">{userData.id}</Typography>
                                                                 </Grid>

                                                                 <Grid size={{ xs: 12, md: 6 }}>
                                                                      <Typography variant="subtitle2" color="text.secondary">
                                                                           Status
                                                                      </Typography>
                                                                      <Chip label={userData.status} color={getStatusColor(userData.status)} size="small" />
                                                                 </Grid>

                                                                 <Grid size={{ xs: 12, md: 6 }}>
                                                                      <Typography variant="subtitle2" color="text.secondary">
                                                                           Full Name
                                                                      </Typography>
                                                                      <Typography variant="body1">{userData.name}</Typography>
                                                                 </Grid>

                                                                 <Grid size={{ xs: 12, md: 6 }}>
                                                                      <Typography variant="subtitle2" color="text.secondary">
                                                                           Email
                                                                      </Typography>
                                                                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                                                           <Typography variant="body1">{userData.email}</Typography>
                                                                           {userData.emailVerified && <VerifiedUserIcon color="success" fontSize="small" />}
                                                                      </Box>
                                                                 </Grid>

                                                                 <Grid size={{ xs: 12, md: 6 }}>
                                                                      <Typography variant="subtitle2" color="text.secondary">
                                                                           Phone Number
                                                                      </Typography>
                                                                      <Typography variant="body1">{userData.phone}</Typography>
                                                                 </Grid>

                                                                 <Grid size={{ xs: 12, md: 6 }}>
                                                                      <Typography variant="subtitle2" color="text.secondary">
                                                                           Member Since
                                                                      </Typography>
                                                                      <Typography variant="body1">{userData.joinDate}</Typography>
                                                                 </Grid>

                                                                 <Grid size={{ xs: 12, md: 6 }}>
                                                                      <Typography variant="subtitle2" color="text.secondary">
                                                                           Community
                                                                      </Typography>
                                                                      <Typography variant="body1">{userData.community}</Typography>
                                                                 </Grid>

                                                                 <Grid size={{ xs: 12, md: 6 }}>
                                                                      <Typography variant="subtitle2" color="text.secondary">
                                                                           Unit/Apartment
                                                                      </Typography>
                                                                      <Typography variant="body1">{userData.unit}</Typography>
                                                                 </Grid>

                                                                 <Grid size={{ xs: 12, md: 6 }}>
                                                                      <Typography variant="subtitle2" color="text.secondary">
                                                                           Role
                                                                      </Typography>
                                                                      <Typography variant="body1">{userData.role}</Typography>
                                                                 </Grid>
                                                            </Grid>

                                                            <Divider sx={{ my: 3 }} />

                                                            <Box>
                                                                 <Typography variant="h6" gutterBottom>
                                                                      Account Actions
                                                                 </Typography>

                                                                 <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                                                                      <Button variant="outlined" component={Link} href="/reset-password" startIcon={<LockIcon />}>
                                                                           Change Password
                                                                      </Button>
                                                                      <Button variant="outlined" color="error">
                                                                           Delete Account
                                                                      </Button>
                                                                 </Stack>
                                                            </Box>
                                                       </Box>
                                                  )}
                                             </TabPanel>

                                             {/* Billing Tab */}
                                             <TabPanel value={tabValue} index={1}>
                                                  <Box sx={{ mb: 4 }}>
                                                       <Typography variant="h5" gutterBottom>
                                                            Subscription Details
                                                       </Typography>

                                                       <Card variant="outlined" sx={{ mb: 3 }}>
                                                            <CardContent>
                                                                 <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                                                                      <Box>
                                                                           <Typography variant="h6" color="primary.main">
                                                                                {subscriptionData.plan} Plan
                                                                           </Typography>
                                                                           <Typography variant="body2" color="text.secondary">
                                                                                {subscriptionData.amount} / {subscriptionData.billingCycle.toLowerCase()}
                                                                           </Typography>
                                                                      </Box>
                                                                      <Chip label={subscriptionData.status} color={getStatusColor(subscriptionData.status)} />
                                                                 </Box>

                                                                 <Divider sx={{ my: 2 }} />

                                                                 <Grid container spacing={2}>
                                                                      <Grid size={{ xs: 12, md: 6 }}>
                                                                           <Typography variant="subtitle2" color="text.secondary">
                                                                                Next billing date
                                                                           </Typography>
                                                                           <Typography variant="body2">{subscriptionData.nextBillingDate}</Typography>
                                                                      </Grid>

                                                                      <Grid size={{ xs: 12, md: 6 }}>
                                                                           <Typography variant="subtitle2" color="text.secondary">
                                                                                Auto-renewal
                                                                           </Typography>
                                                                           <Typography variant="body2">
                                                                                {subscriptionData.autoRenew ? "Enabled" : "Disabled"}
                                                                           </Typography>
                                                                      </Grid>
                                                                 </Grid>

                                                                 <Box sx={{ mt: 3 }}>
                                                                      <Typography variant="subtitle2" gutterBottom>
                                                                           Plan Features:
                                                                      </Typography>

                                                                      <Grid container spacing={1}>
                                                                           {subscriptionData.features.map((feature, index) => (
                                                                                <Grid size={{ xs: 12, md: 6 }} key={index}>
                                                                                     <Box sx={{ display: "flex", alignItems: "center" }}>
                                                                                          <CheckCircleIcon color="success" fontSize="small" sx={{ mr: 1 }} />
                                                                                          <Typography variant="body2">{feature}</Typography>
                                                                                     </Box>
                                                                                </Grid>
                                                                           ))}
                                                                      </Grid>
                                                                 </Box>
                                                            </CardContent>
                                                       </Card>

                                                       <Box sx={{ display: "flex", gap: 2 }}>
                                                            <Button variant="contained" component={Link} href="/pricing">
                                                                 Upgrade Plan
                                                            </Button>
                                                            <Button variant="outlined">Cancel Subscription</Button>
                                                       </Box>
                                                  </Box>

                                                  <Divider sx={{ my: 4 }} />

                                                  <Box>
                                                       <Typography variant="h5" gutterBottom>
                                                            Payment Methods
                                                       </Typography>

                                                       {paymentMethods.map((method) => (
                                                            <Card
                                                                 key={method.id}
                                                                 variant="outlined"
                                                                 sx={{
                                                                      mb: 2,
                                                                      borderColor: method.default ? "primary.main" : "divider",
                                                                      position: "relative",
                                                                 }}
                                                            >
                                                                 {method.default && (
                                                                      <Chip
                                                                           label="Default"
                                                                           color="primary"
                                                                           size="small"
                                                                           sx={{
                                                                                position: "absolute",
                                                                                top: 12,
                                                                                right: 12,
                                                                           }}
                                                                      />
                                                                 )}
                                                                 <CardContent>
                                                                      <Box sx={{ display: "flex", alignItems: "center" }}>
                                                                           <CreditCardIcon sx={{ mr: 2 }} />
                                                                           <Box>
                                                                                <Typography variant="subtitle1">
                                                                                     {method.type} •••• {method.last4}
                                                                                </Typography>
                                                                                <Typography variant="body2" color="text.secondary">
                                                                                     Expires {method.expiry}
                                                                                </Typography>
                                                                           </Box>
                                                                      </Box>
                                                                 </CardContent>
                                                            </Card>
                                                       ))}

                                                       <Button variant="outlined" sx={{ mt: 1 }}>
                                                            Add Payment Method
                                                       </Button>
                                                  </Box>

                                                  <Divider sx={{ my: 4 }} />

                                                  <Box>
                                                       <Typography variant="h5" gutterBottom>
                                                            Billing Address
                                                       </Typography>

                                                       <Card variant="outlined">
                                                            <CardContent>
                                                                 <Typography variant="body1">Sarah Johnson</Typography>
                                                                 <Typography variant="body2">123 Community Lane, Apt 302</Typography>
                                                                 <Typography variant="body2">Boston, MA 02110</Typography>
                                                                 <Typography variant="body2">United States</Typography>

                                                                 <Button variant="text" sx={{ mt: 2 }} startIcon={<EditIcon />}>
                                                                      Edit Address
                                                                 </Button>
                                                            </CardContent>
                                                       </Card>
                                                  </Box>
                                             </TabPanel>

                                             {/* Payments Tab */}
                                             <TabPanel value={tabValue} index={2}>
                                                  <Typography variant="h5" gutterBottom>
                                                       Payment History
                                                  </Typography>

                                                  <TableContainer component={Paper} variant="outlined" sx={{ mb: 3 }}>
                                                       <Table>
                                                            <TableHead>
                                                                 <TableRow>
                                                                      <TableCell>Invoice</TableCell>
                                                                      <TableCell>Date</TableCell>
                                                                      <TableCell>Amount</TableCell>
                                                                      <TableCell>Status</TableCell>
                                                                      <TableCell>Payment Method</TableCell>
                                                                      <TableCell align="right">Actions</TableCell>
                                                                 </TableRow>
                                                            </TableHead>
                                                            <TableBody>
                                                                 {paymentHistory.map((payment) => (
                                                                      <TableRow key={payment.id}>
                                                                           <TableCell>{payment.id}</TableCell>
                                                                           <TableCell>{payment.date}</TableCell>
                                                                           <TableCell>{payment.amount}</TableCell>
                                                                           <TableCell>
                                                                                <Chip
                                                                                     label={payment.status}
                                                                                     color={getPaymentStatusColor(payment.status)}
                                                                                     size="small"
                                                                                />
                                                                           </TableCell>
                                                                           <TableCell>{payment.method}</TableCell>
                                                                           <TableCell align="right">
                                                                                <Button variant="text" size="small" startIcon={<DownloadIcon />}>
                                                                                     Receipt
                                                                                </Button>
                                                                           </TableCell>
                                                                      </TableRow>
                                                                 ))}
                                                            </TableBody>
                                                       </Table>
                                                  </TableContainer>

                                                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                                       <Button variant="outlined">View All Invoices</Button>
                                                       <Typography variant="body2" color="text.secondary">
                                                            Showing 5 of 12 payments
                                                       </Typography>
                                                  </Box>
                                             </TabPanel>

                                             {/* Notifications Tab */}
                                             <TabPanel value={tabValue} index={3}>
                                                  <Typography variant="h5" gutterBottom>
                                                       Notification Preferences
                                                  </Typography>

                                                  <Typography variant="body2" color="text.secondary" paragraph>
                                                       Manage how you receive notifications and updates from HouseCouncil.
                                                  </Typography>

                                                  <List>
                                                       {notificationSettings.map((setting) => (
                                                            <ListItem
                                                                 key={setting.id}
                                                                 secondaryAction={
                                                                      <Switch
                                                                           edge="end"
                                                                           checked={setting.enabled}
                                                                           onChange={() => handleNotificationToggle(setting.id)}
                                                                      />
                                                                 }
                                                                 divider
                                                            >
                                                                 <ListItemText primary={setting.type} secondary={setting.description} />
                                                            </ListItem>
                                                       ))}
                                                  </List>

                                                  <Box sx={{ mt: 3 }}>
                                                       <Button variant="contained">Save Preferences</Button>
                                                  </Box>
                                             </TabPanel>

                                             {/* Security Tab */}
                                             <TabPanel value={tabValue} index={4}>
                                                  <Typography variant="h5" gutterBottom>
                                                       Security Settings
                                                  </Typography>

                                                  <Card variant="outlined" sx={{ mb: 4 }}>
                                                       <CardContent>
                                                            <Typography variant="h6" gutterBottom>
                                                                 Password
                                                            </Typography>

                                                            <Typography variant="body2" color="text.secondary" paragraph>
                                                                 It's a good idea to use a strong password that you don't use elsewhere.
                                                            </Typography>

                                                            <Button variant="outlined" startIcon={<LockIcon />} component={Link} href="/reset-password">
                                                                 Change Password
                                                            </Button>
                                                       </CardContent>
                                                  </Card>

                                                  <Card variant="outlined" sx={{ mb: 4 }}>
                                                       <CardContent>
                                                            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                                                                 <Typography variant="h6">Two-Factor Authentication</Typography>
                                                                 <Chip
                                                                      label={userData.twoFactorEnabled ? "Enabled" : "Disabled"}
                                                                      color={userData.twoFactorEnabled ? "success" : "default"}
                                                                 />
                                                            </Box>

                                                            <Typography variant="body2" color="text.secondary" paragraph>
                                                                 Add an extra layer of security to your account by requiring both your password and a
                                                                 verification code from your mobile phone.
                                                            </Typography>

                                                            <Button variant={userData.twoFactorEnabled ? "outlined" : "contained"}>
                                                                 {userData.twoFactorEnabled ? "Disable" : "Enable"} Two-Factor Authentication
                                                            </Button>
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
                                                                      <ListItemText
                                                                           primary="Safari on iPhone"
                                                                           secondary="Boston, MA • Last active: 2 hours ago"
                                                                      />
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
                                             </TabPanel>
                                        </Box>
                                   </Paper>

                                   <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
                                        <Typography variant="caption" color="text.secondary">
                                             Last updated: January 15, 2024
                                        </Typography>
                                   </Box>
                              </Grid>
                         </Grid>
                    </Container>
               </Box>
          </Box>
     )
}

