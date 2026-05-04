"use client"

import { Box, Button, Card, Container, Divider, Grid, MenuItem, Paper, TextField, Typography } from "@mui/material"
import EmailIcon from "@mui/icons-material/Email"
import PhoneIcon from "@mui/icons-material/Phone"
import LocationOnIcon from "@mui/icons-material/LocationOn"
import toast, { Toaster } from "react-hot-toast";
import GoogleMap, { MapMarker } from "@/app/components/google-map";
import { useState } from "react";
import * as Yup from "yup"
import Animate from "@/app/components/animation-framer-motion"
import { Form, Formik } from "formik"
import { sendClientContactMessageToSupport } from "../lib/node-mailer"
// Sample data for markers
const sampleLocations: MapMarker[] = [
     {
          id: 1,
          position: { lat: 40.7128, lng: -74.006 },
          title: "New York City",
          description: "The Big Apple",
     },
     {
          id: 2,
          position: { lat: 40.7484, lng: -73.9857 },
          title: "Empire State Building",
          description: "Iconic skyscraper in Midtown Manhattan",
     },
     {
          id: 3,
          position: { lat: 40.7061, lng: -74.0088 },
          title: "One World Trade Center",
          description: "Tallest building in the Western Hemisphere",
     },
]

const initialValues = {
     fullName: '',
     email: '',
     subject: '',
     message: '',
};

const validationSchema = Yup.object({
     fullName: Yup.string().required('Full Name is required'),
     email: Yup.string().email('Invalid email').required('Email is required'),
     subject: Yup.string().required('Subject is required'),
     message: Yup.string().required('Message is required'),
});

type ContactProps = {
     mapKey: string
}

