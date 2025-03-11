"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
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
} from "@mui/material"
import Grid from "@mui/material/Grid2"
import CheckIcon from "@mui/icons-material/Check"
import ExpandMoreIcon from "@mui/icons-material/ExpandMore"

interface PricingOption {
  title: string
  price: {
    monthly: number
    annually: number
  }
  description: string
  features: string[]
  popular?: boolean
}

const pricingOptions: PricingOption[] = [
  {
    title: "Basic",
    price: {
      monthly: 29,
      annually: 23,
    },
    description: "For small communities",
    features: [
      "Up to 50 units/residents",
      "Community announcements",
      "Document storage",
      "Basic financial tracking",
      "Email support",
    ],
  },
  {
    title: "Standard",
    price: {
      monthly: 59,
      annually: 47,
    },
    description: "For medium-sized communities",
    features: [
      "Up to 150 units/residents",
      "All Basic features",
      "Advanced financial tools",
      "Voting system",
      "Maintenance requests",
      "Priority email support",
    ],
    popular: true,
  },
  {
    title: "Premium",
    price: {
      monthly: 99,
      annually: 79,
    },
    description: "For large communities",
    features: [
      "Unlimited units/residents",
      "All Standard features",
      "Custom branding",
      "API access",
      "Advanced analytics",
      "Dedicated account manager",
      "24/7 phone & email support",
    ],
  },
]

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
    answer:
      "Yes, we offer special pricing for non-profit organizations. Please contact our sales team for more information.",
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept all major credit cards, PayPal, and bank transfers for annual plans.",
  },
]

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annually">("monthly")

  const handleBillingCycleChange = (event: React.SyntheticEvent, newValue: "monthly" | "annually") => {
    setBillingCycle(newValue)
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Box component="main" sx={{ flexGrow: 1, py: { xs: 6, md: 10 } }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: "center", mb: 6 }}>
            <Typography variant="h2" gutterBottom>
              Simple, Transparent Pricing
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 700, mx: "auto" }}>
              Choose the plan that's right for your community. All plans include a 14-day free trial.
            </Typography>
          </Box>

          <Box sx={{ display: "flex", justifyContent: "center", mb: 6 }}>
            <Tabs value={billingCycle} onChange={handleBillingCycleChange} aria-label="billing cycle tabs">
              <Tab label="Monthly" value="monthly" />
              <Tab label="Annually (Save 20%)" value="annually" />
            </Tabs>
          </Box>

          <Grid container spacing={4} justifyContent="center">
            {pricingOptions.map((option) => (
              <Grid size={{ xs: 12, md: 6, lg: 4 }} key={option.title}>
                <Card
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    ...(option.popular
                      ? {
                        border: 2,
                        borderColor: "primary.main",
                        position: "relative",
                      }
                      : {}),
                  }}
                >
                  {option.popular && (
                    <Box
                      sx={{
                        position: "absolute",
                        top: 12,
                        left: 0,
                        right: 0,
                        textAlign: "center",
                      }}
                    >
                      <Typography
                        variant="caption"
                        sx={{
                          bgcolor: "primary.main",
                          color: "primary.contrastText",
                          py: 0.5,
                          px: 2,
                          borderRadius: 10,
                        }}
                      >
                        Popular
                      </Typography>
                    </Box>
                  )}

                  <CardContent sx={{ pt: option.popular ? 5 : 2, flexGrow: 1 }}>
                    <Typography variant="h5" component="div" gutterBottom>
                      {option.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {option.description}
                    </Typography>

                    <Box sx={{ my: 3 }}>
                      <Typography variant="h3" component="div">
                        ${billingCycle === "monthly" ? option.price.monthly : option.price.annually}
                        <Typography variant="body2" component="span" color="text.secondary" sx={{ ml: 1 }}>
                          /month
                        </Typography>
                      </Typography>
                      {billingCycle === "annually" && (
                        <Typography variant="caption" color="text.secondary">
                          Billed annually (${option.price.annually * 12})
                        </Typography>
                      )}
                    </Box>

                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {option.features[0]}
                    </Typography>

                    <List dense>
                      {option.features.slice(1).map((feature, index) => (
                        <ListItem key={index} disablePadding sx={{ py: 0.5 }}>
                          <ListItemIcon sx={{ minWidth: 32 }}>
                            <CheckIcon color="primary" fontSize="small" />
                          </ListItemIcon>
                          <ListItemText primary={feature} />
                        </ListItem>
                      ))}
                    </List>
                  </CardContent>

                  <CardActions sx={{ p: 2, pt: 0 }}>
                    <Button variant="contained" fullWidth>
                      Start Free Trial
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
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
            }}
          >
            <Typography variant="h4" gutterBottom>
              Need a custom solution?
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              Contact our sales team for custom pricing and features tailored to your specific needs.
            </Typography>
            <Link href="/contact" style={{ textDecoration: "none" }}>
              <Button variant="contained" size="large">
                Contact Sales
              </Button>
            </Link>
          </Paper>
        </Container>
      </Box>
    </Box>
  )
}

