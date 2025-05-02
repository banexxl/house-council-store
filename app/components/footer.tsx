"use client"

import Link from "next/link"
import { Box, Container, Typography, Divider, List, ListItem, ListItemText, Grid, useTheme } from "@mui/material"
import Image from "next/image";

export const Footer = () => {

  const theme = useTheme();

  return (
    <Box component="footer" sx={{ bgcolor: theme.palette.secondary.main, py: 6, borderTop: 1, borderColor: "divider" }}>
      <Container maxWidth="lg">
        <Grid container spacing={4}>

          <Grid size={{ xs: 12, md: 4 }}>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Image src="/logo-icons/1-01.png" alt="Logo" width={80} height={80} style={{ transform: "scale(1.5)", marginTop: "10px" }} priority />
              <Typography variant="h6" component="div" sx={{ fontWeight: 700, color: theme.palette.primary.main }}>
                Nest Link
              </Typography>
            </Box>
            <Typography variant="body2" color="primary" sx={{ color: theme.palette.primary.main }}>
              Simplifying residential community management since 2023.
            </Typography>
          </Grid>

          <Grid size={{ xs: 12, md: 8 }}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 4 }}>
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
                  Product
                </Typography>
                <List dense disablePadding>
                  <ListItem disablePadding>
                    <Link href="/docs" style={{ textDecoration: "none", color: theme.palette.primary.main }}>
                      <ListItemText primary="Features" />
                    </Link>
                  </ListItem>
                  <ListItem disablePadding>
                    <Link href="/pricing" style={{ textDecoration: "none", color: theme.palette.primary.main }}>
                      <ListItemText primary="Pricing" />
                    </Link>
                  </ListItem>
                  <ListItem disablePadding>
                    <Link href="/docs" style={{ textDecoration: "none", color: theme.palette.primary.main }}>
                      <ListItemText primary="Documentation" />
                    </Link>
                  </ListItem>
                </List>
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
                  Company
                </Typography>
                <List dense disablePadding>
                  <ListItem disablePadding>
                    <Link href="/contact" style={{ textDecoration: "none", color: theme.palette.primary.main }}>
                      <ListItemText primary="Contact" />
                    </Link>
                  </ListItem>
                  <ListItem disablePadding>
                    <Link href="/privacy-policy" style={{ textDecoration: "none", color: theme.palette.primary.main }}>
                      <ListItemText primary="Privacy Policy" />
                    </Link>
                  </ListItem>
                  <ListItem disablePadding>
                    <Link href="/terms-and-conditions" style={{ textDecoration: "none", color: theme.palette.primary.main }}>
                      <ListItemText primary="Terms of Service" />
                    </Link>
                  </ListItem>
                </List>
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
                  Connect
                </Typography>
                <List dense disablePadding>
                  <ListItem disablePadding>
                    <Link href="#" style={{ textDecoration: "none", color: theme.palette.primary.main }}>
                      <ListItemText primary="Twitter" />
                    </Link>
                  </ListItem>
                  <ListItem disablePadding>
                    <Link href="#" style={{ textDecoration: "none", color: theme.palette.primary.main }}>
                      <ListItemText primary="LinkedIn" />
                    </Link>
                  </ListItem>
                  <ListItem disablePadding>
                    <Link href="#" style={{ textDecoration: "none", color: theme.palette.primary.main }}>
                      <ListItemText primary="Facebook" />
                    </Link>
                  </ListItem>
                </List>
              </Grid>
            </Grid>
          </Grid>

        </Grid>

        <Divider sx={{ my: 4 }} />

        <Typography variant="body2" color="primary" align="center" sx={{ color: theme.palette.primary.main }}>
          © 2023 NestLink. All rights reserved.
        </Typography>
      </Container>
    </Box>
  )
}

