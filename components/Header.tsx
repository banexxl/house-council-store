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
  CircularProgress,
} from "@mui/material"
import MenuIcon from "@mui/icons-material/Menu"
import ApartmentIcon from "@mui/icons-material/Apartment"
import { useRouter } from "next/navigation"
import { logoutUserAction } from "@/app/profile/logout-action"
import toast from "react-hot-toast"

type UserMetadata = {
  email: string
  email_verified: boolean
  phone_verified: boolean
  sub: string
}

type Identity = {
  identity_id: string
  id: string
  user_id: string
  identity_data: {
    email: string
    email_verified: boolean
    phone_verified: boolean
    sub: string
  }
  provider: string
  last_sign_in_at: string
  created_at: string
  updated_at: string
  email: string
}

type AppMetadata = {
  provider: string
  providers: string[]
}

export type User = {
  id: string
  aud: string
  role: string
  email: string
  email_confirmed_at: string
  phone: string
  confirmation_sent_at: string
  confirmed_at: string
  last_sign_in_at: string
  app_metadata: AppMetadata
  user_metadata: UserMetadata
  identities: Identity[]
  created_at: string
  updated_at: string
  is_anonymous: boolean
}

export type Session = {
  user?: User
}

type HeaderProps = {
  session?: Session
  isLoading?: boolean
  refreshSession?: () => void
}

export default function Header({ session, isLoading = false, refreshSession }: HeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [currentSession, setCurrentSession] = useState<Session | undefined>(session)
  const router = useRouter()

  useEffect(() => {
    setCurrentSession(session) // Update state when session changes
  }, [session])

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen)
  }

  const handleSignOut = async () => {
    try {
      const logoutError = await logoutUserAction()

      if (logoutError) {
        toast.error(logoutError)
        return
      }
      // After sign out, refresh the session
      if (refreshSession) {
        refreshSession()
      }

      router.push("/")
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  // Conditionally render menu items based on session state
  const navItems = [
    { name: "Home", path: "/" },
    { name: "Documentation", path: "/docs" },
    { name: "Pricing", path: "/pricing" },
    { name: "Contact", path: "/contact" },
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
            <ListItemButton sx={{ textAlign: "center" }}>
              <Link href={item.path} style={{ textDecoration: "none", width: "100%", color: "inherit" }}>
                <ListItemText primary={item.name} />
              </Link>
            </ListItemButton>
          </ListItem>
        ))}
        {
          currentSession?.user ? (
            <>
              <ListItem disablePadding>
                <Link href="/profile" style={{ textDecoration: "none", width: "100%", color: "inherit" }}>
                  <ListItemButton sx={{ textAlign: "center" }}>
                    <ListItemText primary="Profile" />
                  </ListItemButton>
                </Link>
              </ListItem>
              <ListItem disablePadding>
                <ListItemButton sx={{ textAlign: "center" }} onClick={handleSignOut}>
                  <ListItemText primary="Sign Out" />
                </ListItemButton>
              </ListItem>
            </>
          ) : (
            <ListItem disablePadding>
              <Link href="/auth/sign-in" style={{ textDecoration: "none", width: "100%", color: "inherit" }}>
                <ListItemButton sx={{ textAlign: "center" }}>
                  <ListItemText primary="Sign In" />
                </ListItemButton>
              </Link>
            </ListItem>
          )}
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

              {
                currentSession?.user ? (
                  <>
                    <Link href="/profile" style={{ textDecoration: "none" }}>
                      <Button color="inherit">Profile</Button>
                    </Link>
                    <Button variant="outlined" onClick={handleSignOut}>
                      Sign Out
                    </Button>
                  </>
                ) : (
                  <Link href="/auth/sign-in" style={{ textDecoration: "none" }}>
                    <Button color="inherit">Sign In</Button>
                  </Link>
                )}

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

