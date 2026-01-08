"use client"

import React, { useMemo, useState, useTransition } from "react"
import {
     Box,
     Button,
     Card,
     CardActions,
     CardContent,
     Container,
     Paper,
     ToggleButton,
     ToggleButtonGroup,
     Typography,
     List,
     ListItem,
     ListItemIcon,
     ListItemText,
     Accordion,
     AccordionSummary,
     AccordionDetails,
     Grid,
     useTheme,
} from "@mui/material"
import CheckIcon from "@mui/icons-material/Check"
import ExpandMoreIcon from "@mui/icons-material/ExpandMore"
import toast, { Toaster } from "react-hot-toast"
import { SubscriptionPlan } from "../types/subscription-plan"
import { Feature } from "../types/feature"
import { useRouter } from "next/navigation"
import Animate from "@/app/components/animation-framer-motion"
import CircularProgress from '@mui/material/CircularProgress';
import Backdrop from '@mui/material/Backdrop';
import { Client } from "../types/client"
import { PolarSubscription } from "../types/polar-subscription-types"
import { PolarProduct, PolarProductPrice } from "../types/polar-product-types"

const faqs = [
     {
          question: "Can I switch plans later?",
          answer: "Yes, you can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle.",
     },
     {
          question: "Is there a setup fee?",
          answer: "No, there are no setup fees or hidden charges. The price you see is the price you pay.",
     },
     {
          question: "Do you offer discounts for non-profits?",
          answer: "Yes, we offer special pricing for non-profit organizations. Please contact our sales team for more information.",
     },
     {
          question: "What payment methods do you accept?",
          answer: "We accept all major credit cards, PayPal, and bank transfers for annual plans.",
     },
]

interface PricingPageProps {
     subscriptionPlans: SubscriptionPlan[]
     polarProducts?: (PolarProduct & { prices: PolarProductPrice[], benefits: any[], medias: any[] })[]
     clientSubscriptionPlanData?: PolarSubscription & { subscription_plan: SubscriptionPlan } | null
     apartmentCount?: number
     client?: Client | null
}

