"use client"

import type React from "react"

import { useState } from "react"
import {
     Box,
     Container,
     InputAdornment,
     Link as MuiLink,
     List,
     ListItem,
     ListItemText,
     Paper,
     Tab,
     Tabs,
     TextField,
     Typography,
     Grid,
} from "@mui/material"
import SearchIcon from "@mui/icons-material/Search"
import DescriptionIcon from "@mui/icons-material/Description"
import { Toaster } from "react-hot-toast"

interface TabPanelProps {
     children?: React.ReactNode
     index: number
     value: number
}

function TabPanel(props: TabPanelProps) {
     const { children, value, index, ...other } = props

     return (
          <div
               role="tabpanel"
               hidden={value !== index}
               id={`simple-tabpanel-${index}`}
               aria-labelledby={`simple-tab-${index}`}
               {...other}
          >
               {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
          </div>
     )
}

export const DocsPage = () => {
     const [tabValue, setTabValue] = useState(0)

     const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
          setTabValue(newValue)
     }

     return (
          <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
               <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
                    <Container maxWidth="lg">
                         <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", py: 2 }}>
                              <Box sx={{ display: "flex", alignItems: "center" }}>
                                   <DescriptionIcon sx={{ mr: 1 }} />
                                   <Typography variant="h6">Documentation</Typography>
                              </Box>
                              <TextField
                                   placeholder="Search documentation..."
                                   variant="outlined"
                                   size="small"
                                   sx={{ width: { xs: "100%", sm: 300 } }}
                                   InputProps={{
                                        startAdornment: (
                                             <InputAdornment position="start">
                                                  <SearchIcon />
                                             </InputAdornment>
                                        ),
                                   }}
                              />
                         </Box>
                    </Container>
               </Box>

               <Box component="main" sx={{ flexGrow: 1 }}>
                    <Container maxWidth="lg">
                         <Grid container spacing={4} sx={{ pt: 4 }}>
                              <Grid size={{ xs: 12, md: 3 }}>
                                   <Box
                                        component="nav"
                                        sx={{
                                             position: { md: "sticky" },
                                             top: { md: 24 },
                                             height: { md: "calc(100vh - 180px)" },
                                             overflowY: "auto",
                                        }}
                                   >
                                        <Typography variant="h6" gutterBottom>
                                             Getting Started
                                        </Typography>
                                        <List dense disablePadding>
                                             <ListItem disablePadding>
                                                  <MuiLink href="#installation" underline="hover" color="inherit">
                                                       <ListItemText primary="Installation" />
                                                  </MuiLink>
                                             </ListItem>
                                             <ListItem disablePadding>
                                                  <MuiLink href="#setup" underline="hover" color="inherit">
                                                       <ListItemText primary="Setup" />
                                                  </MuiLink>
                                             </ListItem>
                                             <ListItem disablePadding>
                                                  <MuiLink href="#first-steps" underline="hover" color="inherit">
                                                       <ListItemText primary="First Steps" />
                                                  </MuiLink>
                                             </ListItem>
                                        </List>

                                        <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
                                             Features
                                        </Typography>
                                        <List dense disablePadding>
                                             <ListItem disablePadding>
                                                  <MuiLink href="#community-management" underline="hover" color="inherit">
                                                       <ListItemText primary="Community Management" />
                                                  </MuiLink>
                                             </ListItem>
                                             <ListItem disablePadding>
                                                  <MuiLink href="#financial-tools" underline="hover" color="inherit">
                                                       <ListItemText primary="Financial Tools" />
                                                  </MuiLink>
                                             </ListItem>
                                             <ListItem disablePadding>
                                                  <MuiLink href="#voting-system" underline="hover" color="inherit">
                                                       <ListItemText primary="Voting System" />
                                                  </MuiLink>
                                             </ListItem>
                                             <ListItem disablePadding>
                                                  <MuiLink href="#notifications" underline="hover" color="inherit">
                                                       <ListItemText primary="Notifications" />
                                                  </MuiLink>
                                             </ListItem>
                                        </List>

                                        <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
                                             API Reference
                                        </Typography>
                                        <List dense disablePadding>
                                             <ListItem disablePadding>
                                                  <MuiLink href="#authentication" underline="hover" color="inherit">
                                                       <ListItemText primary="Authentication" />
                                                  </MuiLink>
                                             </ListItem>
                                             <ListItem disablePadding>
                                                  <MuiLink href="#endpoints" underline="hover" color="inherit">
                                                       <ListItemText primary="Endpoints" />
                                                  </MuiLink>
                                             </ListItem>
                                             <ListItem disablePadding>
                                                  <MuiLink href="#webhooks" underline="hover" color="inherit">
                                                       <ListItemText primary="Webhooks" />
                                                  </MuiLink>
                                             </ListItem>
                                        </List>

                                        <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
                                             <MuiLink href="#faq" underline="hover" color="inherit">
                                                  FAQ
                                             </MuiLink>
                                        </Typography>
                                   </Box>
                              </Grid>

                              <Grid size={{ xs: 12, md: 9 }}>
                                   <Box sx={{ typography: "body1" }}>
                                        <Box id="getting-started">
                                             <Typography
                                                  variant="h4"
                                                  component="h2"
                                                  gutterBottom
                                                  sx={{ pb: 1, borderBottom: 1, borderColor: "divider" }}
                                             >
                                                  Getting Started
                                             </Typography>
                                             <Typography paragraph>
                                                  Welcome to the NestLink documentation. This guide will help you get started with our platform
                                                  and make the most of its features.
                                             </Typography>

                                             <Typography variant="h5" component="h3" gutterBottom id="installation" sx={{ mt: 4 }}>
                                                  Installation
                                             </Typography>
                                             <Typography paragraph>
                                                  NestLink is a web-based platform, so there's no installation required. Simply sign up for an
                                                  account and you can access it from any modern web browser.
                                             </Typography>

                                             <Typography variant="h5" component="h3" gutterBottom id="setup" sx={{ mt: 4 }}>
                                                  Setup
                                             </Typography>
                                             <Typography paragraph>
                                                  After signing up, you'll need to set up your community profile. This includes basic information
                                                  about your residential community, such as:
                                             </Typography>
                                             <List>
                                                  <ListItem>
                                                       <ListItemText primary="Community name and address" />
                                                  </ListItem>
                                                  <ListItem>
                                                       <ListItemText primary="Number of units/residents" />
                                                  </ListItem>
                                                  <ListItem>
                                                       <ListItemText primary="Council member information" />
                                                  </ListItem>
                                                  <ListItem>
                                                       <ListItemText primary="Community rules and bylaws" />
                                                  </ListItem>
                                             </List>

                                             <Typography variant="h5" component="h3" gutterBottom id="first-steps" sx={{ mt: 4 }}>
                                                  First Steps
                                             </Typography>
                                             <Typography paragraph>Once your community is set up, you can:</Typography>
                                             <List>
                                                  <ListItem>
                                                       <ListItemText primary="1. Invite residents to join the platform" />
                                                  </ListItem>
                                                  <ListItem>
                                                       <ListItemText primary="2. Set up your first announcement" />
                                                  </ListItem>
                                                  <ListItem>
                                                       <ListItemText primary="3. Create a community event" />
                                                  </ListItem>
                                                  <ListItem>
                                                       <ListItemText primary="4. Establish your financial accounts" />
                                                  </ListItem>
                                             </List>
                                        </Box>

                                        <Box id="features" sx={{ mt: 6 }}>
                                             <Typography
                                                  variant="h4"
                                                  component="h2"
                                                  gutterBottom
                                                  sx={{ pb: 1, borderBottom: 1, borderColor: "divider" }}
                                             >
                                                  Features
                                             </Typography>

                                             <Typography variant="h5" component="h3" gutterBottom id="community-management" sx={{ mt: 4 }}>
                                                  Community Management
                                             </Typography>
                                             <Typography paragraph>
                                                  Our platform provides comprehensive tools for managing your residential community:
                                             </Typography>
                                             <List>
                                                  <ListItem>
                                                       <ListItemText primary="Resident directory with contact information" />
                                                  </ListItem>
                                                  <ListItem>
                                                       <ListItemText primary="Document storage for community bylaws and rules" />
                                                  </ListItem>
                                                  <ListItem>
                                                       <ListItemText primary="Event calendar for community gatherings" />
                                                  </ListItem>
                                                  <ListItem>
                                                       <ListItemText primary="Announcement system for important updates" />
                                                  </ListItem>
                                             </List>

                                             <Paper sx={{ mt: 3, mb: 6 }}>
                                                  <Tabs value={tabValue} onChange={handleTabChange} aria-label="example tabs">
                                                       <Tab label="Example" />
                                                       <Tab label="Code" />
                                                  </Tabs>
                                                  <TabPanel value={tabValue} index={0}>
                                                       <Typography variant="subtitle2">Creating a new announcement:</Typography>
                                                       <List>
                                                            <ListItem>
                                                                 <ListItemText primary="1. Navigate to the Announcements section" />
                                                            </ListItem>
                                                            <ListItem>
                                                                 <ListItemText primary="2. Click 'New Announcement'" />
                                                            </ListItem>
                                                            <ListItem>
                                                                 <ListItemText primary="3. Fill in the title, content, and select recipients" />
                                                            </ListItem>
                                                            <ListItem>
                                                                 <ListItemText primary="4. Choose notification methods (email, SMS, in-app)" />
                                                            </ListItem>
                                                            <ListItem>
                                                                 <ListItemText primary="5. Click 'Publish'" />
                                                            </ListItem>
                                                       </List>
                                                  </TabPanel>
                                                  <TabPanel value={tabValue} index={1}>
                                                       <Box
                                                            component="pre"
                                                            sx={{ p: 2, bgcolor: "background.paper", borderRadius: 1, overflow: "auto" }}
                                                       >
                                                            <code>
                                                                 {`// Example API call to create an announcement
const createAnnouncement = async () => {
  const response = await fetch('/api/announcements', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      title: 'Building Maintenance',
      content: 'Water will be shut off on Friday from 10am-2pm',
      recipients: 'all-residents',
      notifyBy: ['email', 'app']
    }),
  });
  
  return response.json();
};`}
                                                            </code>
                                                       </Box>
                                                  </TabPanel>
                                             </Paper>

                                             {/* More documentation content would go here */}
                                        </Box>
                                   </Box>
                              </Grid>
                         </Grid>
                    </Container>
               </Box>
               <Toaster />
          </Box>
     )
}

