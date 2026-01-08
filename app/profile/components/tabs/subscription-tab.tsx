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
     Receipt as ReceiptIcon,
     OpenInNew as OpenInNewIcon
} from "@mui/icons-material"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"
import { getStatusColor } from "../profile-sidebar"
import GradingIcon from '@mui/icons-material/Grading';
import { SubscriptionPlan } from "@/app/types/subscription-plan"
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { Feature } from "@/app/types/feature"
import Link from "next/link"
import { initClientSubscriptionRealtime, type InitListenerOptions } from "@/app/lib/sb-realtime"
import { PolarSubscription } from "@/app/types/polar-subscription-types"

interface SubscriptionTabProps {
     clientSubscriptionObject: PolarSubscription & { subscription_plan: SubscriptionPlan } | null;
     subsrciptioFeatures?: SubscriptionPlan & { features: Feature[] } | null;
     apartmentsCount: number
}

type ClientSubscriptionWithOptionalPlan = PolarSubscription & { subscription_plan?: SubscriptionPlan }

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
          const clientId = clientSubscriptionObject?.client_id;
          if (!clientId) return;

          let isMounted = true;
          let cleanup: (() => Promise<void>) | null = null;

          // Debounce refresh so multiple updates close together don't cause multiple refreshes
          let refreshTimer: ReturnType<typeof setTimeout> | null = null;
          const scheduleRefresh = () => {
               if (refreshTimer) clearTimeout(refreshTimer);
               refreshTimer = setTimeout(() => {
                    // This re-runs the server components above this tab and re-passes new props
                    router.refresh();
               }, 250);
          };

          const handleRealtimeUpdate: InitListenerOptions<ClientSubscriptionWithOptionalPlan>["onEvent"] = (payload) => {
               if (!isMounted) return;

               // 1) Update local subscription columns immediately (fast)
               if (payload.eventType === "DELETE") {
                    // if your DELETE means subscription row removed, clear local state
                    setSubscriptionData(null);
                    scheduleRefresh();
                    return;
               }

               const maybeRecord = payload.new;
               if (!isClientSubscriptionRecord(maybeRecord)) return;

               setSubscriptionData((prev) => ({
                    ...(prev ?? ({} as any)),
                    ...maybeRecord,
                    // keep whatever plan we already had until refresh brings the joined plan
                    subscription_plan: prev?.subscription_plan,
               }));

               // 2) Refresh to get joined `subscription_plan` and `subsrciptioFeatures` updated
               scheduleRefresh();
          };

          initClientSubscriptionRealtime<ClientSubscriptionWithOptionalPlan>(clientId, handleRealtimeUpdate)
               .then((stop) => {
                    if (!isMounted) {
                         void stop();
                         return;
                    }
                    cleanup = stop;
               })
               .catch((error) => {
                    console.error("[SubscriptionTab] Failed to start realtime listener", error);
               });

          return () => {
               isMounted = false;
               if (refreshTimer) clearTimeout(refreshTimer);
               if (cleanup) void cleanup();
          };
     }, [clientSubscriptionObject?.client_id]);


     const theme = useTheme()
     const router = useRouter()
     const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
     const [confirmCancelDialogOpen, setConfirmCancelDialogOpen] = useState(false)
     const [upgradeDialogOpen, setUpgradeDialogOpen] = useState(false)
     const [isProcessing, setIsProcessing] = useState(false)
     const [isPortalLoading, setIsPortalLoading] = useState(false)
     const statusTone = getStatusColor(subscriptionData?.status)
     const statusColorMap: Record<string, string> = {
          success: theme.palette.success.main,
          warning: theme.palette.warning.main,
          error: theme.palette.error.main,
          info: theme.palette.info.main,
          default: theme.palette.text.primary,
     }
     const statusTextColor = statusColorMap[statusTone] ?? theme.palette.text.primary
     const statusLabel = subscriptionData?.status?.toUpperCase() ?? "N/A"

     const handleDialogToggle = (type: "cancel" | "confirmCancel" | "upgrade", open: boolean) => {
          if (type === "cancel") setCancelDialogOpen(open)
          if (type === "confirmCancel") setConfirmCancelDialogOpen(open)
          if (type === "upgrade") setUpgradeDialogOpen(open)
     }

     const handleCancelSubscription = async () => {
          setIsProcessing(true)
          if (!subscriptionData?.polar_subscription_id || !subscriptionData?.customer_id) {
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
                              polarSubscriptionId: subscriptionData.polar_subscription_id,
                              polarCustomerId: subscriptionData.customer_id,
                         }),
                    });
                    if (!res.ok) {
                         const errorData = await res.json().catch(() => ({}));
                         if (errorData?.error === "Missing subscriptionId or clientId") {
                              toast.error("Missing subscription identifiers. Please contact support.");
                         } else if (errorData?.error === "Subscription is already canceled.") {
                              toast.error("This subscription is already canceled or will be canceled at the end of the current billing period.");
                         } else {
                              toast.error("Failed to cancel subscription. Please try again or contact support.");
                         }
                         handleDialogToggle("confirmCancel", false);
                    } else {
                         toast.success("Subscription canceled successfully.");
                         handleDialogToggle("confirmCancel", false);
                    }
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

     const handleOpenCustomerPortal = async () => {
          const hasSubscription = Boolean(subscriptionData?.id && subscriptionData?.subscription_id)
          if (!hasSubscription) {
               toast.error("No subscription found. Please purchase a plan first.")
               return
          }

          if (!subscriptionData?.customer_id) {
               toast.error("Missing customer identifier.")
               return
          }

          setIsPortalLoading(true)
          try {
               const returnUrl = typeof window !== "undefined"
                    ? `${window.location.origin}/profile`
                    : null

               const res = await fetch("/api/polar/customer-portal", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                         polarCustomerId: subscriptionData.customer_id,
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
          } finally {
               setIsPortalLoading(false)
          }
     }

     // const handleReactivateSubscription = async () => {
     //      setIsProcessing(true)
     //      if (!subscriptionData?.subscription_id || !subscriptionData?.customer_id) {
     //           toast.error("Missing subscription identifiers.")
     //           setIsProcessing(false)
     //           return
     //      }
     //      try {
     //           try {
     //                const res = await fetch("/api/polar/", {
     //                     method: "PUT",
     //                     headers: { "Content-Type": "application/json" },
     //                     body: JSON.stringify({
     //                          subscriptionId: subscriptionData.subscription_id,
     //                          polarCustomerId: subscriptionData.customer_id,
     //                     }),
     //                });
     //                if (!res.ok) {
     //                     toast.error("Failed to reactivate subscription. Please try again.");
     //                     handleDialogToggle("confirmCancel", false);
     //                } else {
     //                     toast.success("Subscription reactivated successfully.");
     //                     handleDialogToggle("confirmCancel", false);
     //                }
     //           } catch (err: any) {
     //                console.error(err);
     //                toast.error(err?.message || "Could not start checkout. Please try again.");
     //           }
     //      } catch {
     //           toast.error("Failed to cancel subscription. Please try again.")
     //      } finally {
     //           setIsProcessing(false)
     //      }
     // }

     const renderDate = (date?: string) =>
          date ? new Date(date).toLocaleDateString() : <i>No subscription plan selected</i>

     const currencyFormatter = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" })
     const pricePerApartment = subscriptionData?.subscription_plan
          ? subscriptionData.recurring_interval === "year"
               ? subscriptionData.subscription_plan.total_price_per_apartment_with_discounts
               : subscriptionData.subscription_plan.monthly_total_price_per_apartment
          : null
     const totalForAllApartments = pricePerApartment !== null ? pricePerApartment * apartmentsCount : null

     const billingPeriodLabel = subscriptionData?.recurring_interval === "year" ? "year" : "month"
     const hasSubscription = Boolean(subscriptionData?.id || subscriptionData?.subscription_id)

     return (
          <Box>
               <Typography variant="h5" gutterBottom>Subscription Management</Typography>
               <Typography variant="body1" color="text.secondary">
                    Manage your subscription plan, billing cycle, and payment methods.
               </Typography>
               {!hasSubscription && (
                    <Alert severity="error" sx={{ mt: 2 }}>
                         No subscription found. Purchase a plan to manage billing and access the customer portal.
                    </Alert>
               )}

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
                              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", justifyContent: "flex-end" }}>
                                   <Button
                                        variant="outlined"
                                        color="primary"
                                        onClick={handleOpenCustomerPortal}
                                        disabled={isPortalLoading || isProcessing || !subscriptionData?.customer_id}
                                        startIcon={isPortalLoading ? <CircularProgress size={18} /> : <OpenInNewIcon />}
                                   >
                                        Customer Portal
                                   </Button>
                                   <Button
                                        variant="outlined"
                                        color="primary"
                                        onClick={() => handleDialogToggle("upgrade", true)}
                                        disabled={isProcessing}
                                   >
                                        Select a Plan
                                   </Button>
                              </Box>
                         </Box>

                         <Divider sx={{ my: 2 }} />

                         <Grid container spacing={2}>
                              <Grid size={{ xs: 12, sm: 6 }}>
                                   <Typography variant="h6" sx={{ mb: 1 }}>Subscription Details:</Typography>
                                   <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                                        <CalendarTodayIcon fontSize="small" sx={{ mr: 1, color: "text.secondary" }} />
                                        <Typography variant="body2">
                                             {(() => {
                                                  const startDateNode = renderDate(subscriptionData?.created_at)

                                                  if (!subscriptionData) return startDateNode

                                                  const nextPaymentDate =
                                                       subscriptionData && "next_payment_date" in subscriptionData
                                                            ? (subscriptionData as ClientSubscriptionWithOptionalPlan & { next_payment_date?: string }).next_payment_date
                                                            : undefined

                                                  if (!nextPaymentDate) return startDateNode

                                                  const now = new Date()
                                                  const target = new Date(nextPaymentDate)
                                                  const diffInDays = (target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)

                                                  if (!Number.isFinite(diffInDays)) return startDateNode

                                                  const daysUntilNext = Math.max(0, Math.ceil(diffInDays))

                                                  const color =
                                                       daysUntilNext > 20
                                                            ? "success.main"
                                                            : daysUntilNext > 10
                                                                 ? "warning.main"
                                                                 : "error.main"

                                                  return (
                                                       <>
                                                            {startDateNode}
                                                            <Box component="span" sx={{ display: "block", color, fontWeight: 600 }}>
                                                                 Next payment in {daysUntilNext} day{daysUntilNext === 1 ? "" : "s"}
                                                            </Box>
                                                       </>
                                                  )
                                             })()}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                                             (Subscription Start Date)
                                        </Typography>
                                   </Box>
                                   {
                                        subscriptionData && subscriptionData.status !== "canceled" && (
                                             <Button variant="outlined" color="error" onClick={() => handleDialogToggle("confirmCancel", true)} disabled={isProcessing || !subscriptionData}>
                                                  Cancel Subscription
                                             </Button>

                                        )
                                   }
                                   {/* {
                                        subscriptionData && subscriptionData.status === "canceled" && (
                                             <Button variant="outlined" color="error" onClick={() => handleReactivateSubscription()} disabled={isProcessing || !subscriptionData}>
                                                  Reactivate Subscription
                                             </Button>
                                        )
                                   } */}
                              </Grid>

                              <Grid size={{ xs: 12, sm: 6 }}>
                                   <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                                        <GradingIcon fontSize="small" sx={{ mr: 1, color: "text.secondary" }} />
                                        <Typography variant="body2">
                                             Status:
                                             <Typography
                                                  component="span"
                                                  variant="body2"
                                                  sx={{ ml: 0.5, fontWeight: 600, color: statusTextColor }}
                                             >
                                                  {statusLabel}
                                             </Typography>
                                        </Typography>
                                   </Box>
                                   <Box sx={{ display: "flex", alignItems: "center" }}>
                                        <ReceiptIcon fontSize="small" sx={{ mr: 1, color: "text.secondary" }} />
                                        <Typography variant="body2">Billing Cycle:
                                             {!subscriptionData ? (
                                                  <Box component="span" sx={{ color: "text.secondary" }}>N/A</Box>
                                             ) : (
                                                  <Box
                                                       component="span"
                                                       sx={{
                                                            color: subscriptionData.recurring_interval === "year"
                                                                 ? "success.main"
                                                                 : "warning.main",
                                                            fontWeight: 600,
                                                       }}
                                                  >
                                                       {subscriptionData.recurring_interval === "year" ? "ANNUALLY" : "MONTHLY"}
                                                  </Box>
                                             )}
                                        </Typography>
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
