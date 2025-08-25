import React, { ChangeEvent, useEffect, useRef, useState } from 'react';
import {
     Dialog, DialogTitle, DialogContent, DialogActions,
     Button, TextField, FormControlLabel, Checkbox,
     InputAdornment, Box, Typography
} from '@mui/material';
import SecurityIcon from '@mui/icons-material/Security';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { createOrUpdateClientBillingInformation } from '../client-billing-information-actions';
import HelpIcon from '@mui/icons-material/Help';
import { Client } from '@/app/types/client';
import { User } from '@supabase/supabase-js';
import toast from 'react-hot-toast';
import { parseExpirationDate } from '@/app/lib/date-helpers';
import { luhnCheck } from '@/app/lib/card-validator';
import { BinLookupResult } from '@/app/types/bin-lookup';
import { ClientBillingInformation, clientBillingInformationInitialValues } from '@/app/types/billing-information';
import AddressAutocomplete, { AddressAutocompleteRef } from './address-autocomplete';
import { transliterateCyrillicToLatin } from '@/app/lib/transliterate';

type AddCardModalProps = {
     open: boolean;
     onClose: () => void;
     userData: { client: Client; session: User; }
     binCheckerAPIKey?: string;
     clientBillingInfo?: ClientBillingInformation | null;
     allClientBillingInformation: ClientBillingInformation[];
};

