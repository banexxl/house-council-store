"use client"

import { Box, Button, Typography, List, ListItem, ListItemText, Switch } from "@mui/material"

interface NotificationsTabProps {
     notificationSettings: any[]
     handleNotificationToggle: (id: string) => void
}

export default function NotificationsTab({ notificationSettings, handleNotificationToggle }: NotificationsTabProps) {
     return (
          <>
               <Typography variant="h5" gutterBottom>
                    Notification Preferences
               </Typography>

               <Typography variant="body2" color="text.secondary" paragraph>
                    Manage how you receive notifications and updates from NestLink.
               </Typography>

               <List>
                    {notificationSettings.map((setting) => (
                         <ListItem
                              key={setting.id}
                              secondaryAction={
                                   <Switch edge="end" checked={setting.enabled} onChange={() => handleNotificationToggle(setting.id)} />
                              }
                              divider
                         >
                              <ListItemText primary={setting.type} secondary={setting.description} />
                         </ListItem>
                    ))}
               </List>

               <Box sx={{ mt: 3 }}>
                    <Button variant="contained">Save Preferences</Button>
               </Box>
          </>
     )
}

