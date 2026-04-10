"use client"

import type React from "react"
import Animate from "@/app/components/animation-framer-motion"
import { useEffect, useMemo, useState } from "react"
import {
     Alert,
     Box,
     Button,
     Container,
     Divider,
     IconButton,
     InputAdornment,
     Link as MuiLink,
     List,
     ListItem,
     ListItemText,
     Paper,
     Stack,
     TextField,
     Typography,
     Grid,
     Chip,
} from "@mui/material"
import SearchIcon from "@mui/icons-material/Search"
import MenuBookIcon from '@mui/icons-material/MenuBook';
import ContentCopyIcon from "@mui/icons-material/ContentCopy"
import LinkIcon from "@mui/icons-material/Link"
import { Toaster } from "react-hot-toast"

type DocSection = {
     id: string
     navLabel: string
     title: string
     description: string
     bullets?: string[]
     role?: "Client" | "Tenant" | "Platform"
     tags?: string[]
}

const HEADER_OFFSET_PX = 88 // adjust if your fixed header is taller/shorter

const ANDROID_APP_URL = (process.env.NEXT_PUBLIC_ANDROID_APP_URL || "").trim().length > 0 ? (process.env.NEXT_PUBLIC_ANDROID_APP_URL || "").trim() : ''
const IOS_APP_URL = (process.env.NEXT_PUBLIC_IOS_APP_URL || "").trim().length > 0 ? (process.env.NEXT_PUBLIC_IOS_APP_URL || "").trim() : ''

