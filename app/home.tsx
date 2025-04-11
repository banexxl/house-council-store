"use client"

import Image from "next/image"
import Link from "next/link"
import { useState, useEffect, useRef } from "react"
import { Box, Button, Card, CardContent, Container, Grid, Typography, Avatar } from "@mui/material"
import ArrowForwardIcon from "@mui/icons-material/ArrowForward"
import PeopleIcon from "@mui/icons-material/People"
import ShieldIcon from "@mui/icons-material/Shield"
import NotificationsIcon from "@mui/icons-material/Notifications"
import PaymentsIcon from "@mui/icons-material/Payments"
import EventIcon from "@mui/icons-material/Event"
import BarChartIcon from "@mui/icons-material/BarChart"

export default function HomePage() {
     const [isMounted, setIsMounted] = useState(false)
     const [scrollY, setScrollY] = useState(0)

     // Refs for parallax sections
     const heroRef = useRef<HTMLDivElement>(null)
     const featuresRef = useRef<HTMLDivElement>(null)
     const testimonialsRef = useRef<HTMLDivElement>(null)
     const ctaRef = useRef<HTMLDivElement>(null)

     // Set isMounted to true when component mounts
     useEffect(() => {
          setIsMounted(true)

          const handleScroll = () => {
               setScrollY(window.scrollY)
          }

          window.addEventListener("scroll", handleScroll, { passive: true })
          return () => window.removeEventListener("scroll", handleScroll)
     }, [])

     // Calculate parallax effects
     const heroParallax = scrollY * 0.4
     const featuresParallax = (scrollY - (featuresRef.current?.offsetTop || 0)) * 0.2
     const testimonialsParallax = (scrollY - (testimonialsRef.current?.offsetTop || 0)) * 0.1

     return (
          <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh", overflow: "hidden" }}>
               <Box component="main" sx={{ flexGrow: 1 }}>
                    {/* Hero Section with Parallax */}
                    <Box
                         ref={heroRef}
                         sx={{
                              py: { xs: 8, md: 12, lg: 16 },
                              position: "relative",
                              overflow: "hidden",
                              "&::before": {
                                   content: '""',
                                   position: "absolute",
                                   top: 0,
                                   left: 0,
                                   right: 0,
                                   bottom: 0,
                                   backgroundImage:
                                        "url(https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=1973&auto=format&fit=crop)",
                                   backgroundSize: "cover",
                                   backgroundPosition: "center",
                                   opacity: 0.25, // Increased opacity from 0.15 to 0.25
                                   transform: `translateY(${heroParallax}px)`,
                                   zIndex: -1,
                              },
                         }}
                    >
                         <Container maxWidth="lg">
                              <Grid container spacing={6} alignItems="center">
                                   <Grid item xs={12} md={6}>
                                        <Box
                                             sx={{
                                                  transform: `translateY(${-heroParallax * 0.2}px)`,
                                                  backgroundColor: "rgba(255, 255, 255, 0.85)", // Semi-transparent white background
                                                  p: 3,
                                                  borderRadius: 2,
                                                  backdropFilter: "blur(5px)",
                                             }}
                                        >
                                             <Typography variant="h1" gutterBottom>
                                                  Simplify Your House Council Management
                                             </Typography>
                                             <Typography variant="h6" color="text.secondary" paragraph sx={{ mb: 4 }}>
                                                  Our app streamlines communication, decision-making, and financial management for residential
                                                  communities.
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
                                        </Box>
                                   </Grid>
                                   <Grid item xs={12} md={6} sx={{ display: "flex", justifyContent: "center" }}>
                                        <Box
                                             sx={{
                                                  position: "relative",
                                                  width: "100%",
                                                  height: { xs: 300, md: 400 },
                                                  transform: `translateY(${-heroParallax * 0.3}px)`,
                                                  transition: "transform 0.1s ease-out",
                                             }}
                                        >
                                             <Image
                                                  src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop"
                                                  alt="Dashboard Mockup"
                                                  fill
                                                  style={{ objectFit: "contain", borderRadius: "12px" }}
                                             />
                                        </Box>
                                   </Grid>
                              </Grid>
                         </Container>
                    </Box>

                    {/* Features Section with Parallax */}
                    <Box
                         ref={featuresRef}
                         sx={{
                              py: { xs: 8, md: 12 },
                              bgcolor: "rgba(241, 243, 244, 0.8)", // Semi-transparent background instead of solid secondary.main
                              position: "relative",
                              overflow: "hidden",
                              "&::before": {
                                   content: '""',
                                   position: "absolute",
                                   top: 0,
                                   left: 0,
                                   right: 0,
                                   bottom: 0,
                                   backgroundImage:
                                        "url(https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop)",
                                   backgroundSize: "cover",
                                   backgroundPosition: "center",
                                   opacity: 0.2, // Increased opacity from 0.05 to 0.2
                                   transform: isMounted && featuresRef.current ? `translateY(${featuresParallax}px)` : "none",
                                   zIndex: 0,
                              },
                         }}
                    >
                         <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
                              <Box
                                   sx={{
                                        textAlign: "center",
                                        mb: 8,
                                        backgroundColor: "rgba(255, 255, 255, 0.85)",
                                        p: 3,
                                        borderRadius: 2,
                                        backdropFilter: "blur(5px)",
                                   }}
                              >
                                   <Typography variant="h2" gutterBottom>
                                        Key Features
                                   </Typography>
                                   <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 800, mx: "auto" }}>
                                        Everything you need to manage your residential community efficiently
                                   </Typography>
                              </Box>

                              <Grid container spacing={4} justifyContent="center">
                                   <Grid item xs={12} md={4}>
                                        <Box
                                             sx={{
                                                  display: "flex",
                                                  flexDirection: "column",
                                                  alignItems: "flex-start",
                                                  height: "100%",
                                                  transform: isMounted && featuresRef.current ? `translateY(${-featuresParallax * 0.3}px)` : "none",
                                                  transition: "transform 0.1s ease-out",
                                                  backgroundColor: "rgba(255, 255, 255, 0.85)",
                                                  p: 3,
                                                  borderRadius: 2,
                                                  backdropFilter: "blur(5px)",
                                             }}
                                        >
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

                                   <Grid item xs={12} md={4}>
                                        <Box
                                             sx={{
                                                  display: "flex",
                                                  flexDirection: "column",
                                                  alignItems: "flex-start",
                                                  height: "100%",
                                                  transform: isMounted && featuresRef.current ? `translateY(${-featuresParallax * 0.5}px)` : "none",
                                                  transition: "transform 0.1s ease-out",
                                                  backgroundColor: "rgba(255, 255, 255, 0.85)",
                                                  p: 3,
                                                  borderRadius: 2,
                                                  backdropFilter: "blur(5px)",
                                             }}
                                        >
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

                                   <Grid item xs={12} md={4}>
                                        <Box
                                             sx={{
                                                  display: "flex",
                                                  flexDirection: "column",
                                                  alignItems: "flex-start",
                                                  height: "100%",
                                                  transform: isMounted && featuresRef.current ? `translateY(${-featuresParallax * 0.7}px)` : "none",
                                                  transition: "transform 0.1s ease-out",
                                                  backgroundColor: "rgba(255, 255, 255, 0.85)",
                                                  p: 3,
                                                  borderRadius: 2,
                                                  backdropFilter: "blur(5px)",
                                             }}
                                        >
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

                              {/* Additional Features */}
                              <Grid container spacing={4} justifyContent="center" sx={{ mt: 4 }}>
                                   <Grid item xs={12} md={4}>
                                        <Box
                                             sx={{
                                                  display: "flex",
                                                  flexDirection: "column",
                                                  alignItems: "flex-start",
                                                  height: "100%",
                                                  transform: isMounted && featuresRef.current ? `translateY(${-featuresParallax * 0.4}px)` : "none",
                                                  transition: "transform 0.1s ease-out",
                                                  backgroundColor: "rgba(255, 255, 255, 0.85)",
                                                  p: 3,
                                                  borderRadius: 2,
                                                  backdropFilter: "blur(5px)",
                                             }}
                                        >
                                             <Avatar sx={{ bgcolor: "primary.main", mb: 2, width: 56, height: 56 }}>
                                                  <PaymentsIcon />
                                             </Avatar>
                                             <Typography variant="h5" gutterBottom>
                                                  Financial Management
                                             </Typography>
                                             <Typography variant="body1" color="text.secondary">
                                                  Track expenses, manage budgets, and handle payments with our comprehensive financial tools.
                                             </Typography>
                                        </Box>
                                   </Grid>

                                   <Grid item xs={12} md={4}>
                                        <Box
                                             sx={{
                                                  display: "flex",
                                                  flexDirection: "column",
                                                  alignItems: "flex-start",
                                                  height: "100%",
                                                  transform: isMounted && featuresRef.current ? `translateY(${-featuresParallax * 0.6}px)` : "none",
                                                  transition: "transform 0.1s ease-out",
                                                  backgroundColor: "rgba(255, 255, 255, 0.85)",
                                                  p: 3,
                                                  borderRadius: 2,
                                                  backdropFilter: "blur(5px)",
                                             }}
                                        >
                                             <Avatar sx={{ bgcolor: "primary.main", mb: 2, width: 56, height: 56 }}>
                                                  <EventIcon />
                                             </Avatar>
                                             <Typography variant="h5" gutterBottom>
                                                  Event Scheduling
                                             </Typography>
                                             <Typography variant="body1" color="text.secondary">
                                                  Plan and organize community events, meetings, and maintenance schedules with ease.
                                             </Typography>
                                        </Box>
                                   </Grid>

                                   <Grid item xs={12} md={4}>
                                        <Box
                                             sx={{
                                                  display: "flex",
                                                  flexDirection: "column",
                                                  alignItems: "flex-start",
                                                  height: "100%",
                                                  transform: isMounted && featuresRef.current ? `translateY(${-featuresParallax * 0.8}px)` : "none",
                                                  transition: "transform 0.1s ease-out",
                                                  backgroundColor: "rgba(255, 255, 255, 0.85)",
                                                  p: 3,
                                                  borderRadius: 2,
                                                  backdropFilter: "blur(5px)",
                                             }}
                                        >
                                             <Avatar sx={{ bgcolor: "primary.main", mb: 2, width: 56, height: 56 }}>
                                                  <BarChartIcon />
                                             </Avatar>
                                             <Typography variant="h5" gutterBottom>
                                                  Analytics & Reporting
                                             </Typography>
                                             <Typography variant="body1" color="text.secondary">
                                                  Gain insights into community trends with detailed analytics and customizable reports.
                                             </Typography>
                                        </Box>
                                   </Grid>
                              </Grid>
                         </Container>
                    </Box>

                    {/* Testimonials Section with Parallax */}
                    <Box
                         ref={testimonialsRef}
                         sx={{
                              py: { xs: 8, md: 12 },
                              position: "relative",
                              overflow: "hidden",
                              "&::before": {
                                   content: '""',
                                   position: "absolute",
                                   top: 0,
                                   left: 0,
                                   right: 0,
                                   bottom: 0,
                                   backgroundImage:
                                        "url(https://images.unsplash.com/photo-1573497620053-ea5300f94f21?q=80&w=2070&auto=format&fit=crop)",
                                   backgroundSize: "cover",
                                   backgroundPosition: "center",
                                   opacity: 0.15, // Increased opacity from 0.05 to 0.15
                                   transform: isMounted && testimonialsRef.current ? `translateY(${testimonialsParallax}px)` : "none",
                                   zIndex: -1,
                              },
                         }}
                    >
                         <Container maxWidth="lg">
                              <Box
                                   sx={{
                                        textAlign: "center",
                                        mb: 8,
                                        backgroundColor: "rgba(255, 255, 255, 0.85)",
                                        p: 3,
                                        borderRadius: 2,
                                        backdropFilter: "blur(5px)",
                                   }}
                              >
                                   <Typography variant="h2" gutterBottom>
                                        Trusted by Communities
                                   </Typography>
                                   <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 800, mx: "auto" }}>
                                        Join hundreds of residential communities already using our platform
                                   </Typography>
                              </Box>

                              <Grid container spacing={4}>
                                   <Grid item xs={12} md={4}>
                                        <Card
                                             sx={{
                                                  height: "100%",
                                                  transform:
                                                       isMounted && testimonialsRef.current ? `translateY(${-testimonialsParallax * 0.3}px)` : "none",
                                                  transition: "transform 0.1s ease-out",
                                                  backgroundColor: "rgba(255, 255, 255, 0.9)", // Semi-transparent card
                                                  backdropFilter: "blur(5px)",
                                             }}
                                        >
                                             <CardContent>
                                                  <Typography variant="body1" color="text.secondary" paragraph>
                                                       "HouseCouncil has transformed how we manage our building. Communication is seamless, and our
                                                       residents are more engaged than ever."
                                                  </Typography>
                                                  <Box sx={{ display: "flex", alignItems: "center", mt: 2 }}>
                                                       <Avatar
                                                            src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1974&auto=format&fit=crop"
                                                            sx={{ bgcolor: "secondary.main", mr: 2 }}
                                                       />
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

                                   <Grid item xs={12} md={4}>
                                        <Card
                                             sx={{
                                                  height: "100%",
                                                  transform:
                                                       isMounted && testimonialsRef.current ? `translateY(${-testimonialsParallax * 0.5}px)` : "none",
                                                  transition: "transform 0.1s ease-out",
                                                  backgroundColor: "rgba(255, 255, 255, 0.9)", // Semi-transparent card
                                                  backdropFilter: "blur(5px)",
                                             }}
                                        >
                                             <CardContent>
                                                  <Typography variant="body1" color="text.secondary" paragraph>
                                                       "The financial tracking features have made our budget management transparent and efficient. Highly
                                                       recommended!"
                                                  </Typography>
                                                  <Box sx={{ display: "flex", alignItems: "center", mt: 2 }}>
                                                       <Avatar
                                                            src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1974&auto=format&fit=crop"
                                                            sx={{ bgcolor: "secondary.main", mr: 2 }}
                                                       />
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

                                   <Grid item xs={12} md={4}>
                                        <Card
                                             sx={{
                                                  height: "100%",
                                                  transform:
                                                       isMounted && testimonialsRef.current ? `translateY(${-testimonialsParallax * 0.7}px)` : "none",
                                                  transition: "transform 0.1s ease-out",
                                                  backgroundColor: "rgba(255, 255, 255, 0.9)", // Semi-transparent card
                                                  backdropFilter: "blur(5px)",
                                             }}
                                        >
                                             <CardContent>
                                                  <Typography variant="body1" color="text.secondary" paragraph>
                                                       "Setting up voting for important decisions used to be a nightmare. Now it's just a few clicks
                                                       away!"
                                                  </Typography>
                                                  <Box sx={{ display: "flex", alignItems: "center", mt: 2 }}>
                                                       <Avatar
                                                            src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?q=80&w=1974&auto=format&fit=crop"
                                                            sx={{ bgcolor: "secondary.main", mr: 2 }}
                                                       />
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

                    {/* CTA Section with Parallax */}
                    <Box
                         ref={ctaRef}
                         sx={{
                              py: { xs: 8, md: 12 },
                              bgcolor: "rgba(241, 243, 244, 0.7)", // Semi-transparent background instead of solid secondary.main
                              position: "relative",
                              overflow: "hidden",
                              "&::before": {
                                   content: '""',
                                   position: "absolute",
                                   top: 0,
                                   left: 0,
                                   right: 0,
                                   bottom: 0,
                                   backgroundImage:
                                        "url(https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=2070&auto=format&fit=crop)",
                                   backgroundSize: "cover",
                                   backgroundPosition: "center",
                                   opacity: 0.25, // Increased opacity from 0.05 to 0.25
                                   zIndex: 0,
                              },
                         }}
                    >
                         <Container maxWidth="sm" sx={{ textAlign: "center", position: "relative", zIndex: 1 }}>
                              <Box
                                   sx={{
                                        backgroundColor: "rgba(255, 255, 255, 0.85)",
                                        p: 4,
                                        borderRadius: 2,
                                        backdropFilter: "blur(5px)",
                                   }}
                              >
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
                              </Box>
                         </Container>
                    </Box>
               </Box>
          </Box>
     )
}
