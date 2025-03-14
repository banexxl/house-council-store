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
import HomeIcon from "@mui/icons-material/Home"
import SettingsIcon from "@mui/icons-material/Settings"
import EmailIcon from "@mui/icons-material/Email"

export const RegistrationConfirmedPage = () => {
     return (
          <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
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
                                   Welcome to HouseCouncil!
                              </Typography>

                              <Typography variant="body1" paragraph sx={{ maxWidth: 600, mx: "auto" }}>
                                   Your account has been successfully created. We've sent a confirmation email to your inbox. Please check
                                   your email and verify your account to access all features.
                              </Typography>

                              <Alert severity="info" sx={{ maxWidth: 600, mx: "auto", mb: 4, textAlign: "left" }}>
                                   <Box sx={{ display: "flex", alignItems: "center" }}>
                                        <EmailIcon sx={{ mr: 1 }} />
                                        <Typography variant="subtitle2">
                                             Please check your inbox and spam folder for the verification email.
                                        </Typography>
                                   </Box>
                              </Alert>

                              <Box sx={{ my: 4 }}>
                                   <Button
                                        variant="contained"
                                        size="large"
                                        component={Link}
                                        href="/login"
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
                                                  primary="Complete Your Profile"
                                                  secondary="Add your personal information and preferences to customize your experience."
                                             />
                                        </ListItem>

                                        <ListItem>
                                             <ListItemIcon>
                                                  <HomeIcon color="primary" />
                                             </ListItemIcon>
                                             <ListItemText
                                                  primary="Set Up Your Community"
                                                  secondary="Add your residential community details or join an existing one."
                                             />
                                        </ListItem>

                                        <ListItem>
                                             <ListItemIcon>
                                                  <SettingsIcon color="primary" />
                                             </ListItemIcon>
                                             <ListItemText
                                                  primary="Configure Notifications"
                                                  secondary="Choose how and when you want to receive updates from your community."
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
          </Box>
     )
}

