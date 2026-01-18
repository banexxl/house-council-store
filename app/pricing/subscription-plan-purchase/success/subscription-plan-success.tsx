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
} from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import CloseIcon from "@mui/icons-material/Close";
import PrintIcon from "@mui/icons-material/Print";
import QrCode2Icon from "@mui/icons-material/QrCode2";
import QRCode from "qrcode";
import Animate from "@/app/components/animation-framer-motion";
import Link from "next/link";

interface SubscriptionSuccessPageProps {
     isTrial: boolean;
     userEmail: string;
     dashboardUrl: string;
}

const PLAY_STORE_URL =
     "https://play.google.com/store/apps/details?id=com.banexxl.nestlinkapp";

// -----------------------------
// Print helper (iframe)
// -----------------------------
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
     document.body.appendChild(iframe);

     const doc = iframe.contentWindow?.document;
     if (!doc) {
          document.body.removeChild(iframe);
          return;
     }

     const origin = window.location.origin;

     doc.open();
     doc.write(`
<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <base href="${origin}/" />
    <title>NestLink QR Poster</title>

    <style>
      @page {
        size: A4 portrait;
        margin: 12mm;
      }

      html, body {
        margin: 0;
        padding: 0;
        background: #fff;
        width: 100%;
        height: 100%;
      }

      * {
        box-sizing: border-box;
      }

      /* Full printable area (inside margins) */
      .page {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 8mm;
      }

      /* Actual poster container - scale down to fit */
      .sheet {
        width: 100%;
        max-width: 170mm;
        height: auto;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        text-align: center;
      }

      /* Scale down all images to fit */
      .sheet img {
        max-width: 100% !important;
        height: auto !important;
      }


               /* Ensure logo stays reasonable size (target Box with alt="NestLink") */
               .sheet img[alt="NestLink"] {
                    max-height: 125mm !important;
                    width: auto !important;
               }

      /* Scale QR code container and image */
      .sheet > div {
        max-width: 100% !important;
      }

      /* Target QR code specifically */
      .sheet img[alt*="QR"] {
        max-width: 45mm !important;
        max-height: 45mm !important;
        width: 45mm !important;
        height: 45mm !important;
      }
    </style>
  </head>

  <body>
    <div class="page">
      <div class="sheet">
        ${el.outerHTML}
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

     // Wait for logo + QR PNG to load
     if (imgs.length === 0) {
          setTimeout(doPrint, 200);
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


// -----------------------------
// QR PNG hook (high-res for print)
// -----------------------------
function useQrPng(value: string) {
     const [pngDataUrl, setPngDataUrl] = React.useState<string>("");

     React.useEffect(() => {
          let cancelled = false;

          (async () => {
               const url = await QRCode.toDataURL(value, {
                    errorCorrectionLevel: "M",
                    margin: 2,
                    width: 1200, // bigger = better print/scanning
               });
               if (!cancelled) setPngDataUrl(url);
          })();

          return () => {
               cancelled = true;
          };
     }, [value]);

     return pngDataUrl;
}

export default function SubscriptionSuccessPage({
     isTrial,
     userEmail,
     dashboardUrl,
}: SubscriptionSuccessPageProps) {
     const [qrOpen, setQrOpen] = React.useState(false);

     // High-res PNG QR for poster
     const qrPng = useQrPng(PLAY_STORE_URL);

     // Trial dates
     const trialEndDate = new Date();
     trialEndDate.setDate(trialEndDate.getDate() + 30);
     const formattedTrialEndDate = trialEndDate.toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
     });

     const firstBillingDate = new Date(trialEndDate);
     const formattedBillingDate = firstBillingDate.toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
     });

     // IMPORTANT: printable ID is ONLY used in the modal poster
     const printablePosterId = "nestlink-qr-poster-a4";

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
                                                            <ListItemText
                                                                 primary="Trial End Date"
                                                                 secondary={formattedTrialEndDate}
                                                            />
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

                                        {/* Mobile app section (NOT printed) */}
                                        <Box
                                             sx={{
                                                  mt: 2,
                                                  p: 2,
                                                  borderRadius: 2,
                                                  border: "1px solid",
                                                  borderColor: "divider",
                                             }}
                                        >
                                             <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                                                  Get the mobile app
                                             </Typography>
                                             <Typography
                                                  variant="body2"
                                                  color="text.secondary"
                                                  sx={{ mt: 0.5, mb: 1.5 }}
                                             >
                                                  Print a poster with a QR code for your tenants to quickly install the
                                                  NestLink app.
                                             </Typography>

                                             <Button
                                                  variant="contained"
                                                  startIcon={<QrCode2Icon />}
                                                  onClick={() => setQrOpen(true)}
                                             >
                                                  Open QR Poster
                                             </Button>
                                        </Box>
                                   </Grid>
                              </Grid>

                              {/* Bottom row: Image and CTA */}
                              <Box sx={{ mt: 4 }}>
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

                         {/* QR POSTER MODAL */}
                         <Dialog open={qrOpen} onClose={() => setQrOpen(false)} maxWidth={false}>
                              <DialogTitle sx={{ pr: 6 }}>
                                   Print QR Poster (A4)
                                   <IconButton
                                        onClick={() => setQrOpen(false)}
                                        aria-label="Close"
                                        sx={{ position: "absolute", right: 8, top: 8 }}
                                   >
                                        <CloseIcon />
                                   </IconButton>
                              </DialogTitle>

                              <DialogContent sx={{ bgcolor: "#f5f5f5", display: "flex", justifyContent: "center" }}>
                                   {/* Printable A4 poster */}
                                   <Box
                                        id={printablePosterId}
                                        sx={{
                                             width: "110mm",
                                             height: "197mm",
                                             bgcolor: "#fff",
                                             color: "#111",
                                             overflow: "hidden",
                                             display: "flex",
                                             flexDirection: "column",
                                             alignItems: "center",
                                             justifyContent: "center",
                                             textAlign: "center",
                                             boxSizing: "border-box",
                                        }}
                                   >
                                        {/* Logo */}
                                        <Box
                                             component="img"
                                             src="/logos/1-01.png"
                                             alt="NestLink"
                                             sx={{
                                                  height: "24mm",
                                                  width: "auto",
                                                  objectFit: "contain",
                                             }}
                                        />
                                        {/* Title */}
                                        <Typography sx={{ fontSize: 16, fontWeight: 700 }}>
                                             Install NestLink
                                        </Typography>

                                        <Typography sx={{ fontSize: 13, color: "#f8cd57" }}>
                                             Scan the QR code to open Google Play and install the app.
                                        </Typography>

                                        {/* QR */}
                                        <Box
                                             sx={{
                                                  mt: "6mm",
                                                  p: "4mm",
                                                  borderRadius: "4mm",
                                                  border: "2px solid #111",
                                                  bgcolor: "#fff",
                                                  display: "inline-flex",
                                                  alignItems: "center",
                                                  justifyContent: "center",
                                             }}
                                        >
                                             {qrPng ? (
                                                  <Box
                                                       component="img"
                                                       src={qrPng}
                                                       alt="NestLink QR"
                                                       sx={{
                                                            width: "50mm",
                                                            height: "50mm",
                                                       }}
                                                  />
                                             ) : (
                                                  <Box sx={{ width: "50mm", height: "50mm" }} />
                                             )}
                                        </Box>

                                        {/* Instructions */}
                                        <Typography sx={{ mt: "5mm", fontSize: 15, fontWeight: 800 }}>
                                             How to install
                                        </Typography>

                                        <Typography sx={{ mt: 1, fontSize: 14, color: "#444" }}>
                                             1) Open your phone camera<br />
                                             2) Point it at the QR code<br />
                                             3) Tap the link to install
                                        </Typography>

                                        {/* Footer link */}
                                        <Typography sx={{ mt: "6mm", fontSize: 11.5, color: "#666", wordBreak: "break-all", maxWidth: "170mm" }}>
                                             {PLAY_STORE_URL}
                                        </Typography>

                                        <Typography sx={{ mt: 1, fontSize: 11.5, color: "#999" }}>
                                             © NestLink • Building communication made simple
                                        </Typography>
                                   </Box>
                              </DialogContent>

                              <DialogActions sx={{ px: 3, pb: 2 }}>
                                   <Button onClick={() => setQrOpen(false)} variant="outlined">
                                        Close
                                   </Button>
                                   <Button
                                        onClick={() => printElementById(printablePosterId)}
                                        variant="contained"
                                        startIcon={<PrintIcon />}
                                        disabled={!qrPng} // wait for QR to be ready
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
