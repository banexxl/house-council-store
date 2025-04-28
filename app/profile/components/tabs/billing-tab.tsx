'use client';

import {
     Box,
     Button,
     Checkbox,
     Chip,
     Divider,
     FormControlLabel,
     Grid,
     MenuItem,
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
import { AddCardModal } from '../add-card-modal';
import { deleteClientBillingInformation } from '../../client-billing-information-actions';
import toast from 'react-hot-toast';
import { luhnCheck } from '@/app/lib/card-validator';
import { formatExpirationDate, parseExpirationDate } from '@/app/lib/date-helpers';
const countries = ['United States', 'Germany', 'Serbia'];
const states = ['New York', 'California', 'Texas'];
const languages = ['English', 'German', 'Serbian'];


interface BillingTabProps {
     userData: { client: Client; session: User; }
     allClientBillingInformation: ClientBillingInformation[]
     binCheckerAPIKey?: string
}

export const BillingTab = ({ userData, allClientBillingInformation, binCheckerAPIKey }: BillingTabProps) => {
     const [emailRecipient, setEmailRecipient] = useState('');
     const [companyName, setCompanyName] = useState('');
     const [address, setAddress] = useState({
          line1: '',
          line2: '',
          city: '',
          state: 'New York',
          zip: '',
          country: 'United States',
     });
     const [purchaseOrder, setPurchaseOrder] = useState('');
     const [taxId, setTaxId] = useState('');
     const [openAddCardModal, setOpenAddCardModal] = useState(false);

     const handleDeleteCard = async (billingInformationId: string) => {

          const { deleteClientBillingInformationSuccess, deleteClientBillingInformationError } = await deleteClientBillingInformation(userData.client.id, [billingInformationId])

          if (deleteClientBillingInformationSuccess) {
               toast.success('Card deleted successfully!');
          } else {
               toast.error(`Error deleting card: ${deleteClientBillingInformationError!}`);
          }
     }

     return (
          <Box>
               {/* Payment Method */}
               <Box >
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
                         <Typography variant="h5">
                              Payment Method
                         </Typography>
                    </Box>
                    {
                         allClientBillingInformation.length > 0 ? (
                              allClientBillingInformation.map((billingInformation) => (
                                   <>
                                        <Box key={billingInformation.id} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                                             <Box sx={{ display: 'flex', flexDirection: 'row' }}>

                                                  <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                                                       <Typography variant="body2" color="text.secondary">
                                                            Card number ending with: {billingInformation.card_number?.slice(-4)}
                                                       </Typography>
                                                       <Typography variant="body2" color="text.secondary">
                                                            Valid until {billingInformation.expiration_date
                                                                 ? formatExpirationDate(billingInformation.expiration_date)
                                                                 : 'Unknown'}
                                                       </Typography>
                                                  </Box>

                                                  {billingInformation.default_payment_method && (
                                                       <Box sx={{ display: 'inline-flex', alignItems: 'center', ml: 1 }}>
                                                            <Chip label="Default" color="success" variant="outlined" size="small" />
                                                       </Box>
                                                  )}
                                             </Box>
                                             <Button variant="outlined" color="error" onClick={() => handleDeleteCard(billingInformation.id!)}>
                                                  Delete
                                             </Button>
                                        </Box>
                                        <Divider sx={{ mb: 2 }} />
                                   </>
                              ))
                         ) : (
                              <Typography variant="body2" color="text.secondary">
                                   No payment methods available.
                              </Typography>
                         )
                    }
                    <Box mt={2}>
                         <Button
                              variant="outlined"
                              startIcon={<CreditCardIcon />}
                              onClick={() => setOpenAddCardModal(true)}
                              disabled={allClientBillingInformation.length >= 3}
                         >
                              Add Card
                         </Button>
                         <Typography variant="caption" color="text.secondary" display="block">
                              At most, three credit cards can be added.
                         </Typography>
                    </Box>
               </Box>

               <Divider sx={{ my: 3 }} />

               {/* Invoice Email Recipient */}
               <Box >
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
               </Box>

               {/* Company Name */}
               <Box >
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
               </Box>

               {/* Billing Address */}
               <Box >
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
               </Box>

               <Divider sx={{ my: 3 }} />

               {/* Invoice Purchase Order */}
               <Box >
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
               </Box>

               {/* Tax ID */}
               <Box >
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
               </Box>
               <AddCardModal
                    open={openAddCardModal}
                    onClose={() => setOpenAddCardModal(false)}
                    userData={userData}
                    binCheckerAPIKey={binCheckerAPIKey}
               />
          </Box >
     );
}
