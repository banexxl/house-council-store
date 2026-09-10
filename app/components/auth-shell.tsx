"use client"

import type React from "react"
import Image from "next/image"
import Link from "next/link"
import { Box, Container, Typography, Stack, Avatar } from "@mui/material"
import ApartmentIcon from "@mui/icons-material/Apartment"
import PollIcon from "@mui/icons-material/Poll"
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive"
import { HEADER_HEIGHT } from "@/app/lib/layout-constants"

const highlights = [
  { icon: <ApartmentIcon fontSize="small" />, text: "Manage every building & apartment from one dashboard" },
  { icon: <PollIcon fontSize="small" />, text: "Transparent polls and community decisions" },
  { icon: <NotificationsActiveIcon fontSize="small" />, text: "Real-time announcements tenants actually see" },
]

type AuthShellProps = {
  children: React.ReactNode
  contentMaxWidth?: number
}

/**
 * Split-screen shell shared by every /auth/* page: a brand/photo panel on
 * the left (desktop only) and the actual form content on the right.
 */
export const AuthShell: React.FC<AuthShellProps> = ({ children, contentMaxWidth = 460 }) => {
  return (
    <Box
      sx={{
        display: "flex",
        minHeight: `calc(100vh - ${HEADER_HEIGHT}px)`,
      }}
    >
      {/* Brand / image panel */}
      <Box
        sx={{
          position: "relative",
          flex: "0 0 42%",
          display: { xs: "none", md: "block" },
          overflow: "hidden",
        }}
      >
        <Image
          src="/background-images/lobby-marble.jpg"
          alt=""
          fill
          priority
          style={{ objectFit: "cover", objectPosition: "center" }}
          sizes="42vw"
        />
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(160deg, rgba(9,13,24,0.92) 0%, rgba(19,26,44,0.75) 55%, rgba(19,26,44,0.55) 100%)",
          }}
        />
        <Stack
          justifyContent="space-between"
          sx={{ position: "relative", zIndex: 1, height: "100%", p: 6 }}
        >
          <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
            <Image src="/logo-icons/1-01.png" alt="NestLink" width={58} height={36} />
            <Typography variant="h6" sx={{ color: "common.white", fontWeight: 800 }}>
              Nest Link
            </Typography>
          </Link>

          <Box>
            <Typography
              variant="h3"
              sx={{ color: "common.white", fontSize: { md: "2rem", lg: "2.35rem" }, mb: 3, maxWidth: 420 }}
            >
              Building management, without the chaos.
            </Typography>
            <Stack spacing={2}>
              {highlights.map((h, i) => (
                <Stack key={i} direction="row" spacing={1.5} alignItems="center">
                  <Avatar sx={{ bgcolor: "rgba(247,150,34,0.9)", width: 34, height: 34 }}>{h.icon}</Avatar>
                  <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.88)" }}>
                    {h.text}
                  </Typography>
                </Stack>
              ))}
            </Stack>
          </Box>

          <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.55)" }}>
            © {new Date().getFullYear()} NestLink. All rights reserved.
          </Typography>
        </Stack>
      </Box>

      {/* Form panel */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "background.default",
          px: 2,
          py: { xs: 5, md: 6 },
        }}
      >
        <Container disableGutters maxWidth={false} sx={{ maxWidth: contentMaxWidth, width: "100%" }}>
          {children}
        </Container>
      </Box>
    </Box>
  )
}

export default AuthShell