export const AddCardModal: React.FC<AddCardModalProps> = ({ open, onClose, userData, binCheckerAPIKey, clientBillingInfo, allClientBillingInformation }) => {

     const [isValidCardNumber, setIsValidCardNumber] = useState(false);
     const [binData, setBinData] = useState<BinLookupResult | null>(null);
     const [cardScheme, setCardScheme] = useState<string>('');
     const autoCompleteRef = useRef<AddressAutocompleteRef>(null);

     // Prefill form values if editing
     const getInitialValues = () => {
          if (clientBillingInfo) {
               return {
                    ...clientBillingInformationInitialValues,
                    ...clientBillingInfo,
               };
          }
          return clientBillingInformationInitialValues;
     };

     useEffect(() => {
          if (clientBillingInfo) {
               // Set card scheme if editing
               if (clientBillingInfo.card_number) {
                    const plainCardNumber = clientBillingInfo.card_number.replace(/\s/g, '');
                    if (plainCardNumber.length >= 6) {
                         // Optionally, trigger BIN lookup for editing
                         (async () => {
                              try {
                                   const response = await fetch(
                                        `https://api.apilayer.com/bincheck/${plainCardNumber.slice(0, 8)}`,
                                        {
                                             method: 'GET',
                                             headers: {
                                                  'Content-Type': 'application/json',
                                                  'apikey': binCheckerAPIKey || ''
                                             },
                                             redirect: 'follow'
                                        }
                                   );
                                   if (response.ok) {
                                        const data: BinLookupResult = await response.json();
                                        setBinData(data);
                                        setCardScheme(data.scheme?.toLowerCase() || '');
                                   }
                              } catch { }
                         })();
                    }
               }
          }
     }, [clientBillingInfo, binCheckerAPIKey]);

     const handleCardNumberChange = async (e: ChangeEvent<HTMLInputElement>) => {
          const formattedValue = e.target.value
               .replace(/[^\d]/g, '')
               .replace(/(\d{4})(?=\d)/g, '$1 ')
               .trim();

          formik.setFieldValue('card_number', formattedValue);

          const plainCardNumber = formattedValue.replace(/\s/g, '');

          // Check Luhn validity for full card number
          if (plainCardNumber.length >= 13) {
               setIsValidCardNumber(luhnCheck(plainCardNumber));
          } else {
               setIsValidCardNumber(false);
          }

          // Reset everything if card number becomes too short
          if (plainCardNumber.length < 6) {
               setBinData(null);
               setCardScheme('');
               return;
          }

          // BIN lookup when at least 6 digits
          if (!binData || (binData && !plainCardNumber.startsWith(binData.bin))) {
               try {
                    const response = await fetch(
                         `https://api.apilayer.com/bincheck/${plainCardNumber.slice(0, 8)}`,
                         {
                              method: 'GET',
                              headers: {
                                   'Content-Type': 'application/json',
                                   'apikey': binCheckerAPIKey || ''
                              },
                              redirect: 'follow'
                         }
                    );

                    if (response.ok) {
                         const data: BinLookupResult = await response.json();
                         setBinData(data);
                         setCardScheme(data.scheme?.toLowerCase() || '');
                    } else {
                         setBinData(null);
                         setCardScheme('');
                         console.error('Failed to lookup BIN info');
                    }
               } catch (error) {
                    setBinData(null);
                    setCardScheme('');
                    console.error('Error during BIN lookup:', error);
               }
          }
     };

     const formik = useFormik({
          enableReinitialize: true,
          initialValues: getInitialValues(),
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
               contact_person: Yup.string().required('Full name is required'),
               billing_address: Yup.string().required('Address is required'),
          }),
          onSubmit: async (values) => {
               formik.resetForm();
               if (allClientBillingInformation && allClientBillingInformation.length > 0) {
                    values.default_payment_method = true;
               }
               const {
                    createOrUpdateClientBillingInformationSuccess,
                    createOrUpdateClientBillingInformationError,
                    createOrUpdateClientBillingInformationData,
               } = await createOrUpdateClientBillingInformation(
                    {
                         ...values,
                         client_id: userData.client.id,
                         payment_method: 'credit_card',
                    }
               )

               if (createOrUpdateClientBillingInformationSuccess) {
                    toast.success(clientBillingInfo ? 'Card updated successfully!' : 'Card added successfully!');
               } else {
                    const errorMessage = createOrUpdateClientBillingInformationError?.message || '';

                    if (errorMessage.toLowerCase().includes('duplicate key')) {
                         toast.error('This card already exists in your billing information.');
                    } else {
                         toast.error(`Error adding card: ${errorMessage}`);
                    }
               }
               onClose();
          }
     });

     return (
          <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
               <DialogTitle>{clientBillingInfo ? 'Modify Card' : 'Add a Card'}</DialogTitle>
               <DialogContent dividers>
                    <Typography gutterBottom>
                         {clientBillingInfo
                              ? 'Modify your credit card details below. Please ensure your CVC and postal codes match what is on file for your card.'
                              : 'Add your credit card details below. Please ensure your CVC and postal codes match what is on file for your card.'}
                    </Typography>

                    <form onSubmit={formik.handleSubmit}>
                         <TextField
                              name="card_number"
                              label="Card number"
                              placeholder="1234 1234 1234 1234"
                              fullWidth
                              margin="normal"
                              value={formik.values.card_number}
                              onChange={handleCardNumberChange}
                              onBlur={formik.handleBlur}
                              error={formik.touched.card_number && (!isValidCardNumber || Boolean(formik.errors.card_number))}
                              helperText={
                                   formik.touched.card_number &&
                                   (!isValidCardNumber ? 'Invalid card number' : formik.errors.card_number)
                              }
                              slotProps={{
                                   input: {
                                        endAdornment: (
                                             <InputAdornment position="end">
                                                  {cardScheme === 'visa' && (
                                                       <img
                                                            src="https://img.icons8.com/color/24/000000/visa.png"
                                                            alt="Visa"
                                                            style={{ marginRight: 4 }}
                                                       />
                                                  )}
                                                  {cardScheme === 'mastercard' && (
                                                       <img
                                                            src="https://img.icons8.com/color/24/000000/mastercard-logo.png"
                                                            alt="MasterCard"
                                                            style={{ marginRight: 4 }}
                                                       />
                                                  )}
                                                  {cardScheme === 'amex' && (
                                                       <img
                                                            src="https://img.icons8.com/color/24/000000/amex.png"
                                                            alt="Amex"
                                                       />
                                                  )}
                                                  {cardScheme === 'discover' && (
                                                       <img
                                                            src="https://img.icons8.com/color/24/000000/discover.png"
                                                            alt="Discover"
                                                       />
                                                  )}
                                                  {cardScheme === 'diners-club' && (
                                                       <img
                                                            src="https://img.icons8.com/color/24/000000/diners-club.png"
                                                            alt="Diners Club"
                                                       />
                                                  )}
                                                  {cardScheme === 'jcb' && (
                                                       <img
                                                            src="https://img.icons8.com/color/24/000000/jcb.png"
                                                            alt="JCB"
                                                       />
                                                  )}
                                                  {cardScheme === 'unionpay' && (
                                                       <img
                                                            src="https://img.icons8.com/color/24/000000/unionpay.png"
                                                            alt="UnionPay"
                                                       />
                                                  )}
                                                  {cardScheme === 'maestro' && (
                                                       <img
                                                            src="https://img.icons8.com/color/24/000000/maestro.png"
                                                            alt="Maestro"
                                                       />
                                                  )}
                                                  {cardScheme === 'mir' && (
                                                       <img
                                                            src="https://img.icons8.com/color/24/000000/mir.png"
                                                            alt="Mir"
                                                       />
                                                  )}
                                                  {cardScheme === 'rupay' && (
                                                       <img
                                                            src="https://img.icons8.com/color/24/000000/rupay.png"
                                                            alt="RuPay"
                                                       />
                                                  )}
                                                  {cardScheme === 'interac' && (
                                                       <img
                                                            src="https://img.icons8.com/color/24/000000/interac.png"
                                                            alt="Interac"
                                                       />
                                                  )}
                                                  {cardScheme === '' && (
                                                       <HelpIcon style={{ backgroundColor: 'primary' }} titleAccess="Card type not recognized" />
                                                  )}
                                             </InputAdornment>
                                        )
                                   },
                                   htmlInput: {
                                        maxLength: 19
                                   }
                              }}
                         />
                         <Box mt={1}>
                              <Typography variant="body2">
                                   🏦 Bank: {binData ? (binData.bank_name || 'Unknown') : '...'}
                              </Typography>
                              <Typography variant="body2">
                                   🌍 Country: {binData ? (binData.country || 'Unknown') : '...'}
                              </Typography>
                         </Box>

                         <Box display="flex" gap={2}>
                              <TextField
                                   name="expiration_date"
                                   label="Expiration date"
                                   placeholder="MM/YY"
                                   fullWidth
                                   margin="normal"
                                   value={formik.values.expiration_date}
                                   onChange={(e) => {
                                        let value = e.target.value.replace(/[^\d]/g, '');

                                        // If typing 1 digit only
                                        if (value.length === 1 && parseInt(value) > 1) {
                                             value = '0' + value; // e.g. user types "5" ➔ becomes "05"
                                        }

                                        if (value.length > 2) {
                                             value = value.slice(0, 2) + '/' + value.slice(2, 4);
                                        }

                                        if (value.length > 5) {
                                             value = value.slice(0, 5); // Prevent extra typing
                                        }

                                        formik.setFieldValue('expiration_date', value);
                                   }}
                                   onBlur={formik.handleBlur}
                                   error={formik.touched.expiration_date && Boolean(formik.errors.expiration_date)}
                                   helperText={
                                        formik.touched.expiration_date && typeof formik.errors.expiration_date === 'string'
                                             ? formik.errors.expiration_date
                                             : ''
                                   }
                                   slotProps={{
                                        htmlInput: {
                                             maxLength: 5
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
                              name="contact_person"
                              label="Full name"
                              fullWidth
                              margin="normal"
                              value={formik.values.contact_person}
                              onChange={formik.handleChange}
                              onBlur={formik.handleBlur}
                              error={formik.touched.contact_person && Boolean(formik.errors.contact_person)}
                              helperText={formik.touched.contact_person && formik.errors.contact_person}
                              sx={{ my: 2 }}
                         />

                         <AddressAutocomplete
                              onAddressSelected={(value => formik.setFieldValue('billing_address', transliterateCyrillicToLatin(value.place_name)))}
                              label={"Billing address"}
                              ref={autoCompleteRef}
                              initialValue={formik.values.billing_address}
                         />

                         {/* <TextField
                              name="billing_address"
                              label="Address"
                              fullWidth
                              margin="normal"
                              value={formik.values.billing_address}
                              onChange={formik.handleChange}
                              onBlur={formik.handleBlur}
                              error={formik.touched.billing_address && Boolean(formik.errors.billing_address)}
                              helperText={formik.touched.billing_address && formik.errors.billing_address}
                         /> */}

                         {/* <FormControlLabel
                              control={
                                   <Checkbox
                                        name="default_payment_method"
                                        checked={formik.values.default_payment_method}
                                        onChange={formik.handleChange}
                                   />
                              }
                              label="Set as default payment method"
                         /> */}

                         <DialogActions sx={{ mt: 2 }}>
                              <Button onClick={onClose}>Cancel</Button>
                              <Button
                                   type="submit"
                                   variant="contained"
                                   loading={formik.isSubmitting}
                                   disabled={!formik.isValid || !formik.dirty || !luhnCheck(formik.values.card_number!.replace(/\s/g, ''))}
                              >
                                   {clientBillingInfo ? 'Update Card' : 'Add Card'}
                              </Button>
                         </DialogActions>
                    </form>
               </DialogContent>
          </Dialog>
     );
};
