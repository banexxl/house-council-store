'use client';

import {
     Box,
     Button,
     Checkbox,
     Divider,
     FormControlLabel,
     Grid,
     MenuItem,
     Paper,
     Stack,
     TextField,
     Typography,
} from '@mui/material';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import React, { useState } from 'react';
import { SubscriptionPlan } from '@/app/types/subscription-plan';
import { BaseEntity } from '@/app/types/base-entity';
import { Client } from '@/app/types/client';
import { User } from '@supabase/supabase-js';
import { Feature } from '@/app/types/feature';
import { ClientBillingInformation } from '@/app/types/billing-information';

const countries = ['United States', 'Germany', 'Serbia'];
const states = ['New York', 'California', 'Texas'];
const languages = ['English', 'German', 'Serbian'];


interface BillingTabProps {
     subscriptionData?: SubscriptionPlan | null
     paymentMethods: BaseEntity[]
     userData: { client: Client; session: User; }
     subscriptionFeatures?: Feature[],
     allClientBillingInformation: ClientBillingInformation[]
}

export const BillingTab = ({ paymentMethods, subscriptionData, userData, subscriptionFeatures }: BillingTabProps) => {
     const [emailRecipient, setEmailRecipient] = useState('');
     const [companyName, setCompanyName] = useState('Branislav');
     const [address, setAddress] = useState({
          line1: '',
          line2: '',
          city: '',
          state: 'New York',
          zip: '',
          country: 'United States',
     });
     const [invoiceLang, setInvoiceLang] = useState('English');
     const [purchaseOrder, setPurchaseOrder] = useState('TEST');
     const [taxId, setTaxId] = useState('');

     return (
          <Stack spacing={4} p={4} maxWidth="800px" mx="auto">
               {/* Payment Method */}
               <Paper variant="outlined" sx={{ p: 3 }}>
                    <Typography variant="h6" gutterBottom>
                         Payment Method
                    </Typography>
                    <FormControlLabel
                         control={<Checkbox defaultChecked />}
                         label="Visa debit —•••• 1985"
                    />
                    <Typography variant="body2" color="text.secondary">
                         Valid until 7/2025
                    </Typography>
                    <Box mt={2}>
                         <Button variant="outlined" startIcon={<CreditCardIcon />}>
                              Add Card
                         </Button>
                         <Typography variant="caption" color="text.secondary" display="block">
                              At most, three credit cards can be added.
                         </Typography>
                    </Box>
               </Paper>

               {/* Invoice Email Recipient */}
               <Paper variant="outlined" sx={{ p: 3 }}>
                    <Typography variant="h6" gutterBottom>
                         Invoice Email Recipient
                    </Typography>
                    <TextField
                         fullWidth
                         placeholder="john@doe.com"
                         value={emailRecipient}
                         onChange={(e) => setEmailRecipient(e.target.value)}
                    />
                    <Typography variant="caption" color="text.secondary">
                         Max 254 characters.
                    </Typography>
                    <Box mt={2}>
                         <Button variant="contained">Save</Button>
                    </Box>
               </Paper>

               {/* Company Name */}
               <Paper variant="outlined" sx={{ p: 3 }}>
                    <Typography variant="h6" gutterBottom>
                         Company Name
                    </Typography>
                    <TextField
                         fullWidth
                         value={companyName}
                         onChange={(e) => setCompanyName(e.target.value)}
                    />
                    <Typography variant="caption" color="text.secondary">
                         Max 64 characters.
                    </Typography>
                    <Box mt={2}>
                         <Button variant="contained">Save</Button>
                    </Box>
               </Paper>

               {/* Billing Address */}
               <Paper variant="outlined" sx={{ p: 3 }}>
                    <Typography variant="h6" gutterBottom>
                         Billing Address
                    </Typography>
                    <Stack spacing={2}>
                         <TextField
                              label="Address Line 1"
                              fullWidth
                              value={address.line1}
                              onChange={(e) => setAddress({ ...address, line1: e.target.value })}
                         />
                         <TextField
                              label="Address Line 2"
                              fullWidth
                              value={address.line2}
                              onChange={(e) => setAddress({ ...address, line2: e.target.value })}
                         />
                         <TextField
                              label="City"
                              fullWidth
                              value={address.city}
                              onChange={(e) => setAddress({ ...address, city: e.target.value })}
                         />
                         <Grid container spacing={2}>
                              <Grid size={6}>
                                   <TextField
                                        label="State"
                                        select
                                        fullWidth
                                        value={address.state}
                                        onChange={(e) => setAddress({ ...address, state: e.target.value })}
                                   >
                                        {states.map((state) => (
                                             <MenuItem key={state} value={state}>
                                                  {state}
                                             </MenuItem>
                                        ))}
                                   </TextField>
                              </Grid>
                              <Grid size={6}>
                                   <TextField
                                        label="ZIP / Postal Code"
                                        fullWidth
                                        value={address.zip}
                                        onChange={(e) => setAddress({ ...address, zip: e.target.value })}
                                   />
                              </Grid>
                         </Grid>
                         <TextField
                              label="Country"
                              select
                              fullWidth
                              value={address.country}
                              onChange={(e) => setAddress({ ...address, country: e.target.value })}
                         >
                              {countries.map((c) => (
                                   <MenuItem key={c} value={c}>
                                        {c}
                                   </MenuItem>
                              ))}
                         </TextField>
                         <Box>
                              <Button variant="contained">Save</Button>
                         </Box>
                    </Stack>
               </Paper>

               {/* Invoice Language */}
               <Paper variant="outlined" sx={{ p: 3 }}>
                    <Typography variant="h6" gutterBottom>
                         Invoice Language
                    </Typography>
                    <TextField
                         select
                         fullWidth
                         value={invoiceLang}
                         onChange={(e) => setInvoiceLang(e.target.value)}
                    >
                         {languages.map((lang) => (
                              <MenuItem key={lang} value={lang}>
                                   {lang}
                              </MenuItem>
                         ))}
                    </TextField>
                    <Typography variant="caption" color="text.secondary">
                         This field determines the language of your invoices.
                    </Typography>
                    <Box mt={2}>
                         <Button variant="contained">Save</Button>
                    </Box>
               </Paper>

               {/* Invoice Purchase Order */}
               <Paper variant="outlined" sx={{ p: 3 }}>
                    <Typography variant="h6" gutterBottom>
                         Invoice Purchase Order
                    </Typography>
                    <TextField
                         fullWidth
                         value={purchaseOrder}
                         onChange={(e) => setPurchaseOrder(e.target.value)}
                    />
                    <Typography variant="caption" color="text.secondary">
                         Max 64 characters.
                    </Typography>
                    <Box mt={2}>
                         <Button variant="contained">Save</Button>
                    </Box>
               </Paper>

               {/* Tax ID */}
               <Paper variant="outlined" sx={{ p: 3 }}>
                    <Typography variant="h6" gutterBottom>
                         Tax ID
                    </Typography>
                    <TextField
                         fullWidth
                         placeholder="EU VAT number"
                         value={taxId}
                         onChange={(e) => setTaxId(e.target.value)}
                    />
                    <Typography variant="caption" color="text.secondary">
                         Countries that do not use Tax IDs can leave this blank.
                    </Typography>
                    <Box mt={2}>
                         <Button variant="contained">Save</Button>
                    </Box>
               </Paper>
          </Stack>
     );
}
