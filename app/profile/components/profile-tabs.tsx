"use client"

import type React from "react"

import { useState } from "react"
import { Box, Paper, Tab, Tabs, Typography } from "@mui/material"
import EditIcon from "@mui/icons-material/Edit"
import CreditCardIcon from "@mui/icons-material/CreditCard"
import ReceiptIcon from "@mui/icons-material/Receipt"
import NotificationsIcon from "@mui/icons-material/Notifications"
import SecurityIcon from "@mui/icons-material/Security"
import AccountTab from "./tabs/account-tab"
import NotificationsTab from "./tabs/notifications-tab"
import SecurityTab from "./tabs/security-tab"
import PaymentsTab from "./tabs/payments-tab"
import { Session, User } from "@supabase/supabase-js"
import { Client } from "@/app/types/client"
import { SubscriptionPlan } from "@/app/types/subscription-plan"
import { ClientBillingInformation } from "@/app/types/billing-information"
import { ActivityItem } from "./profile-sidebar"
import { Feature } from "@/app/types/feature"
import { BillingTab } from "./tabs/billing-tab"

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
     userData: { client: Client, session: User }
     editMode: boolean
     setEditMode: (value: boolean) => void
     subscriptionData: SubscriptionPlan | null
     paymentMethods: any[]
     allClientBillingInformation: ClientBillingInformation[]
     notificationSettings: any[]
     setNotificationSettings: (value: any) => void
     recentActivity: ActivityItem[]
     subscriptionFeatures?: Feature[],
     binCheckerAPIKey?: string
}

export default function ProfileTabs({
     userData,
     editMode,
     setEditMode,
     subscriptionData,
     paymentMethods,
     allClientBillingInformation,
     notificationSettings,
     setNotificationSettings,
     recentActivity,
     subscriptionFeatures,
     binCheckerAPIKey
}: ProfileTabsProps) {

     const [tabValue, setTabValue] = useState(0)

     const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
          setTabValue(newValue)
     }

     const handleNotificationToggle = (id: string) => {
          setNotificationSettings((prevSettings: any[]) =>
               prevSettings.map((setting) => (setting.id === id ? { ...setting, enabled: !setting.enabled } : setting)),
          )
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
                         <Tab label="Billing" icon={<CreditCardIcon />} iconPosition="start" />
                         <Tab label="Payments" icon={<ReceiptIcon />} iconPosition="start" />
                         <Tab label="Notifications" icon={<NotificationsIcon />} iconPosition="start" />
                         <Tab label="Security" icon={<SecurityIcon />} iconPosition="start" />
                    </Tabs>

                    <Box sx={{ px: 3 }}>
                         {/* Account Tab */}
                         <TabPanel value={tabValue} index={0}>
                              <AccountTab userData={userData} editMode={editMode} setEditMode={setEditMode} />
                         </TabPanel>

                         {/* Billing Tab */}
                         <TabPanel value={tabValue} index={1}>
                              <BillingTab
                                   userData={userData}
                                   allClientBillingInformation={allClientBillingInformation}
                                   binCheckerAPIKey={binCheckerAPIKey}
                              />
                         </TabPanel>

                         {/* Payments Tab */}
                         <TabPanel value={tabValue} index={2}>
                              <PaymentsTab allClientBillingInformation={allClientBillingInformation} />
                         </TabPanel>

                         {/* Notifications Tab */}
                         <TabPanel value={tabValue} index={3}>
                              <NotificationsTab
                                   notificationSettings={notificationSettings}
                                   handleNotificationToggle={handleNotificationToggle}
                              />
                         </TabPanel>

                         {/* Security Tab */}
                         <TabPanel value={tabValue} index={4}>
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

