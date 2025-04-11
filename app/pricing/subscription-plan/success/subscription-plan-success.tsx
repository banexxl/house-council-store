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
} from "@mui/material"
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline"
import CalendarTodayIcon from "@mui/icons-material/CalendarToday"
import CreditCardIcon from "@mui/icons-material/CreditCard"
import AccountCircleIcon from "@mui/icons-material/AccountCircle"
import DescriptionIcon from "@mui/icons-material/Description"

interface SubscriptionSuccessPageProps {
     planId: string
     planName: string
     isTrial: boolean
     userEmail: string
}

export default function SubscriptionSuccessPage({
     planId,
     planName,
     isTrial,
     userEmail,
}: SubscriptionSuccessPageProps) {
     const router = useRouter()

     // Calculate trial end date (14 days from now)
     const trialEndDate = new Date()
     trialEndDate.setDate(trialEndDate.getDate() + 14)
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
               <Paper
                    elevation={3}
                    sx={{
                         p: 4,
                         borderRadius: 2,
                         position: "relative",
                         overflow: "hidden",
                         "&::before": {
                              content: '""',
                              position: "absolute",
                              top: 0,
                              left: 0,
                              right: 0,
                              bottom: 0,
                              backgroundImage: "url(/images/community-meeting.png)",
                              backgroundSize: "cover",
                              backgroundPosition: "center",
                              opacity: 0.05,
                              zIndex: 0,
                         },
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
                              <Typography variant="h6" color="text.secondary">
                                   {isTrial
                                        ? `You now have access to all ${planName} plan features for the next 14 days.`
                                        : `You now have full access to all ${planName} plan features.`}
                              </Typography>
                         </Box>

                         <Grid container spacing={4}>
                              <Grid item xs={12} md={6}>
                                   <Box sx={{ mb: 4 }}>
                                        <Typography variant="h5" gutterBottom>
                                             {isTrial ? "Trial Details" : "Subscription Details"}
                                        </Typography>
                                        <Divider sx={{ mb: 3 }} />

                                        <List>
                                             <ListItem>
                                                  <ListItemIcon>
                                                       <DescriptionIcon color="primary" />
                                                  </ListItemIcon>
                                                  <ListItemText primary="Plan" secondary={planName} />
                                             </ListItem>
                                             <ListItem>
                                                  <ListItemIcon>
                                                       <AccountCircleIcon color="primary" />
                                                  </ListItemIcon>
                                                  <ListItemText primary="Account" secondary={userEmail} />
                                             </ListItem>
                                             {isTrial && (
                                                  <>
                                                       <ListItem>
                                                            <ListItemIcon>
                                                                 <CalendarTodayIcon color="primary" />
                                                            </ListItemIcon>
                                                            <ListItemText primary="Trial End Date" secondary={formattedTrialEndDate} />
                                                       </ListItem>
                                                       <ListItem>
                                                            <ListItemIcon>
                                                                 <CreditCardIcon color="primary" />
                                                            </ListItemIcon>
                                                            <ListItemText primary="First Billing Date" secondary={formattedBillingDate} />
                                                       </ListItem>
                                                  </>
                                             )}
                                        </List>
                                   </Box>

                                   <Box sx={{ mb: 4 }}>
                                        <Typography variant="h5" gutterBottom>
                                             Next Steps
                                        </Typography>
                                        <Divider sx={{ mb: 3 }} />

                                        <List>
                                             <ListItem>
                                                  <ListItemIcon>
                                                       <CheckCircleOutlineIcon color="primary" />
                                                  </ListItemIcon>
                                                  <ListItemText
                                                       primary="Set up your profile"
                                                       secondary="Complete your profile to get the most out of our platform"
                                                  />
                                             </ListItem>
                                             <ListItem>
                                                  <ListItemIcon>
                                                       <CheckCircleOutlineIcon color="primary" />
                                                  </ListItemIcon>
                                                  <ListItemText
                                                       primary="Explore the dashboard"
                                                       secondary="Familiarize yourself with all the features available to you"
                                                  />
                                             </ListItem>
                                             <ListItem>
                                                  <ListItemIcon>
                                                       <CheckCircleOutlineIcon color="primary" />
                                                  </ListItemIcon>
                                                  <ListItemText
                                                       primary="Invite your team"
                                                       secondary="Add other council members to collaborate effectively"
                                                  />
                                             </ListItem>
                                        </List>
                                   </Box>
                              </Grid>

                              <Grid item xs={12} md={6}>
                                   <Box sx={{ position: "relative", height: 300, mb: 4 }}>
                                        <Image
                                             src="/images/dashboard-mockup.png"
                                             alt="Dashboard Preview"
                                             fill
                                             style={{ objectFit: "contain", borderRadius: "8px" }}
                                        />
                                   </Box>

                                   <Box sx={{ textAlign: "center", mt: 4 }}>
                                        <Typography variant="h6" gutterBottom>
                                             Ready to get started?
                                        </Typography>
                                        <Button
                                             variant="contained"
                                             size="large"
                                             onClick={() => router.push("/dashboard")}
                                             sx={{ mb: 2, minWidth: 200 }}
                                        >
                                             Go to Dashboard
                                        </Button>
                                        <Typography variant="body2" color="text.secondary">
                                             Need help? Check out our <Button variant="text">documentation</Button> or{" "}
                                             <Button variant="text">contact support</Button>.
                                        </Typography>
                                   </Box>
                              </Grid>
                         </Grid>
                    </Box>
               </Paper>
          </Container>
     )
}
