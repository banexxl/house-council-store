'use client';

import React, { useTransition, Suspense, lazy, useEffect, useState } from 'react';
import Image from 'next/image';
import {
     Box,
     Button,
     Container,
     Typography,
     Avatar,
     Grid,
     Chip,
     Stack,
     Divider,
     useTheme,
     useMediaQuery,
     alpha,
} from '@mui/material';
import DashboardCustomizeIcon from '@mui/icons-material/DashboardCustomize';
import ApartmentIcon from '@mui/icons-material/Apartment';
import HowToRegIcon from '@mui/icons-material/HowToReg';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import PhoneIphoneIcon from '@mui/icons-material/PhoneIphone';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import PollIcon from '@mui/icons-material/Poll';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import CircularProgress from '@mui/material/CircularProgress';
import Backdrop from '@mui/material/Backdrop';
import { useRouter } from 'next/navigation';
import { Reveal, Stagger, itemVariants } from './components/motion';
import { motion } from 'framer-motion';

// Import ParallaxSection eagerly (needed for LCP hero image)
import ParallaxSection from './components/paralax-section';
// Lazy load ParticleBackground (decorative, not LCP)
const ParticleBackground = lazy(() => import('./components/particle-background'));

// Motion div component - used conditionally based on showAnimations state
const MotionDiv = motion.div;

