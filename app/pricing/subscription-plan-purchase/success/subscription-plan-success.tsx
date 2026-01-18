"use client";

import React from "react";
import Image from "next/image";
import {
     Box,
     Container,
     Typography,
     Paper,
     Button,
     Divider,
     List,
     ListItem,
     ListItemIcon,
     ListItemText,
     Grid,
     Dialog,
     DialogActions,
     DialogContent,
     DialogTitle,
     IconButton,
     Stack,
} from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import CloseIcon from "@mui/icons-material/Close";
import PrintIcon from "@mui/icons-material/Print";
import QrCode2Icon from "@mui/icons-material/QrCode2";
import Animate from "@/app/components/animation-framer-motion";
import Link from "next/link";
import { QRCodeSVG } from "qrcode.react";

interface SubscriptionSuccessPageProps {
     isTrial: boolean;
     userEmail: string;
     dashboardUrl: string;
}

const PLAY_STORE_URL =
     "https://play.google.com/store/apps/details?id=com.banexxl.nestlinkapp";

function printElementById(elementId: string) {
     const el = document.getElementById(elementId);
     if (!el) return;

     const iframe = document.createElement("iframe");
     iframe.style.position = "fixed";
     iframe.style.right = "0";
     iframe.style.bottom = "0";
     iframe.style.width = "0";
     iframe.style.height = "0";
     iframe.style.border = "0";
     iframe.setAttribute("aria-hidden", "true");
     document.body.appendChild(iframe);

     const doc = iframe.contentWindow?.document;
     if (!doc) {
          document.body.removeChild(iframe);
          return;
     }

     const origin = window.location.origin;

     // IMPORTANT: use OUTER html so the wrapper styles/structure stay together
     const printableHtml = el.outerHTML;

     doc.open();
     doc.write(`
<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <base href="${origin}/" />
    <title>Print QR</title>
    <style>
      @page { margin: 12mm; }
      html, body { margin: 0; padding: 0; }
      body { font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif; }

      /* Center and keep as ONE printable block */
      .wrap {
        display: flex;
        justify-content: center;
        align-items: flex-start;
        padding: 12mm;
      }

      /* Prevent page splitting */
      .no-break {
        break-inside: avoid;
        page-break-inside: avoid;
      }

      /* Make sure QR/logo fit on one page */
      svg { max-width: 100%; height: auto; }
      img { max-width: 100%; height: auto; }

      /* Optional: if your block is too wide, cap it */
      #${elementId} { max-width: 360px; }
    </style>
  </head>
  <body>
    <div class="wrap">
      <div class="no-break">
        ${printableHtml}
      </div>
    </div>
  </body>
</html>
  `);
     doc.close();

     const win = iframe.contentWindow!;
     const imgs = Array.from(doc.images);

     const cleanup = () => setTimeout(() => document.body.removeChild(iframe), 300);
     const doPrint = () => {
          win.focus();
          win.print();
          cleanup();
     };

     // Wait for images (logo) before printing
     if (imgs.length === 0) {
          setTimeout(doPrint, 150);
          return;
     }

     let loaded = 0;
     const done = () => {
          loaded += 1;
          if (loaded >= imgs.length) setTimeout(doPrint, 150);
     };

     imgs.forEach((img) => {
          if (img.complete) done();
          else {
               img.onload = done;
               img.onerror = done;
          }
     });
}


