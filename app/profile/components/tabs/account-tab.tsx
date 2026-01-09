"use client"

import { Box, Button, Divider, Typography, Grid } from "@mui/material"
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser"
import LogoutIcon from "@mui/icons-material/Logout"
import { logoutUserAction } from "../../account-action"
import { User } from "@supabase/supabase-js"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { PolarCustomer } from "@/app/types/polar-customer-types"

interface AccountTabProps {
     userData: { customer: PolarCustomer; session: User }
}

export default function AccountTab({ userData }: AccountTabProps) {

     const [signoutLoading, setSignoutLoading] = useState(false)
     const router = useRouter()
     const handleSignOut = async () => {
          setSignoutLoading(true)
          try {
               logoutUserAction();
               router.refresh();
          } catch (error) {
               console.error("Error signing out:", error);
          }
     };

     return (
          <Box>
               <Box
                    sx={{
                         display: "flex",
                         flexDirection: { xs: "column", sm: "row" },
                         justifyContent: { xs: "flex-start", sm: "space-between" },
                         alignItems: { xs: "flex-start", sm: "center" },
                         gap: { xs: 2, sm: 0 },
                         mb: 3
                    }}
               >
                    <Typography variant="h5">Account Information</Typography>
                    <Button
                         variant="outlined"
                         color="error"
                         startIcon={<LogoutIcon />}
                         onClick={handleSignOut}
                         loading={signoutLoading}
                         sx={{ width: { xs: "100%", sm: "auto" } }}
                    >
                         Sign out
                    </Button>
               </Box>

               <Grid container spacing={3}>
                    <Grid size={{ xs: 12, md: 6 }}>
                         <Typography variant="subtitle2" color="text.secondary">
                              Customer ID
                         </Typography>
                         <Typography variant="body1">{userData.customer.id}</Typography>
                    </Grid>

                    <Grid size={{ xs: 12, md: 6 }}>
                         <Typography variant="subtitle2" color="text.secondary">
                              Name
                         </Typography>
                         <Typography variant="body1">{userData.customer.name}</Typography>
                    </Grid>

                    <Grid size={{ xs: 12, md: 6 }}>
                         <Typography variant="subtitle2" color="text.secondary">
                              Email
                         </Typography>
                         <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                              <Typography variant="body1">{userData.customer.email}</Typography>
                              {userData.customer.emailVerified && <VerifiedUserIcon color="success" fontSize="small" />}
                         </Box>
                    </Grid>

                    <Grid size={{ xs: 12, md: 6 }}>
                         <Typography variant="subtitle2" color="text.secondary">
                              Organization ID
                         </Typography>
                         <Typography variant="body1">{userData.customer.organizationId}</Typography>
                    </Grid>

                    <Grid size={{ xs: 12, md: 6 }}>
                         <Typography variant="subtitle2" color="text.secondary">
                              Avatar
                         </Typography>
                         <Typography variant="body1">{userData.customer.avatarUrl || 'N/A'}</Typography>
                    </Grid>

                    <Grid size={{ xs: 12 }}>
                         <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                              Billing Address
                         </Typography>
                         <Box sx={{ pl: 2 }}>
                              <Typography variant="body1">
                                   {userData.customer.billingAddress?.line1 && `${userData.customer.billingAddress.line1}`}
                                   {userData.customer.billingAddress?.line2 && `, ${userData.customer.billingAddress.line2}`}
                              </Typography>
                              <Typography variant="body1">
                                   {userData.customer.billingAddress?.city && `${userData.customer.billingAddress.city}`}
                                   {userData.customer.billingAddress?.state && `, ${userData.customer.billingAddress.state}`}
                                   {userData.customer.billingAddress?.postalCode && ` ${userData.customer.billingAddress.postalCode}`}
                              </Typography>
                              <Typography variant="body1">
                                   {userData.customer.billingAddress?.country || 'N/A'}
                              </Typography>
                         </Box>
                    </Grid>

                    {userData.customer.taxId && userData.customer.taxId.length > 0 && (
                         <Grid size={{ xs: 12, md: 6 }}>
                              <Typography variant="subtitle2" color="text.secondary">
                                   Tax IDs
                              </Typography>
                              <Typography variant="body1">{userData.customer.taxId.join(', ')}</Typography>
                         </Grid>
                    )}

                    <Grid size={{ xs: 12, md: 6 }}>
                         <Typography variant="subtitle2" color="text.secondary">
                              Created At
                         </Typography>
                         <Typography variant="body1">
                              {new Intl.DateTimeFormat("en-US", {
                                   year: "numeric",
                                   month: "short",
                                   day: "numeric",
                                   hour: "2-digit",
                                   minute: "2-digit",
                              }).format(new Date(userData.customer.createdAt))}
                         </Typography>
                    </Grid>

                    <Grid size={{ xs: 12, md: 6 }}>
                         <Typography variant="subtitle2" color="text.secondary">
                              Modified At
                         </Typography>
                         <Typography variant="body1">
                              {new Intl.DateTimeFormat("en-US", {
                                   year: "numeric",
                                   month: "short",
                                   day: "numeric",
                                   hour: "2-digit",
                                   minute: "2-digit",
                              }).format(new Date(userData.customer.modifiedAt))}
                         </Typography>
                    </Grid>

                    {userData.customer.deletedAt && (
                         <Grid size={{ xs: 12, md: 6 }}>
                              <Typography variant="subtitle2" color="text.secondary">
                                   Deleted At
                              </Typography>
                              <Typography variant="body1" color="error">
                                   {new Intl.DateTimeFormat("en-US", {
                                        year: "numeric",
                                        month: "short",
                                        day: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                   }).format(new Date(userData.customer.deletedAt))}
                              </Typography>
                         </Grid>
                    )}

               </Grid>
          </Box >
     )
}
