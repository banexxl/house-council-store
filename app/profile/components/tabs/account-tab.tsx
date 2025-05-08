"use client"

import { Box, Button, Divider, TextField, Typography, Chip, Alert, Stack, Grid, InputAdornment, IconButton, LinearProgress, CircularProgress, Paper, Autocomplete } from "@mui/material"
import EditIcon from "@mui/icons-material/Edit"
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser"
import LogoutIcon from "@mui/icons-material/Logout"
import { getStatusColor } from "../profile-sidebar"
import { deleteAccountAction, logoutUserAction, updateAccountAction } from "../../account-action"
import Swal from 'sweetalert2'
import { Client } from "@/app/types/client"
import { User } from "@supabase/supabase-js"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import toast from "react-hot-toast"
import { Form, Formik, useFormik } from "formik"
import * as Yup from "yup"

interface AccountTabProps {
     userData: { client: Client; session: User }
     editMode: boolean
     setEditMode: (value: boolean) => void
}
type CountryCodeData = {
     [key: string]: {
          country_name: string;
          dialling_code: string;
     };
};

type CountryItem = {
     code: string;
     country_name: string;
     dialling_code: string;
};

const accountSchema = Yup.object().shape({
     contact_person: Yup.string().min(2, "Name must be at least 2 characters").required("Full name is required"),
     mobile_phone: Yup.string().min(8, "Mobile phone number must be at least 8 characters"),
     phone: Yup.string().min(8, "Phone number must be at least 8 characters"),
     name: Yup.string().min(2, "Company name must be at least 2 characters"),
     address_1: Yup.string().min(2, "Address must be at least 2 characters"),
});

