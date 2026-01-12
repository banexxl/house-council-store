"use client"

import { useState } from "react"
import { Box, Container, Grid } from "@mui/material"
import ProfileSidebar, { ActivityItem } from "./components/profile-sidebar"
import ProfileTabs from "./components/profile-tabs"
import { User } from "@supabase/supabase-js"
import { SubscriptionPlan } from "../types/subscription-plan"
import { Feature } from "../types/feature"
import Animate from "@/app/components/animation-framer-motion"
import { PolarSubscription } from "../types/polar-subscription-types"
import { PolarCustomer } from "../types/polar-customer-types"
import { PolarProduct } from "../types/polar-product-types"
import { PolarOrder } from "../types/polar-order-types"

type ProfilePageProps = {
     sessionAndCustomerDataCombined?: { customer: PolarCustomer, session: User }
     customerSubscriptionObject: PolarSubscription
     recentActivity: ActivityItem[]
     binCheckerAPIKey?: string,
     subscriptionFeatures: SubscriptionPlan & { features: Feature[] } | null
     apartmentsCount: number
     productData: PolarProduct | null
     payments: PolarOrder[] | null
}
export const ProfilePage = ({
     sessionAndCustomerDataCombined,
     customerSubscriptionObject,
     recentActivity,
     binCheckerAPIKey,
     subscriptionFeatures,
     apartmentsCount,
     productData,
     payments
}: ProfilePageProps) => {

     const [editMode, setEditMode] = useState(false)

     return (
          <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh", mt: 5 }}>
               <Animate>
                    <Box component="main" sx={{ flexGrow: 1, py: { xs: 4, md: 6 } }}>
                         <Container maxWidth="lg">
                              <Grid container spacing={4}>
                                   {/* Profile Sidebar */}
                                   <Grid size={{ xs: 12, md: 4 }}>
                                        <ProfileSidebar
                                             userData={sessionAndCustomerDataCombined!}
                                             recentActivity={recentActivity}
                                             onEditProfile={() => setEditMode(true)}
                                        />
                                   </Grid>

                                   {/* Main Content */}
                                   <Grid size={{ xs: 12, md: 8 }}>
                                        <ProfileTabs
                                             userData={sessionAndCustomerDataCombined!}
                                             editMode={editMode}
                                             setEditMode={setEditMode}
                                             customerSubscriptionObject={customerSubscriptionObject}
                                             // notificationSettings={notificationSettings}
                                             // setNotificationSettings={setNotificationSettings}
                                             recentActivity={recentActivity || []}
                                             binCheckerAPIKey={binCheckerAPIKey}
                                             apartmentsCount={apartmentsCount}
                                             subscriptionFeatures={subscriptionFeatures}
                                             productData={productData}
                                             payments={payments}
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

