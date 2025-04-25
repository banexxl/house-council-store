"use client"

import { Box, Button, Card, CardContent, CardHeader, Chip, Divider, Grid, List, ListItem, ListItemIcon, ListItemText, Typography } from "@mui/material"
import Link from "next/link"
import EditIcon from "@mui/icons-material/Edit"
import CheckCircleIcon from "@mui/icons-material/CheckCircle"
import CreditCardIcon from "@mui/icons-material/CreditCard"
import { getStatusColor } from "../profile-sidebar"
import { useRouter } from "next/navigation"
import { SubscriptionPlan } from "@/app/types/subscription-plan"
import { BaseEntity } from "@/app/types/base-entity"
import { Client } from "@/app/types/client"
import { User } from "@supabase/supabase-js"
import { Feature } from "@/app/types/feature"

interface BillingTabProps {
     subscriptionData?: SubscriptionPlan | null
     paymentMethods: BaseEntity[]
     userData: { client: Client; session: User; }
     subscriptionFeatures?: Feature[]
}

export default function BillingTab({ subscriptionData, paymentMethods, userData, subscriptionFeatures }: BillingTabProps) {

     const router = useRouter();

     if (subscriptionData === null || subscriptionData === undefined) {
          return (
               <Box sx={{ mb: 4 }}>
                    <Typography variant="h5" gutterBottom>
                         Subscription Details
                    </Typography>

                    <Typography variant="body2" color="text.secondary">
                         No subscription data available.
                    </Typography>

                    <Button variant="outlined" startIcon={<EditIcon />} onClick={() => router.push("/pricing")} sx={{ mt: 2 }}>
                         Add Subscription
                    </Button>
               </Box>
          )
     }

     return (
          <>
               <Box sx={{ mb: 4 }}>
                    {subscriptionData ? (
                         <Card elevation={2} sx={{ my: 3 }}>
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
                              </CardContent>
                         </Card>
                    ) : (
                         <Card elevation={2} sx={{ my: 3 }}>
                              <CardHeader title="Subscription" sx={{ variant: "h6" }} />
                              <CardContent>
                                   <Typography variant="body2" color="text.secondary">
                                        No active subscription found.
                                   </Typography>
                              </CardContent>
                         </Card>
                    )}

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

                    {paymentMethods?.length ? (
                         paymentMethods.map((method) => (
                              <Card
                                   key={method.id}
                                   variant="outlined"
                                   sx={{
                                        mb: 2,
                                        borderColor: method.name ? "primary.main" : "divider",
                                        position: "relative",
                                   }}
                              >
                                   {method.name && (
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
                                                       {/* {method.name} •••• {method.last4} */}
                                                  </Typography>
                                                  <Typography variant="body2" color="text.secondary">
                                                       {/* Expires {method.expiry} */}
                                                  </Typography>
                                             </Box>
                                        </Box>
                                   </CardContent>
                              </Card>
                         ))
                    ) : (
                         <Typography variant="body2" color="text.secondary">
                              No payment methods available.
                         </Typography>
                    )}

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
          </>
     )
}

