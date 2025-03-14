"use client"

import { useState } from "react"
import {
     Box,
     Container,
     Typography,
     Paper,
     Divider,
     List,
     ListItem,
     ListItemText,
     Breadcrumbs,
     Link as MuiLink,
     Chip,
     Button,
     Alert,
} from "@mui/material"
import Link from "next/link"
import NavigateNextIcon from "@mui/icons-material/NavigateNext"
import GavelIcon from "@mui/icons-material/Gavel"

// Table of contents items
const tableOfContents = [
     { id: "introduction", label: "Introduction" },
     { id: "definitions", label: "Definitions" },
     { id: "account-terms", label: "Account Terms" },
     { id: "payment-terms", label: "Payment Terms" },
     { id: "service-usage", label: "Service Usage" },
     { id: "intellectual-property", label: "Intellectual Property" },
     { id: "user-content", label: "User Content" },
     { id: "prohibited-activities", label: "Prohibited Activities" },
     { id: "limitation-liability", label: "Limitation of Liability" },
     { id: "indemnification", label: "Indemnification" },
     { id: "termination", label: "Termination" },
     { id: "governing-law", label: "Governing Law" },
     { id: "changes", label: "Changes to Terms" },
     { id: "contact", label: "Contact Us" },
]

export const TermsPage = () => {
     const [activeSection, setActiveSection] = useState("introduction")

     const handleSectionClick = (sectionId: string) => {
          setActiveSection(sectionId)
          const element = document.getElementById(sectionId)
          if (element) {
               element.scrollIntoView({ behavior: "smooth" })
          }
     }

     // Last updated date
     const lastUpdated = "January 15, 2024"

     return (
          <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
               <Box component="main" sx={{ flexGrow: 1, py: { xs: 4, md: 6 } }}>
                    <Container maxWidth="lg">
                         {/* Breadcrumbs */}
                         <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} aria-label="breadcrumb" sx={{ mb: 4 }}>
                              <MuiLink component={Link} href="/" underline="hover" color="inherit">
                                   Home
                              </MuiLink>
                              <Typography color="text.primary">Terms and Conditions</Typography>
                         </Breadcrumbs>

                         <Box sx={{ display: "flex", alignItems: "center", mb: 4 }}>
                              <GavelIcon color="primary" sx={{ fontSize: 32, mr: 2 }} />
                              <Typography variant="h3" component="h1">
                                   Terms and Conditions
                              </Typography>
                         </Box>

                         <Typography variant="subtitle1" sx={{ mb: 1 }}>
                              Last Updated: {lastUpdated}
                         </Typography>

                         <Chip label="Official Document" color="primary" size="small" sx={{ mb: 4 }} />

                         <Alert severity="info" sx={{ mb: 4 }}>
                              Please read these Terms and Conditions carefully before using our Service. By accessing or using the
                              Service, you agree to be bound by these Terms.
                         </Alert>

                         <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, gap: 4 }}>
                              {/* Table of Contents Sidebar */}
                              <Box
                                   component={Paper}
                                   elevation={2}
                                   sx={{
                                        width: { xs: "100%", md: 280 },
                                        height: { md: "fit-content" },
                                        position: { md: "sticky" },
                                        top: 24,
                                        p: 3,
                                        mb: { xs: 4, md: 0 },
                                   }}
                              >
                                   <Typography variant="h6" gutterBottom>
                                        Table of Contents
                                   </Typography>
                                   <List dense disablePadding>
                                        {tableOfContents.map((item) => (
                                             <ListItem
                                                  key={item.id}
                                                  disablePadding
                                                  sx={{
                                                       py: 0.5,
                                                       pl: 1,
                                                       borderLeft: activeSection === item.id ? 2 : 0,
                                                       borderColor: "primary.main",
                                                       bgcolor: activeSection === item.id ? "action.selected" : "transparent",
                                                       borderRadius: "0 4px 4px 0",
                                                  }}
                                             >
                                                  <ListItemText
                                                       primary={
                                                            <MuiLink
                                                                 component="button"
                                                                 underline="hover"
                                                                 color={activeSection === item.id ? "primary" : "inherit"}
                                                                 onClick={() => handleSectionClick(item.id)}
                                                                 sx={{
                                                                      textAlign: "left",
                                                                      fontWeight: activeSection === item.id ? 600 : 400,
                                                                 }}
                                                            >
                                                                 {item.label}
                                                            </MuiLink>
                                                       }
                                                  />
                                             </ListItem>
                                        ))}
                                   </List>

                                   <Button variant="outlined" fullWidth sx={{ mt: 3 }} component={Link} href="/terms.pdf" target="_blank">
                                        Download PDF
                                   </Button>
                              </Box>

                              {/* Main Content */}
                              <Box
                                   component={Paper}
                                   elevation={2}
                                   sx={{
                                        flexGrow: 1,
                                        p: { xs: 3, md: 4 },
                                   }}
                              >
                                   <section id="introduction">
                                        <Typography variant="h5" component="h2" gutterBottom>
                                             Introduction
                                        </Typography>
                                        <Typography paragraph>
                                             Welcome to HouseCouncil. These Terms and Conditions ("Terms", "Terms and Conditions") govern your use
                                             of our website and mobile application (collectively, the "Service") operated by HouseCouncil ("us",
                                             "we", or "our").
                                        </Typography>
                                        <Typography paragraph>
                                             By accessing or using the Service, you agree to be bound by these Terms. If you disagree with any part
                                             of the Terms, then you may not access the Service.
                                        </Typography>
                                        <Typography paragraph>
                                             These Terms apply to all visitors, users, and others who access or use the Service. By accessing or
                                             using the Service, you agree to be bound by these Terms. If you disagree with any part of the Terms,
                                             then you may not access the Service.
                                        </Typography>
                                        <Divider sx={{ my: 4 }} />
                                   </section>

                                   <section id="definitions">
                                        <Typography variant="h5" component="h2" gutterBottom>
                                             Definitions
                                        </Typography>
                                        <Typography paragraph>For the purposes of these Terms and Conditions:</Typography>
                                        <List>
                                             <ListItem>
                                                  <ListItemText
                                                       primary="Service"
                                                       secondary="Refers to the HouseCouncil website and mobile application."
                                                  />
                                             </ListItem>
                                             <ListItem>
                                                  <ListItemText
                                                       primary="User"
                                                       secondary="Refers to the individual accessing or using the Service, or the company, or other legal entity on behalf of which such individual is accessing or using the Service, as applicable."
                                                  />
                                             </ListItem>
                                             <ListItem>
                                                  <ListItemText
                                                       primary="Account"
                                                       secondary="A unique account created for You to access our Service or parts of our Service."
                                                  />
                                             </ListItem>
                                             <ListItem>
                                                  <ListItemText
                                                       primary="Content"
                                                       secondary="Refers to any information, data, text, software, music, sound, photographs, graphics, videos, messages, or other materials that can be posted, uploaded, linked to, or otherwise made available through the Service."
                                                  />
                                             </ListItem>
                                             <ListItem>
                                                  <ListItemText
                                                       primary="Subscription"
                                                       secondary="Refers to the arrangement by which a User gains access to the Service, or parts of the Service, for a specified period of time in return for periodic payment."
                                                  />
                                             </ListItem>
                                        </List>
                                        <Divider sx={{ my: 4 }} />
                                   </section>

                                   <section id="account-terms">
                                        <Typography variant="h5" component="h2" gutterBottom>
                                             Account Terms
                                        </Typography>
                                        <Typography paragraph>
                                             When you create an account with us, you must provide accurate, complete, and up-to-date information at
                                             all times. Failure to do so constitutes a breach of the Terms, which may result in immediate
                                             termination of your account on our Service.
                                        </Typography>
                                        <Typography paragraph>
                                             You are responsible for safeguarding the password that you use to access the Service and for any
                                             activities or actions under your password, whether your password is with our Service or a third-party
                                             service.
                                        </Typography>
                                        <Typography paragraph>
                                             You agree not to disclose your password to any third party. You must notify us immediately upon
                                             becoming aware of any breach of security or unauthorized use of your account.
                                        </Typography>
                                        <Typography paragraph>
                                             You may not use as a username the name of another person or entity or that is not lawfully available
                                             for use, a name or trademark that is subject to any rights of another person or entity other than you
                                             without appropriate authorization, or a name that is otherwise offensive, vulgar, or obscene.
                                        </Typography>
                                        <Divider sx={{ my: 4 }} />
                                   </section>

                                   <section id="payment-terms">
                                        <Typography variant="h5" component="h2" gutterBottom>
                                             Payment Terms
                                        </Typography>
                                        <Typography paragraph>
                                             Some features of the Service are billed on a subscription basis. You will be billed in advance on a
                                             recurring and periodic basis, depending on the type of subscription plan you select.
                                        </Typography>
                                        <Typography paragraph>
                                             At the end of each period, your subscription will automatically renew under the same conditions unless
                                             you cancel it or we cancel it. You may cancel your subscription renewal either through your online
                                             account management page or by contacting our customer support team.
                                        </Typography>
                                        <Typography paragraph>
                                             A valid payment method, including credit card, is required to process the payment for your
                                             subscription. You shall provide accurate and complete billing information including full name,
                                             address, state, zip code, telephone number, and valid payment method information.
                                        </Typography>
                                        <Typography paragraph>
                                             Should automatic billing fail to occur for any reason, we will issue an electronic invoice indicating
                                             that you must proceed manually, within a certain deadline date, with the full payment corresponding to
                                             the billing period as indicated on the invoice.
                                        </Typography>
                                        <Typography paragraph>
                                             We reserve the right to change, modify, or update our pricing at any time. If we do so, we will notify
                                             you by either sending an email to the address associated with your account or by displaying a
                                             prominent notice within the Service. Your continued use of the Service after the price change becomes
                                             effective constitutes your agreement to pay the modified price.
                                        </Typography>
                                        <Divider sx={{ my: 4 }} />
                                   </section>

                                   <section id="service-usage">
                                        <Typography variant="h5" component="h2" gutterBottom>
                                             Service Usage
                                        </Typography>
                                        <Typography paragraph>
                                             Our Service allows you to post, link, store, share, and otherwise make available certain information,
                                             text, graphics, videos, or other material. You are responsible for the Content that you post to the
                                             Service, including its legality, reliability, and appropriateness.
                                        </Typography>
                                        <Typography paragraph>
                                             By posting Content to the Service, you grant us the right and license to use, modify, publicly
                                             perform, publicly display, reproduce, and distribute such Content on and through the Service. You
                                             retain any and all of your rights to any Content you submit, post, or display on or through the
                                             Service and you are responsible for protecting those rights.
                                        </Typography>
                                        <Typography paragraph>
                                             You represent and warrant that: (i) the Content is yours (you own it) or you have the right to use it
                                             and grant us the rights and license as provided in these Terms, and (ii) the posting of your Content
                                             on or through the Service does not violate the privacy rights, publicity rights, copyrights, contract
                                             rights, or any other rights of any person.
                                        </Typography>
                                        <Divider sx={{ my: 4 }} />
                                   </section>

                                   <section id="intellectual-property">
                                        <Typography variant="h5" component="h2" gutterBottom>
                                             Intellectual Property
                                        </Typography>
                                        <Typography paragraph>
                                             The Service and its original content (excluding Content provided by users), features, and
                                             functionality are and will remain the exclusive property of HouseCouncil and its licensors. The
                                             Service is protected by copyright, trademark, and other laws of both the United States and foreign
                                             countries. Our trademarks and trade dress may not be used in connection with any product or service
                                             without the prior written consent of HouseCouncil.
                                        </Typography>
                                        <Typography paragraph>
                                             You acknowledge and agree that the Service may contain proprietary and confidential information that
                                             is protected by applicable intellectual property and other laws. You agree not to modify, rent, lease,
                                             loan, sell, distribute, or create derivative works based on the Service, in whole or in part.
                                        </Typography>
                                        <Divider sx={{ my: 4 }} />
                                   </section>

                                   <section id="user-content">
                                        <Typography variant="h5" component="h2" gutterBottom>
                                             User Content
                                        </Typography>
                                        <Typography paragraph>
                                             Our Service allows you to post, link, store, share, and otherwise make available certain information,
                                             text, graphics, videos, or other material. You are responsible for the Content that you post to the
                                             Service, including its legality, reliability, and appropriateness.
                                        </Typography>
                                        <Typography paragraph>
                                             By posting Content to the Service, you grant us the right and license to use, modify, publicly
                                             perform, publicly display, reproduce, and distribute such Content on and through the Service. You
                                             retain any and all of your rights to any Content you submit, post, or display on or through the
                                             Service and you are responsible for protecting those rights.
                                        </Typography>
                                        <Typography paragraph>
                                             You represent and warrant that: (i) the Content is yours (you own it) or you have the right to use it
                                             and grant us the rights and license as provided in these Terms, and (ii) the posting of your Content
                                             on or through the Service does not violate the privacy rights, publicity rights, copyrights, contract
                                             rights, or any other rights of any person.
                                        </Typography>
                                        <Divider sx={{ my: 4 }} />
                                   </section>

                                   <section id="prohibited-activities">
                                        <Typography variant="h5" component="h2" gutterBottom>
                                             Prohibited Activities
                                        </Typography>
                                        <Typography paragraph>
                                             You may not access or use the Service for any purpose other than that for which we make the Service
                                             available. The Service may not be used in connection with any commercial endeavors except those that
                                             are specifically endorsed or approved by us.
                                        </Typography>
                                        <Typography paragraph>As a user of the Service, you agree not to:</Typography>
                                        <List>
                                             <ListItem>
                                                  <ListItemText primary="Use the Service in any manner that could disable, overburden, damage, or impair the Service or interfere with any other party's use of the Service." />
                                             </ListItem>
                                             <ListItem>
                                                  <ListItemText primary="Use any robot, spider, or other automatic device, process, or means to access the Service for any purpose, including monitoring or copying any of the material on the Service." />
                                             </ListItem>
                                             <ListItem>
                                                  <ListItemText primary="Use any manual process to monitor or copy any of the material on the Service or for any other unauthorized purpose without our prior written consent." />
                                             </ListItem>
                                             <ListItem>
                                                  <ListItemText primary="Use any device, software, or routine that interferes with the proper working of the Service." />
                                             </ListItem>
                                             <ListItem>
                                                  <ListItemText primary="Introduce any viruses, trojan horses, worms, logic bombs, or other material which is malicious or technologically harmful." />
                                             </ListItem>
                                             <ListItem>
                                                  <ListItemText primary="Attempt to gain unauthorized access to, interfere with, damage, or disrupt any parts of the Service, the server on which the Service is stored, or any server, computer, or database connected to the Service." />
                                             </ListItem>
                                             <ListItem>
                                                  <ListItemText primary="Attack the Service via a denial-of-service attack or a distributed denial-of-service attack." />
                                             </ListItem>
                                             <ListItem>
                                                  <ListItemText primary="Otherwise attempt to interfere with the proper working of the Service." />
                                             </ListItem>
                                        </List>
                                        <Divider sx={{ my: 4 }} />
                                   </section>

                                   <section id="limitation-liability">
                                        <Typography variant="h5" component="h2" gutterBottom>
                                             Limitation of Liability
                                        </Typography>
                                        <Typography paragraph>
                                             In no event shall HouseCouncil, nor its directors, employees, partners, agents, suppliers, or
                                             affiliates, be liable for any indirect, incidental, special, consequential, or punitive damages,
                                             including without limitation, loss of profits, data, use, goodwill, or other intangible losses,
                                             resulting from (i) your access to or use of or inability to access or use the Service; (ii) any
                                             conduct or content of any third party on the Service; (iii) any content obtained from the Service; and
                                             (iv) unauthorized access, use, or alteration of your transmissions or content, whether based on
                                             warranty, contract, tort (including negligence), or any other legal theory, whether or not we have
                                             been informed of the possibility of such damage, and even if a remedy set forth herein is found to
                                             have failed of its essential purpose.
                                        </Typography>
                                        <Typography paragraph>
                                             Some jurisdictions do not allow the exclusion of certain warranties or the limitation or exclusion of
                                             liability for incidental or consequential damages. Accordingly, some of the above limitations may not
                                             apply to you.
                                        </Typography>
                                        <Divider sx={{ my: 4 }} />
                                   </section>

                                   <section id="indemnification">
                                        <Typography variant="h5" component="h2" gutterBottom>
                                             Indemnification
                                        </Typography>
                                        <Typography paragraph>
                                             You agree to defend, indemnify, and hold harmless HouseCouncil, its parent, subsidiaries, affiliates,
                                             and their respective directors, officers, employees, agents, service providers, contractors,
                                             licensors, suppliers, successors, and assigns from and against any claims, liabilities, damages,
                                             judgments, awards, losses, costs, expenses, or fees (including reasonable attorneys' fees) arising out
                                             of or relating to your violation of these Terms or your use of the Service, including, but not limited
                                             to, your User Content, any use of the Service's content, services, and products other than as
                                             expressly authorized in these Terms, or your use of any information obtained from the Service.
                                        </Typography>
                                        <Divider sx={{ my: 4 }} />
                                   </section>

                                   <section id="termination">
                                        <Typography variant="h5" component="h2" gutterBottom>
                                             Termination
                                        </Typography>
                                        <Typography paragraph>
                                             We may terminate or suspend your account immediately, without prior notice or liability, for any
                                             reason whatsoever, including without limitation if you breach the Terms.
                                        </Typography>
                                        <Typography paragraph>
                                             Upon termination, your right to use the Service will immediately cease. If you wish to terminate your
                                             account, you may simply discontinue using the Service or contact us to request account deletion.
                                        </Typography>
                                        <Typography paragraph>
                                             All provisions of the Terms which by their nature should survive termination shall survive
                                             termination, including, without limitation, ownership provisions, warranty disclaimers, indemnity, and
                                             limitations of liability.
                                        </Typography>
                                        <Divider sx={{ my: 4 }} />
                                   </section>

                                   <section id="governing-law">
                                        <Typography variant="h5" component="h2" gutterBottom>
                                             Governing Law
                                        </Typography>
                                        <Typography paragraph>
                                             These Terms shall be governed and construed in accordance with the laws of the Commonwealth of
                                             Massachusetts, United States, without regard to its conflict of law provisions.
                                        </Typography>
                                        <Typography paragraph>
                                             Our failure to enforce any right or provision of these Terms will not be considered a waiver of those
                                             rights. If any provision of these Terms is held to be invalid or unenforceable by a court, the
                                             remaining provisions of these Terms will remain in effect.
                                        </Typography>
                                        <Typography paragraph>
                                             These Terms constitute the entire agreement between us regarding our Service, and supersede and
                                             replace any prior agreements we might have between us regarding the Service.
                                        </Typography>
                                        <Divider sx={{ my: 4 }} />
                                   </section>

                                   <section id="changes">
                                        <Typography variant="h5" component="h2" gutterBottom>
                                             Changes to Terms
                                        </Typography>
                                        <Typography paragraph>
                                             We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a
                                             revision is material, we will try to provide at least 30 days' notice prior to any new terms taking
                                             effect. What constitutes a material change will be determined at our sole discretion.
                                        </Typography>
                                        <Typography paragraph>
                                             By continuing to access or use our Service after those revisions become effective, you agree to be
                                             bound by the revised terms. If you do not agree to the new terms, please stop using the Service.
                                        </Typography>
                                        <Divider sx={{ my: 4 }} />
                                   </section>

                                   <section id="contact">
                                        <Typography variant="h5" component="h2" gutterBottom>
                                             Contact Us
                                        </Typography>
                                        <Typography paragraph>If you have any questions about these Terms, please contact us:</Typography>
                                        <List>
                                             <ListItem>
                                                  <ListItemText primary="By email:" secondary="legal@housecouncil.com" />
                                             </ListItem>
                                             <ListItem>
                                                  <ListItemText
                                                       primary="By mail:"
                                                       secondary="HouseCouncil, 123 Community Lane, Suite 456, Boston, MA 02110, United States"
                                                  />
                                             </ListItem>
                                        </List>
                                   </section>
                              </Box>
                         </Box>
                    </Container>
               </Box>
          </Box>
     )
}

