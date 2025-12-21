'use client';

import React, { useTransition } from 'react';
import {
     Box,
     Button,
     Container,
     Typography,
     Avatar,
     Card,
     CardContent,
     Grid,
     Chip,
     Stack,
     Divider,
     useTheme,
     useMediaQuery,
} from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import DashboardCustomizeIcon from '@mui/icons-material/DashboardCustomize';
import ApartmentIcon from '@mui/icons-material/Apartment';
import GroupsIcon from '@mui/icons-material/Groups';
import HowToRegIcon from '@mui/icons-material/HowToReg';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import PhoneIphoneIcon from '@mui/icons-material/PhoneIphone';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import PollIcon from '@mui/icons-material/Poll';
import CampaignIcon from '@mui/icons-material/Campaign';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import CircularProgress from '@mui/material/CircularProgress';
import Backdrop from '@mui/material/Backdrop';
import { useRouter } from 'next/navigation';
import ParallaxSection from './components/paralax-section';
import { motion } from 'framer-motion';
import { Reveal, Stagger, itemVariants } from './components/motion';

const LandingPage = () => {
     const theme = useTheme();
     const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
     const router = useRouter();
     const [isPending, startTransition] = useTransition();

     const handleNavClick = (path: string) => {
          startTransition(() => router.push(path));
     };

     const glassSx = {
          backgroundColor: 'rgba(255,255,255,0.86)',
          borderRadius: 3,
          backdropFilter: 'blur(10px)',
          border: '1px solid',
          borderColor: 'rgba(0,0,0,0.06)',
          boxShadow: '0 18px 50px rgba(0,0,0,0.10)',
          position: 'relative',
          overflow: 'hidden',
          // ✨ subtle animated sheen
          '&::before': {
               content: '""',
               position: 'absolute',
               inset: -2,
               background:
                    'radial-gradient(600px circle at var(--mx, 20%) var(--my, 10%), rgba(255,255,255,0.75), transparent 45%)',
               opacity: 0.8,
               pointerEvents: 'none',
               transition: 'opacity 200ms ease',
          },
     } as const;

     const liftHoverSx = {
          transition: 'transform 200ms ease, box-shadow 200ms ease, border-color 200ms ease',
          '&:hover': {
               transform: 'translateY(-6px)',
               boxShadow: '0 24px 70px rgba(0,0,0,0.14)',
               borderColor: 'rgba(0,0,0,0.10)',
          },
     } as const;

     // optional: update CSS variables on mouse move for the sheen
     const onMoveSheen = (e: React.MouseEvent<HTMLElement>) => {
          const el = e.currentTarget;
          const rect = el.getBoundingClientRect();
          const x = ((e.clientX - rect.left) / rect.width) * 100;
          const y = ((e.clientY - rect.top) / rect.height) * 100;
          el.style.setProperty('--mx', `${x}%`);
          el.style.setProperty('--my', `${y}%`);
     };

     return (
          <Box>
               <ParallaxSection backgroundImage="/background-images/background-image-3.png">
                    <Container
                         maxWidth="lg"
                         sx={{
                              minHeight: '100vh',
                              display: 'flex',
                              alignItems: 'center',
                              // ✅ Push hero down on mobile so the fixed header doesn’t overlap it
                              pt: { xs: 'calc(56px + 24px)', sm: 'calc(64px + 24px)' },
                              pb: { xs: 6, md: 0 },
                              mt: { xs: 56, md: 0 }
                         }}
                    >
                         <Grid
                              container
                              spacing={{ xs: 3, sm: 4, md: 6 }}
                              alignItems="center"
                         >
                              <Grid size={{ xs: 12, md: 7 }}>
                                   <Box
                                        sx={{
                                             ...glassSx,
                                             p: { xs: 2.5, sm: 3, md: 4 },
                                             // ✅ prevent layout “squeeze” causing overlap
                                             minWidth: 0,
                                        }}
                                        onMouseMove={onMoveSheen}
                                   >
                                        <Reveal>
                                             <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                                                  <Chip icon={<DashboardCustomizeIcon />} label="Web dashboard" />
                                                  <Chip icon={<PhoneIphoneIcon />} label="Mobile app" />
                                                  <Chip icon={<ApartmentIcon />} label="Pay per apartment" />
                                             </Stack>
                                        </Reveal>

                                        <Box sx={{ mt: 2 }}>
                                             <Reveal delay={0.05} y={22}>
                                                  <Typography
                                                       variant={isMobile ? 'h3' : 'h1'}
                                                       sx={{
                                                            lineHeight: 1.08,
                                                            // ✅ Responsive font sizes to avoid overlap on small screens
                                                            fontSize: { xs: '2rem', sm: '2.35rem', md: undefined },
                                                            overflowWrap: 'anywhere',
                                                            wordBreak: 'break-word',
                                                       }}
                                                  >
                                                       NestLink brings your building community into one place.
                                                  </Typography>
                                             </Reveal>

                                             <Reveal delay={0.12} y={18}>
                                                  <Typography
                                                       variant="h6"
                                                       color="text.secondary"
                                                       sx={{
                                                            mt: 2,
                                                            maxWidth: 680,
                                                            // ✅ Mobile-safe text sizing & wrapping
                                                            fontSize: { xs: '1rem', sm: '1.05rem', md: undefined },
                                                            lineHeight: 1.6,
                                                            overflowWrap: 'anywhere',
                                                            wordBreak: 'break-word',
                                                       }}
                                                  >
                                                       A subscription-based platform for house councils and building managers to run announcements, polls,
                                                       tenant communication, and service/incident reporting — with role-based access for clients, members, and tenants.
                                                  </Typography>
                                             </Reveal>

                                             <Reveal delay={0.18} y={12}>
                                                  <Stack
                                                       direction={{ xs: 'column', sm: 'row' }}
                                                       spacing={2}
                                                       sx={{ mt: 3 }}
                                                  >
                                                       <Button
                                                            variant="contained"
                                                            size="large"
                                                            endIcon={<ArrowForwardIcon />}
                                                            onClick={() => handleNavClick('/auth/register')}
                                                            sx={{ minHeight: 48 }}
                                                       >
                                                            Start Free Trial
                                                       </Button>
                                                       <Button
                                                            variant="outlined"
                                                            size="large"
                                                            onClick={() => handleNavClick('/pricing')}
                                                            sx={{ minHeight: 48 }}
                                                       >
                                                            See Pricing
                                                       </Button>
                                                       <Button
                                                            variant="text"
                                                            size="large"
                                                            onClick={() => handleNavClick('/docs')}
                                                            sx={{ minHeight: 48 }}
                                                       >
                                                            How it works
                                                       </Button>
                                                  </Stack>
                                             </Reveal>
                                        </Box>
                                   </Box>
                              </Grid>

                              <Grid size={{ xs: 12, md: 5 }}>
                                   <Reveal delay={0.12} x={18}>
                                        <Box
                                             sx={{
                                                  ...glassSx,
                                                  ...liftHoverSx,
                                                  p: { xs: 2.5, sm: 3 },
                                                  minWidth: 0,
                                             }}
                                             onMouseMove={onMoveSheen}
                                        >
                                             <Typography variant="h6" sx={{ mb: 2 }}>
                                                  Designed for three roles
                                             </Typography>

                                             <Stack spacing={2}>
                                                  {[
                                                       {
                                                            icon: <AdminPanelSettingsIcon />,
                                                            title: 'Client (Owner / Manager)',
                                                            text:
                                                                 'Purchases the subscription, manages buildings & apartments, creates members, invites tenants, configures permissions and workflows.',
                                                       },
                                                       {
                                                            icon: <GroupsIcon />,
                                                            title: 'Client Members (Reserved Seats)',
                                                            text:
                                                                 'Same dashboard, different authorizations. Collaborate on moderation, polls, announcements, and incident handling.',
                                                       },
                                                       {
                                                            icon: <HowToRegIcon />,
                                                            title: 'Tenants',
                                                            text:
                                                                 'Tenant permissions on web and mobile — participate in polls, read announcements, engage with posts, and submit service requests.',
                                                       },
                                                  ].map((r, idx) => (
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
                                                            {idx !== 2 && <Divider sx={{ my: 2 }} />}
                                                       </Box>
                                                  ))}
                                             </Stack>
                                        </Box>
                                   </Reveal>
                              </Grid>
                         </Grid>
                    </Container>
               </ParallaxSection>

               <Box
                    sx={{
                         mt: { xs: 44, sm: 5, md: 6 },
                         height: { xs: 56, sm: 64, md: 72 },
                         backgroundColor: '#f7f7f7',
                    }}
               />

               {/* FEATURES with staggered slide-ins */}
               <Container
                    maxWidth="lg"
                    sx={{
                         pt: { xs: 8, sm: 9, md: 10 },
                         pb: { xs: 7, md: 10 },
                    }}
               >
                    <Reveal>
                         <Box
                              sx={{
                                   textAlign: 'center',
                                   // ✅ give more breathing room on small screens so it never sits on top of cards
                                   mb: { xs: 8, sm: 7, md: 6 },
                                   px: { xs: 1, sm: 0 },
                              }}
                         >
                              <Typography
                                   variant="h2"
                                   sx={{
                                        // ✅ mobile-safe heading sizing
                                        fontSize: { xs: '1.8rem', sm: '2.4rem', md: undefined },
                                        lineHeight: { xs: 1.15, sm: 1.2, md: undefined },
                                        // ✅ avoid “gutterBottom” inconsistencies
                                        mb: { xs: 2, sm: 2.5 },
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
                                        fontSize: { xs: '1rem', sm: '1.05rem', md: undefined },
                                        lineHeight: 1.65,
                                        overflowWrap: 'anywhere',
                                   }}
                              >
                                   NestLink is a web dashboard + mobile app built around real building workflows: communication, governance,
                                   and service/incident reporting — with clear roles and permissions.
                              </Typography>
                         </Box>
                    </Reveal>


                    <Stagger>
                         <Grid container spacing={3}>
                              {[
                                   {
                                        icon: <DashboardCustomizeIcon />,
                                        title: 'Client Dashboard (Web)',
                                        description:
                                             'Manage buildings, apartments, and tenants. Configure roles, create announcements, run polls, and track service issues in one place.',
                                   },
                                   {
                                        icon: <GroupsIcon />,
                                        title: 'Member Seats (Web)',
                                        description:
                                             'Invite additional client members with reserved access spots. Assign responsibilities like moderation, incident handling, and announcements.',
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
                                             'Notify tenants and members about announcements, vote openings/closures, and new incident progress — without chaos in messaging apps.',
                                   },
                              ].map((item, idx) => (
                                   <Grid key={idx} size={{ xs: 12, sm: 6, md: 4 }}>
                                        <motion.div variants={itemVariants}>
                                             <Box sx={{ ...glassSx, ...liftHoverSx, p: 3, height: '100%', minWidth: 0 }} onMouseMove={onMoveSheen}>
                                                  <Avatar sx={{ bgcolor: 'primary.main', mb: 2 }}>{item.icon}</Avatar>
                                                  <Typography variant="h6" gutterBottom sx={{ overflowWrap: 'anywhere' }}>
                                                       {item.title}
                                                  </Typography>
                                                  <Typography variant="body2" color="text.secondary" sx={{ overflowWrap: 'anywhere' }}>
                                                       {item.description}
                                                  </Typography>
                                             </Box>
                                        </motion.div>
                                   </Grid>
                              ))}
                         </Grid>
                    </Stagger>
               </Container>

               {/* ✅ PRODUCT WORKFLOWS (replaces your comment) */}
               <Box sx={{ backgroundColor: '#f7f7f7' }}>
                    <Container maxWidth="lg" sx={{ py: { xs: 7, md: 10 } }}>
                         <Reveal>
                              <Box sx={{ textAlign: 'center', mb: 6 }}>
                                   <Typography variant="h2" gutterBottom sx={{ overflowWrap: 'anywhere' }}>
                                        Built around real building workflows
                                   </Typography>
                                   <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 860, mx: 'auto', overflowWrap: 'anywhere' }}>
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
                                                  'Tenants submit issues with photos, notes, and categories. Members track progress until resolution.',
                                        },
                                        {
                                             title: 'Roles and permissions by design',
                                             description:
                                                  'Clients manage the subscription and configuration, members moderate and resolve, tenants participate and report.',
                                        },
                                        {
                                             title: 'Web + mobile, same rules',
                                             description:
                                                  'Tenant permissions are consistent on both platforms, but the mobile app is optimized for fast actions.',
                                        },
                                        {
                                             title: 'One source of truth',
                                             description:
                                                  'Reduce “who said what” and “where is that message?” Everything lives in NestLink, searchable and organized.',
                                        },
                                   ].map((item, idx) => (
                                        <Grid key={idx} size={{ xs: 12, md: 6 }}>
                                             <motion.div variants={itemVariants}>
                                                  <Box sx={{ ...glassSx, ...liftHoverSx, p: 3, height: '100%', minWidth: 0 }} onMouseMove={onMoveSheen}>
                                                       <Typography variant="h6" sx={{ fontWeight: 900, overflowWrap: 'anywhere' }}>
                                                            {item.title}
                                                       </Typography>
                                                       <Typography variant="body2" color="text.secondary" sx={{ mt: 1, overflowWrap: 'anywhere' }}>
                                                            {item.description}
                                                       </Typography>
                                                  </Box>
                                             </motion.div>
                                        </Grid>
                                   ))}
                              </Grid>
                         </Stagger>
                    </Container>
               </Box>

               {/* ✅ PRICING TEASER */}
               <Container maxWidth="lg" sx={{ py: { xs: 7, md: 10 } }}>
                    <Grid container spacing={{ xs: 3, md: 4 }} alignItems="stretch">
                         <Grid size={{ xs: 12, md: 6 }}>
                              <Reveal>
                                   <Box sx={{ ...glassSx, p: 3, height: '100%', minWidth: 0 }} onMouseMove={onMoveSheen}>
                                        <Typography variant="h4" sx={{ fontWeight: 900, overflowWrap: 'anywhere' }}>
                                             Simple pricing that scales with your building
                                        </Typography>
                                        <Typography variant="body1" color="text.secondary" sx={{ mt: 1.5, lineHeight: 1.7, overflowWrap: 'anywhere' }}>
                                             Pay per apartment — perfect for small buildings and scalable for larger communities.
                                             Add member seats as needed and keep everything organized in one platform.
                                        </Typography>

                                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mt: 3 }}>
                                             <Button variant="contained" size="large" onClick={() => handleNavClick('/pricing')} sx={{ minHeight: 48 }}>
                                                  View Plans
                                             </Button>
                                             <Button variant="outlined" size="large" onClick={() => handleNavClick('/auth/register')} sx={{ minHeight: 48 }}>
                                                  Start Free Trial
                                             </Button>
                                        </Stack>
                                   </Box>
                              </Reveal>
                         </Grid>

                         <Grid size={{ xs: 12, md: 6 }}>
                              <Reveal delay={0.08}>
                                   <Box sx={{ ...glassSx, ...liftHoverSx, p: 3, height: '100%', minWidth: 0 }} onMouseMove={onMoveSheen}>
                                        <Typography variant="h6" sx={{ fontWeight: 900, mb: 2 }}>
                                             What you get
                                        </Typography>

                                        <Stack spacing={1.5}>
                                             {[
                                                  'Client web dashboard for buildings & apartments',
                                                  'Tenant web + mobile access',
                                                  'Announcements, posts, and notifications',
                                                  'Polls and voting with clear results',
                                                  'Incident/service reports with photos (mobile)',
                                                  'Role-based permissions for clients, members, tenants',
                                             ].map((t) => (
                                                  <Stack key={t} direction="row" spacing={1.5} alignItems="flex-start">
                                                       <Box sx={{ mt: '4px', width: 8, height: 8, borderRadius: '999px', bgcolor: 'primary.main', flex: '0 0 auto' }} />
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

               {/* ✅ FAQ */}
               <Box sx={{ backgroundColor: '#f7f7f7' }}>
                    <Container maxWidth="lg" sx={{ py: { xs: 7, md: 10 } }}>
                         <Reveal>
                              <Box sx={{ textAlign: 'center', mb: 6 }}>
                                   <Typography variant="h2" gutterBottom sx={{ overflowWrap: 'anywhere' }}>
                                        FAQ
                                   </Typography>
                                   <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 860, mx: 'auto', overflowWrap: 'anywhere' }}>
                                        Quick answers to common questions.
                                   </Typography>
                              </Box>
                         </Reveal>

                         <Stagger>
                              <Grid container spacing={3}>
                                   {[
                                        {
                                             q: 'Is NestLink web-only or mobile-only?',
                                             a: 'Both. Clients and members use the web dashboard, and tenants have mobile + web access with consistent permissions.',
                                        },
                                        {
                                             q: 'Can I limit what members can do?',
                                             a: 'Yes. Member seats are role-based—give access only to what that person needs (moderation, incidents, announcements, etc.).',
                                        },
                                        {
                                             q: 'How does incident reporting work?',
                                             a: 'Tenants submit a report (optionally with photos). Members manage progress and close it when resolved.',
                                        },
                                        {
                                             q: 'How do you price it?',
                                             a: 'Pay per apartment (plus optional reserved seats for additional client members).',
                                        },
                                   ].map((item, idx) => (
                                        <Grid key={idx} size={{ xs: 12, md: 6 }}>
                                             <motion.div variants={itemVariants}>
                                                  <Box sx={{ ...glassSx, p: 3, height: '100%', minWidth: 0 }} onMouseMove={onMoveSheen}>
                                                       <Typography variant="h6" sx={{ fontWeight: 900, overflowWrap: 'anywhere' }}>
                                                            {item.q}
                                                       </Typography>
                                                       <Typography variant="body2" color="text.secondary" sx={{ mt: 1, overflowWrap: 'anywhere' }}>
                                                            {item.a}
                                                       </Typography>
                                                  </Box>
                                             </motion.div>
                                        </Grid>
                                   ))}
                              </Grid>
                         </Stagger>
                    </Container>
               </Box>

               {/* ✅ FINAL CTA */}
               <Container maxWidth="lg" sx={{ py: { xs: 7, md: 10 } }}>
                    <Reveal>
                         <Box sx={{ ...glassSx, p: { xs: 3, md: 4 }, textAlign: 'center' }} onMouseMove={onMoveSheen}>
                              <Typography variant="h3" sx={{ fontWeight: 950, overflowWrap: 'anywhere' }}>
                                   Ready to bring your tenants together?
                              </Typography>
                              <Typography variant="h6" color="text.secondary" sx={{ mt: 1.5, maxWidth: 860, mx: 'auto', overflowWrap: 'anywhere' }}>
                                   Start your free trial and set up your first building in minutes.
                              </Typography>

                              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mt: 3, justifyContent: 'center' }}>
                                   <Button variant="contained" size="large" onClick={() => handleNavClick('/auth/register')} sx={{ minHeight: 48 }}>
                                        Start Free Trial
                                   </Button>
                                   <Button variant="outlined" size="large" onClick={() => handleNavClick('/pricing')} sx={{ minHeight: 48 }}>
                                        See Pricing
                                   </Button>
                              </Stack>
                         </Box>
                    </Reveal>
               </Container>

               <Backdrop sx={{ color: '#fff', zIndex: (t) => t.zIndex.drawer + 1 }} open={isPending}>
                    <CircularProgress sx={{ color: theme.palette.primary.main }} />
               </Backdrop>
          </Box >
     );

};

export default LandingPage;
