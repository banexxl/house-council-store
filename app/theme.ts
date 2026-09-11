"use client"

import { createTheme, alpha } from "@mui/material/styles"

// ---------------------------------------------------------------------------
// Soft, modern shadow scale (replaces MUI's default heavy/dated shadows).
// Every Paper/Card/AppBar/Dialog elevation in the app draws from this.
// ---------------------------------------------------------------------------
const softShadow = (y: number, blur: number, alphaVal: number) =>
  `0 ${y}px ${blur}px rgba(15, 23, 42, ${alphaVal})`

const shadows = Array.from({ length: 25 }, (_, i) => {
  if (i === 0) return "none"
  const y = Math.min(2 + i * 1.6, 40)
  const blur = Math.min(6 + i * 3.4, 90)
  const a = Math.max(0.16 - i * 0.005, 0.05)
  return softShadow(Math.round(y), Math.round(blur), Number(a.toFixed(3)))
}) as unknown as import("@mui/material/styles").Theme["shadows"]

// ---------------------------------------------------------------------------
// Brand palette — primary orange is intentionally unchanged (brand identity).
// Secondary moves from the old maroon/brown to a modern deep navy-slate,
// which reads as far more "professional SaaS" while still pairing warmly
// with the orange accent.
// ---------------------------------------------------------------------------
const theme = createTheme({
  shadows,
  palette: {
    mode: "light",
    primary: {
      main: "#f79622",
      light: "#f7a22c",
      dark: "#f68a00",
      contrastText: "#1A1300",
    },
    secondary: {
      main: "#131A2C",
      light: "#2B3450",
      dark: "#090D18",
      contrastText: "#FFFFFF",
    },
    background: {
      default: "#FAFAF8",
      paper: "#FFFFFF",
    },
    text: {
      primary: "#161B22",
      secondary: "#5B6472",
    },
    divider: alpha("#131A2C", 0.08),
    success: { main: "#1E9E6B" },
    warning: { main: "#E2A03F" },
    error: { main: "#E24C4B" },
    info: { main: "#2F80ED" },
  },
  shape: {
    borderRadius: 14,
  },
  typography: {
    fontFamily:
      'var(--font-plus-jakarta-sans), "Segoe UI", "Inter", "Roboto", "Helvetica Neue", "Arial", sans-serif',
    h1: {
      fontWeight: 800,
      fontSize: "3.25rem",
      lineHeight: 1.1,
      letterSpacing: "-0.02em",
    },
    h2: {
      fontWeight: 800,
      fontSize: "2.5rem",
      lineHeight: 1.15,
      letterSpacing: "-0.015em",
    },
    h3: {
      fontWeight: 700,
      fontSize: "2rem",
      lineHeight: 1.2,
      letterSpacing: "-0.01em",
    },
    h4: {
      fontWeight: 700,
      fontSize: "1.5rem",
      lineHeight: 1.25,
      letterSpacing: "-0.01em",
    },
    h5: {
      fontWeight: 700,
      fontSize: "1.25rem",
      lineHeight: 1.3,
    },
    h6: {
      fontWeight: 700,
      fontSize: "1.05rem",
      lineHeight: 1.35,
    },
    subtitle1: { fontWeight: 600 },
    body1: { lineHeight: 1.7 },
    body2: { lineHeight: 1.65 },
    button: {
      textTransform: "none",
      fontWeight: 700,
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          "&::-webkit-scrollbar": { width: "8px", height: "8px" },
          "&::-webkit-scrollbar-track": { backgroundColor: "transparent" },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: alpha("#131A2C", 0.18),
            borderRadius: "8px",
            "&:hover": { backgroundColor: alpha("#131A2C", 0.3) },
          },
          "*::-webkit-scrollbar": { width: "8px", height: "8px" },
          "*::-webkit-scrollbar-track": { backgroundColor: "transparent" },
          "*::-webkit-scrollbar-thumb": {
            backgroundColor: alpha("#131A2C", 0.18),
            borderRadius: "8px",
            "&:hover": { backgroundColor: alpha("#131A2C", 0.3) },
          },
        },
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: {
          borderRadius: 10,
          padding: "10px 20px",
          fontWeight: 700,
        },
        sizeLarge: {
          padding: "13px 26px",
          fontSize: "1rem",
        },
        contained: {
          boxShadow: "none",
          "&:hover": {
            boxShadow: `0 10px 24px ${alpha("#f79622", 0.28)}`,
            transform: "translateY(-1px)",
          },
          transition: "transform 160ms ease, box-shadow 160ms ease, background-color 160ms ease",
        },
        outlined: {
          borderWidth: "1.5px",
          "&:hover": { borderWidth: "1.5px" },
        },
        loading: {
          backgroundColor: alpha("#f79622", 0.5),
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 18,
          border: `1px solid ${alpha("#131A2C", 0.07)}`,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
        },
        rounded: {
          borderRadius: 18,
        },
        outlined: {
          borderColor: alpha("#131A2C", 0.09),
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { borderRadius: 999, fontWeight: 600 },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: { boxShadow: "none" },
      },
    },
    MuiTextField: {
      defaultProps: { variant: "outlined" },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: { borderRadius: 10 },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: { borderRadius: 12 },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: { fontWeight: 700, borderRadius: 10 },
      },
    },
  },
})

export default theme
