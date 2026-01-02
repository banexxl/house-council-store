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
     Receipt as ReceiptIcon
} from "@mui/icons-material"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"
import { getStatusColor } from "../profile-sidebar"
import GradingIcon from '@mui/icons-material/Grading';
import { ClientSubscription, SubscriptionPlan } from "@/app/types/subscription-plan"
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { Feature } from "@/app/types/feature"
import Link from "next/link"
import { initClientSubscriptionRealtime, type InitListenerOptions } from "@/app/lib/sb-realtime"

interface SubscriptionTabProps {
     clientSubscriptionObject: ClientSubscription & { subscription_plan: SubscriptionPlan } | null;
     subsrciptioFeatures?: SubscriptionPlan & { features: Feature[] } | null;
     apartmentsCount: number
}

type ClientSubscriptionWithOptionalPlan = ClientSubscription & { subscription_plan?: SubscriptionPlan }

const isClientSubscriptionRecord = (record: unknown): record is ClientSubscriptionWithOptionalPlan => {
     if (!record || typeof record !== "object") return false
     return "id" in record && "status" in record
}

export default function SubscriptionTab({ clientSubscriptionObject, subsrciptioFeatures, apartmentsCount }: SubscriptionTabProps) {
     const [subscriptionData, setSubscriptionData] = useState<ClientSubscriptionWithOptionalPlan | null>(clientSubscriptionObject)

     useEffect(() => {
          setSubscriptionData(clientSubscriptionObject)
     }, [clientSubscriptionObject])

     useEffect(() => {
          const clientId = clientSubscriptionObject?.client_id
          if (!clientId) return

          let isMounted = true
          let cleanup: (() => Promise<void>) | null = null

          const handleRealtimeUpdate: InitListenerOptions<ClientSubscriptionWithOptionalPlan>["onEvent"] = (payload) => {
               const maybeRecord = payload.new
               if (!isMounted || !isClientSubscriptionRecord(maybeRecord)) return

               setSubscriptionData((prev) => {
                    if (!prev) return maybeRecord

                    return {
                         ...prev,
                         ...maybeRecord,
                         subscription_plan: maybeRecord.subscription_plan ?? prev.subscription_plan,
                    }
               })
          }

          initClientSubscriptionRealtime<ClientSubscriptionWithOptionalPlan>(clientId, handleRealtimeUpdate)
               .then((stop) => {
                    if (!isMounted) {
                         void stop()
                         return
                    }
                    cleanup = stop
               })
               .catch((error) => {
                    console.error('[SubscriptionTab] Failed to start realtime listener', error)
               })

          return () => {
               isMounted = false
               if (cleanup) {
                    void cleanup()
               }
          }
     }, [clientSubscriptionObject?.client_id])

     const theme = useTheme()
     const router = useRouter()
     const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
     const [confirmCancelDialogOpen, setConfirmCancelDialogOpen] = useState(false)
     const [upgradeDialogOpen, setUpgradeDialogOpen] = useState(false)
     const [isProcessing, setIsProcessing] = useState(false)

     const handleDialogToggle = (type: "cancel" | "confirmCancel" | "upgrade", open: boolean) => {
          if (type === "cancel") setCancelDialogOpen(open)
          if (type === "confirmCancel") setConfirmCancelDialogOpen(open)
          if (type === "upgrade") setUpgradeDialogOpen(open)
     }

     const handleCancelSubscription = async () => {
          setIsProcessing(true)
          if (!subscriptionData?.polar_subscription_id || !subscriptionData?.polar_customer_id) {
               toast.error("Missing subscription identifiers.")
               setIsProcessing(false)
               return
          }
          try {
               try {
                    const res = await fetch("/api/polar/", {
                         method: "DELETE",
                         headers: { "Content-Type": "application/json" },
                         body: JSON.stringify({
                              subscriptionId: subscriptionData.polar_subscription_id,
                              polarCustomerId: subscriptionData.polar_customer_id,
                         }),
                    });
                    if (!res.ok) {
                         toast.error("Failed to cancel subscription. Please try again.");
                         handleDialogToggle("confirmCancel", false);
                    }
                    toast.success("Subscription canceled successfully.");
                    handleDialogToggle("confirmCancel", false);
               } catch (err: any) {
                    console.error(err);
                    toast.error(err?.message || "Could not start checkout. Please try again.");
               }
          } catch {
               toast.error("Failed to cancel subscription. Please try again.")
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

     const renderDate = (date?: string) =>
          date ? new Date(date).toLocaleDateString() : <i>No subscription plan selected</i>

     const currencyFormatter = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" })
     const pricePerApartment = subscriptionData?.subscription_plan
          ? subscriptionData.renewal_period === "annually"
               ? subscriptionData.subscription_plan.total_price_per_apartment_with_discounts
               : subscriptionData.subscription_plan.monthly_total_price_per_apartment
          : null
     const totalForAllApartments = pricePerApartment !== null ? pricePerApartment * apartmentsCount : null

     const billingPeriodLabel = subscriptionData?.renewal_period === "annually" ? "year" : "month"

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
                              {!subscriptionData ? (
                                   <Chip label="No Subscription" color="error" size="small" />
                              ) : (
                                   <Chip label={subscriptionData.subscription_plan?.name ?? "Plan"} color={getStatusColor(subscriptionData.status)} size="small" />
                              )}
                         </Box>

                         <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
                              <Box>
                                   <Typography variant="h5" color="primary.main" gutterBottom>
                                        {subscriptionData?.subscription_plan?.name ?? "No plan selected"}
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
                                        <Typography variant="body2">{renderDate(subscriptionData?.created_at)}</Typography>
                                        <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                                             (Subscription Start Date)
                                        </Typography>
                                   </Box>
                                   {
                                        subscriptionData && subscriptionData.status !== "canceled" && (
                                             <Button variant="outlined" color="error" onClick={() => handleDialogToggle("confirmCancel", true)} disabled={isProcessing || !subscriptionData}>
                                                  Cancel Subscription
                                             </Button>

                                        )}
                              </Grid>

                              <Grid size={{ xs: 12, sm: 6 }}>
                                   <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                                        <GradingIcon fontSize="small" sx={{ mr: 1, color: "text.secondary" }} />
                                        <Typography variant="body2">Status: {subscriptionData?.status?.toUpperCase() ?? "N/A"}</Typography>
                                   </Box>
                                   <Box sx={{ display: "flex", alignItems: "center" }}>
                                        <ReceiptIcon fontSize="small" sx={{ mr: 1, color: "text.secondary" }} />
                                        <Typography variant="body2">Billing Cycle: {!subscriptionData ? "N/A" : subscriptionData.renewal_period == 'annually' ? "ANNUALLY" : "MONTHLY"}</Typography>
                                   </Box>
                                   {pricePerApartment !== null && (
                                        <Alert severity="info" sx={{ mt: 1 }}>
                                             Billing is per apartment. With {apartmentsCount} apartment{apartmentsCount === 1 ? "" : "s"}, your {billingPeriodLabel}ly charge is {currencyFormatter.format(pricePerApartment)} x {apartmentsCount} = {currencyFormatter.format(totalForAllApartments ?? 0)}.
                                        </Alert>
                                   )}
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
