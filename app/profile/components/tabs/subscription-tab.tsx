// SubscriptionTab.tsx
"use client"

import { useEffect, useState } from "react"
import {
     Box, Typography, Button, Card, CardContent, Divider, Chip,
     Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle,
     Grid, Alert, CircularProgress,
     List,
     ListItem,
     ListItemIcon,
     ListItemText,
     useTheme,
     Tooltip
} from "@mui/material"
import {
     CalendarToday as CalendarTodayIcon,
     CreditCard as CreditCardIcon,
     Receipt as ReceiptIcon
} from "@mui/icons-material"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"
import { getStatusColor } from "../profile-sidebar"
import GradingIcon from '@mui/icons-material/Grading';
import { ClientSubscription, SubscriptionPlan, SubscriptionStatus } from "@/app/types/subscription-plan"
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { Payment } from "@/app/types/payment"
import { Feature } from "@/app/types/feature"
import Link from "next/link"

interface SubscriptionTabProps {
     clientSubscriptionObject: ClientSubscription & { subscription_plan: SubscriptionPlan } | null;
     payment: Payment | null;
     subsrciptioFeatures?: SubscriptionPlan & { features: Feature[] } | null
}

export default function SubscriptionTab({ clientSubscriptionObject, payment, subsrciptioFeatures }: SubscriptionTabProps) {

     const theme = useTheme()
     const router = useRouter()
     const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
     const [confirmCancelDialogOpen, setConfirmCancelDialogOpen] = useState(false)
     const [upgradeDialogOpen, setUpgradeDialogOpen] = useState(false)
     const [isProcessing, setIsProcessing] = useState(false)
     const [autoRenew, setAutoRenew] = useState(payment?.is_recurring || false)

     const [clientSubscriptionStatus, setClientSubscriptionStatus] = useState<SubscriptionStatus>('trialing')

     const handleDialogToggle = (type: "cancel" | "confirmCancel" | "upgrade", open: boolean) => {
          if (type === "cancel") setCancelDialogOpen(open)
          if (type === "confirmCancel") setConfirmCancelDialogOpen(open)
          if (type === "upgrade") setUpgradeDialogOpen(open)
     }

     const handleCancelSubscription = async () => {
          setIsProcessing(true)
          try {
               await new Promise((resolve) => setTimeout(resolve, 1500))
               // await cancelSubscriptionAction(clientSubscriptionObject.id)
               toast.success("Your subscription has been canceled successfully")
               handleDialogToggle("confirmCancel", false)
               router.refresh()
          } catch {
               toast.error("Failed to cancel subscription. Please try again.")
          } finally {
               setIsProcessing(false)
          }
     }

     const handleAutoRenewToggle = async () => {
          setIsProcessing(true)
          try {
               await new Promise((resolve) => setTimeout(resolve, 1000))
               // await toggleAutoRenewAction(clientSubscriptionObject.id, !autoRenew)
               setAutoRenew(!autoRenew)
               toast.success(`Auto-renewal has been ${!autoRenew ? "enabled" : "disabled"}`)
          } catch {
               toast.error("Failed to update auto-renewal settings. Please try again.")
          } finally {
               setIsProcessing(false)
          }
     }

     const handleUpgradeSubscription = async () => {
          setIsProcessing(true)
          try {
               await new Promise((resolve) => setTimeout(resolve, 1500))
               handleDialogToggle("upgrade", false)
               router.push("/pricing/")
          } catch {
               toast.error("Failed to process upgrade request. Please try again.")
          } finally {
               setIsProcessing(false)
          }
     }

     const formattedPrice = payment?.total_paid && payment.total_paid > 0
          ? new Intl.NumberFormat('en-US', { style: 'currency', currency: payment.currency }).format(payment.total_paid)
          : ""

     const renderDate = (date?: string) =>
          date ? new Date(date).toLocaleDateString() : <i>No subscription plan selected</i>

     return (
          <Box>
               <Typography variant="h5" gutterBottom>Subscription Management</Typography>
               <Typography variant="body1" color="text.secondary">
                    Manage your subscription plan, billing cycle, and payment methods.
               </Typography>

               <Card elevation={2} sx={{ my: 4 }}>
                    <CardContent>
                         <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                              <Typography variant="h6">Current Plan</Typography>
                              {!clientSubscriptionObject ? (
                                   <Chip label="No Subscription" color="error" size="small" />
                              ) : (
                                   <Chip label={clientSubscriptionObject.subscription_plan.name} color={getStatusColor(clientSubscriptionObject.status)} size="small" />
                              )}
                         </Box>

                         <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
                              <Box>
                                   <Typography variant="h5" color="primary.main" gutterBottom>
                                        {clientSubscriptionObject?.subscription_plan.name}
                                   </Typography>
                                   <Typography variant="body2" color="text.secondary">
                                        {clientSubscriptionObject?.status == 'trialing' ? (
                                             <>Trial period until: {renderDate(clientSubscriptionObject?.next_payment_date!)}</>
                                        ) : (
                                             payment ? (
                                                  <>
                                                       Last Payment: {renderDate(payment.created_at)}
                                                       {payment.total_paid > 0 && (
                                                            <> - {formattedPrice}</>
                                                       )}
                                                  </>
                                             ) : (
                                                  <i>No payment information available</i>
                                             )
                                        )}
                                   </Typography>
                              </Box>
                              <Button variant="outlined" color="primary" onClick={() => handleDialogToggle("upgrade", true)} disabled={isProcessing}>
                                   Upgrade Plan
                              </Button>
                         </Box>

                         <Divider sx={{ my: 2 }} />

                         <Grid container spacing={2}>
                              <Grid size={{ xs: 12, sm: 6 }}>
                                   <Typography variant="h6" sx={{ mb: 1 }}>Subscription Details:</Typography>
                                   <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                                        <CalendarTodayIcon fontSize="small" sx={{ mr: 1, color: "text.secondary" }} />
                                        <Typography variant="body2">{renderDate(clientSubscriptionObject?.created_at)}</Typography>
                                        <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                                             (Subscription Start Date)
                                        </Typography>
                                   </Box>
                              </Grid>

                              <Grid size={{ xs: 12, sm: 6 }}>
                                   <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                                        <GradingIcon fontSize="small" sx={{ mr: 1, color: "text.secondary" }} />
                                        <Typography variant="body2">Status: {clientSubscriptionObject?.status.toUpperCase()}</Typography>
                                   </Box>
                                   <Box sx={{ display: "flex", alignItems: "center" }}>
                                        <ReceiptIcon fontSize="small" sx={{ mr: 1, color: "text.secondary" }} />
                                        <Typography variant="body2">Billing Cycle: {clientSubscriptionObject?.renewal_period == 'annually' ? "ANNUALLY" : "MONTHLY"}</Typography>
                                   </Box>
                              </Grid>
                         </Grid>

                    </CardContent>

               </Card>
               <Card>
                    <CardContent>
                         {!subsrciptioFeatures && (
                              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                                   <Typography variant="h6">
                                        No Subscription plan selected...
                                   </Typography>
                              </Box>
                         )}
                         {subsrciptioFeatures && (
                              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                                   <Typography variant="h6">
                                        Features Included in {' '}
                                        <Typography component="span" sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
                                             {subsrciptioFeatures?.name}
                                        </Typography> Plan:
                                   </Typography>
                              </Box>
                         )}

                         <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                              <Typography variant="body1" color="text.secondary">

                                   <List dense={true}>
                                        {subsrciptioFeatures?.features.map((feature, index) => (
                                             <ListItem key={index} component={Link} href={`/docs#${feature.slug!}`} sx={{ cursor: "pointer" }}>
                                                  <ListItemIcon>
                                                       <CheckCircleIcon fontSize="small" color="success" />
                                                  </ListItemIcon>
                                                  <Tooltip title={'Learn more about ' + feature.name} placement={'right'}>
                                                       <ListItemText primary={feature.name} sx={{ color: theme.palette.primary.main }} />
                                                  </Tooltip>
                                             </ListItem>
                                        ))}
                                   </List>

                              </Typography>
                         </Box>
                    </CardContent>
               </Card>
               {/* Cancel Confirmation Dialog */}
               <Dialog open={confirmCancelDialogOpen} onClose={() => handleDialogToggle("confirmCancel", false)}>
                    <DialogTitle>Confirm Cancellation</DialogTitle>
                    <DialogContent>
                         <DialogContentText>
                              Please confirm that you want to cancel your subscription. This action cannot be undone.
                         </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                         <Button onClick={() => handleDialogToggle("confirmCancel", false)} color="primary" disabled={isProcessing}>Go Back</Button>
                         <Button onClick={handleCancelSubscription} color="error" disabled={isProcessing} startIcon={isProcessing ? <CircularProgress size={20} /> : null}>
                              {isProcessing ? "Processing..." : "Confirm Cancellation"}
                         </Button>
                    </DialogActions>
               </Dialog>

               {/* Upgrade Plan Dialog */}
               <Dialog open={upgradeDialogOpen} onClose={() => handleDialogToggle("upgrade", false)}>
                    <DialogTitle>Upgrade Your Plan</DialogTitle>
                    <DialogContent>
                         <DialogContentText>
                              You are about to upgrade your subscription plan. You will be redirected to our pricing page to select a new plan.
                         </DialogContentText>
                         <Alert severity="info" sx={{ mt: 2 }}>
                              Your current plan will remain active until you select and confirm a new plan.
                         </Alert>
                    </DialogContent>
                    <DialogActions>
                         <Button onClick={() => handleDialogToggle("upgrade", false)} color="primary" disabled={isProcessing}>Cancel</Button>
                         <Button onClick={handleUpgradeSubscription} color="primary" variant="contained" disabled={isProcessing} startIcon={isProcessing ? <CircularProgress size={20} /> : null}>
                              {isProcessing ? "Processing..." : "Continue to Upgrade"}
                         </Button>
                    </DialogActions>
               </Dialog>
          </Box>
     )
}