export const ContactPage = ({ mapKey }: ContactProps) => {

     const [selectedLocation, setSelectedLocation] = useState<MapMarker | null>(null)

     const handleMarkerClick = (marker: MapMarker) => {
          setSelectedLocation(marker)
     }

     const handleSubmit = async (
          values: typeof initialValues,
          helpers: { resetForm: () => void }
     ) => {

          try {
               const sendEmailResponse = await sendClientContactMessageToSupport(values.email, values.fullName, values.message, values.subject)

               if (sendEmailResponse) {
                    toast.success("Message sent successfully.");
                    helpers.resetForm();
               } else {
                    toast.error("Failed to send message.");
               }
          } catch (error) {
               console.error(error);
               toast.error("Failed to send message. Please try again later.");
          }
     };

     return (
          <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh", mt: 5 }}>
               <Animate>
                    <Box component="main" sx={{ flexGrow: 1, py: { xs: 6, md: 10 } }}>
                         <Container maxWidth="lg">

                              <Box sx={{ textAlign: "center", mb: 6 }}>
                                   <Typography variant="h2" gutterBottom>
                                        Contact Us
                                   </Typography>
                                   <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 700, mx: "auto" }}>
                                        Have questions about our platform? We're here to help. Reach out to our team.
                                   </Typography>
                              </Box>

                              <Grid container spacing={6}>
                                   <Grid size={{ xs: 12, md: 6 }}>
                                        <Typography variant="h4" gutterBottom>
                                             Get in Touch
                                        </Typography>
                                        <Typography variant="body1" color="text.secondary">
                                             Fill out the form and our team will get back to you within 24 hours.
                                        </Typography>

                                        <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleSubmit}>
                                             {({ values, errors, touched, handleChange, handleBlur, isSubmitting, isValid }) => (
                                                  <Form>
                                                       <Box sx={{ mt: 4 }}>
                                                            <Grid container spacing={3}>
                                                                 <Grid size={{ xs: 12, md: 6 }}>
                                                                      <TextField
                                                                           fullWidth
                                                                           name="fullName"
                                                                           label="Full Name"
                                                                           placeholder="Enter your full name"
                                                                           variant="outlined"
                                                                           value={values.fullName}
                                                                           onChange={handleChange}
                                                                           onBlur={handleBlur}
                                                                           error={touched.fullName && Boolean(errors.fullName)}
                                                                           helperText={touched.fullName && errors.fullName}
                                                                      />
                                                                 </Grid>

                                                                 <Grid size={{ xs: 12, md: 6 }}>
                                                                      <TextField
                                                                           fullWidth
                                                                           name="email"
                                                                           label="Email"
                                                                           placeholder="Enter your email"
                                                                           type="email"
                                                                           variant="outlined"
                                                                           value={values.email}
                                                                           onChange={handleChange}
                                                                           onBlur={handleBlur}
                                                                           error={touched.email && Boolean(errors.email)}
                                                                           helperText={touched.email && errors.email}
                                                                      />
                                                                 </Grid>

                                                                 <Grid size={{ xs: 12, md: 6 }}>
                                                                      <TextField
                                                                           select
                                                                           fullWidth
                                                                           name="subject"
                                                                           label="Subject"
                                                                           variant="outlined"
                                                                           value={values.subject}
                                                                           onChange={handleChange}
                                                                           onBlur={handleBlur}
                                                                           error={touched.subject && Boolean(errors.subject)}
                                                                           helperText={touched.subject && errors.subject}
                                                                      >
                                                                           <MenuItem value="">Select a subject</MenuItem>
                                                                           <MenuItem value="General Inquiry">General Inquiry</MenuItem>
                                                                           <MenuItem value="Technical Support">Technical Support</MenuItem>
                                                                           <MenuItem value="Request a Demo">Request a Demo</MenuItem>
                                                                           <MenuItem value="Billing Question">Billing Question</MenuItem>
                                                                           <MenuItem value="Other">Other</MenuItem>
                                                                      </TextField>
                                                                 </Grid>

                                                                 <Grid size={{ xs: 12 }}>
                                                                      <TextField
                                                                           fullWidth
                                                                           multiline
                                                                           rows={5}
                                                                           name="message"
                                                                           label="Message"
                                                                           placeholder="Enter your message"
                                                                           variant="outlined"
                                                                           value={values.message}
                                                                           onChange={handleChange}
                                                                           onBlur={handleBlur}
                                                                           error={touched.message && Boolean(errors.message)}
                                                                           helperText={touched.message && errors.message}
                                                                      />
                                                                 </Grid>

                                                                 <Grid size={{ xs: 12 }}>
                                                                      <Button
                                                                           type="submit"
                                                                           variant="contained"
                                                                           size="large"
                                                                           fullWidth
                                                                           loading={isSubmitting}
                                                                           disabled={isSubmitting || !isValid}
                                                                      >
                                                                           Send Message
                                                                      </Button>
                                                                 </Grid>
                                                            </Grid>
                                                       </Box>
                                                  </Form>
                                             )}
                                        </Formik>
                                   </Grid>

                                   <Grid size={{ xs: 12, md: 6 }}>
                                        <Paper elevation={2} sx={{ flex: 2, overflow: "hidden" }}>
                                             <GoogleMap
                                                  markers={sampleLocations}
                                                  center={{ lat: 45.236394, lng: 19.798346 }}
                                                  zoom={13}
                                                  height={500}
                                                  onMarkerClick={handleMarkerClick}
                                                  apiKey={mapKey}
                                             />
                                        </Paper>
                                   </Grid>

                                   <Grid size={{ xs: 12, md: 6 }}>
                                        <Typography variant="h4" gutterBottom>
                                             Contact Information
                                        </Typography>
                                        <Typography variant="body1" color="text.secondary" >
                                             You can also reach us through the following channels.
                                        </Typography>

                                        <Box sx={{ mt: 4, display: "flex", flexDirection: "column", gap: 4 }}>
                                             <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}>
                                                  <EmailIcon color="primary" />
                                                  <Box>
                                                       <Typography variant="subtitle1" fontWeight={500}>
                                                            Email
                                                       </Typography>
                                                       <Typography variant="body2" color="text.secondary">
                                                            support@nest-link.app
                                                       </Typography>
                                                  </Box>
                                             </Box>

                                             <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}>
                                                  <PhoneIcon color="primary" />
                                                  <Box>
                                                       <Typography variant="subtitle1" fontWeight={500}>
                                                            Phone
                                                       </Typography>
                                                       <Typography variant="body2" color="text.secondary">
                                                            (+381) 66 415651
                                                       </Typography>
                                                       <Typography variant="body2" color="text.secondary">
                                                            Monday - Friday, 8am - 4pm CET
                                                       </Typography>
                                                  </Box>
                                             </Box>

                                             <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}>
                                                  <LocationOnIcon color="primary" />
                                                  <Box>
                                                       <Typography variant="subtitle1" fontWeight={500}>
                                                            Office
                                                       </Typography>
                                                       <Typography variant="body2" color="text.secondary">
                                                            Branka Ćopića
                                                       </Typography>
                                                       <Typography variant="body2" color="text.secondary">
                                                            33
                                                       </Typography>
                                                       <Typography variant="body2" color="text.secondary">
                                                            Novi Sad, Serbia
                                                       </Typography>
                                                  </Box>
                                             </Box>
                                        </Box>

                                        <Card sx={{ mt: 4, p: 3 }}>
                                             <Typography variant="subtitle1" fontWeight={500} gutterBottom>
                                                  Our Hours
                                             </Typography>
                                             <Box sx={{ mt: 2 }}>
                                                  <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                                                       <Typography variant="body2">Monday - Friday</Typography>
                                                       <Typography variant="body2">8:00 AM - 4:00 PM</Typography>
                                                  </Box>
                                                  <Divider sx={{ my: 1 }} />
                                                  <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                                                       <Typography variant="body2">Saturday</Typography>
                                                       <Typography variant="body2">10:00 AM - 2:00 PM</Typography>
                                                  </Box>
                                                  <Divider sx={{ my: 1 }} />
                                                  <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                                                       <Typography variant="body2">Sunday</Typography>
                                                       <Typography variant="body2">Closed</Typography>
                                                  </Box>
                                             </Box>
                                        </Card>
                                   </Grid>
                              </Grid>

                         </Container>
                    </Box>
               </Animate>
               <Toaster />
          </Box>
     )
}

