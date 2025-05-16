"use client"

import { useRouter } from "next/navigation"
import {
     Box,
     Container,
     Typography,
     Paper,
     Button,
     List,
     ListItem,
     ListItemIcon,
     ListItemText,
     Divider,
} from "@mui/material"
import WarningIcon from "@mui/icons-material/Warning"
import HelpOutlineIcon from "@mui/icons-material/HelpOutline"
import Animate from "@/app/components/animation-framer-motion"

interface FreeTrialErrorProps {
     userEmail: string
}

export default function SubscriptionErrorPage({ userEmail }: FreeTrialErrorProps) {
     const router = useRouter()

     return (
          <Container maxWidth="md" sx={{ py: 8 }}>
               <Animate>
                    <Paper elevation={3} sx={{ p: 4, borderRadius: 2, textAlign: "center" }}>
                         <Box sx={{ color: "error.main", mb: 3 }}>
                              <WarningIcon sx={{ fontSize: 80 }} />
                         </Box>

                         <Typography variant="h4" gutterBottom>
                              There was an error starting your free trial.
                         </Typography>

                         <Typography variant="body1" sx={{ mb: 4 }}>
                              It looks like there was an error starting your free trial. You can try again, or contact our support team at support@nest-link.app if you need help.
                         </Typography>

                         <Box sx={{ bgcolor: "background.default", p: 3, borderRadius: 2, mb: 4, maxWidth: 500, mx: "auto" }}>
                              <Typography variant="subtitle1" gutterBottom>
                                   Contact Details
                              </Typography>
                              <List>
                                   <ListItem>
                                        <ListItemIcon>
                                             <HelpOutlineIcon color="primary" />
                                        </ListItemIcon>
                                        <ListItemText primary="Account Email" secondary={userEmail} />
                                   </ListItem>
                              </List>
                         </Box>

                         <Divider sx={{ my: 4 }} />

                         <Typography variant="h6" gutterBottom>
                              What's Next?
                         </Typography>

                         <Box sx={{ display: "flex", flexDirection: "column", gap: 2, maxWidth: 500, mx: "auto", mb: 4 }}>
                              <Button
                                   variant="contained"
                                   startIcon={<HelpOutlineIcon />}
                                   onClick={() => router.push("/pricing")}
                                   fullWidth
                                   size="large"
                              >
                                   Try Again
                              </Button>
                         </Box>

                         <Typography variant="body2" color="text.secondary">
                              If you have any questions or need help, contact our support team at support@nest-link.app
                         </Typography>
                    </Paper>
               </Animate>
          </Container>
     )
}

