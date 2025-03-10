"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import {
  AppBar,
  Box,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Container,
} from "@mui/material"
import MenuIcon from "@mui/icons-material/Menu"
import ApartmentIcon from "@mui/icons-material/Apartment"
import { getSession } from "@/lib/get-session"

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [session, setSession] = useState<{ user: any } | null>(null)

  useEffect(() => {
    const getSessionAsync = async () => {
      const session = await getSession()
      setSession(session)
    }
    getSessionAsync()
  }, [])

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen)
  }

  // Conditionally render menu items based on session state
  const navItems = [
    { name: "Home", path: "/" },
    { name: "Documentation", path: "/docs" },
    { name: "Pricing", path: "/pricing" },
    { name: "Contact", path: "/contact" },
    ...(session
      ? [
        { name: "Profile", path: "/profile" },
        { name: "Sign Out", path: "/auth/sign-out" },
      ]
      : [
        // { name: "Register", path: "/auth/register" },
        { name: "Sign In", path: "/auth/sign-in" },
      ]),
  ]

  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{ textAlign: "center" }}>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", p: 2 }}>
        <ApartmentIcon sx={{ mr: 1 }} />
        <Typography variant="h6" component="div">
          HouseCouncil
        </Typography>
      </Box>
      <List>
        {navItems.map((item) => (
          <ListItem key={item.name} disablePadding>
            <Link href={item.path} style={{ textDecoration: "none", width: "100%", color: "inherit" }}>
              <ListItemButton sx={{ textAlign: "center" }}>
                <ListItemText primary={item.name} />
              </ListItemButton>
            </Link>
          </ListItem>
        ))}
      </List>
    </Box>
  )

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static" color="default" elevation={1}>
        <Container maxWidth="lg">
          <Toolbar disableGutters>
            <Link href="/" style={{ textDecoration: "none", color: "inherit", display: "flex", alignItems: "center" }}>
              <ApartmentIcon sx={{ mr: 1 }} />
              <Typography
                variant="h6"
                component="div"
                sx={{ flexGrow: 1, fontWeight: 700, display: { xs: "none", sm: "block" } }}
              >
                HouseCouncil
              </Typography>
            </Link>

            <Box sx={{ flexGrow: 1 }} />

            <Box sx={{ display: { xs: "none", md: "flex" }, gap: 2 }}>
              {navItems.map((item) => (
                <Link key={item.name} href={item.path} style={{ textDecoration: "none" }}>
                  <Button color="inherit">{item.name}</Button>
                </Link>
              ))}
              <Link href="/pricing" style={{ textDecoration: "none" }}>
                <Button variant="contained" color="primary">
                  Get Started
                </Button>
              </Link>
            </Box>

            <Box sx={{ display: { xs: "flex", md: "none" } }}>
              <Link href="/pricing" style={{ textDecoration: "none", marginRight: "8px" }}>
                <Button variant="contained" color="primary" size="small">
                  Get Started
                </Button>
              </Link>
              <IconButton color="inherit" aria-label="open drawer" edge="end" onClick={handleDrawerToggle}>
                <MenuIcon />
              </IconButton>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      <Drawer
        anchor="right"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": { boxSizing: "border-box", width: 240 },
        }}
      >
        {drawer}
      </Drawer>
    </Box>
  )
}