export default function SubscriptionSuccessPage({
     isTrial,
     userEmail,
     dashboardUrl,
}: SubscriptionSuccessPageProps) {
     const [qrOpen, setQrOpen] = React.useState(false);

     // Calculate trial end date (30 days from now)
     const trialEndDate = new Date();
     trialEndDate.setDate(trialEndDate.getDate() + 30);
     const formattedTrialEndDate = trialEndDate.toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
     });

     // Calculate the first billing date (after trial)
     const firstBillingDate = new Date(trialEndDate);
     const formattedBillingDate = firstBillingDate.toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
     });

     const printableId = "nestlink-qr-print-block";

     return (
          <Container maxWidth="md" sx={{ py: 8 }}>
               <Animate>
                    <Paper
                         elevation={3}
                         sx={{
                              p: 4,
                              borderRadius: 2,
                              position: "relative",
                              overflow: "hidden",
                         }}
                    >
                         <Box sx={{ position: "relative", zIndex: 1 }}>
                              <Box sx={{ textAlign: "center", mb: 6 }}>
                                   <Box sx={{ display: "flex", justifyContent: "center", mb: 3 }}>
                                        <CheckCircleOutlineIcon color="success" sx={{ fontSize: 80 }} />
                                   </Box>
                                   <Typography variant="h3" gutterBottom>
                                        {isTrial ? "Your Free Trial Has Started!" : "Subscription Successful!"}
                                   </Typography>
                                   <Typography variant="subtitle1">
                                        {isTrial ? (
                                             <>You now have access to all plan features for the next 30 days.</>
                                        ) : (
                                             <>You now have full access to all plan features.</>
                                        )}
                                   </Typography>
                              </Box>

                              {/* Top grid row: Subscription Details + Next Steps */}
                              <Grid container spacing={6}>
                                   <Grid size={{ xs: 12, md: 6 }}>
                                        <Typography variant="h5" gutterBottom>
                                             {isTrial ? "Trial Details" : "Subscription Details"}
                                        </Typography>
                                        <Divider sx={{ mb: 3 }} />
                                        <List sx={{ pl: 1 }}>
                                             <ListItem disableGutters sx={{ pb: 1 }}>
                                                  <ListItemIcon sx={{ minWidth: 36 }}>
                                                       <AccountCircleIcon color="primary" />
                                                  </ListItemIcon>
                                                  <ListItemText primary="Account" secondary={userEmail} />
                                             </ListItem>

                                             {isTrial && (
                                                  <>
                                                       <ListItem disableGutters sx={{ pb: 1 }}>
                                                            <ListItemIcon sx={{ minWidth: 36 }}>
                                                                 <CalendarTodayIcon color="primary" />
                                                            </ListItemIcon>
                                                            <ListItemText primary="Trial End Date" secondary={formattedTrialEndDate} />
                                                       </ListItem>

                                                       <ListItem disableGutters sx={{ pb: 1 }}>
                                                            <ListItemIcon sx={{ minWidth: 36 }}>
                                                                 <CreditCardIcon color="primary" />
                                                            </ListItemIcon>
                                                            <ListItemText
                                                                 primary="First Billing Date"
                                                                 secondary={formattedBillingDate}
                                                            />
                                                       </ListItem>
                                                  </>
                                             )}
                                        </List>
                                   </Grid>

                                   <Grid size={{ xs: 12, md: 6 }}>
                                        <Typography variant="h5" gutterBottom>
                                             Next Steps
                                        </Typography>
                                        <Divider sx={{ mb: 3 }} />

                                        <List sx={{ pl: 1 }}>
                                             <ListItem disableGutters sx={{ pb: 1 }}>
                                                  <ListItemIcon sx={{ minWidth: 36 }}>
                                                       <CheckCircleOutlineIcon color="primary" />
                                                  </ListItemIcon>
                                                  <ListItemText
                                                       primary="Set up your profile"
                                                       secondary="Complete your profile to get the most out of our platform"
                                                  />
                                             </ListItem>

                                             <ListItem disableGutters sx={{ pb: 1 }}>
                                                  <ListItemIcon sx={{ minWidth: 36 }}>
                                                       <CheckCircleOutlineIcon color="primary" />
                                                  </ListItemIcon>
                                                  <ListItemText
                                                       primary="Explore the dashboard"
                                                       secondary="Familiarize yourself with all the features available to you"
                                                  />
                                             </ListItem>
                                        </List>

                                        {/* NEW: Mobile app QR section */}
                                        <Box id={printableId} sx={{ mt: 2, p: 2, borderRadius: 2, border: "1px solid", borderColor: "divider" }}>
                                             <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                                  Get the mobile app
                                             </Typography>
                                             <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, mb: 1.5 }}>
                                                  Send this QR code or print it out for your tenants
                                                  to report issues faster and stay updated on the go.
                                             </Typography>

                                             <Button
                                                  variant="contained"
                                                  startIcon={<QrCode2Icon />}
                                                  onClick={() => setQrOpen(true)}
                                             >
                                                  Show QR Code
                                             </Button>
                                        </Box>
                                   </Grid>
                              </Grid>

                              {/* Bottom row: Image and CTA */}
                              <Box>
                                   <Box sx={{ height: 400, position: "relative", mb: 4 }}>
                                        <Image
                                             src="/cards/ty-card.png"
                                             alt="Thank You"
                                             fill
                                             style={{ objectFit: "contain", borderRadius: "8px" }}
                                        />
                                   </Box>

                                   <Box sx={{ textAlign: "center" }}>
                                        <Typography variant="h6" gutterBottom>
                                             Ready to get started?
                                        </Typography>
                                        <Button
                                             variant="contained"
                                             size="large"
                                             onClick={() => window.open(dashboardUrl, "_blank")}
                                             sx={{
                                                  mb: 2,
                                                  minWidth: 200,
                                                  animation: "pulse 2s infinite",
                                                  "@keyframes pulse": {
                                                       "0%": { transform: "scale(1)" },
                                                       "50%": { transform: "scale(1.05)" },
                                                       "100%": { transform: "scale(1)" },
                                                  },
                                             }}
                                        >
                                             Go to Dashboard
                                        </Button>

                                        <Typography variant="body2" color="text.secondary">
                                             Need help? Check out our{" "}
                                             <Link href="/docs" passHref>
                                                  <Typography component="span" variant="body2" color="primary">
                                                       docs
                                                  </Typography>
                                             </Link>{" "}
                                             or{" "}
                                             <Link href="/contact" passHref>
                                                  <Typography component="span" variant="body2" color="primary">
                                                       contact support
                                                  </Typography>
                                             </Link>
                                             .
                                        </Typography>
                                   </Box>
                              </Box>
                         </Box>

                         {/* QR MODAL */}
                         <Dialog open={qrOpen} onClose={() => setQrOpen(false)} maxWidth="xs" fullWidth>
                              <DialogTitle sx={{ pr: 6 }}>
                                   Get NestLink on Google Play
                                   <IconButton
                                        onClick={() => setQrOpen(false)}
                                        aria-label="Close"
                                        sx={{ position: "absolute", right: 8, top: 8 }}
                                   >
                                        <CloseIcon />
                                   </IconButton>
                              </DialogTitle>

                              <DialogContent>
                                   <Box
                                        id={printableId}
                                        sx={{
                                             p: 2.5,
                                             borderRadius: 2,
                                             border: "1px solid",
                                             borderColor: "divider",
                                             bgcolor: "background.paper",
                                             width: "100%",
                                             maxWidth: 360,
                                             mx: "auto",
                                        }}
                                   >
                                        <Stack spacing={1} alignItems="center">
                                             {/* Update logo path as needed */}
                                             <Box
                                                  component="img"
                                                  src="/logos/1-01.png"
                                                  alt="NestLink"
                                                  sx={{
                                                       maxHeight: 86,
                                                       maxWidth: "100%",
                                                       objectFit: "contain",
                                                  }}
                                             />

                                             <Divider flexItem />

                                             <Box
                                                  sx={{
                                                       p: 1.5,
                                                       bgcolor: "#fff",
                                                       borderRadius: 2,
                                                       display: "inline-flex",
                                                  }}
                                             >
                                                  <QRCodeSVG value={PLAY_STORE_URL} size={220} level="M" includeMargin />
                                             </Box>

                                             <Typography variant="body2" sx={{ textAlign: "center" }}>
                                                  Scan to open the app on Google Play
                                             </Typography>

                                             <Typography
                                                  variant="caption"
                                                  sx={{ textAlign: "center", wordBreak: "break-all", opacity: 0.7 }}
                                             >
                                                  {PLAY_STORE_URL}
                                             </Typography>
                                        </Stack>
                                   </Box>
                              </DialogContent>

                              <DialogActions sx={{ px: 3, pb: 2 }}>
                                   <Button onClick={() => setQrOpen(false)} variant="outlined">
                                        Close
                                   </Button>
                                   <Button
                                        onClick={() => printElementById(printableId)}
                                        variant="contained"
                                        startIcon={<PrintIcon />}
                                   >
                                        Print
                                   </Button>
                              </DialogActions>
                         </Dialog>
                    </Paper>
               </Animate>
          </Container>
     );
}
