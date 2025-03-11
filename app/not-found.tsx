"use client"

import type React from "react"

import Link from "next/link"
import { Box, Button, Container, Typography, Paper, TextField, InputAdornment } from "@mui/material"
import SearchIcon from "@mui/icons-material/Search"
import SentimentDissatisfiedIcon from "@mui/icons-material/SentimentDissatisfied"
import HomeIcon from "@mui/icons-material/Home"
import ContactSupportIcon from "@mui/icons-material/ContactSupport"

export default function NotFound() {

     return (
          <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
               <Box
                    component="main"
                    sx={{
                         flexGrow: 1,
                         display: "flex",
                         alignItems: "center",
                         py: { xs: 6, md: 10 },
                    }}
               >
                    <Container maxWidth="md">
                         <Paper
                              elevation={3}
                              sx={{
                                   p: { xs: 4, md: 6 },
                                   borderRadius: 2,
                                   textAlign: "center",
                                   bgcolor: "background.paper",
                              }}
                         >
                              <Box sx={{ mb: 4 }}>
                                   <SentimentDissatisfiedIcon
                                        sx={{
                                             fontSize: { xs: 80, md: 120 },
                                             color: "primary.main",
                                             opacity: 0.8,
                                        }}
                                   />
                              </Box>

                              <Typography
                                   variant="h2"
                                   component="h1"
                                   gutterBottom
                                   sx={{
                                        fontSize: { xs: "2rem", md: "3rem" },
                                        fontWeight: 700,
                                   }}
                              >
                                   404
                              </Typography>

                              <Typography
                                   variant="h4"
                                   component="h2"
                                   gutterBottom
                                   sx={{
                                        fontSize: { xs: "1.5rem", md: "2rem" },
                                        mb: 2,
                                   }}
                              >
                                   Page Not Found
                              </Typography>

                              <Typography
                                   variant="body1"
                                   color="text.secondary"
                                   paragraph
                                   sx={{
                                        maxWidth: 500,
                                        mx: "auto",
                                        mb: 4,
                                   }}
                              >
                                   The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
                              </Typography>

                              <Box
                                   component="form"
                                   // onSubmit={handleSearch}
                                   sx={{
                                        maxWidth: 500,
                                        mx: "auto",
                                        mb: 5,
                                   }}
                              >
                                   <TextField
                                        fullWidth
                                        name="search"
                                        placeholder="Search for pages, resources, or information..."
                                        variant="outlined"
                                        InputProps={{
                                             startAdornment: (
                                                  <InputAdornment position="start">
                                                       <SearchIcon />
                                                  </InputAdornment>
                                             ),
                                             endAdornment: (
                                                  <InputAdornment position="end">
                                                       <Button type="submit" variant="contained" size="small">
                                                            Search
                                                       </Button>
                                                  </InputAdornment>
                                             ),
                                        }}
                                   />
                              </Box>

                              <Box
                                   sx={{
                                        display: "flex",
                                        flexDirection: { xs: "column", sm: "row" },
                                        justifyContent: "center",
                                        gap: 2,
                                   }}
                              >
                                   <Button variant="contained" component={Link} href="/" startIcon={<HomeIcon />} sx={{ minWidth: 200 }}>
                                        Back to Home
                                   </Button>

                                   <Button
                                        variant="outlined"
                                        component={Link}
                                        href="/contact"
                                        startIcon={<ContactSupportIcon />}
                                        sx={{ minWidth: 200 }}
                                   >
                                        Contact Support
                                   </Button>
                              </Box>
                         </Paper>
                    </Container>
               </Box>
          </Box>
     )
}

