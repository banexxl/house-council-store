"use client"

import { useState } from "react"
import {
     Box,
     Typography,
     Button,
     Card,
     CardContent,
     Divider,
     Chip,
     Dialog,
     DialogActions,
     DialogContent,
     DialogContentText,
     DialogTitle,
     Grid,
     Alert,
     CircularProgress,
     Paper,
     List,
     ListItem,
     ListItemIcon,
     ListItemText,
     Accordion,
     AccordionSummary,
     AccordionDetails,
     Switch,
     FormControlLabel,
} from "@mui/material"
import CheckCircleIcon from "@mui/icons-material/CheckCircle"
import WarningIcon from "@mui/icons-material/Warning"
import ExpandMoreIcon from "@mui/icons-material/ExpandMore"
import CreditCardIcon from "@mui/icons-material/CreditCard"
import ReceiptIcon from "@mui/icons-material/Receipt"
import CalendarTodayIcon from "@mui/icons-material/CalendarToday"
import AutorenewIcon from "@mui/icons-material/Autorenew"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { getStatusColor } from "../profile-sidebar"
import toast from "react-hot-toast"
import { ClientSubscription, SubscriptionPlan } from "@/app/types/subscription-plan"
import { Payment } from "@/app/types/payment"
import { BaseEntity } from "@/app/types/base-entity"

// Types
export interface SubscriptionTabProps {
     clientSubscriptionObject: SubscriptionPlan & ClientSubscription | null
     payment: Payment | null
}

