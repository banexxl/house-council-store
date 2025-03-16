"use client"

import { Box, Button, Card, CardContent, Chip, Divider, Typography } from "@mui/material"
import Grid from "@mui/material/Grid2"
import Link from "next/link"
import EditIcon from "@mui/icons-material/Edit"
import CheckCircleIcon from "@mui/icons-material/CheckCircle"
import CreditCardIcon from "@mui/icons-material/CreditCard"
import { getStatusColor } from "../profile-sidebar"

interface BillingTabProps {
     subscriptionData: any
     paymentMethods: any[]
}

export default function BillingTab({ subscriptionData, paymentMethods }: BillingTabProps) {
     return (
          <>
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
                                        <Typography variant="body2">{subscriptionData.autoRenew ? "Enabled" : "Disabled"}</Typography>
                                   </Grid>
                              </Grid>

                              <Box sx={{ mt: 3 }}>
                                   <Typography variant="subtitle2" gutterBottom>
                                        Plan Features:
                                   </Typography>

                                   <Grid container spacing={1}>
                                        {subscriptionData.features.map((feature: string, index: number) => (
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
          </>
     )
}

