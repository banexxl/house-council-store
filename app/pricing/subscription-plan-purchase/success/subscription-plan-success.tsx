"use client"

import { useRouter } from "next/navigation"
import Image from "next/image"
import {
     Box,
     Container,
     Typography,
     Paper,
     Button,
     Divider,
     List,
     ListItem,
     ListItemIcon,
     ListItemText,
     Grid,
     useTheme,
} from "@mui/material"
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline"
import CalendarTodayIcon from "@mui/icons-material/CalendarToday"
import CreditCardIcon from "@mui/icons-material/CreditCard"
import AccountCircleIcon from "@mui/icons-material/AccountCircle"
import Animate from "@/app/components/animation-framer-motion"
import Link from "next/link"

interface SubscriptionSuccessPageProps {
     isTrial: boolean
     userEmail: string
     dashboardUrl: string
}

export default function SubscriptionSuccessPage({
     isTrial,
     userEmail,
     dashboardUrl
}: SubscriptionSuccessPageProps) {
     const theme = useTheme();
     // Calculate trial end date (30 days from now)
     const trialEndDate = new Date()
     trialEndDate.setDate(trialEndDate.getDate() + 30)
     const formattedTrialEndDate = trialEndDate.toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
     })

     // Calculate the first billing date (after trial)
     const firstBillingDate = new Date(trialEndDate)
     const formattedBillingDate = firstBillingDate.toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
     })

     return (
          <Container maxWidth="md" sx={{ py: 8 }}>
               <Animate>
                    <Paper
                         elevation={3}
                         sx={{
                              p: 4,
                              borderRadius: 2,
                              position: "relative",
                              overflow: "hidden",
                         }}
                    >
                         <Box sx={{ position: "relative", zIndex: 1 }}>
                              <Box sx={{ textAlign: "center", mb: 6 }}>
                                   <Box sx={{ display: "flex", justifyContent: "center", mb: 3 }}>
                                        <CheckCircleOutlineIcon color="success" sx={{ fontSize: 80 }} />
                                   </Box>
                                   <Typography variant="h3" gutterBottom>
                                        {isTrial ? "Your Free Trial Has Started!" : "Subscription Successful!"}
                                   </Typography>
                                   <Typography variant="subtitle1">
                                        {isTrial
                                             ? <>You now have access to all plan features for the next 30 days.</>
                                             : <>You now have full access to all plan features.</>}
                                   </Typography>
                              </Box>

                              {/* Top grid row: Subscription Details + Next Steps */}
                              <Grid container spacing={6}>
                                   <Grid size={{ xs: 12, md: 6 }}>
                                        <Typography variant="h5" gutterBottom>
                                             {isTrial ? "Trial Details" : "Subscription Details"}
                                        </Typography>
                                        <Divider sx={{ mb: 3 }} />
                                        <List sx={{ pl: 1 }}>
                                             <ListItem disableGutters sx={{ pb: 1 }}>
                                                  <ListItemIcon sx={{ minWidth: 36 }}>
                                                       <AccountCircleIcon color="primary" />
                                                  </ListItemIcon>
                                                  <ListItemText primary="Account" secondary={userEmail} />
                                             </ListItem>
                                             {isTrial && (
                                                  <>
                                                       <ListItem disableGutters sx={{ pb: 1 }}>
                                                            <ListItemIcon sx={{ minWidth: 36 }}>
                                                                 <CalendarTodayIcon color="primary" />
                                                            </ListItemIcon>
                                                            <ListItemText primary="Trial End Date" secondary={formattedTrialEndDate} />
                                                       </ListItem>
                                                       <ListItem disableGutters sx={{ pb: 1 }}>
                                                            <ListItemIcon sx={{ minWidth: 36 }}>
                                                                 <CreditCardIcon color="primary" />
                                                            </ListItemIcon>
                                                            <ListItemText primary="First Billing Date" secondary={formattedBillingDate} />
                                                       </ListItem>
                                                  </>
                                             )}
                                        </List>
                                   </Grid>

                                   <Grid size={{ xs: 12, md: 6 }}>
                                        <Typography variant="h5" gutterBottom>
                                             Next Steps
                                        </Typography>
                                        <Divider sx={{ mb: 3 }} />
                                        <List sx={{ pl: 1 }}>
                                             <ListItem disableGutters sx={{ pb: 1 }}>
                                                  <ListItemIcon sx={{ minWidth: 36 }}>
                                                       <CheckCircleOutlineIcon color="primary" />
                                                  </ListItemIcon>
                                                  <ListItemText
                                                       primary="Set up your profile"
                                                       secondary="Complete your profile to get the most out of our platform"
                                                  />
                                             </ListItem>
                                             <ListItem disableGutters sx={{ pb: 1 }}>
                                                  <ListItemIcon sx={{ minWidth: 36 }}>
                                                       <CheckCircleOutlineIcon color="primary" />
                                                  </ListItemIcon>
                                                  <ListItemText
                                                       primary="Explore the dashboard"
                                                       secondary="Familiarize yourself with all the features available to you"
                                                  />
                                             </ListItem>
                                             <ListItem disableGutters sx={{ pb: 1 }}>
                                                  <ListItemIcon sx={{ minWidth: 36 }}>
                                                       <CheckCircleOutlineIcon color="primary" />
                                                  </ListItemIcon>
                                                  <ListItemText
                                                       primary="Invite your team"
                                                       secondary="Add other council members to collaborate effectively"
                                                  />
                                             </ListItem>
                                        </List>
                                   </Grid>
                              </Grid>

                              {/* Bottom row: Image and CTA */}
                              <Box>
                                   <Box sx={{ height: 400, position: "relative", mb: 4 }}>
                                        <Image
                                             src="/cards/ty-card.png"
                                             alt="Thank You"
                                             fill
                                             style={{ objectFit: "contain", borderRadius: "8px" }}
                                        />
                                   </Box>

                                   <Box sx={{ textAlign: "center" }}>
                                        <Typography variant="h6" gutterBottom>
                                             Ready to get started?
                                        </Typography>
                                        <Button
                                             variant="contained"
                                             size="large"
                                             onClick={() => window.open(dashboardUrl, '_blank')}
                                             sx={{
                                                  mb: 2,
                                                  minWidth: 200,
                                                  animation: "pulse 2s infinite",
                                                  "@keyframes pulse": {
                                                       "0%": { transform: "scale(1)" },
                                                       "50%": { transform: "scale(1.05)" },
                                                       "100%": { transform: "scale(1)" }
                                                  }
                                             }}
                                        >
                                             Go to Dashboard
                                        </Button>
                                        <Typography variant="body2" color="text.secondary">
                                             Need help? Check out our{" "}
                                             <Link href="/docs" passHref>
                                                  <Typography variant="body2" color="primary">
                                                       docs
                                                  </Typography>
                                             </Link>{" "}
                                             or{" "}
                                             <Link href="/contact" passHref>
                                                  <Typography variant="body2" color="primary">
                                                       contact support
                                                  </Typography>
                                             </Link>.
                                        </Typography>
                                   </Box>
                              </Box>
                         </Box>
                    </Paper>
               </Animate>
          </Container>
     )


}
