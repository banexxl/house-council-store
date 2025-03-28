"use client"

import { useRouter } from "next/navigation"
import {
     Box,
     Container,
     Typography,
     Paper,
     Button,
     List,
     ListItem,
     ListItemIcon,
     ListItemText,
     Divider,
} from "@mui/material"
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline"
import CalendarTodayIcon from "@mui/icons-material/CalendarToday"
import DashboardIcon from "@mui/icons-material/Dashboard"
import SettingsIcon from "@mui/icons-material/Settings"
import HelpOutlineIcon from "@mui/icons-material/HelpOutline"

interface FreeTrialSuccessProps {
     userEmail: string
}

export default function FreeTrialSuccess({ userEmail }: FreeTrialSuccessProps) {
     const router = useRouter()

     // Calculate trial end date (14 days from now)
     const trialEndDate = new Date()
     trialEndDate.setDate(trialEndDate.getDate() + 14)
     const formattedTrialEndDate = trialEndDate.toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
     })

     return (
          <Container maxWidth="md" sx={{ py: 8 }}>
               <Paper elevation={3} sx={{ p: 4, borderRadius: 2, textAlign: "center" }}>
                    <Box sx={{ color: "success.main", mb: 3 }}>
                         <CheckCircleOutlineIcon sx={{ fontSize: 80 }} />
                    </Box>

                    <Typography variant="h4" gutterBottom>
                         Your Free Trial Has Started!
                    </Typography>

                    <Typography variant="body1" sx={{ mb: 4 }}>
                         Thank you for starting your free trial with HouseCouncil. You now have full access to all features for the
                         next 14 days.
                    </Typography>

                    <Box sx={{ bgcolor: "background.default", p: 3, borderRadius: 2, mb: 4, maxWidth: 500, mx: "auto" }}>
                         <Typography variant="subtitle1" gutterBottom>
                              Trial Details
                         </Typography>
                         <List>
                              <ListItem>
                                   <ListItemIcon>
                                        <CalendarTodayIcon color="primary" />
                                   </ListItemIcon>
                                   <ListItemText primary="Trial End Date" secondary={formattedTrialEndDate} />
                              </ListItem>
                              <ListItem>
                                   <ListItemIcon>
                                        <SettingsIcon color="primary" />
                                   </ListItemIcon>
                                   <ListItemText primary="Account Email" secondary={userEmail} />
                              </ListItem>
                         </List>
                    </Box>

                    <Divider sx={{ my: 4 }} />

                    <Typography variant="h6" gutterBottom>
                         What's Next?
                    </Typography>

                    <Box sx={{ display: "flex", flexDirection: "column", gap: 2, maxWidth: 500, mx: "auto", mb: 4 }}>
                         <Button
                              variant="contained"
                              startIcon={<DashboardIcon />}
                              onClick={() => router.push("https://house-council-app-v2-plum.vercel.app/")}
                              fullWidth
                              size="large"
                         >
                              Go to Dashboard
                         </Button>

                         <Button variant="outlined" startIcon={<HelpOutlineIcon />} onClick={() => router.push("/docs")} href="/docs" fullWidth>
                              View Documentation
                         </Button>
                    </Box>

                    <Typography variant="body2" color="text.secondary">
                         Need help getting started? Contact our support team at support@housecouncil.com
                    </Typography>
               </Paper>
          </Container>
     )
}