export default function SubscriptionTab({ clientSubscriptionObject, payment }: SubscriptionTabProps) {
     console.log('clientSubscriptionObject', clientSubscriptionObject);

     const router = useRouter()
     const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
     const [confirmCancelDialogOpen, setConfirmCancelDialogOpen] = useState(false)
     const [isProcessing, setIsProcessing] = useState(false)
     const [autoRenew, setAutoRenew] = useState(payment?.is_recurring || false)
     const [upgradeDialogOpen, setUpgradeDialogOpen] = useState(false)

     const handleCancelDialogOpen = () => {
          setCancelDialogOpen(true)
     }

     const handleCancelDialogClose = () => {
          setCancelDialogOpen(false)
     }

     const handleConfirmCancelDialogOpen = () => {
          setCancelDialogOpen(false)
          setConfirmCancelDialogOpen(true)
     }

     const handleConfirmCancelDialogClose = () => {
          setConfirmCancelDialogOpen(false)
     }

     const handleUpgradeDialogOpen = () => {
          setUpgradeDialogOpen(true)
     }

     const handleUpgradeDialogClose = () => {
          setUpgradeDialogOpen(false)
     }

     const handleCancelSubscription = async () => {
          setIsProcessing(true)
          try {
               // Simulate API call to cancel subscription
               await new Promise((resolve) => setTimeout(resolve, 1500))

               // In a real implementation, you would call a server action here
               // const result = await cancelSubscriptionAction(clientSubscriptionObject.id)

               setIsProcessing(false)
               handleConfirmCancelDialogClose()
               toast.success("Your subscription has been canceled successfully")

               // Refresh the page or update the subscription status
               router.refresh()
          } catch (error) {
               setIsProcessing(false)
               toast.error("Failed to cancel subscription. Please try again.")
          }
     }

     const handleAutoRenewToggle = async () => {
          setIsProcessing(true)
          try {
               // Simulate API call to toggle auto-renew
               await new Promise((resolve) => setTimeout(resolve, 1000))

               // In a real implementation, you would call a server action here
               // const result = await toggleAutoRenewAction(clientSubscriptionObject.id, !autoRenew)

               setAutoRenew(!autoRenew)
               setIsProcessing(false)
               toast.success(`Auto-renewal has been ${!autoRenew ? "enabled" : "disabled"}`)
          } catch (error) {
               setIsProcessing(false)
               toast.error("Failed to update auto-renewal settings. Please try again.")
          }
     }

     const handleUpgradeSubscription = async () => {
          setIsProcessing(true)
          try {
               // Simulate API call to upgrade subscription
               await new Promise((resolve) => setTimeout(resolve, 1500))

               // In a real implementation, you would redirect to the upgrade page
               setIsProcessing(false)
               handleUpgradeDialogClose()
               router.push("/pricing/subscription-plan-purchase?upgrade=true")
          } catch (error) {
               setIsProcessing(false)
               toast.error("Failed to process upgrade request. Please try again.")
          }
     }

     const isActive = clientSubscriptionObject?.name.toLowerCase() === "active"
     const isTrialing = clientSubscriptionObject?.name.toLowerCase() === "trialing"
     const isCanceled = clientSubscriptionObject?.name.toLowerCase() === "canceled"
     const isPaused = clientSubscriptionObject?.name.toLowerCase() === "paused"

     return (
          <Box>
               <Typography variant="h5" gutterBottom>
                    Subscription Management
               </Typography>

               <Typography variant="body1" color="text.secondary" >
                    Manage your subscription plan, billing cycle, and payment methods.
               </Typography>

               {/* Current Plan Card */}
               <Card elevation={2} sx={{ my: 4 }}>
                    <CardContent>

                         <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                              <Typography variant="h6">Current Plan</Typography>
                              {!clientSubscriptionObject ? (
                                   <Chip label="No Subscription" color="error" size="small" />
                              ) : (
                                   <Chip label={clientSubscriptionObject.name} color={getStatusColor(clientSubscriptionObject.name)} size="small" />
                              )}
                         </Box>

                         <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
                              <Box>
                                   <Typography variant="h5" color="primary.main" gutterBottom>
                                        {clientSubscriptionObject?.name}
                                   </Typography>
                                   {!clientSubscriptionObject ? (
                                        <Typography variant="body2" color="text.secondary">
                                             No subscription plan selected
                                        </Typography>
                                   ) : (
                                        <Typography variant="body2" color="text.secondary">
                                             {payment?.total_paid === 0 || payment?.total_paid === undefined ? "Free for the first month!" : new Intl.NumberFormat('en-US', {
                                                  style: 'currency',
                                                  currency: payment?.currency,
                                             }).format(payment?.total_paid!)} billed {clientSubscriptionObject.is_billed_yearly ? "yearly" : "monthly"}
                                        </Typography>
                                   )}
                              </Box>

                              {!isCanceled && (
                                   <Button variant="outlined" color="primary" onClick={handleUpgradeDialogOpen} disabled={isProcessing}>
                                        Upgrade Plan
                                   </Button>
                              )}

                              {
                                   isActive
                              }
                         </Box>

                         <Divider sx={{ my: 2 }} />

                         <Grid container spacing={2}>
                              <Grid size={{ sm: 6, xs: 12 }}>
                                   <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                                        <CalendarTodayIcon fontSize="small" sx={{ mr: 1, color: "text.secondary" }} />
                                        {/* <Typography variant="body2">
                                             {clientSubscriptionObject?.created_at ? (
                                                  <>{clientSubscriptionObject.created_at.toLocaleDateString()}</>
                                             ) : (
                                                  <i>No subscription plan selected</i>
                                             )}
                                        </Typography> */}
                                   </Box>

                                   <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                                        <CalendarTodayIcon fontSize="small" sx={{ mr: 1, color: "text.secondary" }} />
                                        <Typography variant="body2">
                                             {clientSubscriptionObject?.is_billed_yearly ? (
                                                  <>{clientSubscriptionObject.is_billed_yearly ? "Yearly" : "Monthly"}</>
                                             ) : (
                                                  <i>No subscription plan selected</i>
                                             )}
                                        </Typography>
                                   </Box>
                              </Grid>

                              <Grid size={{ sm: 6, xs: 12 }}>
                                   <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                                        <CreditCardIcon fontSize="small" sx={{ mr: 1, color: "text.secondary" }} />
                                        {/* <Typography variant="body2">
                                             {payment.}
                                             {clientSubscriptionObject?.payment_method ? (
                                                  <>{clientSubscriptionObject.payment_method}</>
                                             ) : (
                                                  <i>No subscription plan selected</i>
                                             )}
                                        </Typography> */}
                                   </Box>

                                   <Box sx={{ display: "flex", alignItems: "center" }}>
                                        <ReceiptIcon fontSize="small" sx={{ mr: 1, color: "text.secondary" }} />
                                        <Typography variant="body2">
                                             Billing Cycle: {clientSubscriptionObject?.is_billed_yearly ? "Yearly" : "Monthly"} {clientSubscriptionObject?.is_billed_yearly ? (
                                                  <>{clientSubscriptionObject.is_billed_yearly ? "Yearly" : "Monthly"}</>
                                             ) : (
                                                  <i>No subscription plan selected</i>
                                             )}
                                        </Typography>
                                   </Box>
                              </Grid>
                         </Grid>

                         {/* Confirm Cancel Dialog */}
                         <Dialog open={confirmCancelDialogOpen} onClose={handleConfirmCancelDialogClose}>
                              <DialogTitle>Confirm Cancellation</DialogTitle>
                              <DialogContent>
                                   <DialogContentText>
                                        Please confirm that you want to cancel your subscription. This action cannot be undone.
                                   </DialogContentText>
                              </DialogContent>
                              <DialogActions>
                                   <Button onClick={handleConfirmCancelDialogClose} color="primary" disabled={isProcessing}>
                                        Go Back
                                   </Button>
                                   <Button
                                        onClick={handleCancelSubscription}
                                        color="error"
                                        disabled={isProcessing}
                                        startIcon={isProcessing ? <CircularProgress size={20} /> : null}
                                   >
                                        {isProcessing ? "Processing..." : "Confirm Cancellation"}
                                   </Button>
                              </DialogActions>
                         </Dialog>

                         {/* Upgrade Plan Dialog */}
                         <Dialog open={upgradeDialogOpen} onClose={handleUpgradeDialogClose}>
                              <DialogTitle>Upgrade Your Plan</DialogTitle>
                              <DialogContent>
                                   <DialogContentText>
                                        You are about to upgrade your subscription plan. You will be redirected to our pricing page to select a new
                                        plan.
                                   </DialogContentText>

                                   <Alert severity="info" sx={{ mt: 2 }}>
                                        Your current plan will remain active until you select and confirm a new plan.
                                   </Alert>
                              </DialogContent>
                              <DialogActions>
                                   <Button onClick={handleUpgradeDialogClose} color="primary" disabled={isProcessing}>
                                        Cancel
                                   </Button>
                                   <Button
                                        onClick={handleUpgradeSubscription}
                                        color="primary"
                                        variant="contained"
                                        disabled={isProcessing}
                                        startIcon={isProcessing ? <CircularProgress size={20} /> : null}
                                   >
                                        {isProcessing ? "Processing..." : "Continue to Upgrade"}
                                   </Button>
                              </DialogActions>
                         </Dialog>
                    </CardContent>
               </Card>
          </Box>
     );
}
