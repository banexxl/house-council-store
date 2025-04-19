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
     Table,
     TableBody,
     TableCell,
     TableContainer,
     TableHead,
     TableRow,
     Chip,
     Button,
} from "@mui/material"
import Link from "next/link"
import NavigateNextIcon from "@mui/icons-material/NavigateNext"
import SecurityIcon from "@mui/icons-material/Security"
import { Toaster } from "react-hot-toast"

// Table of contents items
const tableOfContents = [
     { id: "introduction", label: "Introduction" },
     { id: "information-collection", label: "Information We Collect" },
     { id: "information-use", label: "How We Use Your Information" },
     { id: "information-sharing", label: "Information Sharing and Disclosure" },
     { id: "data-security", label: "Data Security" },
     { id: "data-retention", label: "Data Retention" },
     { id: "your-rights", label: "Your Rights" },
     { id: "cookies", label: "Cookies and Tracking Technologies" },
     { id: "third-party", label: "Third-Party Services" },
     { id: "children", label: "Children's Privacy" },
     { id: "international", label: "International Data Transfers" },
     { id: "changes", label: "Changes to This Privacy Policy" },
     { id: "contact", label: "Contact Us" },
]

export const PrivacyPage = () => {
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
                         <Breadcrumbs
                              separator={<NavigateNextIcon fontSize="small" />}
                              aria-label="breadcrumb"
                              sx={{ mb: 4 }}
                         >
                              <MuiLink component={Link} href="/" underline="hover" color="inherit">
                                   Home
                              </MuiLink>
                              <Typography color="text.primary">Privacy Policy</Typography>
                         </Breadcrumbs>

                         <Box sx={{ display: "flex", alignItems: "center", mb: 4 }}>
                              <SecurityIcon color="primary" sx={{ fontSize: 32, mr: 2 }} />
                              <Typography variant="h3" component="h1">
                                   Privacy Policy
                              </Typography>
                         </Box>

                         <Typography variant="subtitle1" sx={{ mb: 1 }}>
                              Last Updated: {lastUpdated}
                         </Typography>

                         <Chip
                              label="Official Document"
                              color="primary"
                              size="small"
                              sx={{ mb: 4 }}
                         />

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
                                        mb: { xs: 4, md: 0 }
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

                                   <Button
                                        variant="outlined"
                                        fullWidth
                                        sx={{ mt: 3 }}
                                        component={Link}
                                        href="/privacy-policy.pdf"
                                        target="_blank"
                                   >
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
                                             NestLink ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our services, including our mobile application (collectively, the "Service").
                                        </Typography>
                                        <Typography paragraph>
                                             Please read this Privacy Policy carefully. By accessing or using our Service, you acknowledge that you have read, understood, and agree to be bound by all the terms of this Privacy Policy. If you do not agree with our policies and practices, please do not use our Service.
                                        </Typography>
                                        <Typography paragraph>
                                             This Privacy Policy applies to all users of the Service, including without limitation users who are browsers, customers, merchants, vendors, and/or contributors of content.
                                        </Typography>
                                        <Divider sx={{ my: 4 }} />
                                   </section>

                                   <section id="information-collection">
                                        <Typography variant="h5" component="h2" gutterBottom>
                                             Information We Collect
                                        </Typography>
                                        <Typography paragraph>
                                             We collect several types of information from and about users of our Service, including:
                                        </Typography>
                                        <Typography variant="h6" component="h3" gutterBottom>
                                             Personal Information
                                        </Typography>
                                        <Typography paragraph>
                                             Personal Information is information that identifies you as an individual or relates to an identifiable individual. We may collect the following types of Personal Information:
                                        </Typography>
                                        <List>
                                             <ListItem>
                                                  <ListItemText
                                                       primary="Contact Information"
                                                       secondary="Name, email address, postal address, phone number, and other similar contact information."
                                                  />
                                             </ListItem>
                                             <ListItem>
                                                  <ListItemText
                                                       primary="Account Information"
                                                       secondary="Username, password, account preferences, and other information needed to create and maintain your account."
                                                  />
                                             </ListItem>
                                             <ListItem>
                                                  <ListItemText
                                                       primary="Payment Information"
                                                       secondary="Credit card numbers, billing address, and other payment details. Note: full payment information is not stored on our servers."
                                                  />
                                             </ListItem>
                                             <ListItem>
                                                  <ListItemText
                                                       primary="Community Information"
                                                       secondary="Information about your residential community, such as address, number of units, and community rules."
                                                  />
                                             </ListItem>
                                        </List>

                                        <Typography variant="h6" component="h3" gutterBottom sx={{ mt: 2 }}>
                                             Usage and Technical Information
                                        </Typography>
                                        <Typography paragraph>
                                             We automatically collect certain information when you visit, use, or navigate our Service. This information does not reveal your specific identity but may include:
                                        </Typography>
                                        <List>
                                             <ListItem>
                                                  <ListItemText
                                                       primary="Device Information"
                                                       secondary="Computer or mobile device information, including operating system, device type, and browser type."
                                                  />
                                             </ListItem>
                                             <ListItem>
                                                  <ListItemText
                                                       primary="Usage Data"
                                                       secondary="Information about how you use our Service, such as the pages you visit, the time and date of your visits, and the time spent on those pages."
                                                  />
                                             </ListItem>
                                             <ListItem>
                                                  <ListItemText
                                                       primary="IP Address"
                                                       secondary="Your device's Internet Protocol address and location information."
                                                  />
                                             </ListItem>
                                             <ListItem>
                                                  <ListItemText
                                                       primary="Cookies and Similar Technologies"
                                                       secondary="Information collected through cookies, web beacons, and other tracking technologies."
                                                  />
                                             </ListItem>
                                        </List>
                                        <Divider sx={{ my: 4 }} />
                                   </section>

                                   <section id="information-use">
                                        <Typography variant="h5" component="h2" gutterBottom>
                                             How We Use Your Information
                                        </Typography>
                                        <Typography paragraph>
                                             We use the information we collect for various purposes, including:
                                        </Typography>
                                        <TableContainer>
                                             <Table>
                                                  <TableHead>
                                                       <TableRow>
                                                            <TableCell><strong>Purpose</strong></TableCell>
                                                            <TableCell><strong>Description</strong></TableCell>
                                                       </TableRow>
                                                  </TableHead>
                                                  <TableBody>
                                                       <TableRow>
                                                            <TableCell>Provide and Maintain the Service</TableCell>
                                                            <TableCell>To operate our Service, maintain your account, and provide the features and functionality you request.</TableCell>
                                                       </TableRow>
                                                       <TableRow>
                                                            <TableCell>Improve and Develop the Service</TableCell>
                                                            <TableCell>To understand how users interact with our Service, identify areas for improvement, and develop new features and functionality.</TableCell>
                                                       </TableRow>
                                                       <TableRow>
                                                            <TableCell>Communicate with You</TableCell>
                                                            <TableCell>To respond to your inquiries, provide customer support, send administrative messages, and deliver marketing communications.</TableCell>
                                                       </TableRow>
                                                       <TableRow>
                                                            <TableCell>Process Transactions</TableCell>
                                                            <TableCell>To process payments, subscriptions, and other transactions you initiate through the Service.</TableCell>
                                                       </TableRow>
                                                       <TableRow>
                                                            <TableCell>Security and Fraud Prevention</TableCell>
                                                            <TableCell>To detect, prevent, and address technical issues, security breaches, and fraudulent activities.</TableCell>
                                                       </TableRow>
                                                       <TableRow>
                                                            <TableCell>Legal Compliance</TableCell>
                                                            <TableCell>To comply with applicable laws, regulations, and legal processes.</TableCell>
                                                       </TableRow>
                                                  </TableBody>
                                             </Table>
                                        </TableContainer>
                                        <Divider sx={{ my: 4 }} />
                                   </section>

                                   <section id="information-sharing">
                                        <Typography variant="h5" component="h2" gutterBottom>
                                             Information Sharing and Disclosure
                                        </Typography>
                                        <Typography paragraph>
                                             We may share your information in the following situations:
                                        </Typography>
                                        <List>
                                             <ListItem>
                                                  <ListItemText
                                                       primary="Service Providers"
                                                       secondary="We may share your information with third-party vendors, service providers, contractors, or agents who perform services for us or on our behalf."
                                                  />
                                             </ListItem>
                                             <ListItem>
                                                  <ListItemText
                                                       primary="Business Transfers"
                                                       secondary="If we are involved in a merger, acquisition, financing, or sale of all or a portion of our assets, your information may be transferred as part of that transaction."
                                                  />
                                             </ListItem>
                                             <ListItem>
                                                  <ListItemText
                                                       primary="Legal Requirements"
                                                       secondary="We may disclose your information where required to do so by law or in response to valid requests by public authorities."
                                                  />
                                             </ListItem>
                                             <ListItem>
                                                  <ListItemText
                                                       primary="With Your Consent"
                                                       secondary="We may share your information with your consent or at your direction."
                                                  />
                                             </ListItem>
                                             <ListItem>
                                                  <ListItemText
                                                       primary="Community Members"
                                                       secondary="Certain information may be shared with other members of your residential community as part of the Service functionality."
                                                  />
                                             </ListItem>
                                        </List>
                                        <Divider sx={{ my: 4 }} />
                                   </section>

                                   <section id="data-security">
                                        <Typography variant="h5" component="h2" gutterBottom>
                                             Data Security
                                        </Typography>
                                        <Typography paragraph>
                                             We have implemented appropriate technical and organizational security measures designed to protect the security of any personal information we process. However, despite our safeguards and efforts to secure your information, no electronic transmission over the Internet or information storage technology can be guaranteed to be 100% secure.
                                        </Typography>
                                        <Typography paragraph>
                                             We use industry-standard encryption technologies when transferring and receiving personal information. We also have appropriate security measures in place in our physical facilities to protect against the loss, misuse, or alteration of information that we have collected from you.
                                        </Typography>
                                        <Divider sx={{ my: 4 }} />
                                   </section>

                                   <section id="data-retention">
                                        <Typography variant="h5" component="h2" gutterBottom>
                                             Data Retention
                                        </Typography>
                                        <Typography paragraph>
                                             We will retain your personal information only for as long as is necessary for the purposes set out in this Privacy Policy. We will retain and use your information to the extent necessary to comply with our legal obligations, resolve disputes, and enforce our policies.
                                        </Typography>
                                        <Typography paragraph>
                                             If you request that your account be deleted, we will delete your information as soon as practicable, although we may retain certain information as required by law or for legitimate business purposes. We may also retain cached or archived copies of your information for a certain period of time.
                                        </Typography>
                                        <Divider sx={{ my: 4 }} />
                                   </section>

                                   <section id="your-rights">
                                        <Typography variant="h5" component="h2" gutterBottom>
                                             Your Rights
                                        </Typography>
                                        <Typography paragraph>
                                             Depending on your location, you may have certain rights regarding your personal information, including:
                                        </Typography>
                                        <List>
                                             <ListItem>
                                                  <ListItemText
                                                       primary="Access"
                                                       secondary="You have the right to request copies of your personal information."
                                                  />
                                             </ListItem>
                                             <ListItem>
                                                  <ListItemText
                                                       primary="Rectification"
                                                       secondary="You have the right to request that we correct any information you believe is inaccurate or complete information you believe is incomplete."
                                                  />
                                             </ListItem>
                                             <ListItem>
                                                  <ListItemText
                                                       primary="Erasure"
                                                       secondary="You have the right to request that we erase your personal information, under certain conditions."
                                                  />
                                             </ListItem>
                                             <ListItem>
                                                  <ListItemText
                                                       primary="Restriction"
                                                       secondary="You have the right to request that we restrict the processing of your personal information, under certain conditions."
                                                  />
                                             </ListItem>
                                             <ListItem>
                                                  <ListItemText
                                                       primary="Object"
                                                       secondary="You have the right to object to our processing of your personal information, under certain conditions."
                                                  />
                                             </ListItem>
                                             <ListItem>
                                                  <ListItemText
                                                       primary="Data Portability"
                                                       secondary="You have the right to request that we transfer the data we have collected to another organization, or directly to you, under certain conditions."
                                                  />
                                             </ListItem>
                                        </List>
                                        <Typography paragraph sx={{ mt: 2 }}>
                                             If you wish to exercise any of these rights, please contact us using the contact information provided below. We may ask you to verify your identity before responding to such requests.
                                        </Typography>
                                        <Divider sx={{ my: 4 }} />
                                   </section>

                                   <section id="cookies">
                                        <Typography variant="h5" component="h2" gutterBottom>
                                             Cookies and Tracking Technologies
                                        </Typography>
                                        <Typography paragraph>
                                             We use cookies and similar tracking technologies to track activity on our Service and store certain information. Cookies are files with a small amount of data which may include an anonymous unique identifier. Cookies are sent to your browser from a website and stored on your device.
                                        </Typography>
                                        <Typography paragraph>
                                             We use the following types of cookies:
                                        </Typography>
                                        <List>
                                             <ListItem>
                                                  <ListItemText
                                                       primary="Essential Cookies"
                                                       secondary="These cookies are necessary for the Service to function properly and cannot be switched off in our systems."
                                                  />
                                             </ListItem>
                                             <ListItem>
                                                  <ListItemText
                                                       primary="Performance Cookies"
                                                       secondary="These cookies allow us to count visits and traffic sources so we can measure and improve the performance of our Service."
                                                  />
                                             </ListItem>
                                             <ListItem>
                                                  <ListItemText
                                                       primary="Functionality Cookies"
                                                       secondary="These cookies enable the Service to provide enhanced functionality and personalization."
                                                  />
                                             </ListItem>
                                             <ListItem>
                                                  <ListItemText
                                                       primary="Targeting Cookies"
                                                       secondary="These cookies may be set through our Service by our advertising partners to build a profile of your interests."
                                                  />
                                             </ListItem>
                                        </List>
                                        <Typography paragraph sx={{ mt: 2 }}>
                                             You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you do not accept cookies, you may not be able to use some portions of our Service.
                                        </Typography>
                                        <Divider sx={{ my: 4 }} />
                                   </section>

                                   <section id="third-party">
                                        <Typography variant="h5" component="h2" gutterBottom>
                                             Third-Party Services
                                        </Typography>
                                        <Typography paragraph>
                                             Our Service may contain links to other websites, applications, or services that are not operated by us. If you click on a third-party link, you will be directed to that third party's site. We strongly advise you to review the Privacy Policy of every site you visit.
                                        </Typography>
                                        <Typography paragraph>
                                             We have no control over and assume no responsibility for the content, privacy policies, or practices of any third-party sites or services.
                                        </Typography>
                                        <Typography paragraph>
                                             We may use third-party service providers to help us operate our Service or administer activities on our behalf, such as sending out newsletters or surveys. We may share your information with these third parties for those limited purposes.
                                        </Typography>
                                        <Divider sx={{ my: 4 }} />
                                   </section>

                                   <section id="children">
                                        <Typography variant="h5" component="h2" gutterBottom>
                                             Children's Privacy
                                        </Typography>
                                        <Typography paragraph>
                                             Our Service is not directed to individuals under the age of 18. We do not knowingly collect personal information from children under 18. If you are a parent or guardian and you are aware that your child has provided us with personal information, please contact us. If we become aware that we have collected personal information from children without verification of parental consent, we take steps to remove that information from our servers.
                                        </Typography>
                                        <Divider sx={{ my: 4 }} />
                                   </section>

                                   <section id="international">
                                        <Typography variant="h5" component="h2" gutterBottom>
                                             International Data Transfers
                                        </Typography>
                                        <Typography paragraph>
                                             Your information, including personal information, may be transferred to and maintained on computers located outside of your state, province, country, or other governmental jurisdiction where the data protection laws may differ from those of your jurisdiction.
                                        </Typography>
                                        <Typography paragraph>
                                             If you are located outside the United States and choose to provide information to us, please note that we transfer the data, including personal information, to the United States and process it there. Your consent to this Privacy Policy followed by your submission of such information represents your agreement to that transfer.
                                        </Typography>
                                        <Divider sx={{ my: 4 }} />
                                   </section>

                                   <section id="changes">
                                        <Typography variant="h5" component="h2" gutterBottom>
                                             Changes to This Privacy Policy
                                        </Typography>
                                        <Typography paragraph>
                                             We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date at the top of this Privacy Policy.
                                        </Typography>
                                        <Typography paragraph>
                                             You are advised to review this Privacy Policy periodically for any changes. Changes to this Privacy Policy are effective when they are posted on this page.
                                        </Typography>
                                        <Typography paragraph>
                                             Your continued use of the Service following the posting of changes to this Privacy Policy will be deemed your acceptance of those changes.
                                        </Typography>
                                        <Divider sx={{ my: 4 }} />
                                   </section>

                                   <section id="contact">
                                        <Typography variant="h5" component="h2" gutterBottom>
                                             Contact Us
                                        </Typography>
                                        <Typography paragraph>
                                             If you have any questions about this Privacy Policy, please contact us:
                                        </Typography>
                                        <List>
                                             <ListItem>
                                                  <ListItemText
                                                       primary="By email:"
                                                       secondary="privacy@NestLink.com"
                                                  />
                                             </ListItem>
                                             <ListItem>
                                                  <ListItemText
                                                       primary="By mail:"
                                                       secondary="NestLink, 123 Community Lane, Suite 456, Boston, MA 02110, United States"
                                                  />
                                             </ListItem>
                                        </List>
                                   </section>
                              </Box>
                         </Box>
                    </Container>
               </Box>
               <Toaster />
          </Box>
     )
}
