"use client"

import { Box, Button, Card, CardContent, Chip, Typography, List, ListItem, ListItemText } from "@mui/material"
import Link from "next/link"
import LockIcon from "@mui/icons-material/Lock"
import { Client } from "@/app/types/client"
import { User } from "@supabase/supabase-js"

interface SecurityTabProps {
     userData: { client: Client; session: User }
}

export default function SecurityTab({ userData }: SecurityTabProps) {
     return (
          <>
               <Typography variant="h5" gutterBottom>
                    Security Settings
               </Typography>

               <Card variant="outlined" sx={{ mb: 4 }}>
                    <CardContent>
                         <Typography variant="h6" gutterBottom>
                              Password
                         </Typography>

                         <Typography variant="body2" color="text.secondary" paragraph>
                              It's a good idea to use a strong password that you don't use elsewhere.
                         </Typography>

                         <Button variant="outlined" startIcon={<LockIcon />} component={Link} href="/auth/reset-password">
                              Change Password
                         </Button>
                    </CardContent>
               </Card>

               <Card variant="outlined" sx={{ mb: 4 }}>
                    <CardContent>
                         <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                              <Typography variant="h6">Two-Factor Authentication</Typography>
                              {/* <Chip
                                   label={userData.twoFactorEnabled ? "Enabled" : "Disabled"}
                                   color={userData.twoFactorEnabled ? "success" : "default"}
                              /> */}
                         </Box>

                         <Typography variant="body2" color="text.secondary" paragraph>
                              Add an extra layer of security to your account by requiring both your password and a verification code from
                              your mobile phone.
                         </Typography>

                         {/* <Button variant={userData.twoFactorEnabled ? "outlined" : "contained"}>
                              {userData.twoFactorEnabled ? "Disable" : "Enable"} Two-Factor Authentication
                         </Button> */}
                    </CardContent>
               </Card>

               <Card variant="outlined">
                    <CardContent>
                         <Typography variant="h6" gutterBottom>
                              Active Sessions
                         </Typography>

                         <Typography variant="body2" color="text.secondary" paragraph>
                              These are the devices that are currently logged into your account.
                         </Typography>

                         <List>
                              <ListItem divider>
                                   <ListItemText
                                        primary="Chrome on Windows"
                                        secondary="Current session • Boston, MA • Last active: Just now"
                                   />
                                   <Chip label="Current" size="small" color="primary" />
                              </ListItem>
                              <ListItem divider>
                                   <ListItemText primary="Safari on iPhone" secondary="Boston, MA • Last active: 2 hours ago" />
                                   <Button size="small" color="error">
                                        Logout
                                   </Button>
                              </ListItem>
                              <ListItem>
                                   <ListItemText primary="Chrome on MacBook" secondary="Boston, MA • Last active: Yesterday" />
                                   <Button size="small" color="error">
                                        Logout
                                   </Button>
                              </ListItem>
                         </List>

                         <Button variant="outlined" color="error" sx={{ mt: 2 }}>
                              Logout of All Devices
                         </Button>
                    </CardContent>
               </Card>
          </>
     )
}

