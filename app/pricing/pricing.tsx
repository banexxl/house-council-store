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
     polarProducts?: (PolarProduct & { prices: PolarProductPrice[], benefits: any[], medias: any[] })[]
     clientSubscriptionPlanData?: PolarSubscription & { subscription_plan: any } | null
     apartmentCount?: number
     client?: Client | null
}

export const PricingPage: React.FC<PricingPageProps> = ({ polarProducts, clientSubscriptionPlanData, apartmentCount, client }) => {
     const router = useRouter()
     const [loadingKey, setLoadingKey] = useState<string | null>(null);
     const theme = useTheme()
     const [isPending, startTransition] = useTransition()

     // Debug logging
     console.log('polarProducts:', polarProducts);
     console.log('mainProduct:', polarProducts?.[0]);
     console.log('prices:', polarProducts?.[0]?.prices);
     console.log('benefits:', polarProducts?.[0]?.benefits);

     const handleNavClick = (path: string) => {
          startTransition(() => {
               router.push(path);
          });
     };

     const handleStartFreeTrial = (priceId: string, productId: string) => {
          void startPolarCheckout(priceId, productId);
     };

     // Get the main product (assuming single product with multiple prices)
     const mainProduct = polarProducts?.[0];

     // Group prices by recurring interval
     const pricesByInterval = useMemo(() => {
          if (!mainProduct?.prices) return {};

          const grouped: Record<string, PolarProductPrice> = {};
          mainProduct.prices.forEach(price => {
               if (!price.isArchived) {
                    // Group by interval type only (month, year, etc)
                    grouped[price.recurringInterval] = price;
               }
          });
          return grouped;
     }, [mainProduct]);

     // Convert benefits to features
     const features = useMemo(() => {
          return mainProduct?.benefits?.map((benefit: any) => ({
               id: benefit.id,
               name: benefit.description || '',
               description: benefit.description || ''
          })) || [];
     }, [mainProduct]);

     const startPolarCheckout = async (priceId: string, productId: string) => {

          if (!client?.id) {
               toast.error("Please sign in to start a trial.");
               router.push("/auth/sign-in");
               return;
          }

          if (clientSubscriptionPlanData && clientSubscriptionPlanData.status === "trialing") {
               toast.error("You are currently in a free trial. Please wait for it to finish before starting a new one.");
               return;
          }

          setLoadingKey(priceId);

          try {
               const successUrl =
                    `https://nest-link.app/pricing/subscription-plan-purchase/success?client_id=${client.id}&subscription_id=${productId}`;
               const returnUrl =
                    `https://nest-link.app/pricing`;

               const res = await fetch("/api/polar/", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                         clientId: client.id!,
                         subscriptionPlanId: productId,
                         customerEmail: client.email,
                         successUrl,
                         returnUrl,
                         productIds: [priceId],
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
                                   {/* Monthly Plan */}
                                   {pricesByInterval['month'] && (
                                        <Grid key="monthly" size={{ xs: 12, sm: 6, md: 6 }}>
                                             <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
                                                  <CardContent sx={{ flexGrow: 1 }}>
                                                       <Typography variant="h5" gutterBottom>
                                                            Monthly
                                                       </Typography>
                                                       <Typography
                                                            variant="body2"
                                                            color="text.secondary"
                                                            gutterBottom
                                                            sx={{ minHeight: 60, maxHeight: 80, overflowY: "auto" }}
                                                       >
                                                            {mainProduct?.description}
                                                       </Typography>

                                                       <Paper variant="outlined" sx={{ p: 2, my: 3 }}>
                                                            <Typography variant="subtitle2" color="text.secondary">
                                                                 Billed monthly
                                                            </Typography>
                                                            <Typography variant="h4" display="block">
                                                                 ${(pricesByInterval['month'].priceAmount / 100).toFixed(2)}
                                                                 <Typography component="span" variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                                                                      per apartment/month
                                                                 </Typography>
                                                            </Typography>
                                                       </Paper>

                                                       <List dense>
                                                            {features.map((feature) => (
                                                                 <ListItem key={feature.id ?? feature.name} disablePadding sx={{ py: 0.5 }}>
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
                                                            onClick={() => handleStartFreeTrial(pricesByInterval['month'].id, mainProduct?.id || '')}
                                                            disabled={
                                                                 loadingKey !== null ||
                                                                 (clientSubscriptionPlanData?.product_id === mainProduct?.id &&
                                                                      (clientSubscriptionPlanData?.status === 'active' || clientSubscriptionPlanData?.status === 'trialing'))
                                                            }
                                                            startIcon={loadingKey === pricesByInterval['month'].id ? <CircularProgress size={20} color="inherit" /> : undefined}
                                                       >
                                                            {loadingKey === pricesByInterval['month'].id ? "Redirecting..." : "Start Free Trial"}
                                                       </Button>
                                                  </CardActions>
                                             </Card>
                                        </Grid>
                                   )}

                                   {/* Annual Plan */}
                                   {pricesByInterval['year'] && (
                                        <Grid key="annual" size={{ xs: 12, sm: 6, md: 6 }}>
                                             <Card sx={{ height: "100%", display: "flex", flexDirection: "column", border: `2px solid ${theme.palette.primary.main}` }}>
                                                  <CardContent sx={{ flexGrow: 1 }}>
                                                       <Typography variant="h5" gutterBottom>
                                                            Annual
                                                            <Typography component="span" variant="caption" color="primary" sx={{ ml: 1 }}>
                                                                 Best Value
                                                            </Typography>
                                                       </Typography>
                                                       <Typography
                                                            variant="body2"
                                                            color="text.secondary"
                                                            gutterBottom
                                                            sx={{ minHeight: 60, maxHeight: 80, overflowY: "auto" }}
                                                       >
                                                            {mainProduct?.description}
                                                       </Typography>

                                                       <Paper variant="outlined" sx={{ p: 2, my: 3 }}>
                                                            <Typography variant="subtitle2" color="text.secondary">
                                                                 Billed annually
                                                            </Typography>
                                                            <Typography variant="h4" display="block">
                                                                 ${(pricesByInterval['year'].priceAmount / 100).toFixed(2)}
                                                                 <Typography component="span" variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                                                                      per apartment/year
                                                                 </Typography>
                                                            </Typography>
                                                            <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
                                                                 Equivalent to ${((pricesByInterval['year'].priceAmount / 100) / 12).toFixed(2)} / month
                                                            </Typography>
                                                       </Paper>

                                                       <List dense>
                                                            {features.map((feature) => (
                                                                 <ListItem key={feature.id ?? feature.name} disablePadding sx={{ py: 0.5 }}>
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
                                                            onClick={() => handleStartFreeTrial(pricesByInterval['year'].id, mainProduct?.id || '')}
                                                            disabled={
                                                                 loadingKey !== null ||
                                                                 (clientSubscriptionPlanData?.product_id === mainProduct?.id &&
                                                                      (clientSubscriptionPlanData?.status === 'active' || clientSubscriptionPlanData?.status === 'trialing'))
                                                            }
                                                            startIcon={loadingKey === pricesByInterval['year'].id ? <CircularProgress size={20} color="inherit" /> : undefined}
                                                       >
                                                            {loadingKey === pricesByInterval['year'].id ? "Redirecting..." : "Start Free Trial"}
                                                       </Button>
                                                  </CardActions>
                                             </Card>
                                        </Grid>
                                   )}
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
