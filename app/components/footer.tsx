"use client"

import { Box, Container, Typography, Divider, Grid, Stack, alpha } from "@mui/material"
import Image from "next/image";
import CircularProgress from '@mui/material/CircularProgress';
import Backdrop from '@mui/material/Backdrop';
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "@mui/material/styles";

const linkGroups = [
  {
    title: "Product",
    links: [
      { label: "Features", path: "/docs" },
      { label: "Pricing", path: "/pricing" },
      { label: "Docs", path: "/docs" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "Contact", path: "/contact" },
      { label: "Privacy Policy", path: "/privacy-policy" },
      { label: "Terms of Service", path: "/terms-and-conditions" },
    ],
  },
]

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
    <Box component="footer" sx={{ bgcolor: "secondary.main", color: "common.white", pt: 7, pb: 4 }}>
      <Container maxWidth="lg">
        <Grid container spacing={5}>
          <Grid size={{ xs: 12, md: 5 }}>
            <Box
              sx={{ display: "flex", alignItems: "center", gap: 1.25, cursor: "pointer", mb: 1.5 }}
              onClick={() => handleNavClick("/")}
            >
              <Image src="/logo-icons/1-02.png" alt="Logo" width={55} height={34} />
              <Typography variant="h6" sx={{ fontWeight: 800, color: "common.white" }}>
                Nest Link
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ color: alpha("#fff", 0.62), maxWidth: 320, lineHeight: 1.7 }}>
              Building management software for apartment buildings and housing communities —
              simplifying tenant communication since 2023.
            </Typography>
          </Grid>

          <Grid size={{ xs: 12, md: 7 }}>
            <Grid container spacing={3}>
              {linkGroups.map((group) => (
                <Grid key={group.title} size={{ xs: 6, sm: 4 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "primary.main", mb: 1.5 }}>
                    {group.title}
                  </Typography>
                  <Stack spacing={1}>
                    {group.links.map((link) => (
                      <Typography
                        key={link.label}
                        component="button"
                        onClick={() => handleNavClick(link.path)}
                        variant="body2"
                        sx={{
                          textAlign: "left",
                          color: alpha("#fff", 0.72),
                          background: "none",
                          border: 0,
                          p: 0,
                          cursor: "pointer",
                          fontFamily: "inherit",
                          "&:hover": { color: "common.white" },
                          transition: "color 150ms ease",
                        }}
                      >
                        {link.label}
                      </Typography>
                    ))}
                  </Stack>
                </Grid>
              ))}
            </Grid>
          </Grid>
        </Grid>

        <Divider sx={{ my: 4, borderColor: alpha("#fff", 0.1) }} />

        <Typography variant="body2" align="center" sx={{ color: alpha("#fff", 0.5) }}>
          © {new Date().getFullYear()} NestLink. All rights reserved.
        </Typography>
      </Container>
      <Backdrop sx={{ color: '#fff', zIndex: (t) => t.zIndex.drawer + 1 }} open={isPending}>
        <CircularProgress sx={{ color: theme.palette.primary.main }} />
      </Backdrop>
    </Box>
  )
}
