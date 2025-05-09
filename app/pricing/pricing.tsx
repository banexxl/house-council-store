"use client"

import React, { useState } from "react"
import {
     Box,
     Button,
     Card,
     CardActions,
     CardContent,
     Container,
     Paper,
     Tab,
     Tabs,
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
import { ClientSubscription, SubscriptionPlan } from "../types/subscription-plan"
import { Feature } from "../types/feature"
import { useRouter } from "next/navigation"
import Animate from "@/app/components/animation-framer-motion"

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
     clientSubscriptionPlanData?: ClientSubscription & { subscription_plan: SubscriptionPlan } | null
}

export const PricingPage: React.FC<PricingPageProps> = ({ subscriptionPlans, clientSubscriptionPlanData }) => {

     const router = useRouter()
     const [billingCycle, setBillingCycle] = useState<"monthly" | "annually">("monthly")
     const [loading, setLoading] = useState(false)
     const [loadingIndex, setLoadingIndex] = useState<number | null>(null);
     const theme = useTheme()

     const handleBillingCycleChange = (event: React.SyntheticEvent, newValue: "monthly" | "annually") => {
          setBillingCycle(newValue)
     }

     const handleStartFreeTrial = (plan: SubscriptionPlan, index: number) => {

          if (clientSubscriptionPlanData && clientSubscriptionPlanData.status === "trialing") {
               toast.error("You are currently in a free trial. Please wait for it to finish before starting a new one.")
               return
          }

          setLoadingIndex(index);
          router.push(`/pricing/subscription-plan-purchase?plan_id=${plan.id}&billing_cycle=${billingCycle}`, {
               scroll: false,
          })

          setTimeout(() => {
               setLoading(false)
               setLoadingIndex(null)
          }, 3000)
     }

     // Determine if ANY plan supports annual billing
     const hasAnnualPlans = subscriptionPlans.some((plan) => plan.is_billed_annually);


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
                              </Box>

                              {hasAnnualPlans && (
                                   <Box sx={{ display: "flex", justifyContent: "center", mb: 6 }}>
                                        <Tabs value={billingCycle} onChange={handleBillingCycleChange}>
                                             <Tab label="Monthly" value="monthly" />
                                             <Tab label="Annually (Save 10%)" value="annually" />
                                        </Tabs>
                                   </Box>
                              )}

                              <Grid container spacing={4} justifyContent="center">
                                   {subscriptionPlans.map((plan, index) => {
                                        const isAnnual = billingCycle === "annually";
                                        const isBilledYearly = plan.is_billed_annually;
                                        const hasAnnualDiscount = isBilledYearly && plan.annual_discount_percentage > 0;
                                        const hasGeneralDiscount = plan.discount_percentage > 0;

                                        // Step 1: Reconstruct original annual price (e.g., 540 / 0.9 = 600)
                                        const originalAnnualPrice = hasAnnualDiscount
                                             ? plan.total_price / (1 - plan.annual_discount_percentage / 100)
                                             : plan.total_price;

                                        // Step 2: Decide what price to show based on billing cycle and plan config
                                        let priceToDisplay: number;

                                        if (isAnnual && isBilledYearly) {
                                             priceToDisplay = plan.total_price; // already discounted
                                        } else if (!isAnnual && isBilledYearly) {
                                             priceToDisplay = Math.round(originalAnnualPrice / 12); // monthly preview of annual
                                        } else if (!isAnnual && !isBilledYearly) {
                                             priceToDisplay = plan.total_price; // monthly plan
                                        } else if (isAnnual && !isBilledYearly) {
                                             priceToDisplay = plan.total_price * 12; // annual total for monthly-only plan
                                        } else {
                                             priceToDisplay = plan.total_price; // fallback
                                        }

                                        // Step 3: Apply general discount if NOT already discounted annual total
                                        const shouldApplyGeneralDiscount = hasGeneralDiscount && !(isAnnual && isBilledYearly);
                                        const finalPrice = shouldApplyGeneralDiscount
                                             ? Math.round(priceToDisplay * (1 - plan.discount_percentage / 100))
                                             : Math.round(priceToDisplay);

                                        return (
                                             <Grid key={plan.id} size={{ xs: 12, sm: 6, md: 4 }}>
                                                  <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
                                                       <CardContent sx={{ flexGrow: 1 }}>
                                                            <Typography variant="h5" gutterBottom>
                                                                 {plan.name}
                                                            </Typography>
                                                            <Typography variant="body2" color="text.secondary" gutterBottom>
                                                                 {plan.description}
                                                            </Typography>

                                                            <Box sx={{ my: 3 }}>
                                                                 {/* Main discounted or base price */}
                                                                 <Typography variant="h3" display="block">
                                                                      ${finalPrice}
                                                                      <Typography
                                                                           component="span"
                                                                           variant="body2"
                                                                           color="text.secondary"
                                                                           sx={{ ml: 1 }}
                                                                      >
                                                                           {isAnnual ? "/year" : "/month"}
                                                                      </Typography>
                                                                 </Typography>

                                                                 {/* Strikethrough original price for annual plans */}
                                                                 {isAnnual && isBilledYearly && hasAnnualDiscount && (
                                                                      <Typography
                                                                           variant="body2"
                                                                           color="text.secondary"
                                                                           display="block"
                                                                           sx={{ textDecoration: "line-through", mt: 0.5 }}
                                                                      >
                                                                           ${Math.round(originalAnnualPrice)} /year
                                                                      </Typography>
                                                                 )}

                                                                 {/* Monthly equivalent display for yearly plans */}
                                                                 {isBilledYearly && isAnnual && (
                                                                      <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
                                                                           Equivalent to ${Math.round(originalAnnualPrice / 12)} / month before discount
                                                                      </Typography>
                                                                 )}

                                                                 {/* Label for monthly-only plans */}
                                                                 {!isBilledYearly && (
                                                                      <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
                                                                           Billed monthly only
                                                                      </Typography>
                                                                 )}

                                                                 {/* Discount tags */}
                                                                 {hasAnnualDiscount && isAnnual && (
                                                                      <Typography variant="caption" color={theme.palette.primary.main} display="block" sx={{ mt: 0.5 }}>
                                                                           Annual discount: {plan.annual_discount_percentage}% off
                                                                      </Typography>
                                                                 )}

                                                                 {hasGeneralDiscount && (
                                                                      <Typography variant="caption" color={theme.palette.primary.main} display="block" sx={{ mt: 0.5 }}>
                                                                           Extra discount: {plan.discount_percentage}% off applied
                                                                      </Typography>
                                                                 )}
                                                            </Box>

                                                            <List dense>
                                                                 {plan.features?.map((feature: Feature) => (
                                                                      <ListItem key={feature.id} disablePadding sx={{ py: 0.5 }}>
                                                                           <ListItemIcon sx={{ minWidth: 32 }}>
                                                                                <CheckIcon color="primary" fontSize="small" />
                                                                           </ListItemIcon>
                                                                           <ListItemText primary={feature.name} />
                                                                      </ListItem>
                                                                 ))}
                                                            </List>
                                                       </CardContent>

                                                       <CardActions sx={{ p: 2, pt: 0 }}>
                                                            <Button
                                                                 variant="contained"
                                                                 fullWidth
                                                                 onClick={() => handleStartFreeTrial(plan, index)}
                                                                 disabled={loadingIndex !== null && loadingIndex !== index}
                                                                 loading={loadingIndex === index}
                                                            >
                                                                 Start Free Trial
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
                                   <Button variant="contained" size="large" onClick={() => router.push("/contact")}>
                                        Contact Sales
                                   </Button>
                              </Paper>
                         </Container>
                    </Box>
               </Animate >
               <Toaster />
          </Box >
     )
}
