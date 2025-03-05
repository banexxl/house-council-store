"use client"

import { Box, Button, Card, Container, Divider, MenuItem, TextField, Typography } from "@mui/material"
import Grid from '@mui/material/Grid2';
import EmailIcon from "@mui/icons-material/Email"
import PhoneIcon from "@mui/icons-material/Phone"
import LocationOnIcon from "@mui/icons-material/LocationOn"
import Header from "@/components/Header"
import Footer from "@/components/Footer"

export default function ContactPage() {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Header />

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

              <Box component="form" sx={{ mt: 4 }}>
                <Grid container spacing={3}>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField fullWidth label="Full Name" variant="outlined" placeholder="Enter your full name" />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField fullWidth label="Email" variant="outlined" placeholder="Enter your email" type="email" />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <TextField fullWidth select label="Subject" variant="outlined" defaultValue="">
                      <MenuItem value="">Select a subject</MenuItem>
                      <MenuItem value="general">General Inquiry</MenuItem>
                      <MenuItem value="support">Technical Support</MenuItem>
                      <MenuItem value="demo">Request a Demo</MenuItem>
                      <MenuItem value="billing">Billing Question</MenuItem>
                      <MenuItem value="other">Other</MenuItem>
                    </TextField>
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <TextField
                      fullWidth
                      label="Message"
                      variant="outlined"
                      placeholder="Enter your message"
                      multiline
                      rows={5}
                    />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <Button variant="contained" size="large" fullWidth>
                      Send Message
                    </Button>
                  </Grid>
                </Grid>
              </Box>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="h4" gutterBottom>
                Contact Information
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph>
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
                      support@housecouncil.com
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      sales@housecouncil.com
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
                      +1 (555) 123-4567
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Monday - Friday, 9am - 5pm EST
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
                      123 Community Lane
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Suite 456
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Boston, MA 02110
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
                    <Typography variant="body2">9:00 AM - 5:00 PM</Typography>
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

      <Footer />
    </Box>
  )
}

