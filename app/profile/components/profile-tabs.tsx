"use client"

import type React from "react"

import { useState } from "react"
import { Box, Paper, Tab, Tabs, Typography } from "@mui/material"
import EditIcon from "@mui/icons-material/Edit"
import SubscriptionsIcon from '@mui/icons-material/Subscriptions';
import SecurityIcon from "@mui/icons-material/Security"
import AccountTab from "./tabs/account-tab"
import SecurityTab from "./tabs/security-tab"
import { User } from "@supabase/supabase-js"
import { SubscriptionPlan } from "@/app/types/subscription-plan"
import { ActivityItem } from "./profile-sidebar"
import { Feature } from "@/app/types/feature"
import SubscriptionTab from "./tabs/subscription-tab"
import { PolarSubscription } from "@/app/types/polar-subscription-types"
import { PolarCustomer } from "@/app/types/polar-customer-types"
import { PolarProduct } from "@/app/types/polar-product-types"
import { PolarOrder } from "@/app/types/polar-order-types"

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

interface ProfileTabsProps {
     userData: { customer: PolarCustomer, session: User }
     editMode: boolean
     setEditMode: (value: boolean) => void
     customerSubscriptionObject: PolarSubscription
     recentActivity: ActivityItem[]
     binCheckerAPIKey?: string,
     subscriptionFeatures?: SubscriptionPlan & { features: Feature[] } | null,
     apartmentsCount: number
     productData: PolarProduct | null
     payments: PolarOrder[] | null
}

export default function ProfileTabs({
     userData,
     editMode,
     setEditMode,
     customerSubscriptionObject,
     recentActivity,
     subscriptionFeatures,
     apartmentsCount,
     productData,
     payments
}: ProfileTabsProps) {

     const [tabValue, setTabValue] = useState(0)
     const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
          setTabValue(newValue)
     }

     const lastAction = recentActivity
          .filter(activity => activity.type === 'action')
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];

     return (
          <>
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
                         {/* <Tab label="Billing" icon={<CreditCardIcon />} iconPosition="start" /> */}
                         <Tab label="Subscription" icon={<SubscriptionsIcon />} iconPosition="start" />
                         {/* <Tab label="Payments" icon={<ReceiptIcon />} iconPosition="start" /> */}
                         {/* <Tab label="Notifications" icon={<NotificationsIcon />} iconPosition="start" /> */}
                         <Tab label="Security" icon={<SecurityIcon />} iconPosition="start" />
                    </Tabs>

                    <Box sx={{ px: 3 }}>
                         {/* Account Tab */}
                         <TabPanel value={tabValue} index={0}>
                              <AccountTab userData={userData} />
                         </TabPanel>

                         {/* Subscription Tab */}
                         <TabPanel value={tabValue} index={1}>
                              <SubscriptionTab
                                   customerSubscriptionObject={customerSubscriptionObject || null}
                                   subsriptionFeatures={subscriptionFeatures}
                                   apartmentsCount={apartmentsCount}
                                   productData={productData}
                                   payments={payments}
                              />
                         </TabPanel>

                         <TabPanel value={tabValue} index={2}>
                              <SecurityTab userData={userData} />
                         </TabPanel>
                    </Box>
               </Paper>

               <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
                    <Typography variant="caption" color="text.secondary">
                         Last updated:{' '}
                         {lastAction?.created_at
                              ? new Intl.DateTimeFormat(undefined, {
                                   dateStyle: 'medium',
                                   timeStyle: 'short',
                                   hour12: false,
                              }).format(new Date(lastAction.created_at))
                              : 'No recent activity'}
                    </Typography>
               </Box>
          </>
     )
}

