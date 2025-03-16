"use client";

import { AppBar, Toolbar, Button, Box, Container, IconButton, Drawer, List, ListItem, ListItemButton, ListItemText, Typography } from "@mui/material";
import Link from "next/link";
import { useEffect, useState } from "react";
import MenuIcon from '@mui/icons-material/Menu';
import ApartmentIcon from '@mui/icons-material/Apartment';
import { User } from "@supabase/supabase-js";
import { logoutUserAction } from "@/app/profile/logout-action";
import { useRouter } from "next/navigation";
import { useCookieTokenUpdater } from "@/lib/client-session-update";
// import other dependencies as needed

type HeaderProps = {
  user: User | null;
}

export const Header = ({ user }: HeaderProps) => {
  // const { session, isLoading, refreshSession } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);
  const router = useRouter();


  useCookieTokenUpdater();


  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleSignOut = async () => {
    try {
      logoutUserAction();
      router.refresh();

    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const navItems = [
    { name: "Home", path: "/" },
    { name: "Documentation", path: "/docs" },
    { name: "Pricing", path: "/pricing" },
    { name: "Contact", path: "/contact" },
  ];

  // Drawer for mobile
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
        {user ? (
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
  );

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static" color="default" elevation={1}>
        <Container maxWidth="lg">
          <Toolbar disableGutters>
            <Link href="/" style={{ textDecoration: "none", color: "inherit", display: "flex", alignItems: "center" }}>
              <ApartmentIcon sx={{ mr: 1 }} />
              <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 700, display: { xs: "none", sm: "block" } }}>
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
              {user ? (
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
              <Link href="https://house-council-app-v2-plum.vercel.app/auth/login" target="_blank" style={{ textDecoration: "none" }}>
                <Button variant="contained" color="primary">
                  Dashboard
                </Button>
              </Link>
            </Box>
            <Box sx={{ display: { xs: "flex", md: "none" } }}>
              <Link href="/pricing" style={{ textDecoration: "none", marginRight: "8px" }}>
                <Button variant="contained" color="primary" size="small">
                  Dashboard
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
  );
}
