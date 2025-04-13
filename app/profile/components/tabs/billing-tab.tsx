"use client"

import { Box, Button, Card, CardContent, Chip, Divider, Grid, Typography } from "@mui/material"
import Link from "next/link"
import EditIcon from "@mui/icons-material/Edit"
import CheckCircleIcon from "@mui/icons-material/CheckCircle"
import CreditCardIcon from "@mui/icons-material/CreditCard"
import { getStatusColor } from "../profile-sidebar"
import { useRouter } from "next/navigation"
import { SubscriptionPlan } from "@/app/types/subscription-plan"
import { BaseEntity } from "@/app/types/base-entity"

interface BillingTabProps {
     subscriptionData?: SubscriptionPlan | null
     paymentMethods: BaseEntity[]
}

export default function BillingTab({ subscriptionData, paymentMethods }: BillingTabProps) {

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
                    <Typography variant="h5" gutterBottom>
                         Subscription Details
                    </Typography>

                    {subscriptionData ? (
                         <Card variant="outlined" sx={{ mb: 3 }}>
                              <CardContent>
                                   <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                                        <Box>
                                             <Typography variant="h6" color="primary.main">
                                                  {subscriptionData.name} Plan
                                             </Typography>
                                             <Typography variant="body2" color="text.secondary">
                                                  {subscriptionData.base_price_per_month} / Monthly
                                             </Typography>
                                        </Box>
                                        <Chip label={subscriptionData.status_id} color={getStatusColor(subscriptionData.status_id)} />
                                   </Box>

                                   <Divider sx={{ my: 2 }} />

                                   <Grid container spacing={2}>
                                        <Grid size={{ xs: 12, md: 6 }}>
                                             <Typography variant="subtitle2" color="text.secondary">
                                                  Next billing date
                                             </Typography>
                                             {/* <Typography variant="body2">{subscriptionData.}</Typography> */}
                                        </Grid>

                                        <Grid size={{ xs: 12, md: 6 }}>
                                             <Typography variant="subtitle2" color="text.secondary">
                                                  Auto-renewal
                                             </Typography>
                                             {/* <Typography variant="body2">{subscriptionData.autoRenew ? "Enabled" : "Disabled"}</Typography> */}
                                        </Grid>
                                   </Grid>

                                   <Box sx={{ mt: 3 }}>
                                        <Typography variant="subtitle2" gutterBottom>
                                             Plan Features:
                                        </Typography>

                                        <Grid container spacing={1}>
                                             {/* {subscriptionData.features.map((feature: string, index: number) => (
                                                  <Grid size={{ xs: 12, md: 6 }} key={index}>
                                                       <Box sx={{ display: "flex", alignItems: "center" }}>
                                                            <CheckCircleIcon color="success" fontSize="small" sx={{ mr: 1 }} />
                                                            <Typography variant="body2">{feature}</Typography>
                                                       </Box>
                                                  </Grid>
                                             ))} */}
                                        </Grid>
                                   </Box>
                              </CardContent>
                         </Card>
                    ) : (
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

