"use client"

import { useState } from "react"
import { Box, Container, Grid } from "@mui/material"
import { Toaster } from "react-hot-toast"
import ProfileSidebar from "./components/profile-sidebar"
import ProfileTabs from "./components/profile-tabs"
import { Client } from "../types/client"
import { User } from "@supabase/supabase-js"
import { SubscriptionPlan } from "../types/subscription-plan"
import { BaseEntity } from "../types/base-entity"
import { ClientBillingInformation } from "../types/billing-information"
import { Feature } from "../types/feature"


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
     subscriptionPlan: SubscriptionPlan | null
     paymentMethods: BaseEntity[]
     allClientBillingInformation: ClientBillingInformation[]
     subscriptionFeatures?: Feature[]
}
export const ProfilePage = ({ sessionAndClientDataCombined, subscriptionPlan, paymentMethods, allClientBillingInformation, subscriptionFeatures }: ProfilePageProps) => {

     const [editMode, setEditMode] = useState(false)
     const [notificationSettings, setNotificationSettings] = useState(notificationPreferences)

     return (
          <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
               <Box component="main" sx={{ flexGrow: 1, py: { xs: 4, md: 6 } }}>
                    <Container maxWidth="lg">
                         <Grid container spacing={4}>
                              {/* Profile Sidebar */}
                              <Grid size={{ xs: 12, md: 4 }}>
                                   <ProfileSidebar
                                        userData={sessionAndClientDataCombined!}
                                        subscriptionData={subscriptionPlan}
                                        recentActivity={recentActivity}
                                        onEditProfile={() => setEditMode(true)}
                                        subscriptionFeatures={subscriptionFeatures}
                                   />
                              </Grid>

                              {/* Main Content */}
                              <Grid size={{ xs: 12, md: 8 }}>
                                   <ProfileTabs
                                        userData={sessionAndClientDataCombined!}
                                        editMode={editMode}
                                        setEditMode={setEditMode}
                                        subscriptionData={subscriptionPlan}
                                        paymentMethods={paymentMethods}
                                        allClientBillingInformation={allClientBillingInformation}
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

