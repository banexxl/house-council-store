"use client"

import { Box, Container, Typography, Divider, List, ListItem, ListItemText, Grid, useTheme, ListItemButton } from "@mui/material"
import Image from "next/image";
import CircularProgress from '@mui/material/CircularProgress';
import Backdrop from '@mui/material/Backdrop';
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export const Footer = () => {

  const theme = useTheme();
  const router = useRouter();

  const [isPending, startTransition] = useTransition()

  const handleNavClick = (path: string) => {
    startTransition(() => {
      router.push(path);
    });
  };

  return (
    <Box component="footer" sx={{ bgcolor: theme.palette.secondary.main, py: 6, borderTop: 1, borderColor: "divider" }}>
      <Container maxWidth="lg">
        <Grid container spacing={4}>

          <Grid size={{ xs: 12, md: 4 }}>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Image src="/logo-icons/1-01.png" alt="Logo" width={80} height={80} style={{ transform: "scale(1.5)", marginTop: "10px", cursor: "pointer" }} priority onClick={() => handleNavClick("/")} />
              <Typography variant="h6" component="div" sx={{ fontWeight: 700, color: theme.palette.primary.main, cursor: "pointer" }} onClick={() => handleNavClick("/")}>
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
                    <ListItemButton onClick={() => handleNavClick("/docs")}>
                      <ListItemText primary="Features" sx={{ color: theme.palette.primary.main }} />
                    </ListItemButton>
                  </ListItem>

                  <ListItem disablePadding>
                    <ListItemButton onClick={() => handleNavClick("/pricing")}>
                      <ListItemText primary="Pricing" sx={{ color: theme.palette.primary.main }} />
                    </ListItemButton>
                  </ListItem>

                  <ListItem disablePadding>
                    <ListItemButton onClick={() => handleNavClick("/docs")}>
                      <ListItemText primary="Documentation" sx={{ color: theme.palette.primary.main }} />
                    </ListItemButton>
                  </ListItem>
                </List>

              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
                  Company
                </Typography>
                <List dense disablePadding>

                  <ListItem disablePadding>
                    <ListItemButton onClick={() => handleNavClick("/contact")}>
                      <ListItemText primary="Contact" sx={{ color: theme.palette.primary.main }} />
                    </ListItemButton>
                  </ListItem>

                  <ListItem disablePadding>
                    <ListItemButton onClick={() => handleNavClick("/privacy-policy")}>
                      <ListItemText primary="Privacy Policy" sx={{ color: theme.palette.primary.main }} />
                    </ListItemButton>
                  </ListItem>

                  <ListItem disablePadding>
                    <ListItemButton onClick={() => handleNavClick("/terms-and-conditions")}>
                      <ListItemText primary="Terms of Service" sx={{ color: theme.palette.primary.main }} />
                    </ListItemButton>
                  </ListItem>

                </List>
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
                  Connect
                </Typography>
                <List dense disablePadding>
                  <ListItem disablePadding>
                    <Link href="https://twitter.com/NestLink" style={{ textDecoration: "none", color: theme.palette.primary.main }} target="_blank" rel="noopener noreferrer" >
                      <ListItemText primary="Twitter" />
                    </Link>
                  </ListItem>
                  <ListItem disablePadding>
                    <Link href="https://www.linkedin.com/company/nestlink" style={{ textDecoration: "none", color: theme.palette.primary.main }} target="_blank" rel="noopener noreferrer">
                      <ListItemText primary="LinkedIn" />
                    </Link>
                  </ListItem>
                  <ListItem disablePadding>
                    <Link href="https://www.facebook.com/NestLink" style={{ textDecoration: "none", color: theme.palette.primary.main }} target="_blank" rel="noopener noreferrer">
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
      <Backdrop
        sx={{
          color: '#fff',
          zIndex: (theme) => theme.zIndex.drawer + 1,
        }}
        open={isPending}
      >
        <CircularProgress sx={{ color: theme.palette.primary.main }} />
      </Backdrop>
    </Box>
  )
}