const sections: DocSection[] = [
     // -----------------------------
     // Getting started
     // -----------------------------
     {
          id: "getting-started",
          navLabel: "Getting Started",
          title: "Getting Started",
          description:
               "NestLink is a web dashboard + tenant mobile app for managing building communities. This documentation explains the core concepts, roles, and every major feature so you can onboard a building quickly and use the platform confidently.",
          tags: ["overview", "roles", "onboarding"],
          role: "Platform",
     },
     {
          id: "installation",
          navLabel: "Installation",
          title: "Installation",
          description:
               "There is no installation required for the web dashboard. Open NestLink in a modern browser and sign in. Tenants can use web or mobile (iOS/Android).",
          bullets: [
               "Web dashboard: works in modern browsers (Chrome/Edge/Safari/Firefox) for building managers/tenants",
               "Tenant mobile app: iOS/Android build distributed by the building/team",
               "No local setup required for standard usage",
               ANDROID_APP_URL ? `Android app: ${ANDROID_APP_URL}` : "Android app: contact your manager for install",
               IOS_APP_URL ? `iOS app: ${IOS_APP_URL}` : "iOS app: contact your manager for install",
          ],
          role: "Platform",
     },
     {
          id: "setup",
          navLabel: "Setup",
          title: "Initial Setup",
          description:
               "After subscription/signup, the Client (Owner/Manager) configures the organization, building properties, apartments and tenants. This is the foundation for apartments and tenant invitations. The manager can also print out a QR code for tenants to scan and join their apartment if that method is preferred.",
          bullets: [
               "Create your first Building (address, city, building settings)",
               "Add Apartments/Units and optionally attach owners/tenants later",
               "Invite Tenants to apartments via email/phone/invite link",
               "Print QR code for tenants to scan and join their apartment (optional)",
          ],
          role: "Client",
     },
     {
          id: "roles-and-permissions",
          navLabel: "Roles & Permissions",
          title: "Roles & Permissions",
          description:
               "NestLink is role-based by design. Permissions ensure people see only what they should and can perform only the actions assigned to them.",
          bullets: [
               "Client (Owner/Manager): subscription + configuration + full building management",
               "Tenants: mobile/web tenant experience (announcements, posts, polls, incident reporting, etc.)",
          ],
          role: "Platform",
          tags: ["rbac", "security", "authorization"],
     },

     // -----------------------------
     // Core modules
     // -----------------------------
     {
          id: "buildings-apartments",
          navLabel: "Buildings & Apartments",
          title: "Buildings & Apartments",
          description:
               "Organize your community structure. Buildings contain apartments (units). Tenants are linked to apartments so permissions and visibility can be scoped correctly.",
          bullets: [
               "Create and edit buildings: address, status, amenities, configuration fields",
               "Create apartments/units per building; track unit count and occupancy",
               "Assign tenants to units (primary tenant, additional occupants)",
               "Use building/unit scope for announcements, polls, incidents, and posts",
          ],
          role: "Client",
          tags: ["structure", "units", "occupancy"],
     },
     {
          id: "tenants-and-invites",
          navLabel: "Tenants & Invitations",
          title: "Tenants & Invitations",
          description:
               "Invite tenants to join and connect them to apartments. This enables tenant actions (poll voting, incident reporting, comments, etc.) and ensures the right people receive the right updates.",
          bullets: [
               "Invite tenants by email (and optionally phone number)",
               "Link tenants to apartments and set primary/secondary status",
               "Control what tenants can access based on unit/building membership",
               "Handle re-invites and access resets cleanly",
               "Use QR code invites for easy tenant onboarding (optional)",
               "Ban or remove tenants as needed to maintain a safe community",
          ],
          role: "Client",
          tags: ["onboarding", "invites", "access"],
     },
     {
          id: "announcements",
          navLabel: "Announcements",
          title: "Announcements",
          description:
               "Announcements are official messages for the building community. They are designed to replace fragmented chat threads with structured, searchable updates.",
          bullets: [
               "Create announcements scoped to a building (or specific audience if supported)",
               "Include important details: what, when, who is affected, next steps",
               "Tenants receive updates in-app (and optionally via other channels depending on setup)",
               "Announcements remain searchable and auditable for later reference",
               "Upload images or attachments to provide additional context",
          ],
          role: "Platform",
          tags: ["communication", "official", "updates"],
     },
     {
          id: "posts-and-comments",
          navLabel: "Posts & Comments",
          title: "Posts & Comments (Community Feed)",
          description:
               "Posts are more conversational than announcements. Use them for community discussions, suggestions, questions, and informal communication between tenants and building staff.",
          bullets: [
               "Create posts with text and optional images (where enabled)",
               "Comment threads keep context in one place",
               "Like/react to posts and comments (optional feature depending on your implementation)",
          ],
          role: "Platform",
          tags: ["feed", "discussion", "moderation"],
     },
     {
          id: "polls",
          navLabel: "Polls & Voting",
          title: "Polls & Voting",
          description:
               "Polls enable transparent decisions. Clients create a poll, tenants vote, and results are tracked clearly. Perfect for repairs, budgets, contractor selection, and building rules.",
          bullets: [
               "Create polls with question, options, and voting window (open/close dates)",
               "Track participation and outcomes in a transparent way",
               "Restrict polls by building/audience rules as configured",
               "Optionally enforce: one vote per tenant / per apartment (depends on your logic)",
               "Archive results for accountability and future reference",
          ],
          role: "Platform",
          tags: ["governance", "voting", "decisions"],
     },
     {
          id: "incident-reporting",
          navLabel: "Incidents & Service Requests",
          title: "Incidents & Service Requests",
          description:
               "Tenants can report issues with details and photos. Client manage triage, status updates, and resolution. This creates a single source of truth for building problems.",
          bullets: [
               "Tenant submits report: category, description, location, urgency",
               "Attach photos directly from mobile camera (where enabled)",
               "Track status: submitted → in progress → resolved (example)",
               "Close the incident with resolution details for transparency",
          ],
          role: "Platform",
          tags: ["support", "maintenance", "camera"],
     },
     {
          id: "notifications",
          navLabel: "Notifications",
          title: "Notifications",
          description:
               "Notifications keep everyone in sync. NestLink can notify tenants and clients about announcements, poll events, incident status changes, and important activity.",
          bullets: [
               "In-app notifications for critical events",
               "Push notifications for mobile users (when enabled)",
               "Clear triggers: new announcement, poll opened/closed, incident update",
               "Reduce missed information and unnecessary calls/messages",
          ],
          role: "Platform",
          tags: ["push", "alerts", "updates"],
     },

     // -----------------------------
     // Admin / product / billing
     // -----------------------------
     {
          id: "subscriptions-and-billing",
          navLabel: "Subscriptions & Billing",
          title: "Subscriptions & Billing",
          description:
               "NestLink is subscription-based, commonly priced per apartment.",
          bullets: [
               "Pay per apartment (scales with community size)",
               "Track subscription status (trial/active/inactive, if applicable to your system)",
               "Centralized plan information for transparency",
          ],
          role: "Client",
          tags: ["pricing", "plans", "seats"],
     },
     {
          id: "security",
          navLabel: "Security",
          title: "Security & Access Control",
          description:
               "NestLink is designed around least-privilege access and clear boundaries between clients, and tenants. Authentication flows can include modern security options depending on your setup.",
          bullets: [
               "Authentication and session management via your auth provider (e.g., Supabase Auth)",
               "Optional 2FA (TOTP) for higher security accounts",
               "Role-based authorization across dashboard and mobile",
               "Data is scoped by client/building/apartment relations where configured",
          ],
          role: "Platform",
          tags: ["auth", "2fa", "rls"],
     },
     {
          id: "faq",
          navLabel: "FAQ",
          title: "FAQ",
          description: "Quick answers to common questions about using NestLink.",
          bullets: [
               "Is NestLink web-only or mobile-only? → Both (web dashboard + tenant mobile/web)",
               "How do incidents work? → Tenants submit; clients manage status; resolution is tracked",
          ],
          role: "Platform",
          tags: ["help"],
     },
]

