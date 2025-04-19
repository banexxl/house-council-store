'use client'

import React, { use } from 'react';
import { Box, Button, Container, Typography, Avatar, Link, Card, CardContent, Grid, useMediaQuery } from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import PeopleIcon from '@mui/icons-material/People';
import ShieldIcon from '@mui/icons-material/Shield';
import NotificationsIcon from '@mui/icons-material/Notifications';
import ParallaxSection from './components/paralax-section';

const LandingPage = () => {

     const isMobile = useMediaQuery(theme => theme.breakpoints.down('sm'));

     return (
          <Box>
               {/* Hero Parallax Section */}
               <ParallaxSection backgroundImage="/background-images/background-image-3.png">
                    <Container maxWidth="lg">
                         <Grid container spacing={6} alignItems="center">
                              <Grid size={{ xs: 12, md: 6 }} >
                                   <Box
                                        sx={{
                                             backgroundColor: 'rgba(255, 255, 255, 0.85)',
                                             p: 3,
                                             borderRadius: 2,
                                             backdropFilter: 'blur(5px)',
                                        }}
                                   >
                                        <Typography variant="h1" gutterBottom>
                                             Simplify Your House Council Management
                                        </Typography>
                                        <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
                                             Our app streamlines communication, decision-making, and financial management for residential
                                             communities.
                                        </Typography>
                                        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                                             <Link href="/pricing" style={{ textDecoration: 'none' }}>
                                                  <Button variant="contained" size="large" endIcon={<ArrowForwardIcon />}>
                                                       Get Started
                                                  </Button>
                                             </Link>
                                             <Link href="/docs" style={{ textDecoration: 'none' }}>
                                                  <Button variant="outlined" size="large">
                                                       Learn More
                                                  </Button>
                                             </Link>
                                        </Box>
                                   </Box>
                              </Grid>
                         </Grid>
                    </Container>
               </ParallaxSection>

               {/* Spacer */}
               <Box sx={{ height: '80px', backgroundColor: '#f7f7f7' }} />

               {/* Features Section */}
               <Container maxWidth="lg" sx={{ py: 10, }}>
                    <Box sx={{ textAlign: 'center', mb: 6 }}>
                         <Typography variant="h2" gutterBottom>
                              Key Features
                         </Typography>
                         <Typography variant="h6" color="text.secondary">
                              Everything you need to manage your residential community efficiently
                         </Typography>
                    </Box>
                    <Grid container spacing={4}>
                         {[
                              {
                                   icon: <PeopleIcon />,
                                   title: 'Community Engagement',
                                   description: 'Foster better communication between residents and council members.',
                              },
                              {
                                   icon: <ShieldIcon />,
                                   title: 'Transparent Governance',
                                   description: 'Manage decisions, voting, and budgets with complete transparency.',
                              },
                              {
                                   icon: <NotificationsIcon />,
                                   title: 'Real-time Notifications',
                                   description: 'Keep everyone informed with instant updates on important matters.',
                              },
                         ].map((feature, index) => (
                              <Grid size={{ xs: 12, md: 4 }} key={index}>
                                   <Box
                                        sx={{
                                             backgroundColor: 'rgba(255,255,255,0.9)',
                                             p: 3,
                                             borderRadius: 2,
                                             backdropFilter: 'blur(5px)',
                                             textAlign: 'left',
                                        }}
                                   >
                                        <Avatar sx={{ bgcolor: 'primary.main', mb: 2 }}>{feature.icon}</Avatar>
                                        <Typography variant="h6" gutterBottom>
                                             {feature.title}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                             {feature.description}
                                        </Typography>
                                   </Box>
                              </Grid>
                         ))}
                    </Grid>
               </Container>

               {/* Parallax Testimonials Section */}
               <ParallaxSection backgroundImage="/background-images/background-image-1.png">
                    <Container maxWidth="lg">
                         <Box sx={{ textAlign: 'center', mb: 6, backgroundColor: 'rgba(255,255,255,0.85)', p: 2, borderRadius: 2 }}>
                              <Typography variant="h4" gutterBottom>
                                   Trusted by Communities
                              </Typography>
                              <Typography variant="h6" color="text.secondary">
                                   Join hundreds of residential communities already using our platform
                              </Typography>
                         </Box>
                         <Grid container spacing={4}>
                              {[
                                   {
                                        name: 'Sarah Johnson',
                                        title: 'Council President, Oakwood Residences',
                                        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1974&auto=format&fit=crop',
                                        quote:
                                             'HouseCouncil has transformed how we manage our building. Communication is seamless, and our residents are more engaged than ever.',
                                   },
                                   {
                                        name: 'Michael Chen',
                                        title: 'Treasurer, Riverside Apartments',
                                        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1974&auto=format&fit=crop',
                                        quote:
                                             'The financial tracking features have made our budget management transparent and efficient. Highly recommended!',
                                   },
                                   {
                                        name: 'Elena Rodriguez',
                                        title: 'Secretary, Sunset Condominiums',
                                        avatar: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?q=80&w=1974&auto=format&fit=crop',
                                        quote:
                                             "Setting up voting for important decisions used to be a nightmare. Now it's just a few clicks away!",
                                   },
                              ].map((testimonial, index) => (
                                   <Grid size={{ xs: 12, md: 4 }} key={index}>
                                        <Card
                                             sx={{
                                                  height: '100%',
                                                  backgroundColor: 'rgba(255,255,255,0.9)',
                                                  backdropFilter: 'blur(5px)',
                                             }}
                                        >
                                             <CardContent>
                                                  <Typography variant="body1" color="text.secondary">
                                                       "{testimonial.quote}"
                                                  </Typography>
                                                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                                                       <Avatar src={testimonial.avatar} sx={{ mr: 2 }} />
                                                       <Box>
                                                            <Typography variant="subtitle2">{testimonial.name}</Typography>
                                                            <Typography variant="caption" color="text.secondary">
                                                                 {testimonial.title}
                                                            </Typography>
                                                       </Box>
                                                  </Box>
                                             </CardContent>
                                        </Card>
                                   </Grid>
                              ))}
                         </Grid>
                    </Container>
               </ParallaxSection>

               <Box sx={{ textAlign: 'center', my: 6, height: isMobile ? 'auto' : '80px' }} >
                    <Typography variant="h2" gutterBottom>
                         Effortless Community Management
                    </Typography>
                    <Typography variant="h6" color="text.secondary">
                         HouseCouncil helps you streamline communication, automate tasks, and build a stronger community.
                    </Typography>
               </Box>


               {/* CTA Parallax Section */}
               <ParallaxSection backgroundImage="/background-images/background-image-4.png" height="80vh">
                    <Container maxWidth="sm" sx={{ textAlign: 'center' }}>
                         <Box
                              sx={{
                                   backgroundColor: 'rgba(255, 255, 255, 0.85)',
                                   p: 4,
                                   borderRadius: 2,
                                   backdropFilter: 'blur(5px)',
                                   display: 'flex',
                                   flexDirection: 'column',
                                   alignItems: 'center',
                                   justifyContent: 'space-between',
                                   gap: 2,
                              }}
                         >
                              <Typography variant="h3" gutterBottom>
                                   Ready to Get Started?
                              </Typography>
                              <Typography variant="h6" color="text.secondary">
                                   Join hundreds of communities already using HouseCouncil
                              </Typography>
                              <Link href="/pricing" style={{ textDecoration: 'none' }}>
                                   <Button variant="contained" size="large" fullWidth sx={{ maxWidth: 300, mb: 2 }}>
                                        View Pricing Plans
                                   </Button>
                              </Link>
                              <Typography variant="caption" color="text.secondary">
                                   Free trial available. No credit card required.
                              </Typography>
                         </Box>
                    </Container>
               </ParallaxSection>
          </Box >
     );
};

export default LandingPage;
