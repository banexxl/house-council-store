"use client";

import React, { useMemo, useState, useTransition } from "react";
import {
     Box,
     Button,
     Card,
     CardActions,
     CardContent,
     Container,
     Paper,
     Typography,
     Accordion,
     AccordionSummary,
     AccordionDetails,
     Grid,
     useTheme,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import toast, { Toaster } from "react-hot-toast";
import { useRouter } from "next/navigation";
import Animate from "@/app/components/animation-framer-motion";
import CircularProgress from "@mui/material/CircularProgress";
import Backdrop from "@mui/material/Backdrop";

import { PolarSubscription } from "../types/polar-subscription-types";
import { PolarProduct } from "../types/polar-product-types";
import { PolarCustomer } from "../types/polar-customer-types";

const faqs = [
     {
          question: "Can I switch plans later?",
          answer:
               "Yes, you can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle.",
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
];

interface PricingPageProps {
     polarProducts?: PolarProduct[];
     customerSubscriptionPlanData?: PolarSubscription;
     apartmentCount?: number;
     customer?: PolarCustomer | null;
}

export const PricingPage: React.FC<PricingPageProps> = ({
     polarProducts,
     customerSubscriptionPlanData,
     apartmentCount,
     customer,
}) => {
     const router = useRouter();
     const theme = useTheme();

     const [loadingKey, setLoadingKey] = useState<string | null>(null);
     const [isPending, startTransition] = useTransition();
     const [selectedIntervalKey, setSelectedIntervalKey] = useState<string>("month-1");

     const handleNavClick = (path: string) => {
          startTransition(() => {
               router.push(path);
          });
     };

     const sortedProducts = useMemo(() => {
          if (!polarProducts) return [];

          // month first, then year; then by interval count
          return [...polarProducts].sort((a, b) => {
               if (a.recurringInterval !== b.recurringInterval) {
                    return a.recurringInterval === "month" ? -1 : 1;
               }
               return (a.recurringIntervalCount ?? 0) - (b.recurringIntervalCount ?? 0);
          });
     }, [polarProducts]);

     const mainProduct = sortedProducts[0];

     const currentProduct = useMemo(() => {
          if (!sortedProducts.length) return undefined;
          const [interval, count] = selectedIntervalKey.split("-");
          const parsed = Number.parseInt(count, 10);

          return (
               sortedProducts.find(
                    (p) => p.recurringInterval === interval && (p.recurringIntervalCount ?? 1) === parsed
               ) || mainProduct
          );
     }, [sortedProducts, selectedIntervalKey, mainProduct]);

     // baseline monthly (month-1)
     const baseMonthlyProduct = useMemo(
          () => sortedProducts.find((p) => p.recurringInterval === "month" && (p.recurringIntervalCount ?? 1) === 1),
          [sortedProducts]
     );
     const baseMonthlyPrice = baseMonthlyProduct?.prices?.[0];

     const discountPercentage = useMemo(() => {
          if (!currentProduct) return 0;
          const productPrice = currentProduct.prices?.[0];
          if (!productPrice || !baseMonthlyPrice) return 0;
          if (currentProduct.recurringInterval === "month" && (currentProduct.recurringIntervalCount ?? 1) === 1) return 0;

          const monthsInPeriod =
               currentProduct.recurringInterval === "year"
                    ? (currentProduct.recurringIntervalCount ?? 1) * 12
                    : (currentProduct.recurringIntervalCount ?? 1);

          const baselineCost = ((baseMonthlyPrice.priceAmount ?? 0) / 100) * monthsInPeriod; // per apt
          const actualCost = (productPrice.priceAmount ?? 0) / 100; // per apt for whole period
          if (baselineCost <= 0) return 0;

          const savings = baselineCost - actualCost;
          return Math.max(0, Math.round((savings / baselineCost) * 100));
     }, [currentProduct, baseMonthlyPrice]);

     const productDescription = currentProduct?.description?.trim() ?? "";

     // ✅ Pricing display based on SELECTED product (not user's current subscription)
     const pricingDisplay = useMemo(() => {
          const price = currentProduct?.prices?.[0];
          if (!price) return null;

          const currency = (price.priceCurrency || "USD").toUpperCase();
          const totalForPeriodPerApartment = (price.priceAmount ?? 0) / 100;

          const months =
               currentProduct.recurringInterval === "year"
                    ? (currentProduct.recurringIntervalCount ?? 1) * 12
                    : (currentProduct.recurringIntervalCount ?? 1);

          const perMonthPerApartment = months > 0 ? totalForPeriodPerApartment / months : totalForPeriodPerApartment;

          return {
               currency,
               months,
               totalForPeriodPerApartment,
               perMonthPerApartment,
               format: (value: number) =>
                    value.toLocaleString("en-US", {
                         style: "currency",
                         currency,
                         minimumFractionDigits: 2,
                         maximumFractionDigits: 2,
                    }),
          };
     }, [currentProduct]);

     const handleOpenCustomerPortal = async () => {
          if (!customer?.id) {
               toast.error("Please sign in to manage your subscription.");
               router.push("/auth/sign-in");
               return;
          }

          if (!customerSubscriptionPlanData?.customerId) {
               toast.error("Missing customer identifier.");
               return;
          }

          setLoadingKey("portal");

          try {
               const returnUrl = typeof window !== "undefined" ? `${window.location.origin}/pricing` : null;

               const res = await fetch("/api/polar/customer-portal", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                         polarCustomerId: customerSubscriptionPlanData.customerId,
                         returnUrl,
                    }),
               });

               const data = await res.json().catch(() => ({}));
               if (!res.ok) {
                    if (data?.error === "customer_not_found") {
                         throw new Error("Please subscribe to a plan before opening the customer portal.");
                    }
                    throw new Error(data?.error || "Failed to open customer portal.");
               }

               const url = data?.url as string | undefined;
               if (!url) throw new Error("Customer portal URL missing.");

               window.open(url, "_blank", "noopener,noreferrer");
          } catch (err: any) {
               toast.error(err?.message || "Failed to open customer portal.");
          } finally {
               setLoadingKey(null);
          }
     };

     const startPolarCheckout = async (priceId: string, productId: string) => {
          if (!customer?.id) {
               const msg = encodeURIComponent("sign_in_required");
               router.push(`/auth/sign-in?message=${msg}`);
               return;
          }

          if (customerSubscriptionPlanData && customerSubscriptionPlanData.status === "trialing") {
               toast.error("You are currently in a free trial. Please wait for it to finish before starting a new one.");
               return;
          }

          // If user has active/trialing AND switching to different plan, send to portal
          if (
               customerSubscriptionPlanData &&
               (customerSubscriptionPlanData.status === "active" || customerSubscriptionPlanData.status === "trialing") &&
               customerSubscriptionPlanData.productId !== productId
          ) {
               await handleOpenCustomerPortal();
               return;
          }

          setLoadingKey(priceId);

          try {
               const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || (typeof window !== "undefined" ? window.location.origin : "");
               const successUrl = `${baseUrl}/pricing/subscription-plan-purchase/success?customerId=${customer.id}&subscription_id=${productId}`;
               const returnUrl = `${baseUrl}/pricing`;

               const res = await fetch("/api/polar/", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                         customerId: customer.id!,
                         productIds: [productId],
                         customerEmail: customer.email,
                         successUrl,
                         returnUrl,
                         priceIds: [priceId],
                    }),
               });

               const data = await res.json().catch(() => ({}));
               if (!res.ok) throw new Error(data?.error || "Failed to create checkout session.");
               if (!data?.url) throw new Error("Checkout URL missing from response.");

               window.location.href = data.url;
          } catch (err: any) {
               console.error(err);
               toast.error(err?.message || "Could not start checkout. Please try again.");
          } finally {
               setLoadingKey(null);
          }
     };

     const currentPriceId = currentProduct?.prices?.[0]?.id ?? null;
     const isCurrentPlan =
          !!customerSubscriptionPlanData?.productId &&
          customerSubscriptionPlanData.productId === currentProduct?.id &&
          (customerSubscriptionPlanData.status === "active" || customerSubscriptionPlanData.status === "trialing");

     const hasActiveOrTrial =
          customerSubscriptionPlanData?.status === "active" || customerSubscriptionPlanData?.status === "trialing";

     const actionLabel = useMemo(() => {
          if (loadingKey === currentPriceId) return "Redirecting...";
          if (loadingKey === "portal") return "Opening Portal...";
          if (isCurrentPlan) return "Current Plan";
          if (hasActiveOrTrial) return "Change Plan";
          return "Start Free Trial";
     }, [loadingKey, currentPriceId, isCurrentPlan, hasActiveOrTrial]);

     const actionDisabled =
          loadingKey !== null || !currentProduct || !currentPriceId || (isCurrentPlan && hasActiveOrTrial);

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
                                        Choose the plan that's right for your community. All plans include a free trial.
                                   </Typography>
                                   <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 700, mx: "auto", mt: 1 }}>
                                        Pricing is billed per apartment.{" "}
                                        {apartmentCount !== undefined && customer
                                             ? `You currently have ${apartmentCount} apartment${apartmentCount === 1 ? "" : "s"} on your account.`
                                             : "Sign in to see your apartment count."}
                                   </Typography>
                              </Box>

                              {/* Billing Interval Selector */}
                              {sortedProducts.length > 1 && (
                                   <Box sx={{ display: "flex", justifyContent: "center", mb: 4 }}>
                                        <Paper sx={{ p: 0.5, display: "inline-flex", gap: 0.5, flexWrap: "wrap" }}>
                                             {sortedProducts.map((product) => {
                                                  const intervalKey = `${product.recurringInterval}-${product.recurringIntervalCount ?? 1}`;
                                                  const intervalCount = product.recurringIntervalCount ?? 1;

                                                  const label =
                                                       product.recurringInterval === "month"
                                                            ? intervalCount === 1
                                                                 ? "Monthly"
                                                                 : `${intervalCount} Months`
                                                            : intervalCount === 1
                                                                 ? "Annually"
                                                                 : `${intervalCount} Years`;

                                                  // Discount badge per button (vs month-1 baseline)
                                                  const productPrice = product.prices?.[0];
                                                  let discount = 0;

                                                  if (productPrice && baseMonthlyPrice && intervalKey !== "month-1") {
                                                       const monthsInPeriod =
                                                            product.recurringInterval === "year"
                                                                 ? (product.recurringIntervalCount ?? 1) * 12
                                                                 : (product.recurringIntervalCount ?? 1);

                                                       const baselineCost = ((baseMonthlyPrice.priceAmount ?? 0) / 100) * monthsInPeriod;
                                                       const actualCost = (productPrice.priceAmount ?? 0) / 100;
                                                       if (baselineCost > 0) {
                                                            discount = Math.max(0, Math.round(((baselineCost - actualCost) / baselineCost) * 100));
                                                       }
                                                  }

                                                  return (
                                                       <Button
                                                            key={intervalKey}
                                                            variant={selectedIntervalKey === intervalKey ? "contained" : "outlined"}
                                                            onClick={() => setSelectedIntervalKey(intervalKey)}
                                                            sx={{ minWidth: 110 }}
                                                       >
                                                            {label}
                                                            {discount > 0 && (
                                                                 <Typography
                                                                      component="span"
                                                                      variant="caption"
                                                                      sx={{
                                                                           ml: 0.5,
                                                                           color: selectedIntervalKey === intervalKey ? "inherit" : "success.main",
                                                                      }}
                                                                 >
                                                                      (-{discount}%)
                                                                 </Typography>
                                                            )}
                                                       </Button>
                                                  );
                                             })}
                                        </Paper>
                                   </Box>
                              )}

                              {/* ✅ Centered responsive card (Grid v2) */}
                              <Grid container spacing={4} justifyContent="center">
                                   {currentProduct && (
                                        <Grid key={currentProduct.id} size={{ xs: 12, md: 8 }} display="flex" justifyContent="center">
                                             <Card
                                                  sx={{
                                                       width: "100%",
                                                       maxWidth: 520,
                                                       display: "flex",
                                                       flexDirection: "column",
                                                       border: `2px solid ${theme.palette.primary.main}`,
                                                  }}
                                             >
                                                  <CardContent sx={{ flexGrow: 1 }}>
                                                       <Typography variant="h5" gutterBottom>
                                                            {currentProduct.name}

                                                            {currentProduct.trialIntervalCount && (
                                                                 <Typography component="span" variant="caption" color="primary" sx={{ ml: 1 }}>
                                                                      {currentProduct.trialIntervalCount} {currentProduct.trialInterval} free trial
                                                                 </Typography>
                                                            )}

                                                            {discountPercentage > 0 && (
                                                                 <Typography
                                                                      component="span"
                                                                      variant="caption"
                                                                      sx={{
                                                                           ml: 1,
                                                                           px: 1,
                                                                           py: 0.5,
                                                                           bgcolor: "success.main",
                                                                           color: "white",
                                                                           borderRadius: 1,
                                                                      }}
                                                                 >
                                                                      Save {discountPercentage}%
                                                                 </Typography>
                                                            )}
                                                       </Typography>

                                                       {/* ✅ Price for SELECTED product */}
                                                       <Typography variant="body2" color="text.secondary" gutterBottom sx={{ minHeight: 48 }}>
                                                            {pricingDisplay ? (
                                                                 <>
                                                                      <strong>{pricingDisplay.format(pricingDisplay.perMonthPerApartment)}</strong> per apartment /
                                                                      month
                                                                      <Typography component="span" variant="caption" sx={{ ml: 1 }}>
                                                                           ({pricingDisplay.format(pricingDisplay.totalForPeriodPerApartment)} per apartment for{" "}
                                                                           {pricingDisplay.months} month{pricingDisplay.months === 1 ? "" : "s"})
                                                                      </Typography>
                                                                 </>
                                                            ) : (
                                                                 "Pricing unavailable for this plan."
                                                            )}
                                                       </Typography>

                                                       {/* Optional: building total */}
                                                       {customer && pricingDisplay && apartmentCount !== undefined && (
                                                            <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1 }}>
                                                                 Total for your {apartmentCount} apartment{apartmentCount === 1 ? "" : "s"}:{" "}
                                                                 <strong>
                                                                      {pricingDisplay.format(pricingDisplay.totalForPeriodPerApartment * apartmentCount)}
                                                                 </strong>{" "}
                                                                 for {pricingDisplay.months} month{pricingDisplay.months === 1 ? "" : "s"}
                                                            </Typography>
                                                       )}

                                                       {/* Product description */}
                                                       {productDescription ? (
                                                            <Typography
                                                                 variant="body2"
                                                                 color="text.secondary"
                                                                 sx={{
                                                                      mt: 1,
                                                                      whiteSpace: 'pre-line',
                                                                      lineHeight: 1.7,
                                                                 }}
                                                            >
                                                                 {productDescription}
                                                            </Typography>
                                                       ) : (
                                                            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                                                 No description available for this plan.
                                                            </Typography>
                                                       )}

                                                  </CardContent>

                                                  <CardActions sx={{ p: 2, pt: 0 }}>
                                                       {currentPriceId ? (
                                                            <Button
                                                                 variant="contained"
                                                                 fullWidth
                                                                 disabled={actionDisabled}
                                                                 onClick={() => startPolarCheckout(currentPriceId, currentProduct.id)}
                                                                 startIcon={
                                                                      loadingKey === currentPriceId || loadingKey === "portal" ? (
                                                                           <CircularProgress size={20} color="inherit" />
                                                                      ) : undefined
                                                                 }
                                                            >
                                                                 {actionLabel}
                                                            </Button>
                                                       ) : (
                                                            <Button variant="contained" fullWidth onClick={() => handleNavClick("/contact")}>
                                                                 Contact Sales
                                                            </Button>
                                                       )}
                                                  </CardActions>
                                             </Card>
                                        </Grid>
                                   )}
                              </Grid>

                              {/* FAQ */}
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

                              {/* Contact sales */}
                              <Paper
                                   sx={{
                                        mt: 8,
                                        p: 4,
                                        textAlign: "center",
                                        bgcolor: "secondary.main",
                                        maxWidth: 800,
                                        mx: "auto",
                                        justifyContent: "space-between",
                                   }}
                              >
                                   <Typography variant="h4" gutterBottom sx={{ color: theme.palette.primary.main }}>
                                        Need a custom solution?
                                   </Typography>
                                   <Typography variant="body1" sx={{ color: theme.palette.primary.main, mb: 2 }}>
                                        Contact our sales team for custom pricing and features tailored to your specific needs.
                                   </Typography>
                                   <Button variant="contained" size="large" onClick={() => handleNavClick("/contact")}>
                                        Contact Sales
                                   </Button>
                              </Paper>
                         </Container>
                    </Box>
               </Animate>

               <Toaster />

               <Backdrop
                    sx={{
                         color: "#fff",
                         zIndex: (t) => t.zIndex.drawer + 1,
                    }}
                    open={isPending}
               >
                    <CircularProgress sx={{ color: theme.palette.primary.main }} />
               </Backdrop>
          </Box>
     );
};
