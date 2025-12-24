"use client";

import { AppBar, Toolbar, Button, Box, Container, IconButton, Drawer, List, ListItem, ListItemButton, ListItemText, Typography, useTheme } from "@mui/material";
import Image from "next/image";
import Link from "next/link";
import { useState, useTransition } from "react";
import MenuIcon from '@mui/icons-material/Menu';
import { User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { useCookieTokenUpdater } from "@/app/lib/client-session-update";
import useScrollTrigger from "@mui/material/useScrollTrigger";
import { logoutUserAction } from "../profile/account-action";
import CircularProgress from '@mui/material/CircularProgress';
import Backdrop from '@mui/material/Backdrop';
import toast from "react-hot-toast";

type HeaderProps = {
  user: User | null;
}

export const Header = ({ user }: HeaderProps) => {
  // const { session, isLoading, refreshSession } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);
  const router = useRouter();
  const theme = useTheme();

  useCookieTokenUpdater();

  const [isPending, startTransition] = useTransition()

  const handleNavClick = (path: string) => {
    startTransition(() => {
      router.push(path);
    });
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleSignOut = async () => {
    try {
      logoutUserAction();
      startTransition(() => {
        router.refresh();
      });
      toast.success("Logged out successfully");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const useShrinkOnScroll = (): boolean => {
    return useScrollTrigger({
      disableHysteresis: true,
      threshold: 10,
    });
  };

  const shrinkOnScroll = useShrinkOnScroll();

  const navItems = [
    { name: "Home", path: "/" },
    { name: "Docs", path: "/docs" },
    { name: "Subscriptions", path: "/pricing" },
    { name: "Contact", path: "/contact" },
  ];

  // Drawer for mobile
  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{ textAlign: "center", backgroundColor: theme.palette.primary.main, height: "100vh" }} >
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Image src="/logo-icons/1-02.png" alt="Logo" width={80} height={80} style={{ transform: "scale(1.5)", marginTop: "10px" }} />
        <Typography variant="h6" component="div" sx={{ textAlign: "center", color: theme.palette.secondary.main, textDecoration: "none" }}>
          Nest Link
        </Typography>
      </Box>
      <List>
        {navItems.map((item) => (
          <ListItem key={item.name} >
            <ListItemButton sx={{ textAlign: "left", mt: 0, p: 0 }}>
              <ListItemButton onClick={() => handleNavClick(item.path)}>
                <ListItemText primary={item.name} sx={{ color: theme.palette.secondary.main }} />
              </ListItemButton>
            </ListItemButton>
          </ListItem>
        ))}
        {user ? (
          <>
            <ListItem >
              <ListItemButton onClick={() => handleNavClick("/profile")}>
                <ListItemText primary="Profile" sx={{ textAlign: "left", color: theme.palette.secondary.main, textDecoration: "none" }} />
              </ListItemButton>
            </ListItem>
            <ListItem >
              <Link href={process.env.NEXT_PUBLIC_DASHBOARD_URL!} style={{ color: theme.palette.primary.main, width: "100%" }}>
                <ListItemButton sx={{ textAlign: "left" }}>
                  <ListItemText primary="Dashboard" sx={{ color: theme.palette.secondary.main }} />
                </ListItemButton>
              </Link>
            </ListItem>
            <ListItem >
              <ListItemButton sx={{ textAlign: "left" }} onClick={handleSignOut}>
                <ListItemText primary="Sign Out" sx={{ color: theme.palette.secondary.main }} />
              </ListItemButton>
            </ListItem>
          </>
        ) : (
          <ListItem >
            <ListItemButton sx={{ textAlign: "left" }} onClick={() => handleNavClick("/auth/sign-in")}>
              <ListItemText primary="Sign In" sx={{ color: theme.palette.secondary.main }} />
            </ListItemButton>
          </ListItem>
        )}
      </List>
    </Box>
  );

  return (
    <Box sx={{ flexGrow: 1, }}>
      <AppBar position="fixed" color="default" elevation={1} sx={{
        backgroundColor: theme.palette.secondary.dark,
        maxWidth: "100%",
      }}>
        <Container maxWidth="lg" >
          <Toolbar disableGutters
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              height: shrinkOnScroll ? 56 : 80,
              transition: "all 0.3s ease",
            }}
          >
            <Image
              src="/logo-icons/1-01.png"
              alt="Logo"
              width={shrinkOnScroll ? 50 : 80}
              height={shrinkOnScroll ? 50 : 80}
              style={{ transform: `scale(${shrinkOnScroll ? 1.2 : 1.5})`, marginTop: "20px", transition: "all 0.3s ease", cursor: "pointer" }}
              priority
              onClick={() => handleNavClick("/")}
            />
            <Box sx={{ flexGrow: 1 }} />

            <Box sx={{ display: { xs: "none", md: "flex" }, gap: 2 }}>
              {navItems.map((item) => (
                <Button
                  key={item.name}
                  sx={{ color: theme.palette.primary.main }}
                  onClick={() => handleNavClick(item.path)}
                >
                  {item.name}
                </Button>
              ))}

              {user ? (
                <Button
                  sx={{ color: theme.palette.primary.main }}
                  onClick={() => handleNavClick("/profile")}
                >
                  Profile
                </Button>
              ) : (
                <Button
                  sx={{ color: theme.palette.primary.main }}
                  onClick={() => handleNavClick("/auth/sign-in")}
                >
                  Sign In
                </Button>
              )}

              {user && (
                <Link
                  href={process.env.NEXT_PUBLIC_DASHBOARD_URL!}
                  target="_blank"
                  style={{ color: theme.palette.primary.main }}
                >
                  <Button variant="contained" color="primary">
                    Dashboard
                  </Button>
                </Link>
              )}
            </Box>


            <Box sx={{ display: { xs: "flex", md: "none" } }}>
              <IconButton color="inherit" aria-label="open drawer" edge="end" onClick={handleDrawerToggle}>
                <MenuIcon sx={{ textAlign: "center", color: theme.palette.primary.main, textDecoration: "none" }} />
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
  );
}
