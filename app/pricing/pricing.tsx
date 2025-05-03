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
import { Toaster } from "react-hot-toast"
import { SubscriptionPlan } from "../types/subscription-plan"
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
}

export const PricingPage: React.FC<PricingPageProps> = ({ subscriptionPlans }) => {

     const router = useRouter()
     const [billingCycle, setBillingCycle] = useState<"monthly" | "annually">("monthly")
     const [loading, setLoading] = useState(false)
     const theme = useTheme()

     const handleBillingCycleChange = (event: React.SyntheticEvent, newValue: "monthly" | "annually") => {
          setBillingCycle(newValue)
     }

     const handleStartFreeTrial = (plan: SubscriptionPlan) => {
          setLoading(true)
          router.push(`/pricing/subscription-plan-purchase?plan_id=${plan.id}&billing_cycle=${billingCycle}`, {
               scroll: false,
          })

          setTimeout(() => {
               setLoading(false)
          }, 3000)
     }

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

                              <Box sx={{ display: "flex", justifyContent: "center", mb: 6 }}>
                                   <Tabs value={billingCycle} onChange={handleBillingCycleChange}>
                                        <Tab label="Monthly" value="monthly" />
                                        <Tab label="Annually (Save more)" value="annually" />
                                   </Tabs>
                              </Box>

                              <Grid container spacing={4} justifyContent="center">
                                   {subscriptionPlans.map((plan) => {
                                        const price =
                                             billingCycle === "monthly" || !plan.is_billed_annually
                                                  ? plan.total_price_per_month
                                                  : Math.round(plan.total_price_per_month * 12 * (1 - plan.annually_discount_percentage / 100))

                                        const isAnnual = billingCycle === "annually" && plan.is_billed_annually

                                        return (
                                             <Grid key={plan.id} size={{ xs: 12, sm: 6, md: 4 }}>
                                                  <Card
                                                       sx={{
                                                            height: "100%",
                                                            display: "flex",
                                                            flexDirection: "column",
                                                       }}
                                                  >
                                                       <CardContent sx={{ flexGrow: 1 }}>
                                                            <Typography variant="h5" gutterBottom>
                                                                 {plan.name}
                                                            </Typography>
                                                            <Typography variant="body2" color="text.secondary" gutterBottom>
                                                                 {plan.description}
                                                            </Typography>

                                                            <Box sx={{ my: 3 }}>
                                                                 <Typography variant="h3">
                                                                      ${price}
                                                                      <Typography
                                                                           component="span"
                                                                           variant="body2"
                                                                           color="text.secondary"
                                                                           sx={{ ml: 1 }}
                                                                      >
                                                                           /month
                                                                      </Typography>
                                                                 </Typography>
                                                                 {isAnnual && (
                                                                      <Typography variant="caption" color="text.secondary">
                                                                           Billed annually (${price * 12})
                                                                      </Typography>
                                                                 )}
                                                            </Box>

                                                            <List dense>
                                                                 {
                                                                      plan.features?.map((feature: Feature) => (
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
                                                            <Button variant="contained" fullWidth onClick={() => handleStartFreeTrial(plan)} loading={loading}>
                                                                 Start Free Trial
                                                            </Button>
                                                       </CardActions>
                                                  </Card>
                                             </Grid>
                                        )
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
               </Animate>
               <Toaster />
          </Box>
     )
}
