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
     Tooltip,
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
import { deleteClientBillingInformation, makeCardDefault } from '../../client-billing-information-actions';
import toast from 'react-hot-toast';
import { formatExpirationDate } from '@/app/lib/date-helpers';


interface BillingTabProps {
     userData: { client: Client; session: User; }
     allClientBillingInformation: ClientBillingInformation[]
     binCheckerAPIKey?: string
}

export const BillingTab = ({ userData, allClientBillingInformation, binCheckerAPIKey }: BillingTabProps) => {

     const [openAddCardModal, setOpenAddCardModal] = useState(false);

     const handleDeleteCard = async (billingInformationId: string) => {

          const { deleteClientBillingInformationSuccess, deleteClientBillingInformationError } = await deleteClientBillingInformation(userData.client.id, [billingInformationId])

          if (deleteClientBillingInformationSuccess) {
               toast.success('Card deleted successfully!');
          } else {
               toast.error(`Error deleting card: ${deleteClientBillingInformationError!}`);
          }
     }

     const handleMakeDefault = async (billingInformationId: string) => {
          try {
               const { makeCardDefaultSuccess, makeCardDefaultError } = await makeCardDefault(userData.client.id, billingInformationId)

               if (makeCardDefaultSuccess) {
                    toast.success('Card made default successfully!');
               } else {
                    toast.error(`Error making card default: ${makeCardDefaultError!}`);
               }
          } catch (error) {
               console.error('Error making card default:', error);
               toast.error('Error making card default. Please try again later.');
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
                                   <Box key={billingInformation.id}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
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
                                             <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                  <Button
                                                       variant="outlined"
                                                       onClick={() => handleMakeDefault(billingInformation.id!)}
                                                       disabled={billingInformation.default_payment_method}
                                                  >
                                                       Make default
                                                  </Button>
                                                  <Button
                                                       variant="outlined"
                                                       color="error"
                                                       onClick={() => handleDeleteCard(billingInformation.id!)}
                                                       disabled={billingInformation.default_payment_method}
                                                  >
                                                       Delete
                                                  </Button>
                                             </Box>
                                        </Box>
                                        <Divider sx={{ mb: 2 }} />
                                   </Box>
                              ))
                         ) : (
                              <Typography variant="body2" color="text.secondary">
                                   No payment methods available.
                              </Typography>
                         )
                    }
                    <Box my={2}>
                         <Tooltip
                              title={
                                   allClientBillingInformation.length >= 3
                                        ? "You can only add up to 3 cards"
                                        : "Add Card"
                              }
                              arrow
                              placement="top"
                         >
                              <span>
                                   <Button
                                        variant="outlined"
                                        startIcon={<CreditCardIcon />}
                                        onClick={() => setOpenAddCardModal(true)}
                                        disabled={allClientBillingInformation.length >= 3}
                                        sx={{ my: 1 }}
                                   >
                                        Add Card
                                   </Button>
                              </span>
                         </Tooltip>

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
                    {/* <TextField
                         fullWidth
                         placeholder="john@doe.com"
                         value={emailRecipient}
                         onChange={(e) => setEmailRecipient(e.target.value)}
                         type='email'
                    /> */}
                    <Typography variant="caption" color="text.secondary">
                         By default, all your invoices will be sent to your account’s email address. If you want to use a custom email address specifically for receiving invoices, enter it here.
                    </Typography>
                    <Box my={2}>
                         <Button variant="contained">Save</Button>
                    </Box>
               </Box>

               {/* Company Name */}
               <Box >
                    <Typography variant="h6" gutterBottom>
                         Company Name
                    </Typography>
                    {/* <TextField
                         fullWidth
                         value={companyName}
                         onChange={(e) => setCompanyName(e.target.value)}
                    /> */}
                    <Typography variant="caption" color="text.secondary">
                         Max 64 characters.
                    </Typography>
                    <Box my={2}>
                         <Button variant="contained">Save</Button>
                    </Box>
               </Box>

               <Divider sx={{ my: 3 }} />

               {/* Invoice Purchase Order */}
               <Box >
                    <Typography variant="h6" gutterBottom>
                         Invoice Purchase Order
                    </Typography>
                    {/* <TextField
                         fullWidth
                         value={purchaseOrder}
                         onChange={(e) => setPurchaseOrder(e.target.value)}
                    /> */}
                    <Typography variant="caption" color="text.secondary">
                         Max 64 characters.
                    </Typography>
                    <Box my={2}>
                         <Button variant="contained">Save</Button>
                    </Box>
               </Box>

               {/* Tax ID */}
               <Box >
                    <Typography variant="h6" gutterBottom>
                         Tax ID
                    </Typography>
                    {/* <TextField
                         fullWidth
                         placeholder="EU VAT number"
                         value={taxId}
                         onChange={(e) => setTaxId(e.target.value)}
                    /> */}
                    <Typography variant="caption" color="text.secondary">
                         Countries that do not use Tax IDs can leave this blank.
                    </Typography>
                    <Box my={2}>
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
