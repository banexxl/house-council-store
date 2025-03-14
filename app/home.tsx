// app/client/HomePage.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import {
     Box,
     Button,
     Card,
     CardContent,
     Container,
     Typography,
     Avatar
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import PeopleIcon from "@mui/icons-material/People";
import ShieldIcon from "@mui/icons-material/Shield";
import NotificationsIcon from "@mui/icons-material/Notifications";
import { Toaster } from "react-hot-toast";

export default function HomePage() {
     return (
          <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
               <Box component="main">
                    {/* Hero Section */}
                    <Box sx={{ py: { xs: 8, md: 12, lg: 16 } }}>
                         <Container maxWidth="lg">
                              <Grid container spacing={6} alignItems="center">
                                   <Grid size={{ xs: 12, md: 6 }}>
                                        <Typography variant="h1" gutterBottom>
                                             Simplify Your House Council Management
                                        </Typography>
                                        <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
                                             Our app streamlines communication, decision-making, and financial management for residential communities.
                                        </Typography>
                                        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                                             <Link href="/pricing" style={{ textDecoration: "none" }}>
                                                  <Button variant="contained" size="large" endIcon={<ArrowForwardIcon />}>
                                                       Get Started
                                                  </Button>
                                             </Link>
                                             <Link href="/docs" style={{ textDecoration: "none" }}>
                                                  <Button variant="outlined" size="large">
                                                       Learn More
                                                  </Button>
                                             </Link>
                                        </Box>
                                   </Grid>
                                   <Grid size={{ xs: 12, md: 6 }} sx={{ display: "flex", justifyContent: "center" }}>
                                        <Box sx={{ position: "relative", width: "100%", height: { xs: 300, md: 400 } }}>
                                             <Image
                                                  src="/placeholder.svg?height=550&width=450"
                                                  alt="Hero Image"
                                                  fill
                                                  style={{ objectFit: "contain", borderRadius: "12px" }}
                                             />
                                        </Box>
                                   </Grid>
                              </Grid>
                         </Container>
                    </Box>

                    {/* Features Section */}
                    <Box sx={{ py: { xs: 8, md: 12 }, bgcolor: "secondary.main" }}>
                         <Container maxWidth="lg">
                              <Box sx={{ textAlign: "center", mb: 8 }}>
                                   <Typography variant="h2" gutterBottom>
                                        Key Features
                                   </Typography>
                                   <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 800, mx: "auto" }}>
                                        Everything you need to manage your residential community efficiently
                                   </Typography>
                              </Box>

                              <Grid container spacing={4} justifyContent="center">
                                   <Grid size={{ xs: 12, md: 4 }}>
                                        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-start", height: "100%" }}>
                                             <Avatar sx={{ bgcolor: "primary.main", mb: 2, width: 56, height: 56 }}>
                                                  <PeopleIcon />
                                             </Avatar>
                                             <Typography variant="h5" gutterBottom>
                                                  Community Engagement
                                             </Typography>
                                             <Typography variant="body1" color="text.secondary">
                                                  Foster better communication between residents and council members with our intuitive platform.
                                             </Typography>
                                        </Box>
                                   </Grid>

                                   <Grid size={{ xs: 12, md: 4 }}>
                                        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-start", height: "100%" }}>
                                             <Avatar sx={{ bgcolor: "primary.main", mb: 2, width: 56, height: 56 }}>
                                                  <ShieldIcon />
                                             </Avatar>
                                             <Typography variant="h5" gutterBottom>
                                                  Transparent Governance
                                             </Typography>
                                             <Typography variant="body1" color="text.secondary">
                                                  Manage decisions, voting, and budgets with complete transparency for all community members.
                                             </Typography>
                                        </Box>
                                   </Grid>

                                   <Grid size={{ xs: 12, md: 4 }}>
                                        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-start", height: "100%" }}>
                                             <Avatar sx={{ bgcolor: "primary.main", mb: 2, width: 56, height: 56 }}>
                                                  <NotificationsIcon />
                                             </Avatar>
                                             <Typography variant="h5" gutterBottom>
                                                  Real-time Notifications
                                             </Typography>
                                             <Typography variant="body1" color="text.secondary">
                                                  Keep everyone informed with instant updates on important community matters and events.
                                             </Typography>
                                        </Box>
                                   </Grid>
                              </Grid>
                         </Container>
                    </Box>

                    {/* Testimonials Section */}
                    <Box sx={{ py: { xs: 8, md: 12 } }}>
                         <Container maxWidth="lg">
                              <Box sx={{ textAlign: "center", mb: 8 }}>
                                   <Typography variant="h2" gutterBottom>
                                        Trusted by Communities
                                   </Typography>
                                   <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 800, mx: "auto" }}>
                                        Join hundreds of residential communities already using our platform
                                   </Typography>
                              </Box>

                              <Grid container spacing={4}>
                                   <Grid size={{ xs: 12, md: 4 }}>
                                        <Card sx={{ height: "100%" }}>
                                             <CardContent>
                                                  <Typography variant="body1" color="text.secondary">
                                                       "HouseCouncil has transformed how we manage our building. Communication is seamless, and our residents are more engaged than ever."
                                                  </Typography>
                                                  <Box sx={{ display: "flex", alignItems: "center", mt: 2 }}>
                                                       <Avatar sx={{ bgcolor: "secondary.main", mr: 2 }} />
                                                       <Box>
                                                            <Typography variant="subtitle2">Sarah Johnson</Typography>
                                                            <Typography variant="caption" color="text.secondary">
                                                                 Council President, Oakwood Residences
                                                            </Typography>
                                                       </Box>
                                                  </Box>
                                             </CardContent>
                                        </Card>
                                   </Grid>

                                   <Grid size={{ xs: 12, md: 4 }}>
                                        <Card sx={{ height: "100%" }}>
                                             <CardContent>
                                                  <Typography variant="body1" color="text.secondary">
                                                       "The financial tracking features have made our budget management transparent and efficient. Highly recommended!"
                                                  </Typography>
                                                  <Box sx={{ display: "flex", alignItems: "center", mt: 2 }}>
                                                       <Avatar sx={{ bgcolor: "secondary.main", mr: 2 }} />
                                                       <Box>
                                                            <Typography variant="subtitle2">Michael Chen</Typography>
                                                            <Typography variant="caption" color="text.secondary">
                                                                 Treasurer, Riverside Apartments
                                                            </Typography>
                                                       </Box>
                                                  </Box>
                                             </CardContent>
                                        </Card>
                                   </Grid>

                                   <Grid size={{ xs: 12, md: 4 }}>
                                        <Card sx={{ height: "100%" }}>
                                             <CardContent>
                                                  <Typography variant="body1" color="text.secondary">
                                                       "Setting up voting for important decisions used to be a nightmare. Now it's just a few clicks away!"
                                                  </Typography>
                                                  <Box sx={{ display: "flex", alignItems: "center", mt: 2 }}>
                                                       <Avatar sx={{ bgcolor: "secondary.main", mr: 2 }} />
                                                       <Box>
                                                            <Typography variant="subtitle2">Elena Rodriguez</Typography>
                                                            <Typography variant="caption" color="text.secondary">
                                                                 Secretary, Sunset Condominiums
                                                            </Typography>
                                                       </Box>
                                                  </Box>
                                             </CardContent>
                                        </Card>
                                   </Grid>
                              </Grid>
                         </Container>
                    </Box>

                    {/* CTA Section */}
                    <Box sx={{ py: { xs: 8, md: 12 }, bgcolor: "secondary.main" }}>
                         <Container maxWidth="sm" sx={{ textAlign: "center" }}>
                              <Typography variant="h3" gutterBottom>
                                   Ready to Get Started?
                              </Typography>
                              <Typography variant="h6" color="text.secondary" paragraph>
                                   Join hundreds of communities already using HouseCouncil
                              </Typography>
                              <Link href="/pricing" style={{ textDecoration: "none" }}>
                                   <Button variant="contained" size="large" fullWidth sx={{ maxWidth: 300, mb: 2 }}>
                                        View Pricing Plans
                                   </Button>
                              </Link>
                              <Typography variant="caption" color="text.secondary">
                                   Free trial available. No credit card required.
                              </Typography>
                         </Container>
                    </Box>

                    <Toaster />
               </Box>
          </Box>
     );
}