const LandingPage = () => {
     const theme = useTheme();
     const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
     const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
     const router = useRouter();
     const [isPending, startTransition] = useTransition();
     const [showAnimations, setShowAnimations] = useState(false);

     // Defer animation loading until page is interactive
     useEffect(() => {
          if ('requestIdleCallback' in window) {
               requestIdleCallback(() => setShowAnimations(true), { timeout: 2000 });
          } else {
               setTimeout(() => setShowAnimations(true), 1000);
          }
     }, []);

     const handleNavClick = (path: string) => {
          startTransition(() => router.push(path));
     };

     const glassSx = {
          backgroundColor: alpha('#FFFFFF', 0.9),
          borderRadius: 4,
          backdropFilter: 'blur(16px)',
          border: '1px solid',
          borderColor: alpha('#FFFFFF', 0.5),
          boxShadow: `0 24px 60px ${alpha(theme.palette.secondary.main, 0.22)}`,
          position: 'relative',
          overflow: 'hidden',
     } as const;

     const liftHoverSx = {
          transition: 'transform 220ms ease, box-shadow 220ms ease, border-color 220ms ease',
          '&:hover': {
               transform: 'translateY(-6px)',
               boxShadow: `0 28px 70px ${alpha(theme.palette.secondary.main, 0.18)}`,
               borderColor: alpha(theme.palette.primary.main, 0.3),
          },
     } as const;

     const chipSx = {
          fontWeight: 700,
          borderRadius: 999,
          height: { xs: 34, sm: 36 },
          bgcolor: alpha('#FFFFFF', 0.14),
          color: 'common.white',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.3)',
          '& .MuiChip-icon': { color: 'common.white' },
     };

     return (
          <Box component="main">
               {/* HERO */}
               <ParallaxSection backgroundImage="/background-images/hero-tower.jpg" height={{ xs: '100vh', md: 'calc(100vh - 72px)' }} priority={true}>
                    <Box
                         sx={{
                              position: 'absolute',
                              inset: 0,
                              background:
                                   `linear-gradient(115deg, ${alpha(theme.palette.secondary.dark, 0.82)} 0%, ${alpha(theme.palette.secondary.main, 0.5)} 42%, ${alpha(theme.palette.secondary.dark, 0.28)} 100%)`,
                         }}
                    />
                    <Container
                         maxWidth="lg"
                         sx={{
                              position: 'relative',
                              zIndex: 1,
                              minHeight: '100%',
                              display: 'flex',
                              alignItems: 'center',
                              py: { xs: 6, md: 0 },
                         }}
                    >
                         <Grid container spacing={{ xs: 3, sm: 4, md: 6 }} alignItems="center">
                              <Grid size={{ xs: 12, md: 7 }}>
                                   <Reveal>
                                        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 3 }}>
                                             <Chip icon={<DashboardCustomizeIcon />} label="Web dashboard" sx={chipSx} />
                                             <Chip icon={<PhoneIphoneIcon />} label="Mobile app" sx={chipSx} />
                                             <Chip icon={<ApartmentIcon />} label="Per apartment pricing" sx={chipSx} />
                                        </Stack>
                                   </Reveal>

                                   <Reveal delay={0.05} y={22}>
                                        <Typography
                                             component="h1"
                                             variant={isMobile ? 'h3' : 'h1'}
                                             sx={{
                                                  color: 'common.white',
                                                  lineHeight: 1.08,
                                                  fontSize: { xs: '2.1rem', sm: '2.6rem', md: undefined },
                                                  overflowWrap: 'anywhere',
                                                  wordBreak: 'break-word',
                                             }}
                                        >
                                             Building Management Software for Apartments &amp; Housing Communities
                                        </Typography>
                                   </Reveal>

                                   <Reveal delay={0.12} y={18}>
                                        <Typography
                                             variant="h6"
                                             sx={{
                                                  mt: 2.5,
                                                  maxWidth: 620,
                                                  color: alpha('#FFFFFF', 0.86),
                                                  fontWeight: 500,
                                                  fontSize: { xs: '1rem', sm: '1.05rem', md: undefined },
                                                  lineHeight: 1.6,
                                                  overflowWrap: 'anywhere',
                                             }}
                                        >
                                             NestLink is a building management software platform designed for apartment buildings, housing communities, and property managers. It helps manage tenants, communication, maintenance requests, announcements, and voting — all in one centralized system with role-based access.
                                        </Typography>
                                   </Reveal>

                                   <Reveal delay={0.18} y={12}>
                                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mt: 4 }}>
                                             <Button
                                                  variant="contained"
                                                  size="large"
                                                  onClick={() => handleNavClick('/pricing')}
                                                  sx={{ minHeight: 50 }}
                                             >
                                                  See Pricing
                                             </Button>
                                             <Button
                                                  variant="outlined"
                                                  size="large"
                                                  onClick={() => handleNavClick('/docs')}
                                                  sx={{
                                                       minHeight: 50,
                                                       color: 'common.white',
                                                       borderColor: alpha('#FFFFFF', 0.5),
                                                       '&:hover': { borderColor: 'common.white', bgcolor: alpha('#FFFFFF', 0.08) },
                                                  }}
                                             >
                                                  How it works
                                             </Button>
                                        </Stack>
                                   </Reveal>
                              </Grid>

                              <Grid size={{ xs: 12, md: 5 }}>
                                   <Reveal delay={0.15} x={18}>
                                        <Box sx={{ ...glassSx, ...liftHoverSx, p: { xs: 2.5, sm: 3 } }}>
                                             <Typography variant="h6" sx={{ mb: 2 }}>
                                                  Designed for two roles
                                             </Typography>

                                             <Stack spacing={2}>
                                                  {[
                                                       {
                                                            icon: <AdminPanelSettingsIcon />,
                                                            title: 'Building manager',
                                                            text:
                                                                 'Purchases the subscription, manages buildings & apartments, invites tenants, configures permissions and workflows.',
                                                       },
                                                       {
                                                            icon: <HowToRegIcon />,
                                                            title: 'Tenants',
                                                            text:
                                                                 'Tenant permissions on web and mobile — participate in polls, read announcements, engage with posts, and submit service requests.',
                                                       },
                                                  ].map((r, idx, arr) => (
                                                       <Box key={idx} sx={{ minWidth: 0 }}>
                                                            <Stack direction="row" spacing={2} alignItems="flex-start">
                                                                 <Avatar sx={{ bgcolor: 'primary.main' }}>{r.icon}</Avatar>
                                                                 <Box sx={{ minWidth: 0 }}>
                                                                      <Typography variant="subtitle1" sx={{ fontWeight: 800, overflowWrap: 'anywhere' }}>
                                                                           {r.title}
                                                                      </Typography>
                                                                      <Typography variant="body2" color="text.secondary" sx={{ overflowWrap: 'anywhere' }}>
                                                                           {r.text}
                                                                      </Typography>
                                                                 </Box>
                                                            </Stack>
                                                            {idx === 0 && (
                                                                 <Divider sx={{ my: 2 }}>
                                                                      <Typography variant="subtitle1" sx={{ fontWeight: 900, textAlign: 'center', my: 0 }}>
                                                                           And
                                                                      </Typography>
                                                                 </Divider>
                                                            )}
                                                       </Box>
                                                  ))}
                                             </Stack>
                                        </Box>
                                   </Reveal>
                              </Grid>
                         </Grid>
                    </Container>
               </ParallaxSection>

               {/* FEATURES — particle background on desktop */}
               <Box
                    component="section"
                    sx={{
                         position: 'relative',
                         overflow: 'hidden',
                         background: `radial-gradient(ellipse 80% 60% at 50% 40%, ${alpha(theme.palette.primary.light, 0.08)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 45%, transparent 100%)`,
                    }}
               >
                    {isDesktop && (
                         <Suspense fallback={null}>
                              <ParticleBackground />
                         </Suspense>
                    )}
                    <Container
                         maxWidth="lg"
                         sx={{
                              pt: { xs: 8, sm: 9, md: 10 },
                              pb: { xs: 7, md: 10 },
                              position: 'relative',
                              zIndex: 1,
                         }}
                    >
                         <Reveal>
                              <Box sx={{ textAlign: 'center', mb: { xs: 6, md: 7 }, px: { xs: 1, sm: 0 } }}>
                                   <Typography
                                        variant="h2"
                                        component="h2"
                                        sx={{
                                             fontSize: { xs: '1.8rem', sm: '2.4rem', md: undefined },
                                             mb: 2.5,
                                             overflowWrap: 'anywhere',
                                        }}
                                   >
                                        Everything you need to run a modern building community
                                   </Typography>

                                   <Typography
                                        variant="h6"
                                        color="text.secondary"
                                        sx={{
                                             maxWidth: 860,
                                             mx: 'auto',
                                             fontWeight: 500,
                                             fontSize: { xs: '1rem', sm: '1.05rem', md: undefined },
                                             lineHeight: 1.65,
                                             overflowWrap: 'anywhere',
                                        }}
                                   >
                                        NestLink is a web dashboard + mobile app built around real building workflows: communication, governance, and
                                        service/incident reporting — with clear roles and permissions.
                                   </Typography>
                              </Box>
                         </Reveal>

                         <Stagger>
                              <Grid container spacing={3}>
                                   {[
                                        {
                                             icon: <DashboardCustomizeIcon />,
                                             title: 'Building Manager Dashboard (Web)',
                                             description:
                                                  'Manage buildings, apartments, and tenants. Configure roles, create announcements, run polls, and track service issues in one place.',
                                        },
                                        {
                                             icon: <PhoneIphoneIcon />,
                                             title: 'Tenant App (Mobile)',
                                             description:
                                                  'Tenants get the same tenant authorizations as on the web, optimized for quick actions and notifications.',
                                        },
                                        {
                                             icon: <CameraAltIcon />,
                                             title: 'Camera for Incident / Service Reports',
                                             description:
                                                  'On mobile, tenants can capture photos and submit reports instantly, so issues are documented clearly and resolved faster.',
                                        },
                                        {
                                             icon: <PollIcon />,
                                             title: 'Voting & Decisions',
                                             description:
                                                  'Create polls, collect votes, and keep decisions transparent. Great for budgets, repairs, and building-wide agreements.',
                                        },
                                        {
                                             icon: <NotificationsActiveIcon />,
                                             title: 'Real-time Updates',
                                             description:
                                                  'Notify tenants and clients about announcements, vote openings/closures, and new incident progress — without chaos in messaging apps.',
                                        },
                                   ].map((item, idx) => (
                                        <Grid key={idx} size={{ xs: 12, sm: 6, md: 4 }}>
                                             {showAnimations ? (
                                                  <Suspense fallback={<Box sx={{ p: 3, height: '100%' }} />}>
                                                       <MotionDiv variants={itemVariants} style={{ height: '100%' }}>
                                                            <Box
                                                                 sx={{
                                                                      p: 3,
                                                                      height: '100%',
                                                                      minWidth: 0,
                                                                      bgcolor: 'background.paper',
                                                                      borderRadius: 4,
                                                                      border: '1px solid',
                                                                      borderColor: alpha(theme.palette.secondary.main, 0.08),
                                                                      boxShadow: `0 12px 34px ${alpha(theme.palette.secondary.main, 0.06)}`,
                                                                      ...liftHoverSx,
                                                                 }}
                                                            >
                                                                 <Avatar sx={{ bgcolor: 'primary.main', mb: 2 }}>{item.icon}</Avatar>
                                                                 <Typography component="h3" variant="h6" gutterBottom sx={{ overflowWrap: 'anywhere' }}>
                                                                      {item.title}
                                                                 </Typography>
                                                                 <Typography variant="body2" color="text.secondary" sx={{ overflowWrap: 'anywhere' }}>
                                                                      {item.description}
                                                                 </Typography>
                                                            </Box>
                                                       </MotionDiv>
                                                  </Suspense>
                                             ) : (
                                                  <Box
                                                       sx={{
                                                            p: 3,
                                                            height: '100%',
                                                            minWidth: 0,
                                                            bgcolor: 'background.paper',
                                                            borderRadius: 4,
                                                            border: '1px solid',
                                                            borderColor: alpha(theme.palette.secondary.main, 0.08),
                                                            boxShadow: `0 12px 34px ${alpha(theme.palette.secondary.main, 0.06)}`,
                                                            ...liftHoverSx,
                                                       }}
                                                  >
                                                       <Avatar sx={{ bgcolor: 'primary.main', mb: 2 }}>{item.icon}</Avatar>
                                                       <Typography component="h3" variant="h6" gutterBottom sx={{ overflowWrap: 'anywhere' }}>
                                                            {item.title}
                                                       </Typography>
                                                       <Typography variant="body2" color="text.secondary" sx={{ overflowWrap: 'anywhere' }}>
                                                            {item.description}
                                                       </Typography>
                                                  </Box>
                                             )}
                                        </Grid>
                                   ))}
                              </Grid>
                         </Stagger>
                    </Container>
               </Box>

               {/* PRODUCT WORKFLOWS (WITH BACKGROUND IMAGE) */}
               <Box sx={{ position: 'relative', py: { xs: 8, md: 11 }, overflow: 'hidden' }}>
                    <Image
                         src="/background-images/balcony-building.jpg"
                         alt="Modern apartment building with balconies"
                         fill
                         style={{ objectFit: 'cover', objectPosition: 'center' }}
                         quality={75}
                    />
                    <Box
                         sx={{
                              position: 'absolute',
                              inset: 0,
                              background: `linear-gradient(180deg, ${alpha(theme.palette.secondary.dark, 0.9)} 0%, ${alpha(theme.palette.secondary.main, 0.82)} 45%, ${alpha(theme.palette.secondary.dark, 0.92)} 100%)`,
                         }}
                    />

                    <Box component="section" sx={{ position: 'relative', zIndex: 1 }}>
                         <Container maxWidth="lg">
                              <Reveal>
                                   <Box sx={{ textAlign: 'center', mb: 6 }}>
                                        <Typography
                                             variant="h2"
                                             component="h2"
                                             gutterBottom
                                             sx={{ overflowWrap: 'anywhere', color: 'common.white' }}
                                        >
                                             Built around real building workflows
                                        </Typography>
                                        <Typography
                                             variant="h6"
                                             sx={{
                                                  maxWidth: 860,
                                                  mx: 'auto',
                                                  fontWeight: 500,
                                                  overflowWrap: 'anywhere',
                                                  color: alpha('#FFFFFF', 0.78),
                                             }}
                                        >
                                             Less chaos, fewer phone calls, more clarity. NestLink is structured so every request, decision, and update
                                             has a proper place.
                                        </Typography>
                                   </Box>
                              </Reveal>

                              <Stagger>
                                   <Grid container spacing={3}>
                                        {[
                                             {
                                                  title: 'Announcements that reach everyone',
                                                  description:
                                                       'Post updates to the building and notify tenants instantly—no missed messages or fragmented chat threads.',
                                             },
                                             {
                                                  title: 'Polls with transparent outcomes',
                                                  description:
                                                       'Open votes, track participation, and close polls with clear results that everyone can trust.',
                                             },
                                             {
                                                  title: 'Incident reporting with evidence',
                                                  description:
                                                       'Tenants submit issues with photos, notes, and categories. Clients track progress until resolution.',
                                             },
                                             {
                                                  title: 'Roles and permissions by design',
                                                  description:
                                                       'Clients manage the subscription and configuration, clients moderate and resolve, tenants participate and report.',
                                             },
                                             {
                                                  title: 'Web + mobile, same rules',
                                                  description:
                                                       'Tenant permissions are consistent on both platforms, but the mobile app is optimized for fast actions.',
                                             },
                                             {
                                                  title: 'One source of truth',
                                                  description:
                                                       'Reduce "who said what" and "where is that message?" Everything lives in NestLink, searchable and organized.',
                                             },
                                        ].map((item, idx) => (
                                             <Grid key={idx} size={{ xs: 12, md: 6 }}>
                                                  <Box
                                                       sx={{
                                                            p: 3,
                                                            height: '100%',
                                                            minWidth: 0,
                                                            bgcolor: alpha('#FFFFFF', 0.06),
                                                            backdropFilter: 'blur(10px)',
                                                            borderRadius: 4,
                                                            border: '1px solid',
                                                            borderColor: alpha('#FFFFFF', 0.14),
                                                            transition: 'background-color 200ms ease, border-color 200ms ease',
                                                            '&:hover': {
                                                                 bgcolor: alpha('#FFFFFF', 0.1),
                                                                 borderColor: alpha(theme.palette.primary.main, 0.5),
                                                            },
                                                       }}
                                                  >
                                                       <Typography component="h3" variant="h6" sx={{ fontWeight: 800, overflowWrap: 'anywhere', color: 'common.white' }}>
                                                            {item.title}
                                                       </Typography>
                                                       <Typography variant="body2" sx={{ mt: 1, overflowWrap: 'anywhere', color: alpha('#FFFFFF', 0.72) }}>
                                                            {item.description}
                                                       </Typography>
                                                  </Box>
                                             </Grid>
                                        ))}
                                   </Grid>
                              </Stagger>
                         </Container>
                    </Box>
               </Box>

               {/* PRICING TEASER — particle background on desktop */}
               <Box
                    component="section"
                    sx={{
                         position: 'relative',
                         overflow: 'hidden',
                         background: `radial-gradient(ellipse 80% 60% at 50% 40%, ${alpha(theme.palette.primary.light, 0.08)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 45%, transparent 100%)`,
                    }}
               >
                    {isDesktop && <ParticleBackground />}
                    <Container maxWidth="lg" sx={{ py: { xs: 8, md: 11 }, position: 'relative', zIndex: 1 }}>
                         <Grid container spacing={{ xs: 3, md: 4 }} alignItems="stretch">
                              <Grid size={{ xs: 12, md: 6 }}>
                                   <Reveal>
                                        <Box
                                             sx={{
                                                  p: 4,
                                                  height: '100%',
                                                  bgcolor: 'background.paper',
                                                  borderRadius: 4,
                                                  border: '1px solid',
                                                  borderColor: alpha(theme.palette.secondary.main, 0.08),
                                                  boxShadow: `0 12px 34px ${alpha(theme.palette.secondary.main, 0.06)}`,
                                             }}
                                        >
                                             <Typography variant="h4" sx={{ fontWeight: 800, overflowWrap: 'anywhere' }}>
                                                  Simple pricing that scales with your building
                                             </Typography>
                                             <Typography
                                                  variant="body1"
                                                  color="text.secondary"
                                                  sx={{ mt: 1.5, lineHeight: 1.7, overflowWrap: 'anywhere' }}
                                             >
                                                  Per apartment pricing - perfect for small buildings and scalable for larger communities.
                                             </Typography>

                                             <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mt: 3 }}>
                                                  <Button
                                                       variant="contained"
                                                       size="large"
                                                       onClick={() => handleNavClick('/pricing')}
                                                       sx={{ minHeight: 48 }}
                                                  >
                                                       View Plans
                                                  </Button>
                                             </Stack>
                                        </Box>
                                   </Reveal>
                              </Grid>

                              <Grid size={{ xs: 12, md: 6 }}>
                                   <Reveal delay={0.08}>
                                        <Box
                                             sx={{
                                                  p: 4,
                                                  height: '100%',
                                                  bgcolor: 'background.paper',
                                                  borderRadius: 4,
                                                  border: '1px solid',
                                                  borderColor: alpha(theme.palette.secondary.main, 0.08),
                                                  boxShadow: `0 12px 34px ${alpha(theme.palette.secondary.main, 0.06)}`,
                                                  ...liftHoverSx,
                                             }}
                                        >
                                             <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>
                                                  What you get
                                             </Typography>

                                             <Stack spacing={1.5}>
                                                  {[
                                                       'Building manager web dashboard for buildings & apartments',
                                                       'Tenant web + mobile access',
                                                       'Announcements, posts, and notifications',
                                                       'Polls and voting with clear results',
                                                       'Incident/service reports with photos (mobile)',
                                                       'Role-based permissions for building managers, tenants',
                                                  ].map((t) => (
                                                       <Stack key={t} direction="row" spacing={1.5} alignItems="flex-start">
                                                            <Box
                                                                 sx={{
                                                                      mt: '4px',
                                                                      width: 8,
                                                                      height: 8,
                                                                      borderRadius: '999px',
                                                                      bgcolor: 'primary.main',
                                                                      flex: '0 0 auto',
                                                                 }}
                                                            />
                                                            <Typography variant="body2" color="text.secondary" sx={{ overflowWrap: 'anywhere' }}>
                                                                 {t}
                                                            </Typography>
                                                       </Stack>
                                                  ))}
                                             </Stack>
                                        </Box>
                                   </Reveal>
                              </Grid>
                         </Grid>
                    </Container>
               </Box>

               {/* FAQ (WITH BACKGROUND IMAGE) */}
               <Box sx={{ position: 'relative', py: { xs: 8, md: 11 }, overflow: 'hidden' }}>
                    <Image
                         src="/background-images/rooftop-community.jpg"
                         alt="Tenants gathering on a rooftop terrace"
                         fill
                         style={{ objectFit: 'cover', objectPosition: 'center 30%' }}
                         quality={75}
                    />
                    <Box
                         sx={{
                              position: 'absolute',
                              inset: 0,
                              background: `linear-gradient(180deg, ${alpha(theme.palette.secondary.dark, 0.92)} 0%, ${alpha(theme.palette.secondary.dark, 0.72)} 45%, ${alpha(theme.palette.secondary.dark, 0.94)} 100%)`,
                         }}
                    />

                    <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
                         <Reveal>
                              <Box sx={{ textAlign: 'center', mb: 6 }}>
                                   <Typography
                                        component="h2"
                                        variant="h2"
                                        gutterBottom sx={{ overflowWrap: 'anywhere', color: 'common.white' }}>
                                        Frequently Asked Questions About NestLink
                                   </Typography>
                                   <Typography
                                        variant="h6"
                                        sx={{
                                             maxWidth: 860,
                                             mx: 'auto',
                                             fontWeight: 500,
                                             overflowWrap: 'anywhere',
                                             color: alpha('#FFFFFF', 0.78),
                                        }}
                                   >
                                        Quick answers to common questions.
                                   </Typography>
                              </Box>
                         </Reveal>

                         <Stagger>
                              <Grid container spacing={3}>
                                   {[
                                        {
                                             q: 'Is NestLink web-only or mobile-only?',
                                             a: 'Both. Clients use the web dashboard, and tenants have mobile + web access with consistent permissions.',
                                        },
                                        {
                                             q: 'How does incident reporting work?',
                                             a: 'Tenants submit a report (optionally with photos). Clients manage progress and close it when resolved.',
                                        },
                                        {
                                             q: 'How do you price it?',
                                             a: 'It is priced per apartment/unit, with no limit on tenants.',
                                        },
                                   ].map((item, idx) => (
                                        <Grid key={idx} size={{ xs: 12, md: 6 }}>
                                             <Box
                                                  sx={{
                                                       p: 3,
                                                       height: '100%',
                                                       bgcolor: alpha('#FFFFFF', 0.94),
                                                       borderRadius: 4,
                                                       boxShadow: '0 18px 40px rgba(0,0,0,0.18)',
                                                  }}
                                             >
                                                  <Typography component="h3" variant="h6" sx={{ fontWeight: 800, overflowWrap: 'anywhere' }}>
                                                       {item.q}
                                                  </Typography>
                                                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1, overflowWrap: 'anywhere' }}>
                                                       {item.a}
                                                  </Typography>
                                             </Box>
                                        </Grid>
                                   ))}
                              </Grid>
                         </Stagger>
                    </Container>
               </Box>

               {/* FINAL CTA (no background image) */}
               <Box component="section">
                    <Container maxWidth="lg" sx={{ py: { xs: 8, md: 11 } }}>
                         <Reveal>
                              <Box
                                   sx={{
                                        p: { xs: 4, md: 6 },
                                        textAlign: 'center',
                                        position: 'relative',
                                        overflow: 'hidden',
                                        borderRadius: 5,
                                        bgcolor: 'secondary.main',
                                   }}
                              >
                                   {isDesktop && showAnimations && (
                                        <Suspense fallback={null}>
                                             <ParticleBackground />
                                        </Suspense>
                                   )}
                                   <Box sx={{ position: 'relative', zIndex: 1 }}>
                                        <Typography variant="h3" sx={{ fontWeight: 900, overflowWrap: 'anywhere', color: 'common.white' }}>
                                             Ready to bring your tenants together?
                                        </Typography>
                                        <Typography
                                             variant="h6"
                                             sx={{ mt: 1.5, maxWidth: 860, mx: 'auto', overflowWrap: 'anywhere', fontWeight: 500, color: alpha('#FFFFFF', 0.75) }}
                                        >
                                             Start your free trial and set up your first building in minutes.
                                        </Typography>

                                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mt: 4, justifyContent: 'center' }}>
                                             <Button
                                                  variant="contained"
                                                  size="large"
                                                  onClick={() => handleNavClick('/pricing')}
                                                  sx={{ minHeight: 50 }}
                                             >
                                                  See Pricing
                                             </Button>
                                        </Stack>
                                   </Box>
                              </Box>
                         </Reveal>
                    </Container>
               </Box>

               <Backdrop sx={{ color: '#fff', zIndex: (t) => t.zIndex.drawer + 1 }} open={isPending}>
                    <CircularProgress sx={{ color: theme.palette.primary.main }} />
               </Backdrop>

          </Box>
     );
};

export default LandingPage;
