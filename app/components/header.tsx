"use client";

import { AppBar, Toolbar, Button, Box, Container, IconButton, Drawer, List, ListItem, ListItemButton, ListItemText, Typography, useTheme, alpha } from "@mui/material";
import Image from "next/image";
import Link from "next/link";
import { useState, useTransition } from "react";
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import ArrowOutwardIcon from '@mui/icons-material/ArrowOutward';
import { User } from "@supabase/supabase-js";
import { useRouter, usePathname } from "next/navigation";
import { useCookieTokenUpdater } from "@/app/lib/client-session-update";
import useScrollTrigger from "@mui/material/useScrollTrigger";
import { logoutUserAction } from "../profile/account-action";
import CircularProgress from '@mui/material/CircularProgress';
import Backdrop from '@mui/material/Backdrop';
import toast from "react-hot-toast";
import { HEADER_HEIGHT } from "@/app/lib/layout-constants";

type HeaderProps = {
  user: User | null;
}

export const Header = ({ user }: HeaderProps) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const theme = useTheme();

  useCookieTokenUpdater();

  const [isPending, startTransition] = useTransition()

  const handleNavClick = (path: string) => {
    setMobileOpen(false);
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

  const scrolled = useScrollTrigger({
    disableHysteresis: true,
    threshold: 8,
  });

  const navItems = [
    { name: "Home", path: "/" },
    { name: "Docs", path: "/docs" },
    { name: "Pricing", path: "/pricing" },
    { name: "Contact", path: "/contact" },
  ];

  const drawer = (
    <Box sx={{ height: "100%", bgcolor: "secondary.main", color: "common.white" }}>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", px: 2.5, py: 2.5 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
          <Image src="/logo-icons/1-02.png" alt="Logo" width={48} height={30} />
          <Typography variant="subtitle1" sx={{ fontWeight: 800, color: "common.white" }}>
            Nest Link
          </Typography>
        </Box>
        <IconButton onClick={handleDrawerToggle} sx={{ color: "common.white" }}>
          <CloseIcon />
        </IconButton>
      </Box>

      <List sx={{ px: 1.5 }}>
        {navItems.map((item) => (
          <ListItem key={item.name} disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton
              onClick={() => handleNavClick(item.path)}
              sx={{
                borderRadius: 2,
                bgcolor: pathname === item.path ? alpha("#fff", 0.08) : "transparent",
              }}
            >
              <ListItemText primary={item.name} slotProps={{ primary: { fontWeight: 600 } }} />
            </ListItemButton>
          </ListItem>
        ))}

        {user ? (
          <>
            <ListItem disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton onClick={() => handleNavClick("/profile")} sx={{ borderRadius: 2 }}>
                <ListItemText primary="Profile" slotProps={{ primary: { fontWeight: 600 } }} />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding sx={{ mb: 0.5 }}>
              <Link
                href={process.env.NEXT_PUBLIC_DASHBOARD_URL!}
                style={{ width: "100%", textDecoration: "none", color: "inherit" }}
              >
                <ListItemButton sx={{ borderRadius: 2 }}>
                  <ListItemText primary="Dashboard" slotProps={{ primary: { fontWeight: 600 } }} />
                </ListItemButton>
              </Link>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton onClick={handleSignOut} sx={{ borderRadius: 2, color: theme.palette.error.light }}>
                <ListItemText primary="Sign Out" slotProps={{ primary: { fontWeight: 600 } }} />
              </ListItemButton>
            </ListItem>
          </>
        ) : (
          <ListItem disablePadding>
            <ListItemButton
              onClick={() => handleNavClick("/auth/sign-in")}
              sx={{ borderRadius: 2, bgcolor: "primary.main", "&:hover": { bgcolor: "primary.dark" } }}
            >
              <ListItemText primary="Sign In" slotProps={{ primary: { fontWeight: 700, color: theme.palette.primary.contrastText } }} />
            </ListItemButton>
          </ListItem>
        )}
      </List>
    </Box>
  );

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar
        position="fixed"
        color="transparent"
        elevation={0}
        sx={{
          height: HEADER_HEIGHT,
          justifyContent: "center",
          backgroundColor: scrolled ? alpha("#FFFFFF", 0.86) : alpha("#FFFFFF", 0.72),
          backdropFilter: "blur(14px)",
          WebkitBackdropFilter: "blur(14px)",
          borderBottom: "1px solid",
          borderColor: scrolled ? alpha("#131A2C", 0.08) : "transparent",
          boxShadow: scrolled ? "0 8px 24px rgba(15,23,42,0.06)" : "none",
          transition: "background-color 200ms ease, border-color 200ms ease, box-shadow 200ms ease",
        }}
      >
        <Container maxWidth="lg">
          <Toolbar
            disableGutters
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              height: HEADER_HEIGHT,
              minHeight: `${HEADER_HEIGHT}px !important`,
            }}
          >
            <Box
              sx={{ display: "flex", alignItems: "center", gap: 1.25, cursor: "pointer" }}
              onClick={() => handleNavClick("/")}
            >
              <Image
                src="/logo-icons/1-01.png"
                alt="NestLink logo"
                width={40}
                height={30}
                priority
              />
              <Typography
                variant="subtitle1"
                sx={{ fontWeight: 800, color: "primary.main", display: { xs: "none", sm: "block" } }}
              >
                Nest Link
              </Typography>
            </Box>

            <Box sx={{ display: { xs: "none", md: "flex" }, alignItems: "center", gap: 0.5 }}>
              {navItems.map((item) => (
                <Button
                  key={item.name}
                  onClick={() => handleNavClick(item.path)}
                  sx={{
                    color: pathname === item.path ? "primary.dark" : "secondary.main",
                    fontWeight: pathname === item.path ? 800 : 600,
                    px: 1.75,
                  }}
                >
                  {item.name}
                </Button>
              ))}

              {user ? (
                <>
                  <Button
                    onClick={() => handleNavClick("/profile")}
                    sx={{ color: pathname === "/profile" ? "primary.dark" : "secondary.main", fontWeight: 600, px: 1.75 }}
                  >
                    Profile
                  </Button>
                  <Button
                    variant="contained"
                    color="primary"
                    endIcon={<ArrowOutwardIcon sx={{ fontSize: 16 }} />}
                    component={Link}
                    href={process.env.NEXT_PUBLIC_DASHBOARD_URL!}
                    target="_blank"
                    sx={{ ml: 1 }}
                  >
                    Dashboard
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    onClick={() => handleNavClick("/auth/sign-in")}
                    sx={{ color: "secondary.main", fontWeight: 600, px: 1.75 }}
                  >
                    Sign In
                  </Button>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => handleNavClick("/auth/register")}
                    sx={{ ml: 1 }}
                  >
                    Get Started
                  </Button>
                </>
              )}
            </Box>

            <Box sx={{ display: { xs: "flex", md: "none" } }}>
              <IconButton onClick={handleDrawerToggle} sx={{ color: "secondary.main" }}>
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
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": { boxSizing: "border-box", width: 260 },
        }}
      >
        {drawer}
      </Drawer>

      <Backdrop sx={{ color: '#fff', zIndex: (t) => t.zIndex.drawer + 1 }} open={isPending}>
        <CircularProgress sx={{ color: theme.palette.primary.main }} />
      </Backdrop>
    </Box>
  );
}