export default function AccountTab({ userData, editMode, setEditMode }: AccountTabProps) {

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

     const [countries, setCountries] = useState<CountryItem[]>([]);
     const [selectedMobileCode, setSelectedMobileCode] = useState<CountryItem | null>(null);
     const [selectedPhoneCode, setSelectedPhoneCode] = useState<CountryItem | null>(null);

     useEffect(() => {
          const fetchCountries = async () => {
               const response = await fetch(`https://api.apilayer.com/number_verification/countries/`, {
                    headers: {
                         'Content-Type': 'application/json',
                         'Access-Control-Allow-Origin': '*',
                         'redirect': 'follow',
                         'apikey': `${process.env.NEXT_PUBLIC_API_LAYER_KEY}`
                    },
               });

               const data: CountryCodeData = await response.json();
               console.log('data', data);

               const countryList: CountryItem[] = Object.entries(data).map(([code, value]) => ({
                    code,
                    country_name: value.country_name,
                    dialling_code: value.dialling_code,
               }));
               console.log('countryList', countryList);

               setCountries(countryList);
          };

          fetchCountries();
     }, []);

     return (
          <>
               {editMode ? (
                    <Box>
                         <Alert severity="info" sx={{ mb: 3 }}>
                              Edit your profile information below. Fields marked with * are required.
                         </Alert>

                         <Formik
                              initialValues={{
                                   contact_person: userData.client.contact_person,
                                   mobile_phone: userData.client.mobile_phone,
                                   phone: userData.client.phone,
                                   name: userData.client.name,
                                   address_1: userData.client.address_1
                              }}
                              onSubmit={async (values, { setSubmitting }) => {
                                   setSubmitting(true);
                                   const fullMobileNumber = `${selectedMobileCode?.dialling_code || ''} ${values.mobile_phone}`;
                                   const fullPhoneNumber = `${selectedPhoneCode?.dialling_code || ''} ${values.phone}`;

                                   try {
                                        const updateAccountActionResponse = await updateAccountAction(userData.client.id, {
                                             contact_person: values.contact_person,
                                             name: values.name,
                                             mobile_phone: fullMobileNumber,
                                             phone: fullPhoneNumber,
                                             address_1: values.address_1
                                        });

                                        if (updateAccountActionResponse.success) {
                                             toast.success("Account updated successfully.");
                                             setEditMode(false);
                                        } else {
                                             toast.error("Error updating account: " + updateAccountActionResponse.error);
                                        }
                                   } catch (error) {
                                        toast.error("Error updating account: " + error);
                                   } finally {
                                        setSubmitting(false);
                                   }
                              }}
                              validationSchema={
                                   accountSchema
                              }
                         >
                              {({ values, handleChange, isSubmitting, errors }) => (
                                   <Form>
                                        <Grid container spacing={3}>
                                             <Grid size={{ xs: 12, md: 6 }}>
                                                  <TextField
                                                       fullWidth
                                                       label="Email"
                                                       type="email"
                                                       name="email"
                                                       value={userData.client.email}
                                                       disabled
                                                  // required
                                                  />
                                             </Grid>

                                             <Grid size={{ xs: 12, md: 6 }}>
                                                  <TextField
                                                       fullWidth
                                                       label="Full Name"
                                                       name="contact_person"
                                                       value={values.contact_person}
                                                       onChange={handleChange}
                                                       error={!!errors.contact_person}
                                                       helperText={errors.contact_person || ""}
                                                       required
                                                  />
                                             </Grid>

                                             <Box sx={{ mb: 3 }}>
                                                  <TextField
                                                       fullWidth
                                                       label="Mobile Phone"
                                                       placeholder="123456789"
                                                       InputProps={{
                                                            startAdornment: (
                                                                 <InputAdornment position="start" sx={{ minWidth: 130 }}>
                                                                      <Autocomplete
                                                                           options={countries}
                                                                           value={selectedMobileCode}
                                                                           getOptionLabel={(option) => option.dialling_code}
                                                                           onChange={(_, newValue) => setSelectedMobileCode(newValue)}
                                                                           renderInput={(params) => (
                                                                                <TextField
                                                                                     {...params}
                                                                                     placeholder="+XXX"
                                                                                     variant="standard"
                                                                                     sx={{ width: 100 }}
                                                                                />
                                                                           )}
                                                                      />
                                                                 </InputAdornment>
                                                            ),
                                                       }}
                                                  />
                                             </Box>

                                             <Box>
                                                  <TextField
                                                       fullWidth
                                                       label="Phone"
                                                       placeholder="987654321"
                                                       InputProps={{
                                                            startAdornment: (
                                                                 <InputAdornment position="start" sx={{ minWidth: 130 }}>
                                                                      <Autocomplete
                                                                           options={countries}
                                                                           value={selectedPhoneCode}
                                                                           getOptionLabel={(option) => option.dialling_code}
                                                                           onChange={(_, newValue) => setSelectedPhoneCode(newValue)}
                                                                           renderInput={(params) => (
                                                                                <TextField
                                                                                     {...params}
                                                                                     placeholder="+XXX"
                                                                                     variant="standard"
                                                                                     sx={{ width: 100 }}
                                                                                />
                                                                           )}
                                                                      />
                                                                 </InputAdornment>
                                                            ),
                                                       }}
                                                  />
                                             </Box>

                                             <Grid size={{ xs: 12, md: 6 }}>
                                                  <TextField
                                                       fullWidth
                                                       label="Address"
                                                       name="address_1"
                                                       value={values.address_1}
                                                       onChange={handleChange}
                                                       error={!!errors.address_1}
                                                       helperText={errors.address_1 || ""}
                                                  />
                                             </Grid>

                                             <Grid size={{ xs: 12, md: 6 }}>
                                                  <TextField
                                                       fullWidth
                                                       label="Company name"
                                                       name="name"
                                                       value={values.name}
                                                       onChange={handleChange}
                                                       error={!!errors.name}
                                                       helperText={errors.name || ""}
                                                  />
                                             </Grid>

                                             <Grid size={{ xs: 12, md: 6 }}>
                                                  <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
                                                       <Button variant="outlined" onClick={() => setEditMode(false)}>
                                                            Cancel
                                                       </Button>
                                                       <Button
                                                            variant="contained"
                                                            disabled={isSubmitting}
                                                            type="submit"
                                                       >
                                                            {isSubmitting ? "Saving..." : "Save Changes"}
                                                       </Button>

                                                  </Box>
                                             </Grid>
                                        </Grid>
                                   </Form>
                              )}
                         </Formik>
                    </Box >
               ) : (
                    <Box>
                         <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
                              <Typography variant="h5">Account Information</Typography>
                              <Box sx={{ display: "flex", gap: 2 }}>
                                   <Button variant="outlined" startIcon={<EditIcon />} onClick={() => setEditMode(true)}>
                                        Edit Profile
                                   </Button>
                                   <Button
                                        variant="outlined"
                                        color="error"
                                        startIcon={<LogoutIcon />}
                                        onClick={handleSignOut}
                                        loading={signoutLoading}
                                   >
                                        Sign out
                                   </Button>
                              </Box>
                         </Box>

                         <Grid container spacing={3}>
                              <Grid size={{ xs: 12, md: 6 }}>
                                   <Typography variant="subtitle2" color="text.secondary">
                                        User ID
                                   </Typography>
                                   <Typography variant="body1">{userData.client.id.slice(-12).toUpperCase()}</Typography>
                              </Grid>

                              <Grid size={{ xs: 12, md: 6 }}>
                                   <Typography variant="subtitle2" color="text.secondary">
                                        Status
                                   </Typography>
                                   <Chip label={userData.client.client_status} color={getStatusColor(userData.client.client_status)} size="small" />
                              </Grid>

                              <Grid size={{ xs: 12, md: 6 }}>
                                   <Typography variant="subtitle2" color="text.secondary">
                                        Full Name
                                   </Typography>
                                   <Typography variant="body1">{userData.client.contact_person}</Typography>
                              </Grid>

                              <Grid size={{ xs: 12, md: 6 }}>
                                   <Typography variant="subtitle2" color="text.secondary">
                                        Email
                                   </Typography>
                                   <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                        <Typography variant="body1">{userData.client.email}</Typography>
                                        {userData.client.is_verified && <VerifiedUserIcon color="success" fontSize="small" />}
                                   </Box>
                              </Grid>

                              <Grid size={{ xs: 12, md: 6 }}>
                                   <Typography variant="subtitle2" color="text.secondary">
                                        Mobile Phone Number
                                   </Typography>
                                   <Typography variant="body1">{userData.client.mobile_phone}</Typography>
                              </Grid>

                              <Grid size={{ xs: 12, md: 6 }}>
                                   <Typography variant="subtitle2" color="text.secondary">
                                        Phone Number
                                   </Typography>
                                   <Typography variant="body1">{userData.client.phone}</Typography>
                              </Grid>

                              <Grid size={{ xs: 12, md: 6 }}>
                                   <Typography variant="subtitle2" color="text.secondary">
                                        Company Name
                                   </Typography>
                                   <Typography variant="body1">{userData.client.name}</Typography>
                              </Grid>

                              <Grid size={{ xs: 12, md: 6 }}>
                                   <Typography variant="subtitle2" color="text.secondary">
                                        Address
                                   </Typography>
                                   <Typography variant="body1">{userData.client.address_1}</Typography>
                              </Grid>

                              <Grid size={{ xs: 12, md: 6 }}>
                                   <Typography variant="subtitle2" color="text.secondary">
                                        Member Since
                                   </Typography>
                                   <Typography variant="body1">
                                        {new Intl.DateTimeFormat("en-US", {
                                             year: "numeric",
                                             month: "short",
                                             day: "numeric",
                                             hour: "2-digit",
                                             minute: "2-digit",
                                        }).format(new Date(userData.session.created_at))}
                                   </Typography>
                              </Grid>

                         </Grid>

                         <Divider sx={{ my: 3 }} />

                    </Box >
               )
               }
          </>
     )
}