function groupForNav(s: DocSection) {
     if (["getting-started", "installation", "setup", "roles-and-permissions"].includes(s.id)) return "Getting Started"
     if (
          [
               "buildings-apartments",
               "tenants-and-invites",
               "announcements",
               "posts-and-comments",
               "polls",
               "incident-reporting",
               "notifications",
          ].includes(s.id)
     )
          return "Features"
     if (["subscriptions-and-billing", "security"].includes(s.id)) return "Admin & Security"
     if (["api-authentication", "api-endpoints", "webhooks"].includes(s.id)) return "API Reference"
     if (s.id === "faq") return "FAQ"
     return "Other"
}

function slugLink(id: string) {
     return `/docs#${id}`
}

export const DocsPage = () => {
     const [query, setQuery] = useState("")
     const [copiedId, setCopiedId] = useState<string | null>(null)

     const filtered = useMemo(() => {
          const q = query.trim().toLowerCase()
          if (!q) return sections
          return sections.filter((s) => {
               const hay = [
                    s.title,
                    s.description,
                    s.navLabel,
                    s.role ?? "",
                    ...(s.bullets ?? []),
                    ...(s.tags ?? []),
                    s.id,
               ]
                    .join(" ")
                    .toLowerCase()
               return hay.includes(q)
          })
     }, [query])

     const navGroups = useMemo(() => {
          const map = new Map<string, DocSection[]>()
          for (const s of filtered) {
               const g = groupForNav(s)
               map.set(g, [...(map.get(g) ?? []), s])
          }
          return Array.from(map.entries())
     }, [filtered])

     // ✅ Smooth scroll + header offset, including when you navigate directly to /docs#section
     useEffect(() => {
          const scrollToHash = () => {
               const hash = window.location.hash?.replace("#", "")
               if (!hash) return
               const el = document.getElementById(hash)
               if (!el) return

               const y = el.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET_PX
               window.scrollTo({ top: y, behavior: "smooth" })
          }

          scrollToHash()
          window.addEventListener("hashchange", scrollToHash)
          return () => window.removeEventListener("hashchange", scrollToHash)
     }, [])

     const handleCopyLink = async (id: string) => {
          const full = `${window.location.origin}${slugLink(id)}`
          try {
               await navigator.clipboard.writeText(full)
               setCopiedId(id)
               setTimeout(() => setCopiedId(null), 1200)
          } catch {
               // fallback: do nothing
          }
     }

     return (
          <Box
               sx={{
                    display: "flex",
                    flexDirection: "column",
                    minHeight: "100vh",
                    mt: 5,
               }}
          >
               <Animate>
                    {/* HEADER */}
                    <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
                         <Container maxWidth="lg">
                              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", py: 2, gap: 2 }}>
                                   <Box sx={{ display: { xs: "none", md: 'flex' }, alignItems: "center", minWidth: 0 }}>
                                        <MenuBookIcon sx={{ mr: 1 }} />
                                        <Typography variant="h4" noWrap>
                                             Docs
                                        </Typography>
                                   </Box>

                                   <TextField
                                        value={query}
                                        onChange={(e) => setQuery(e.target.value)}
                                        placeholder="Search docs..."
                                        variant="outlined"
                                        size="small"
                                        sx={{ width: { xs: "100%", sm: 360 } }}
                                        slotProps={{
                                             input: {
                                                  startAdornment: (
                                                       <InputAdornment position="start">
                                                            <SearchIcon />
                                                       </InputAdornment>
                                                  ),
                                             },
                                        }}
                                   />
                              </Box>
                         </Container>
                    </Box>

                    {/* MAIN */}
                    <Box component="main" sx={{ flexGrow: 1 }}>
                         <Container maxWidth="lg">
                              <Grid container spacing={4} sx={{ pt: 4 }}>
                                   {/* LEFT NAV */}
                                   <Grid size={{ xs: 12, md: 3 }}>
                                        <Box
                                             component="nav"
                                             sx={{
                                                  position: { md: "sticky" },
                                                  top: { md: 24 },
                                                  height: { md: "calc(100vh - 180px)" },
                                                  overflowY: "auto",
                                                  pr: { md: 1 },
                                                  // Custom scrollbar styling
                                                  "&::-webkit-scrollbar": {
                                                       width: "6px",
                                                  },
                                                  "&::-webkit-scrollbar-track": {
                                                       backgroundColor: "rgba(0, 0, 0, 0.05)",
                                                       borderRadius: "3px",
                                                  },
                                                  "&::-webkit-scrollbar-thumb": {
                                                       backgroundColor: "primary.main",
                                                       borderRadius: "3px",
                                                       "&:hover": {
                                                            backgroundColor: "primary.dark",
                                                       },
                                                  },
                                             }}
                                        >
                                             {navGroups.map(([groupName, items]) => (
                                                  <Box key={groupName} sx={{ mb: 3 }}>
                                                       <Typography variant="h6" gutterBottom>
                                                            {groupName}
                                                       </Typography>

                                                       <List dense disablePadding>
                                                            {items.map((s) => (
                                                                 <ListItem key={s.id} disablePadding sx={{ py: 0.25 }}>
                                                                      <MuiLink href={`#${s.id}`} underline="hover" color="inherit" sx={{ width: "100%" }}>
                                                                           <ListItemText
                                                                                primary={s.navLabel}
                                                                                slotProps={{
                                                                                     primary: {
                                                                                          variant: "body2",
                                                                                          sx: { lineHeight: 1.4 },
                                                                                     },
                                                                                }}
                                                                           />
                                                                      </MuiLink>
                                                                 </ListItem>
                                                            ))}
                                                       </List>
                                                  </Box>
                                             ))}

                                             <Divider sx={{ my: 2 }} />
                                        </Box>
                                   </Grid>

                                   {/* CONTENT */}
                                   <Grid size={{ xs: 12, md: 9 }}>
                                        <Box sx={{ typography: "body1" }}>
                                             {filtered.map((s) => (
                                                  <Paper
                                                       key={s.id}
                                                       id={s.id}
                                                       elevation={0}
                                                       sx={{
                                                            p: { xs: 2, sm: 3 },
                                                            mb: 3,
                                                            border: "1px solid",
                                                            borderColor: "divider",
                                                            // ✅ makes native anchor jumps respect the header
                                                            scrollMarginTop: `${HEADER_OFFSET_PX}px`,
                                                       }}
                                                  >
                                                       <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} alignItems={{ sm: "center" }}>
                                                            <Stack direction="row" spacing={1} alignItems="center" sx={{ minWidth: 0, flexWrap: "wrap" }}>
                                                                 <Typography variant="h5" component="h2" sx={{ fontWeight: 900 }}>
                                                                      {s.title}
                                                                 </Typography>

                                                                 <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
                                                                      {s.role && (
                                                                           <Chip size="small" label={s.role} variant="outlined" sx={{ borderRadius: 999 }} />
                                                                      )}
                                                                      {(s.tags ?? []).slice(0, 4).map((t) => (
                                                                           <Chip key={t} size="small" label={t} variant="outlined" sx={{ borderRadius: 999 }} />
                                                                      ))}
                                                                 </Stack>
                                                            </Stack>

                                                            <Box sx={{ flex: 1 }} />

                                                            <Stack direction="row" spacing={1} alignItems="center">
                                                                 <MuiLink
                                                                      href={`#${s.id}`}
                                                                      underline="hover"
                                                                      color="inherit"
                                                                      sx={{ display: "inline-flex", alignItems: "center", gap: 0.75 }}
                                                                 >
                                                                      <LinkIcon fontSize="small" />
                                                                      <Typography variant="body2">{`#${s.id}`}</Typography>
                                                                 </MuiLink>

                                                                 <IconButton
                                                                      size="small"
                                                                      onClick={() => handleCopyLink(s.id)}
                                                                      aria-label="Copy link"
                                                                      title="Copy full link"
                                                                 >
                                                                      <ContentCopyIcon fontSize="small" />
                                                                 </IconButton>
                                                            </Stack>
                                                       </Stack>

                                                       {copiedId === s.id && (
                                                            <Typography variant="caption" color="success.main" sx={{ display: "block", mt: 1 }}>
                                                                 Link copied ✅
                                                            </Typography>
                                                       )}

                                                       <Typography paragraph sx={{ mt: 2, mb: 1.5, lineHeight: 1.75 }}>
                                                            {s.description}
                                                       </Typography>

                                                       {s.bullets?.length ? (
                                                            <List dense sx={{ mt: 0 }}>
                                                                 {s.bullets.map((b) => (
                                                                      <ListItem key={b} sx={{ py: 0.25 }}>
                                                                           <ListItemText primary={b} />
                                                                      </ListItem>
                                                                 ))}
                                                            </List>
                                                       ) : null}

                                                       <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ mt: 2 }}>
                                                            <Button
                                                                 variant="outlined"
                                                                 size="small"
                                                                 startIcon={<LinkIcon />}
                                                                 component="a"
                                                                 href={slugLink(s.id)}
                                                            >
                                                                 Open link
                                                            </Button>

                                                            <Button
                                                                 variant="text"
                                                                 size="small"
                                                                 startIcon={<ContentCopyIcon />}
                                                                 onClick={() => handleCopyLink(s.id)}
                                                            >
                                                                 Copy link
                                                            </Button>
                                                       </Stack>
                                                  </Paper>
                                             ))}

                                             {!filtered.length ? (
                                                  <Paper sx={{ p: 3, border: "1px solid", borderColor: "divider" }} elevation={0}>
                                                       <Typography variant="h6" sx={{ fontWeight: 900 }}>
                                                            No results
                                                       </Typography>
                                                       <Typography color="text.secondary" sx={{ mt: 1 }}>
                                                            Try a different search term (e.g. “polls”, “incidents”, “announcements”, “tenants”).
                                                       </Typography>
                                                  </Paper>
                                             ) : null}
                                        </Box>
                                   </Grid>
                              </Grid>
                         </Container>
                    </Box>
               </Animate>

               <Toaster />
          </Box>
     )
}
