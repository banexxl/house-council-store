"use client"

import type React from "react"
import Image from "next/image"
import { Box, Container, Typography, Chip, Stack } from "@mui/material"
import { Reveal } from "./motion"

type PageBannerProps = {
  image: string
  eyebrow?: string
  title: string
  subtitle?: string
  height?: { xs: number; md: number }
  children?: React.ReactNode
  priority?: boolean
  imagePosition?: string
}

/**
 * Full-bleed image header used at the top of secondary pages (pricing, docs,
 * contact, legal, profile, error, ...). The overlay gradient is applied in
 * CSS on top of a clean source photo — never baked into the image itself.
 */
export const PageBanner: React.FC<PageBannerProps> = ({
  image,
  eyebrow,
  title,
  subtitle,
  height = { xs: 260, md: 340 },
  children,
  priority = false,
  imagePosition = "center",
}) => {
  return (
    <Box
      component="section"
      sx={{
        position: "relative",
        height,
        display: "flex",
        alignItems: "flex-end",
        overflow: "hidden",
      }}
    >
      <Image
        src={image}
        alt=""
        fill
        priority={priority}
        style={{ objectFit: "cover", objectPosition: imagePosition }}
        sizes="100vw"
      />
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(180deg, rgba(9,13,24,0.78) 0%, rgba(19,26,44,0.55) 45%, rgba(19,26,44,0.88) 100%)",
        }}
      />
      <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1, pb: { xs: 3.5, md: 5 } }}>
        <Reveal>
          <Stack spacing={1.5}>
            {eyebrow && (
              <Chip
                label={eyebrow}
                size="small"
                sx={{
                  alignSelf: "flex-start",
                  bgcolor: "rgba(255,255,255,0.14)",
                  color: "common.white",
                  border: "1px solid rgba(255,255,255,0.28)",
                  backdropFilter: "blur(6px)",
                  fontWeight: 700,
                }}
              />
            )}
            <Typography
              component="h1"
              variant="h2"
              sx={{
                color: "common.white",
                fontSize: { xs: "1.9rem", sm: "2.4rem", md: "2.75rem" },
                overflowWrap: "anywhere",
              }}
            >
              {title}
            </Typography>
            {subtitle && (
              <Typography
                variant="h6"
                sx={{
                  color: "rgba(255,255,255,0.82)",
                  fontWeight: 500,
                  maxWidth: 720,
                  fontSize: { xs: "0.95rem", sm: "1.05rem" },
                }}
              >
                {subtitle}
              </Typography>
            )}
            {children}
          </Stack>
        </Reveal>
      </Container>
    </Box>
  )
}

export default PageBanner
