"use client"

import toast from "react-hot-toast"
import { Box, Container, Grid } from "@mui/material"
import ProfileSidebar, { ActivityItem } from "./components/profile-sidebar"
import ProfileTabs from "./components/profile-tabs"
import { User } from "@supabase/supabase-js"
import Animate from "@/app/components/animation-framer-motion"
import { PolarSubscription } from "../types/polar-subscription-types"
import { PolarCustomer } from "../types/polar-customer-types"
import { PolarProduct } from "../types/polar-product-types"
import { PolarOrder } from "../types/polar-order-types"

type ProfilePageProps = {
     sessionAndCustomerDataCombined?: { customer: PolarCustomer, session: User }
     customerSubscriptionObject: PolarSubscription
     recentActivity: ActivityItem[]
     apartmentsCount: number
     productData: PolarProduct | null
     payments: PolarOrder[] | null
}
export const ProfilePage = ({
     sessionAndCustomerDataCombined,
     customerSubscriptionObject,
     recentActivity,
     apartmentsCount,
     productData,
     payments
}: ProfilePageProps) => {

     const handleOpenCustomerPortal = async () => {
          const hasSubscription = Boolean(customerSubscriptionObject?.id && customerSubscriptionObject?.id)
          if (!hasSubscription) {
               toast.error("No subscription found. Please purchase a plan first.")
               return
          }

          if (!customerSubscriptionObject?.customerId) {
               toast.error("Missing customer identifier.")
               return
          }

          try {
               const returnUrl = typeof window !== "undefined"
                    ? `${window.location.origin}/profile`
                    : null

               const res = await fetch("/api/polar/customer-portal", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                         polarCustomerId: customerSubscriptionObject.customerId,
                         returnUrl,
                    }),
               })

               const data = await res.json().catch(() => ({}))
               if (!res.ok) {
                    if (data?.error === "customer_not_found") {
                         throw new Error("Please subscribe to a plan before opening the customer portal.")
                    }
                    throw new Error(data?.error || "Failed to open customer portal.")
               }

               const url = data?.url as string | undefined
               if (!url) {
                    throw new Error("Customer portal URL missing.")
               }

               if (typeof window !== "undefined") {
                    window.open(url, "_blank", "noopener,noreferrer")
               }
          } catch (err: any) {
               toast.error(err?.message || "Failed to open customer portal.")
          }
     }

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
                                             onEditProfile={() => handleOpenCustomerPortal()}
                                        />
                                   </Grid>

                                   {/* Main Content */}
                                   <Grid size={{ xs: 12, md: 8 }}>
                                        <ProfileTabs
                                             userData={sessionAndCustomerDataCombined!}
                                             customerSubscriptionObject={customerSubscriptionObject}
                                             // notificationSettings={notificationSettings}
                                             // setNotificationSettings={setNotificationSettings}
                                             recentActivity={recentActivity || []}
                                             apartmentsCount={apartmentsCount}
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

