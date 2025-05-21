"use client"

import { useEffect, useState } from "react"
import { Box, Container, Grid } from "@mui/material"
import ProfileSidebar, { ActivityItem } from "./components/profile-sidebar"
import ProfileTabs from "./components/profile-tabs"
import { Client } from "../types/client"
import { User } from "@supabase/supabase-js"
import { ClientSubscription, SubscriptionPlan } from "../types/subscription-plan"
import { BaseEntity } from "../types/base-entity"
import { ClientBillingInformation } from "../types/billing-information"
import { Feature } from "../types/feature"
import Animate from "@/app/components/animation-framer-motion"
import { Payment } from "../types/payment"
import { Currency } from "../types/currency"
import { createBrowserClient } from "@supabase/ssr"

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

type ProfilePageProps = {
     sessionAndClientDataCombined?: { client: Client, session: User }
     clientSubscriptionObject: ClientSubscription & { subscription_plan: SubscriptionPlan }
     paymentMethods: BaseEntity[]
     allClientBillingInformation: ClientBillingInformation[]
     recentActivity: ActivityItem[]
     binCheckerAPIKey?: string,
     clientPayments: Payment[]
     subsrciptioFeatures: SubscriptionPlan & { features: Feature[] } | null
     currencies?: Currency[],
}
export const ProfilePage = ({ sessionAndClientDataCombined, clientSubscriptionObject, paymentMethods, allClientBillingInformation, recentActivity, binCheckerAPIKey, clientPayments, subsrciptioFeatures, currencies }: ProfilePageProps) => {

     const [editMode, setEditMode] = useState(false)
     const [notificationSettings, setNotificationSettings] = useState(notificationPreferences)

     return (
          <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh", mt: 5 }}>
               <Animate>
                    <Box component="main" sx={{ flexGrow: 1, py: { xs: 4, md: 6 } }}>
                         <Container maxWidth="lg">
                              <Grid container spacing={4}>
                                   {/* Profile Sidebar */}
                                   <Grid size={{ xs: 12, md: 4 }}>
                                        <ProfileSidebar
                                             userData={sessionAndClientDataCombined!}
                                             clientSubscriptionObject={clientSubscriptionObject}
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
                                             clientSubscriptionObject={clientSubscriptionObject}
                                             paymentMethods={paymentMethods}
                                             allClientBillingInformation={allClientBillingInformation}
                                             notificationSettings={notificationSettings}
                                             setNotificationSettings={setNotificationSettings}
                                             recentActivity={recentActivity || []}
                                             binCheckerAPIKey={binCheckerAPIKey}
                                             clientPayments={clientPayments}
                                             subsrciptioFeatures={subsrciptioFeatures}
                                             currencies={currencies}
                                        />
                                   </Grid>
                              </Grid>
                         </Container>
                    </Box>
               </Animate>
          </Box>
     )
}

export default ProfilePage