export const PricingPage: React.FC<PricingPageProps> = ({ subscriptionPlans, polarProducts, clientSubscriptionPlanData, apartmentCount, client }) => {
     const router = useRouter()
     const [loadingKey, setLoadingKey] = useState<string | null>(null);
     const [planBillingCycles, setPlanBillingCycles] = useState<Record<string, "monthly" | "annually">>({});
     const theme = useTheme()
     const [isPending, startTransition] = useTransition()

     const handleNavClick = (path: string) => {
          startTransition(() => {
               router.push(path);
          });
     };

     const handleStartFreeTrial = (plan: SubscriptionPlan, priceId: string) => {
          void startPolarCheckout(plan, priceId);
     };

     const handlePlanBillingCycleChange = (planKey: string, newValue: "monthly" | "annually" | null) => {
          if (!newValue) return;
          setPlanBillingCycles((prev) => ({ ...prev, [planKey]: newValue }));
     }

     const sortedPlans = useMemo(
          () =>
               [...subscriptionPlans].sort(
                    (a, b) => (a.features?.length ?? 0) - (b.features?.length ?? 0)
               ),
          [subscriptionPlans]
     );

     const startPolarCheckout = async (plan: SubscriptionPlan, priceId: string) => {

          if (!client?.id) {
               toast.error("Please sign in to start a trial.");
               router.push("/auth/sign-in");
               return;
          }

          if (clientSubscriptionPlanData && clientSubscriptionPlanData.status === "trialing") {
               toast.error("You are currently in a free trial. Please wait for it to finish before starting a new one.");
               return;
          }

          setLoadingKey(plan.id!);

          try {
               const successUrl =
                    `https://nest-link.app/pricing/subscription-plan-purchase/success?client_id=${client.id}&subscription_id=${plan.id}`;
               const returnUrl =
                    `https://nest-link.app/pricing`;

               const res = await fetch("/api/polar/", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                         clientId: client.id!,
                         subscriptionPlanId: plan.id,
                         customerEmail: client.email,
                         successUrl,
                         returnUrl,
                         productIds: [priceId], // Use the price ID directly
                    }),
               });

               const data = await res.json();

               if (!res.ok) {
                    throw new Error("Failed to create checkout session.");
               }

               if (!data?.url) {
                    throw new Error("Checkout URL missing from response.");
               }

               // ✅ Redirect to Polar Checkout
               window.location.href = data.url;
          } catch (err: any) {
               console.error(err);
               toast.error(err?.message || "Could not start checkout. Please try again.");
               setLoadingKey(null);
          }
     };


     return (
          <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh", mt: 5 }}>
               <Animate>
                    <Box component="main" sx={{ flexGrow: 1, py: { xs: 6, md: 10 } }}>
                         <Container maxWidth="lg">
                              <Box sx={{ textAlign: "center", mb: 6 }}>
                                   <Typography variant="h2" gutterBottom>
                                        Simple, Transparent Pricing
                                   </Typography>
                                   <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 700, mx: "auto" }}>
                                        Choose the plan that's right for your community. All plans include a 30-day free trial.
                                   </Typography>
                                   <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 700, mx: "auto", mt: 1 }}>
                                        Pricing is billed per apartment. {apartmentCount !== undefined ? `You currently have ${apartmentCount} apartment${apartmentCount === 1 ? "" : "s"} on your account.` : "Sign in to see your apartment count."}
                                   </Typography>
                              </Box>

                              <Grid container spacing={4} justifyContent="center">
                                   {sortedPlans.map((plan, index) => {
                                        const planKey = plan.id ?? `plan-${index}`;
                                        const supportsAnnualBilling = plan.is_billed_annually;
                                        const hasAnnualDiscount = supportsAnnualBilling && plan.annual_discount_percentage > 0;
                                        const hasGeneralDiscount = plan.discount_percentage > 0;
                                        const selectedCycle = planBillingCycles[planKey] ?? "monthly";
                                        const billingCycle = supportsAnnualBilling ? selectedCycle : "monthly";
                                        const isAnnual = billingCycle === "annually";
                                        const key = `${plan.id}-${billingCycle}`;
                                        const isThisLoading = loadingKey === key;
                                        const isAnyLoading = loadingKey !== null;

                                        // Find matching Polar product and get price ID (camelCase columns)
                                        const polarProductId = isAnnual ? plan.polar_product_id_annually : plan.polar_product_id_monthly;
                                        const matchingProduct = polarProducts?.find(p => p.id === polarProductId);
                                        const matchingPrice = matchingProduct?.prices?.find(p =>
                                             p.recurringInterval === (isAnnual ? 'year' : 'month') && !p.isArchived
                                        );
                                        const priceId = matchingPrice?.id || polarProductId; // Fallback to product ID if price not found

                                        const monthlyBasePrice = plan.monthly_total_price_per_apartment;
                                        const monthlyPrice = hasGeneralDiscount
                                             ? (monthlyBasePrice * (1 - plan.discount_percentage / 100))
                                             : monthlyBasePrice;

                                        const annualPrice = supportsAnnualBilling
                                             ? plan.total_price_per_apartment_with_discounts
                                             : null;

                                        const originalAnnualPrice = isAnnual && hasAnnualDiscount && annualPrice
                                             ? ((annualPrice * 100) / (100 - plan.annual_discount_percentage))
                                             : null;

                                        const displayedPrice = isAnnual && supportsAnnualBilling ? (annualPrice ?? 0) : monthlyPrice;
                                        const priceSuffix = isAnnual && supportsAnnualBilling ? "per apartment/year" : "per apartment/month";
                                        const buttonLabel = isAnnual && supportsAnnualBilling
                                             ? `Start ${hasAnnualDiscount ? ` (Save ${plan.annual_discount_percentage}%)` : ""} Trial`
                                             : "Start Trial";
                                        const previousPlan = index > 0 ? sortedPlans[index - 1] : null;
                                        const previousFeatures = previousPlan?.features ?? [];
                                        const featuresToDisplay =
                                             index === 0
                                                  ? (plan.features ?? [])
                                                  : (plan.features ?? []).filter((feature) => {
                                                       const matchesById = previousFeatures.some((prev) => prev.id && prev.id === feature.id);
                                                       const matchesByName = previousFeatures.some(
                                                            (prev) => !prev.id && prev.name === feature.name
                                                       );
                                                       return !(matchesById || matchesByName);
                                                  });

                                        return (
                                             <Grid key={plan.id ?? planKey} size={{ xs: 12, sm: 6, md: 4 }}>
                                                  <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
                                                       <CardContent sx={{ flexGrow: 1 }}>
                                                            <Typography variant="h5" gutterBottom>
                                                                 {plan.name}
                                                            </Typography>
                                                            <Typography
                                                                 variant="body2"
                                                                 color="text.secondary"
                                                                 gutterBottom
                                                                 sx={{
                                                                      minHeight: 140,
                                                                      maxHeight: 160,
                                                                      overflowY: "auto",
                                                                 }}
                                                            >
                                                                 {plan.description}
                                                            </Typography>

                                                            <Box sx={{ my: 3, display: "flex", flexDirection: "column", gap: 2 }}>
                                                                 {supportsAnnualBilling && (
                                                                      <ToggleButtonGroup
                                                                           size="small"
                                                                           exclusive
                                                                           value={billingCycle}
                                                                           onChange={(_, value) => handlePlanBillingCycleChange(planKey, value)}
                                                                      >
                                                                           <ToggleButton value="monthly">Monthly</ToggleButton>
                                                                           <ToggleButton value="annually">Annually</ToggleButton>
                                                                      </ToggleButtonGroup>
                                                                 )}

                                                                 <Paper variant="outlined" sx={{ p: 2 }}>
                                                                      <Typography variant="subtitle2" color="text.secondary">
                                                                           {isAnnual && supportsAnnualBilling ? "Annual billing" : "Monthly billing"}
                                                                      </Typography>
                                                                      <Typography variant="h4" display="block">
                                                                           ${displayedPrice}
                                                                           <Typography component="span" variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                                                                                {priceSuffix}
                                                                           </Typography>
                                                                      </Typography>
                                                                      {originalAnnualPrice && (
                                                                           <Typography
                                                                                variant="body2"
                                                                                color="text.secondary"
                                                                                display="block"
                                                                                sx={{ textDecoration: "line-through", mt: 0.5 }}
                                                                           >
                                                                                ${originalAnnualPrice.toFixed(2)} /year before discount
                                                                           </Typography>
                                                                      )}
                                                                      {isAnnual && supportsAnnualBilling && (
                                                                           <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
                                                                                Equivalent to ${((displayedPrice ?? 0) / 12).toFixed(2)} / month
                                                                           </Typography>
                                                                      )}
                                                                      {isAnnual && supportsAnnualBilling && hasAnnualDiscount && (
                                                                           <Typography variant="caption" color={theme.palette.primary.main} display="block" sx={{ mt: 0.5 }}>
                                                                                Annual discount: {plan.annual_discount_percentage}% off
                                                                           </Typography>
                                                                      )}
                                                                      {!isAnnual && hasGeneralDiscount && (
                                                                           <Typography variant="caption" color={theme.palette.primary.main} display="block" sx={{ mt: 0.5 }}>
                                                                                Includes {plan.discount_percentage}% discount
                                                                           </Typography>
                                                                      )}
                                                                      {!supportsAnnualBilling && (
                                                                           <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
                                                                                Billed monthly
                                                                           </Typography>
                                                                      )}
                                                                 </Paper>
                                                            </Box>

                                                            {index > 0 && (
                                                                 <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: "block" }}>
                                                                      All of the {previousPlan?.name ?? "previous"} features plus:
                                                                 </Typography>
                                                            )}

                                                            <List dense>
                                                                 {featuresToDisplay.map((feature: Feature) => (
                                                                      <ListItem key={feature.id ?? feature.name} disablePadding sx={{ py: 0.5 }}>
                                                                           <ListItemIcon sx={{ minWidth: 32 }}>
                                                                                <CheckIcon color="primary" fontSize="small" />
                                                                           </ListItemIcon>
                                                                           <ListItemText primary={feature.name} />
                                                                      </ListItem>
                                                                 ))}
                                                                 {featuresToDisplay.length === 0 && (
                                                                      <ListItem disablePadding sx={{ py: 0.5 }}>
                                                                           <ListItemText primary="No additional features" />
                                                                      </ListItem>
                                                                 )}
                                                            </List>
                                                       </CardContent>

                                                       <CardActions sx={{ p: 2, pt: 0, display: "flex", flexDirection: "column", gap: 1 }}>
                                                            <Button
                                                                 variant="contained"
                                                                 fullWidth
                                                                 onClick={() => handleStartFreeTrial(plan, priceId)}
                                                                 disabled={
                                                                      isAnyLoading ||
                                                                      !isThisLoading &&
                                                                      (
                                                                           clientSubscriptionPlanData?.subscription_id == plan.id &&
                                                                           clientSubscriptionPlanData?.status === 'active' ||
                                                                           clientSubscriptionPlanData?.status === 'trialing'
                                                                      )
                                                                 }
                                                                 startIcon={isThisLoading ? <CircularProgress size={20} color="inherit" /> : undefined}
                                                            >
                                                                 {isThisLoading ? "Redirecting..." : buttonLabel}
                                                            </Button>
                                                       </CardActions>
                                                  </Card>
                                             </Grid>
                                        );
                                   })}


                              </Grid>


                              <Box sx={{ mt: 10, mb: 6, textAlign: "center" }}>
                                   <Typography variant="h4" gutterBottom>
                                        Frequently Asked Questions
                                   </Typography>

                                   <Box sx={{ mt: 4, maxWidth: 800, mx: "auto" }}>
                                        {faqs.map((faq, index) => (
                                             <Accordion key={index} sx={{ mb: 1 }}>
                                                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                                       <Typography variant="subtitle1">{faq.question}</Typography>
                                                  </AccordionSummary>
                                                  <AccordionDetails>
                                                       <Typography variant="body2" color="text.secondary">
                                                            {faq.answer}
                                                       </Typography>
                                                  </AccordionDetails>
                                             </Accordion>
                                        ))}
                                   </Box>
                              </Box>

                              <Paper
                                   sx={{
                                        mt: 8,
                                        p: 4,
                                        textAlign: "center",
                                        bgcolor: "secondary.main",
                                        maxWidth: 800,
                                        mx: "auto",
                                        justifyContent: 'space-between'
                                   }}
                              >
                                   <Typography variant="h4" gutterBottom sx={{ color: theme.palette.primary.main }}>
                                        Need a custom solution?
                                   </Typography>
                                   <Typography variant="body1" color="text.secondary" sx={{ color: theme.palette.primary.main, mb: 2 }}>
                                        Contact our sales team for custom pricing and features tailored to your specific needs.
                                   </Typography>
                                   <Button variant="contained" size="large" onClick={() => handleNavClick("/contact")}>
                                        Contact Sales
                                   </Button>
                              </Paper>
                         </Container>
                    </Box>
               </Animate >
               <Toaster />
               <Backdrop
                    sx={{
                         color: '#fff',
                         zIndex: (theme) => theme.zIndex.drawer + 1,
                    }}
                    open={isPending}
               >
                    <CircularProgress sx={{ color: theme.palette.primary.main }} />
               </Backdrop>
          </Box >
     )
}
