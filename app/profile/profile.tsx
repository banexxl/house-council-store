"use client"

import { useState } from "react"
import { Box, Container } from "@mui/material"
import Grid from "@mui/material/Grid2"
import { Toaster } from "react-hot-toast"
import ProfileSidebar from "./components/profile-sidebar"
import ProfileTabs from "./components/profile-tabs"
import { Client } from "../types/client"
import { User } from "@supabase/supabase-js"

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

type ProfilePageProps = {
     sessionAndClientDataCombined?: { client: Client, session: User }
}
export const ProfilePage = ({ sessionAndClientDataCombined }: ProfilePageProps) => {


     const [editMode, setEditMode] = useState(false)
     const [notificationSettings, setNotificationSettings] = useState(notificationPreferences)

     return (
          <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
               <Toaster position="top-right" />
               <Box component="main" sx={{ flexGrow: 1, py: { xs: 4, md: 6 } }}>
                    <Container maxWidth="lg">
                         <Grid container spacing={4}>
                              {/* Profile Sidebar */}
                              <Grid size={{ xs: 12, md: 4 }}>
                                   <ProfileSidebar
                                        userData={sessionAndClientDataCombined!}
                                        subscriptionData={subscriptionData}
                                        recentActivity={recentActivity}
                                        onEditProfile={() => setEditMode(true)}
                                   />
                              </Grid>

                              {/* Main Content */}
                              <Grid size={{ xs: 12, md: 8 }}>
                                   <ProfileTabs
                                        userData={sessionAndClientDataCombined!}
                                        editMode={editMode}
                                        setEditMode={setEditMode}
                                        subscriptionData={subscriptionData}
                                        paymentMethods={paymentMethods}
                                        paymentHistory={paymentHistory}
                                        notificationSettings={notificationSettings}
                                        setNotificationSettings={setNotificationSettings}
                                   />
                              </Grid>
                         </Grid>
                    </Container>
               </Box>
          </Box>
     )
}

export default ProfilePage

