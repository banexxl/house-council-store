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
     polarProducts?: (PolarProduct & { prices: PolarProductPrice[] })[]
     clientSubscriptionPlanData?: PolarSubscription & { subscription_plan: any } | null
     apartmentCount?: number
     client?: Client | null
}

export const PricingPage: React.FC<PricingPageProps> = ({ polarProducts, clientSubscriptionPlanData, apartmentCount, client }) => {
     const router = useRouter()
     const [loadingKey, setLoadingKey] = useState<string | null>(null);
     const theme = useTheme()
     const [isPending, startTransition] = useTransition()
     const [selectedIntervalKey, setSelectedIntervalKey] = useState<string>('month-1');

     const handleNavClick = (path: string) => {
          startTransition(() => {
               router.push(path);
          });
     };

     const handleStartFreeTrial = (priceId: string, productId: string) => {
          void startPolarCheckout(priceId, productId);
     };

     // Sort products by interval count for display
     const sortedProducts = useMemo(() => {
          if (!polarProducts) return [];

          // Sort by interval type (month first, then year) and then by count
          return [...polarProducts].sort((a, b) => {
               if (a.recurringInterval !== b.recurringInterval) {
                    return a.recurringInterval === 'month' ? -1 : 1;
               }
               return a.recurringIntervalCount - b.recurringIntervalCount;
          });
     }, [polarProducts]);

     const mainProduct = sortedProducts[0];

     // Extract features from metadata
     const features = useMemo(() => {
          if (!mainProduct?.metadata) return [];

          return Object.entries(mainProduct.metadata).map(([key, value]) => ({
               id: key,
               name: String(value),
               description: String(value)
          }));
     }, [mainProduct]);

     // Get current selected product by interval key
     const currentProduct = useMemo(() => {
          const [interval, count] = selectedIntervalKey.split('-');
          return sortedProducts.find(
               p => p.recurringInterval === interval && p.recurringIntervalCount === parseInt(count)
          ) || mainProduct;
     }, [sortedProducts, selectedIntervalKey, mainProduct]);

     const currentPrice = currentProduct?.prices?.[0];

     // Get 1-month product for baseline comparison
     const baseMonthlyProduct = sortedProducts.find(p => p.recurringInterval === 'month' && p.recurringIntervalCount === 1);
     const baseMonthlyPrice = baseMonthlyProduct?.prices?.[0];

     const discountPercentage = useMemo(() => {
          if (!currentPrice || !baseMonthlyPrice || !currentProduct) return 0;
          if (currentProduct.recurringInterval === 'month' && currentProduct.recurringIntervalCount === 1) return 0;

          // Calculate what this period would cost at monthly rate
          const monthsInPeriod = currentProduct.recurringInterval === 'year'
               ? currentProduct.recurringIntervalCount * 12
               : currentProduct.recurringIntervalCount;

          const baselineCost = (baseMonthlyPrice.priceAmount / 100) * monthsInPeriod;
          const actualCost = currentPrice.priceAmount / 100;
          const savings = baselineCost - actualCost;

          return Math.round((savings / baselineCost) * 100);
     }, [currentPrice, baseMonthlyPrice, currentProduct]);

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

                              {/* Billing Interval Selector */}
                              {sortedProducts.length > 1 && (
                                   <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
                                        <Paper sx={{ p: 0.5, display: 'inline-flex', gap: 0.5, flexWrap: 'wrap' }}>
                                             {sortedProducts.map(product => {
                                                  const intervalKey = `${product.recurringInterval}-${product.recurringIntervalCount}`;
                                                  const label = product.recurringInterval === 'month'
                                                       ? product.recurringIntervalCount === 1 ? 'Monthly' : `${product.recurringIntervalCount} Months`
                                                       : product.recurringIntervalCount === 1 ? 'Annually' : `${product.recurringIntervalCount} Years`;

                                                  // Calculate discount for this product
                                                  const productPrice = product.prices?.[0];
                                                  let discount = 0;
                                                  if (productPrice && baseMonthlyPrice && intervalKey !== 'month-1') {
                                                       const monthsInPeriod = product.recurringInterval === 'year'
                                                            ? product.recurringIntervalCount * 12
                                                            : product.recurringIntervalCount;
                                                       const baselineCost = (baseMonthlyPrice.priceAmount / 100) * monthsInPeriod;
                                                       const actualCost = productPrice.priceAmount / 100;
                                                       const savings = baselineCost - actualCost;
                                                       discount = Math.round((savings / baselineCost) * 100);
                                                  }

                                                  return (
                                                       <Button
                                                            key={intervalKey}
                                                            variant={selectedIntervalKey === intervalKey ? 'contained' : 'outlined'}
                                                            onClick={() => setSelectedIntervalKey(intervalKey)}
                                                            sx={{ minWidth: 100 }}
                                                       >
                                                            {label}
                                                            {discount > 0 && (
                                                                 <Typography component="span" variant="caption" sx={{ ml: 0.5, color: selectedIntervalKey === intervalKey ? 'inherit' : 'success.main' }}>
                                                                      (-{discount}%)
                                                                 </Typography>
                                                            )}
                                                       </Button>
                                                  );
                                             })}
                                        </Paper>
                                   </Box>
                              )}

                              <Grid container spacing={4} justifyContent="center">
                                   {mainProduct && currentProduct && (
                                        <Grid key={currentProduct.id} size={{ xs: 12, md: 8 }}>
                                             <Card sx={{ height: "100%", display: "flex", flexDirection: "column", border: `2px solid ${theme.palette.primary.main}` }}>
                                                  <CardContent sx={{ flexGrow: 1 }}>
                                                       <Typography variant="h5" gutterBottom>
                                                            {mainProduct.name}
                                                            <Typography component="span" variant="caption" color="primary" sx={{ ml: 1 }}>
                                                                 {mainProduct.trialIntervalCount} {mainProduct.trialInterval} free trial
                                                            </Typography>
                                                            {discountPercentage > 0 && (
                                                                 <Typography component="span" variant="caption" sx={{ ml: 1, px: 1, py: 0.5, bgcolor: 'success.main', color: 'white', borderRadius: 1 }}>
                                                                      Save {discountPercentage}%
                                                                 </Typography>
                                                            )}
                                                       </Typography>
                                                       <Typography
                                                            variant="body2"
                                                            color="text.secondary"
                                                            gutterBottom
                                                            sx={{ minHeight: 60, maxHeight: 80, overflowY: "auto" }}
                                                       >
                                                            {mainProduct.description}
                                                       </Typography>

                                                       {currentPrice ? (
                                                            <Paper variant="outlined" sx={{ p: 2, my: 3 }}>
                                                                 <Typography variant="subtitle2" color="text.secondary">
                                                                      Billed every {currentProduct.recurringIntervalCount} {currentProduct.recurringInterval}{currentProduct.recurringIntervalCount > 1 ? 's' : ''}
                                                                 </Typography>
                                                                 <Typography variant="h4" display="block" sx={{ mt: 1 }}>
                                                                      ${(currentPrice.priceAmount / 100).toFixed(2)}
                                                                      <Typography component="span" variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                                                                           per apartment
                                                                      </Typography>
                                                                 </Typography>
                                                                 {(currentProduct.recurringInterval === 'year' || currentProduct.recurringIntervalCount > 1) && baseMonthlyPrice && (
                                                                      <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
                                                                           Equivalent to ${(
                                                                                (currentPrice.priceAmount / 100) /
                                                                                (currentProduct.recurringInterval === 'year'
                                                                                     ? currentProduct.recurringIntervalCount * 12
                                                                                     : currentProduct.recurringIntervalCount)
                                                                           ).toFixed(2)}/month
                                                                      </Typography>
                                                                 )}
                                                            </Paper>
                                                       ) : (
                                                            <Paper variant="outlined" sx={{ p: 2, my: 3, textAlign: 'center' }}>
                                                                 <Typography variant="h6" color="text.secondary">
                                                                      Contact us for pricing
                                                                 </Typography>
                                                                 <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                                                      Custom pricing available for your needs
                                                                 </Typography>
                                                            </Paper>
                                                       )}

                                                       <List dense>
                                                            {features.map((feature) => (
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
                                                       {currentPrice ? (
                                                            <Button
                                                                 variant="contained"
                                                                 fullWidth
                                                                 onClick={() => handleStartFreeTrial(currentPrice.id, currentProduct.id)}
                                                                 disabled={
                                                                      loadingKey !== null ||
                                                                      (clientSubscriptionPlanData?.product_id === currentProduct.id &&
                                                                           (clientSubscriptionPlanData?.status === 'active' || clientSubscriptionPlanData?.status === 'trialing'))
                                                                 }
                                                                 startIcon={loadingKey === currentPrice.id ? <CircularProgress size={20} color="inherit" /> : undefined}
                                                            >
                                                                 {loadingKey === currentPrice.id ? "Redirecting..." : "Start Free Trial"}
                                                            </Button>
                                                       ) : (
                                                            <Button
                                                                 variant="contained"
                                                                 fullWidth
                                                                 onClick={() => handleNavClick("/contact")}
                                                            >
                                                                 Contact Sales
                                                            </Button>
                                                       )}
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
