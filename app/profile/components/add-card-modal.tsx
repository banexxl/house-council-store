import React from 'react';
import {
     Dialog, DialogTitle, DialogContent, DialogActions,
     Button, TextField, FormControlLabel, Checkbox,
     InputAdornment, Box, Typography
} from '@mui/material';
import SecurityIcon from '@mui/icons-material/Security';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { CountryAutocomplete } from './countries-autocomplete';
import { createOrUpdateClientBillingInformation } from '../client-billing-information-actions';
import { Client } from '@/app/types/client';
import { User } from '@supabase/supabase-js';
import toast from 'react-hot-toast';

type AddCardModalProps = {
     open: boolean;
     onClose: () => void;
     userData: { client: Client; session: User; }
};

export const AddCardModal: React.FC<AddCardModalProps> = ({ open, onClose, userData }) => {

     const parseExpirationDate = (value: string) => {
          const [monthStr, yearStr] = value.split('/');
          if (!monthStr || !yearStr) return null;

          const month = parseInt(monthStr, 10) - 1; // JS months are 0-based
          const year = parseInt('20' + yearStr, 10); // assume 20XX

          if (isNaN(month) || isNaN(year)) return null;

          return new Date(year, month);
     };

     const formik = useFormik({
          initialValues: {
               card_number: '',
               expiration_date: new Date(),
               cvc: 0,
               full_name: '',
               country: '',
               billing_address: '',
               default_payment_method: false,
          },
          validationSchema: Yup.object({
               card_number: Yup.string().required('Card number is required'),
               expiration_date: Yup.string()
                    .required('Expiration date is required')
                    .matches(/^(0[1-9]|1[0-2])\/\d{2}$/, 'Invalid format, must be MM/YY')
                    .test('expirationDateNotPast', 'Expiration date cannot be in the past', (value) => {
                         if (!value) return false;

                         const expDate = parseExpirationDate(value);
                         if (!expDate) return false;

                         const now = new Date();
                         // Set day to 1 for comparison (ignore days)
                         const current = new Date(now.getFullYear(), now.getMonth(), 1);
                         const expiry = new Date(expDate.getFullYear(), expDate.getMonth(), 1);

                         return expiry >= current;
                    }),
               cvc: Yup.number().required('Security code is required'),
               full_name: Yup.string().required('Full name is required'),
               country: Yup.string().required('Country is required'),
               billing_address: Yup.string().required('Address is required'),
          }),
          onSubmit: async (values) => {
               const {
                    createOrUpdateClientBillingInformationSuccess,
                    createOrUpdateClientBillingInformationError,
                    createOrUpdateClientBillingInformationData,

               } = await createOrUpdateClientBillingInformation(
                    {
                         ...values,
                         client_id: userData.client.id,
                         payment_method_id: 'f3089f92-a241-4542-b0e4-cbc98f8a9c6e',
                         billing_status_id: '71f8c548-ba1c-44b6-a6cc-5cf079f4fb1e',
                    }
               )

               if (createOrUpdateClientBillingInformationSuccess) {
                    toast.success('Card added successfully!');
               } else {
                    toast.error(`Error adding card: ${createOrUpdateClientBillingInformationError.message}`);
               }
               onClose();
          }
     });

     return (
          <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
               <DialogTitle>Add a Card</DialogTitle>
               <DialogContent dividers>
                    <Typography gutterBottom>
                         Add your credit card details below.
                         Please ensure your CVC and postal codes match what is on file for your card.
                    </Typography>

                    <form onSubmit={formik.handleSubmit}>
                         <TextField
                              name="card_number"
                              label="Card number"
                              placeholder="1234 1234 1234 1234"
                              fullWidth
                              margin="normal"
                              value={formik.values.card_number}
                              onChange={(e) => {
                                   const formattedValue = e.target.value.replace(/[^\d]/g, '').replace(/(\d{4})/g, '$1 ').trim();
                                   formik.setFieldValue('card_number', formattedValue);
                              }}
                              onBlur={formik.handleBlur}
                              error={formik.touched.card_number && Boolean(formik.errors.card_number)}
                              helperText={formik.touched.card_number && formik.errors.card_number}
                              slotProps={{
                                   input: {
                                        endAdornment: (
                                             <InputAdornment position="end">
                                                  <img src="https://img.icons8.com/color/24/000000/visa.png" alt="Visa" style={{ marginRight: 4 }} />
                                                  <img src="https://img.icons8.com/color/24/000000/mastercard-logo.png" alt="MasterCard" style={{ marginRight: 4 }} />
                                                  <img src="https://img.icons8.com/color/24/000000/amex.png" alt="Amex" />
                                             </InputAdornment>
                                        )
                                   },
                                   htmlInput: {
                                        maxLength: 19
                                   }
                              }}
                         />

                         <Box display="flex" gap={2}>
                              <TextField
                                   name="expiration_date"
                                   label="Expiration date"
                                   placeholder="MM/YY"
                                   fullWidth
                                   margin="normal"
                                   value={
                                        formik.values.expiration_date
                                             ? typeof formik.values.expiration_date === 'string'
                                                  ? formik.values.expiration_date
                                                  : new Date(formik.values.expiration_date).toLocaleDateString('en-GB', {
                                                       month: '2-digit',
                                                       year: '2-digit',
                                                  }).replace('/', '/')
                                             : ''
                                   }
                                   onChange={(e) => {
                                        const formattedValue = e.target.value
                                             .replace(/[^0-9]/g, '')    // remove non-numbers
                                             .replace(/(\d{2})(\d{1,2})/, '$1/$2'); // format MM/YY
                                        formik.setFieldValue('expiration_date', formattedValue);
                                   }}
                                   onBlur={formik.handleBlur}
                                   error={formik.touched.expiration_date && Boolean(formik.errors.expiration_date)}
                                   helperText={formik.touched.expiration_date && typeof formik.errors.expiration_date === 'string' ? formik.errors.expiration_date : ''}
                                   slotProps={{
                                        htmlInput: {
                                             maxLength: 5,
                                        }
                                   }}
                              />

                              <TextField
                                   name="cvc"
                                   label="Security code"
                                   placeholder="CVC"
                                   fullWidth
                                   margin="normal"
                                   value={formik.values.cvc}
                                   onChange={(e) => {
                                        const formattedValue = e.target.value.replace(/[^0-9]/g, '').slice(0, 3);
                                        formik.setFieldValue('cvc', formattedValue);
                                   }}
                                   onBlur={formik.handleBlur}
                                   error={formik.touched.cvc && Boolean(formik.errors.cvc)}
                                   helperText={formik.touched.cvc && formik.errors.cvc}
                                   slotProps={{
                                        input: {
                                             endAdornment: (
                                                  <InputAdornment position="end">
                                                       <SecurityIcon />
                                                  </InputAdornment>
                                             )
                                        }
                                   }}
                              />
                         </Box>

                         <Typography variant="caption" color="textSecondary" mt={1}>
                              By providing your card information, you allow Vercel Inc. to charge your card
                              for future payments in accordance with their terms.
                         </Typography>

                         <TextField
                              name="full_name"
                              label="Full name"
                              fullWidth
                              margin="normal"
                              value={formik.values.full_name}
                              onChange={formik.handleChange}
                              onBlur={formik.handleBlur}
                              error={formik.touched.full_name && Boolean(formik.errors.full_name)}
                              helperText={formik.touched.full_name && formik.errors.full_name}
                         />

                         <CountryAutocomplete value={formik.values.country}
                              onChange={(value) => formik.setFieldValue('country', value)}
                         />

                         <TextField
                              name="billing_address"
                              label="Address"
                              fullWidth
                              margin="normal"
                              value={formik.values.billing_address}
                              onChange={formik.handleChange}
                              onBlur={formik.handleBlur}
                              error={formik.touched.billing_address && Boolean(formik.errors.billing_address)}
                              helperText={formik.touched.billing_address && formik.errors.billing_address}
                         />

                         <FormControlLabel
                              control={
                                   <Checkbox
                                        name="default_payment_method"
                                        checked={formik.values.default_payment_method}
                                        onChange={formik.handleChange}
                                   />
                              }
                              label="Set as default payment method"
                         />

                         <DialogActions sx={{ mt: 2 }}>
                              <Button onClick={onClose}>Cancel</Button>
                              <Button type="submit" variant="contained" loading={formik.isSubmitting}>
                                   Add Card
                              </Button>
                         </DialogActions>
                    </form>
               </DialogContent>
          </Dialog>
     );
};
