"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
     Box,
     Container,
     Typography,
     Paper,
     Button,
     Divider,
     List,
     ListItem,
     ListItemIcon,
     ListItemText,
     Alert,
     CircularProgress,
     Chip,
} from "@mui/material"
import CheckCircleIcon from "@mui/icons-material/CheckCircle"
import InfoIcon from "@mui/icons-material/Info"
import CalendarTodayIcon from "@mui/icons-material/CalendarToday"
import CreditCardIcon from "@mui/icons-material/CreditCard"
import toast, { Toaster } from "react-hot-toast"
import { updateAccountAction } from "@/app/profile/account-action"
import { SubscriptionPlan } from "@/app/types/subscription-plan"
import { Client } from "@/app/types/client"

interface FreeTrialConfirmationProps {
     subscriptionPlan: SubscriptionPlan
     userEmail?: string
     client?: Client
}

export default function FreeTrialConfirmation({ subscriptionPlan, userEmail, client }: FreeTrialConfirmationProps) {

     const router = useRouter()
     const [isLoading, setIsLoading] = useState(false)

     if (!client) {
          router.push("/auth/sign-in")
     }

     // Calculate trial end date (14 days from now)
     const trialEndDate = new Date()
     trialEndDate.setDate(trialEndDate.getDate() + 14)
     const formattedTrialEndDate = trialEndDate.toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
     })

     // Format the billing cycle
     const formattedCycle = subscriptionPlan.is_billed_yearly === true ? "annually" : "monthly"
     const hasUsedFreeTrial = client?.next_billing_date !== null
     // Calculate the first billing date (after trial)
     const firstBillingDate = new Date(trialEndDate)
     const formattedBillingDate = firstBillingDate.toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
     })

     const handleStartFreeTrial = async () => {
          setIsLoading(true)
          try {
               const updateClientResponse = await updateAccountAction(
                    client?.id!,
                    {
                         subscription_plan: subscriptionPlan.id,
                         next_billing_date: trialEndDate,
                    },
               );

               if (!updateClientResponse.error) {
                    toast.success("Your free trial has been started successfully!")
                    router.push("/pricing/subscription-plan/success")
               } else {
                    router.push("/pricing/subscription-plan/error")
               }
          } catch (error) {
               console.error("Error starting free trial:", error)
               toast.error("There was an error starting your free trial. Please try again.")
               router.push("/pricing/subscription-plan/error")
               setIsLoading(false)
          } finally {
               setIsLoading(false)
          }
     }

     if (hasUsedFreeTrial) {
          return (
               <Container maxWidth="md" sx={{ py: 8 }}>
                    <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
                         <Alert severity="info" sx={{ mb: 4 }}>
                              <Typography variant="h6">You've already used your free trial</Typography>
                              <Typography variant="body2">
                                   Our records show that you've already used a free trial with this account. You can subscribe directly to
                                   continue using our services.
                              </Typography>
                         </Alert>

                         <Box sx={{ display: "flex", justifyContent: "space-between", mt: 4 }}>
                              <Button variant="outlined" onClick={() => router.push("/pricing")}>
                                   Back to Pricing
                              </Button>
                              <Button
                                   variant="contained"
                                   onClick={() => router.push(`/pricing/subscribe?plan_id=${subscriptionPlan.id}`)}
                              >
                                   Subscribe Now
                              </Button>
                         </Box>
                    </Paper>
               </Container>
          )
     }

     return (
          <Container maxWidth="md" sx={{ py: 8 }}>
               <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
                    <Box sx={{ textAlign: "center", mb: 4 }}>
                         <Typography variant="h4" gutterBottom>
                              Start Your Free Trial
                         </Typography>
                         <Typography variant="body1" color="text.secondary">
                              You're about to start a 14-day free trial of our {subscriptionPlan.name} subscriptionPlan. No payment required during the trial period.
                         </Typography>
                    </Box>

                    <Divider sx={{ my: 3 }} />

                    <Box sx={{ mb: 4 }}>
                         <Typography variant="h5" gutterBottom>
                              Plan Details
                         </Typography>

                         <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                              <Typography variant="h6" sx={{ mr: 2 }}>
                                   {subscriptionPlan.name} Plan
                              </Typography>
                              <Chip label="14-day free trial" color="primary" size="small" />
                         </Box>

                         <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, gap: 4, mb: 3 }}>
                              <Box>
                                   <Typography variant="subtitle2" color="text.secondary">
                                        Price after trial
                                   </Typography>
                                   <Typography variant="h6">
                                        ${subscriptionPlan.base_price_per_month.toFixed(2)}/{formattedCycle}
                                   </Typography>
                              </Box>

                              <Box>
                                   <Typography variant="subtitle2" color="text.secondary">
                                        Billing cycle
                                   </Typography>
                                   <Typography variant="h6">{formattedCycle}</Typography>
                              </Box>
                         </Box>

                         <List>
                              <ListItem>
                                   <ListItemIcon>
                                        <CalendarTodayIcon color="primary" />
                                   </ListItemIcon>
                                   <ListItemText
                                        primary="Trial End Date"
                                        secondary={`Your free trial will end on ${formattedTrialEndDate}`}
                                   />
                              </ListItem>
                              <ListItem>
                                   <ListItemIcon>
                                        <CreditCardIcon color="primary" />
                                   </ListItemIcon>
                                   <ListItemText
                                        primary="First Billing Date"
                                        secondary={`You will be billed on ${formattedBillingDate} unless you cancel before the trial ends`}
                                   />
                              </ListItem>
                         </List>
                    </Box>

                    <Alert severity="info" sx={{ mb: 4 }}>
                         <Box sx={{ display: "flex", alignItems: "flex-start" }}>
                              <InfoIcon sx={{ mr: 1, mt: 0.5 }} />
                              <Box>
                                   <Typography variant="subtitle2">No payment required now</Typography>
                                   <Typography variant="body2">
                                        You won't be charged during the free trial period. You can cancel anytime before the trial ends to avoid
                                        any charges.
                                   </Typography>
                              </Box>
                         </Box>
                    </Alert>

                    <Box sx={{ display: "flex", justifyContent: "space-between", mt: 4 }}>
                         <Button variant="outlined" onClick={() => router.push("/pricing")}>
                              Back to Pricing
                         </Button>
                         <Button
                              variant="contained"
                              onClick={handleStartFreeTrial}
                              disabled={isLoading}
                              startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <CheckCircleIcon />}
                         >
                              {isLoading ? "Processing..." : "Confirm Free Trial"}
                         </Button>
                    </Box>
               </Paper>
          </Container>
     )
}

