"use client"

import Link from "next/link"
import {
     Box,
     Button,
     Container,
     Paper,
     Typography,
     Divider,
     List,
     ListItem,
     ListItemIcon,
     ListItemText,
     Alert,
} from "@mui/material"
import CheckCircleIcon from "@mui/icons-material/CheckCircle"
import LoginIcon from "@mui/icons-material/Login"
import PersonIcon from "@mui/icons-material/Person"
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import BiotechIcon from '@mui/icons-material/Biotech';
import Animate from "@/app/components/animation-framer-motion"

export const RegistrationConfirmedPage = () => {

     return (
          <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh", mt: 5 }}>
               <Animate>
                    <Box component="main" sx={{ flexGrow: 1, py: { xs: 6, md: 10 } }}>
                         <Container maxWidth="md">
                              <Paper elevation={3} sx={{ p: { xs: 3, md: 5 }, textAlign: "center" }}>
                                   <Box sx={{ color: "success.main", mb: 3 }}>
                                        <CheckCircleIcon sx={{ fontSize: 70 }} />
                                   </Box>

                                   <Typography variant="h3" gutterBottom>
                                        Registration Successful!
                                   </Typography>

                                   <Typography variant="h6" sx={{ mb: 3 }}>
                                        Welcome to NestLink!
                                   </Typography>

                                   <Typography variant="body1" paragraph sx={{ maxWidth: 600, mx: "auto" }}>
                                        Your account has been successfully created. You can now log in and start using our services.
                                   </Typography>

                                   <Box sx={{ my: 4 }}>
                                        <Button
                                             variant="contained"
                                             size="large"
                                             component={Link}
                                             href="/auth/sign-in"
                                             startIcon={<LoginIcon />}
                                             sx={{ px: 4, py: 1.5 }}
                                        >
                                             Go to Login
                                        </Button>
                                   </Box>

                                   <Divider sx={{ my: 4, maxWidth: 600, mx: "auto" }}>
                                        <Typography variant="body2" color="text.secondary">
                                             NEXT STEPS
                                        </Typography>
                                   </Divider>

                                   <Box sx={{ maxWidth: 600, mx: "auto", textAlign: "left", mb: 4 }}>
                                        <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                                             After verifying your email, you can:
                                        </Typography>

                                        <List>
                                             <ListItem>
                                                  <ListItemIcon>
                                                       <PersonIcon color="primary" />
                                                  </ListItemIcon>
                                                  <ListItemText
                                                       primary="Sign in and Set Up Your Profile"
                                                       secondary="Add your personal information and preferences to customize your experience."
                                                  />
                                             </ListItem>

                                             <ListItem>
                                                  <ListItemIcon>
                                                       <AttachMoneyIcon color="primary" />
                                                  </ListItemIcon>
                                                  <ListItemText
                                                       primary="Purchase a subscription"
                                                       secondary="Choose a plan that fits your needs and join our community."
                                                  />
                                             </ListItem>

                                             <ListItem>
                                                  <ListItemIcon>
                                                       <BiotechIcon color="primary" />
                                                  </ListItemIcon>
                                                  <ListItemText
                                                       primary="Get a Free Trial"
                                                       secondary="Try our service for free and explore its features."
                                                  />
                                             </ListItem>
                                        </List>
                                   </Box>

                                   <Box sx={{ display: "flex", justifyContent: "center", gap: 2, flexWrap: "wrap" }}>
                                        <Button variant="outlined" component={Link} href="/">
                                             Return to Home Page
                                        </Button>
                                        <Button variant="outlined" component={Link} href="/contact">
                                             Contact Support
                                        </Button>
                                   </Box>
                              </Paper>
                         </Container>
                    </Box>
               </Animate>
          </Box>
     )
}

