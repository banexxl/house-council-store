"use client"

import Link from "next/link"
import { Box, Container, Grid, Typography, Divider, List, ListItem, ListItemText } from "@mui/material"
import ApartmentIcon from "@mui/icons-material/Apartment"

export default function Footer() {
  return (
    <Box component="footer" sx={{ bgcolor: "background.paper", py: 6, borderTop: 1, borderColor: "divider" }}>
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <ApartmentIcon sx={{ mr: 1 }} />
              <Typography variant="h6" component="div" sx={{ fontWeight: 700 }}>
                HouseCouncil
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              Simplifying residential community management since 2023.
            </Typography>
          </Grid>

          <Grid item xs={12} md={8}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                  Product
                </Typography>
                <List dense disablePadding>
                  <ListItem disablePadding>
                    <Link href="/docs" style={{ textDecoration: "none", color: "inherit" }}>
                      <ListItemText primary="Features" />
                    </Link>
                  </ListItem>
                  <ListItem disablePadding>
                    <Link href="/pricing" style={{ textDecoration: "none", color: "inherit" }}>
                      <ListItemText primary="Pricing" />
                    </Link>
                  </ListItem>
                  <ListItem disablePadding>
                    <Link href="/docs" style={{ textDecoration: "none", color: "inherit" }}>
                      <ListItemText primary="Documentation" />
                    </Link>
                  </ListItem>
                </List>
              </Grid>

              <Grid item xs={12} sm={4}>
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                  Company
                </Typography>
                <List dense disablePadding>
                  <ListItem disablePadding>
                    <Link href="/contact" style={{ textDecoration: "none", color: "inherit" }}>
                      <ListItemText primary="Contact" />
                    </Link>
                  </ListItem>
                  <ListItem disablePadding>
                    <Link href="#" style={{ textDecoration: "none", color: "inherit" }}>
                      <ListItemText primary="Privacy Policy" />
                    </Link>
                  </ListItem>
                  <ListItem disablePadding>
                    <Link href="#" style={{ textDecoration: "none", color: "inherit" }}>
                      <ListItemText primary="Terms of Service" />
                    </Link>
                  </ListItem>
                </List>
              </Grid>

              <Grid item xs={12} sm={4}>
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                  Connect
                </Typography>
                <List dense disablePadding>
                  <ListItem disablePadding>
                    <Link href="#" style={{ textDecoration: "none", color: "inherit" }}>
                      <ListItemText primary="Twitter" />
                    </Link>
                  </ListItem>
                  <ListItem disablePadding>
                    <Link href="#" style={{ textDecoration: "none", color: "inherit" }}>
                      <ListItemText primary="LinkedIn" />
                    </Link>
                  </ListItem>
                  <ListItem disablePadding>
                    <Link href="#" style={{ textDecoration: "none", color: "inherit" }}>
                      <ListItemText primary="Facebook" />
                    </Link>
                  </ListItem>
                </List>
              </Grid>
            </Grid>
          </Grid>
        </Grid>

        <Divider sx={{ my: 4 }} />

        <Typography variant="body2" color="text.secondary" align="center">
          © 2023 HouseCouncil. All rights reserved.
        </Typography>
      </Container>
    </Box>
  )
}

