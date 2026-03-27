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
     Link,
     useTheme,
     Tooltip,
     Pagination
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
import { initPolarSubscriptionRealtime, type InitListenerOptions } from "@/app/lib/sb-realtime"
import { PolarSubscription } from "@/app/types/polar-subscription-types"
import { PolarProduct } from "@/app/types/polar-product-types"
import { PolarOrder } from "@/app/types/polar-order-types"
import log from "@/app/lib/logger"
import { PolarActiveMeter } from "@/app/types/polar-customer-types"

interface SubscriptionTabProps {
     customerSubscriptionObject: PolarSubscription
     apartmentsCount: number
     productData: PolarProduct | null
     payments?: PolarOrder[] | null
}

const isClientSubscriptionRecord = (record: unknown): record is PolarSubscription => {
     if (!record || typeof record !== "object") return false
     return "id" in record && "status" in record
}

export default function SubscriptionTab({ customerSubscriptionObject, apartmentsCount, productData, payments }: SubscriptionTabProps) {
     const [subscriptionData, setSubscriptionData] = useState<PolarSubscription | null>(customerSubscriptionObject)
     const [currentPage, setCurrentPage] = useState(1)
     const itemsPerPage = 5
     const activeMeters: PolarActiveMeter[] = subscriptionData?.meters ?? []
     const theme = useTheme()
     const router = useRouter()
     const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
     const [confirmCancelDialogOpen, setConfirmCancelDialogOpen] = useState(false)
     const [upgradeDialogOpen, setUpgradeDialogOpen] = useState(false)
     const [descriptionDialogOpen, setDescriptionDialogOpen] = useState(false)
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

     useEffect(() => {
          setSubscriptionData(customerSubscriptionObject)
     }, [customerSubscriptionObject])

     useEffect(() => {
          const subscriptionId = customerSubscriptionObject?.id;
          if (!subscriptionId) return;

          let isMounted = true;
          let stop: (() => Promise<void>) | null = null;

          let refreshTimer: ReturnType<typeof setTimeout> | null = null;
          const scheduleRefresh = () => {
               if (refreshTimer) clearTimeout(refreshTimer);
               refreshTimer = setTimeout(() => {
                    router.refresh();
               }, 250);
          };

          const handleRealtimeUpdate: InitListenerOptions<PolarSubscription>["onEvent"] = (payload) => {
               if (!isMounted) return;

               log(`[SubscriptionTab] 🔔 Received realtime event: ${payload.eventType}`);

               if (payload.eventType === "DELETE") {
                    setSubscriptionData(null);
                    scheduleRefresh();
                    return;
               }

               const maybeRecord = payload.new;
               if (!isClientSubscriptionRecord(maybeRecord)) {
                    return;
               }

               setSubscriptionData((prev) => ({
                    ...(prev ?? ({} as any)),
                    ...maybeRecord,
               }));

               scheduleRefresh();
          };

          log("[SubscriptionTab] Starting realtime subscription...");

          initPolarSubscriptionRealtime<PolarSubscription>(subscriptionId, handleRealtimeUpdate)
               .then((cleanup) => {
                    if (!isMounted) {
                         void cleanup();
                         return;
                    }
                    stop = cleanup;
                    log("[SubscriptionTab] ✅ Realtime subscription established");
               })
               .catch((error: any) => {
                    log(`[SubscriptionTab] ❌ Failed to start realtime listener: ${error?.message || String(error)}`, "error");
                    console.error("[SubscriptionTab] Failed to start realtime listener", error);
               });

          return () => {
               isMounted = false;
               if (refreshTimer) clearTimeout(refreshTimer);
               if (stop) void stop();
          };
     }, [customerSubscriptionObject?.id]);


     const handleDialogToggle = (type: "cancel" | "confirmCancel" | "upgrade", open: boolean) => {
          if (type === "cancel") setCancelDialogOpen(open)
          if (type === "confirmCancel") setConfirmCancelDialogOpen(open)
          if (type === "upgrade") setUpgradeDialogOpen(open)
     }

     const handleCancelSubscription = async () => {
          setIsProcessing(true)
          if (!subscriptionData?.customerId) {
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
                              polarSubscriptionId: subscriptionData.id,
                              polarCustomerId: subscriptionData.customerId,
                         }),
                    });
                    if (!res.ok) {
                         const errorData = await res.json().catch(() => ({}));
                         if (errorData?.error === "Missing subscriptionId or customerId") {
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
          const hasSubscription = Boolean(subscriptionData?.id && subscriptionData?.id)
          if (!hasSubscription) {
               toast.error("No subscription found. Please purchase a plan first.")
               return
          }

          if (!subscriptionData?.customerId) {
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
                         polarCustomerId: subscriptionData.customerId,
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

     const renderDate = (date?: string | Date) => {
          if (!date) return <i>No subscription plan selected</i>
          const dateObj = date instanceof Date ? date : new Date(date)
          return dateObj.toLocaleDateString()
     }

     const currencyFormatter = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" })
     const pricePerApartment = subscriptionData?.amount
     const billingPeriodLabel = subscriptionData?.recurringInterval === "year" ? "year" : "month"
     const hasSubscription = Boolean(subscriptionData?.id || subscriptionData?.id)

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
                                   <Chip label={productData?.name ?? "Plan"} color={getStatusColor(subscriptionData.status)} size="small" />
                              )}
                         </Box>

                         <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
                              <Box>
                                   <Typography variant="h5" color="primary.main" gutterBottom>
                                        {productData?.name ?? "No plan selected"}
                                   </Typography>
                                   {productData?.description && (
                                        <Link
                                             component="button"
                                             variant="body2"
                                             underline="always"
                                             sx={{ color: "text.secondary", p: 0, textAlign: "left" }}
                                             onClick={() => setDescriptionDialogOpen(true)}
                                             aria-haspopup="dialog"
                                             aria-controls="plan-description-dialog"
                                        >
                                             View Plan Features
                                        </Link>
                                   )}
                              </Box>
                              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", justifyContent: "flex-end" }}>
                                   <Button
                                        variant="outlined"
                                        color="primary"
                                        onClick={handleOpenCustomerPortal}
                                        disabled={isPortalLoading || isProcessing || !subscriptionData?.customerId}
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
                                                  const startDateNode = renderDate(subscriptionData?.createdAt ?? undefined)

                                                  if (!subscriptionData) return startDateNode

                                                  const nextPaymentDate =
                                                       subscriptionData && "next_payment_date" in subscriptionData
                                                            ? (subscriptionData as PolarSubscription & { next_payment_date?: string }).next_payment_date
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
                                                  <Box component="span" sx={{ color: "text.secondary", ml: 0.5 }}>N/A</Box>
                                             ) : (
                                                  <Box
                                                       component="span"
                                                       sx={{
                                                            color: subscriptionData.recurringInterval === "year"
                                                                 ? "success.main"
                                                                 : "warning.main",
                                                            fontWeight: 600,
                                                            ml: 0.5
                                                       }}
                                                  >
                                                       {productData?.recurringInterval === "year"
                                                            ? `EVERY ${productData.recurringIntervalCount ?? 1} YEAR${(productData.recurringIntervalCount ?? 1) > 1 ? 'S' : ''}`
                                                            : `EVERY ${productData?.recurringIntervalCount ?? 1} MONTH${(productData?.recurringIntervalCount ?? 1) > 1 ? 'S' : ''}`
                                                       }
                                                  </Box>
                                             )}
                                        </Typography>
                                   </Box>
                                   {productData?.trialIntervalCount && (
                                        <Alert severity="success" sx={{ mt: 1 }}>
                                             This plan includes a {productData.trialIntervalCount} {productData.trialInterval} free trial!
                                        </Alert>
                                   )}

                              </Grid>
                         </Grid>

                    </CardContent>
                    {activeMeters.length > 0 && pricePerApartment !== null && (
                         <Alert severity="info" sx={{ mt: 1 }}>
                              Billing is per active meter.
                              <br />
                              You have {activeMeters.length} active meter{activeMeters.length === 1 ? "" : "s"}:
                              <List dense sx={{ pl: 2, mb: 1 }}>
                                   {activeMeters.map((meter) => (
                                        <ListItem key={meter.id} sx={{ py: 0, minHeight: 0 }}>
                                             <ListItemText
                                                  primary={`${meter.meter.name} – ${meter.consumedUnits} apartment${meter.consumedUnits === 1 ? "" : "s"}`}
                                                  slotProps={{ primary: { variant: "body2" } }}
                                             />
                                        </ListItem>
                                   ))}
                              </List>
                              Your {billingPeriodLabel}ly charge is {' '}
                              {currencyFormatter.format(subscriptionData?.prices[0].unitAmount! / 100)} x {' '}
                              {subscriptionData?.meters[0].consumedUnits} = {' '}
                              {currencyFormatter.format((subscriptionData?.prices[0].unitAmount! / 100) * subscriptionData?.meters[0].consumedUnits!)}.
                         </Alert>
                    )}

               </Card>
               <Card>
                    <CardContent>
                         <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                              <Typography variant="h6">
                                   Payment History
                                   {productData?.name && (
                                        <Typography component="span" sx={{ fontWeight: 600, color: theme.palette.primary.main, ml: 1 }}>
                                             - {productData.name} Plan
                                        </Typography>
                                   )}
                              </Typography>
                         </Box>

                         <Box sx={{ mb: 2 }}>
                              {!payments || payments.length === 0 ? (
                                   <Alert severity="info">
                                        No payment history available.
                                   </Alert>
                              ) : (
                                   <>
                                        <List dense={true}>
                                             {payments
                                                  .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                                                  .map((payment) => {
                                                       const statusColor =
                                                            payment.status === "paid" ? "success" :
                                                                 payment.status === "refunded" ? "error" :
                                                                      payment.status === "partially_refunded" ? "warning" : "default";

                                                       return (
                                                            <ListItem
                                                                 key={payment.id}
                                                                 sx={{
                                                                      border: 1,
                                                                      borderColor: "divider",
                                                                      borderRadius: 1,
                                                                      mb: 1,
                                                                      backgroundColor: "background.paper"
                                                                 }}
                                                            >
                                                                 <ListItemIcon>
                                                                      <ReceiptIcon fontSize="small" color={statusColor as any} />
                                                                 </ListItemIcon>
                                                                 <ListItemText
                                                                      primary={
                                                                           <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                                                                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                                                     {currencyFormatter.format(payment.totalAmount / 100)}
                                                                                </Typography>
                                                                                <Chip
                                                                                     label={payment.status.toUpperCase()}
                                                                                     size="small"
                                                                                     color={statusColor as any}
                                                                                />
                                                                           </Box>
                                                                      }
                                                                      secondary={
                                                                           <Box>
                                                                                <Typography variant="caption" color="text.secondary">
                                                                                     {new Date(payment.createdAt).toLocaleDateString("en-US", {
                                                                                          year: "numeric",
                                                                                          month: "long",
                                                                                          day: "numeric"
                                                                                     })}
                                                                                </Typography>
                                                                                {payment.invoiceNumber && (
                                                                                     <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                                                                                          Invoice: {payment.invoiceNumber}
                                                                                     </Typography>
                                                                                )}
                                                                                {payment.refundedAmount > 0 && (
                                                                                     <Typography variant="caption" color="error.main" sx={{ display: "block" }}>
                                                                                          Refunded: {currencyFormatter.format(payment.refundedAmount / 100)}
                                                                                     </Typography>
                                                                                )}
                                                                           </Box>
                                                                      }
                                                                      slotProps={{ secondary: { component: "div" } }}
                                                                 />
                                                            </ListItem>
                                                       );
                                                  })}
                                        </List>
                                        {payments.length > itemsPerPage && (
                                             <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
                                                  <Pagination
                                                       count={Math.ceil(payments.length / itemsPerPage)}
                                                       page={currentPage}
                                                       onChange={(event, page) => setCurrentPage(page)}
                                                       color="primary"
                                                       showFirstButton
                                                       showLastButton
                                                  />
                                             </Box>
                                        )}
                                   </>
                              )}
                         </Box>
                    </CardContent>
               </Card>
               {/* Cancel Confirmation Dialog */}
               <Dialog open={confirmCancelDialogOpen} onClose={() => handleDialogToggle("confirmCancel", false)}>
                    <DialogTitle>Confirm Cancellation</DialogTitle>
                    <DialogContent>
                         <DialogContentText>
                              Please confirm that you want to cancel your subscription.
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
               {/* Plan Description Dialog */}
               <Dialog
                    id="plan-description-dialog"
                    open={descriptionDialogOpen}
                    onClose={() => setDescriptionDialogOpen(false)}
                    aria-labelledby="plan-description-title"
               >
                    <DialogTitle id="plan-description-title">Plan description</DialogTitle>
                    <DialogContent dividers>
                         <Typography variant="body2" color="text.secondary" sx={{
                              mt: 1,
                              whiteSpace: 'pre-line',
                              lineHeight: 1.7,
                         }}>
                              {productData?.description ?? "No description available."}
                         </Typography>
                    </DialogContent>
                    <DialogActions>
                         <Button onClick={() => setDescriptionDialogOpen(false)} color="primary">Close</Button>
                    </DialogActions>
               </Dialog>
          </Box>
     )
}
