import React, { useState } from 'react';
import {
     Dialog, DialogTitle, DialogContent, DialogActions,
     Button, TextField, FormControlLabel, Checkbox,
     InputAdornment, MenuItem, Box, Typography
} from '@mui/material';
import SecurityIcon from '@mui/icons-material/Security';

const countries = ['United States', 'Serbia', 'Germany', 'France']; // You can extend this

type AddCardModalProps = {
     open: boolean;
     onClose: () => void;
     onSubmit: (formData: {
          cardNumber: string;
          expirationDate: string;
          securityCode: string;
          fullName: string;
          country: string;
          address: string;
          isDefault: boolean;
          useAsTeamAddress: boolean;
     }) => void;
};

export const AddCardModal: React.FC<AddCardModalProps> = ({
     open,
     onClose,
     onSubmit,
}) => {
     const [cardNumber, setCardNumber] = useState('');
     const [expirationDate, setExpirationDate] = useState('');
     const [securityCode, setSecurityCode] = useState('');
     const [fullName, setFullName] = useState('Branislav');
     const [country, setCountry] = useState('United States');
     const [address, setAddress] = useState('');
     const [isDefault, setIsDefault] = useState(true);
     const [useAsTeamAddress, setUseAsTeamAddress] = useState(true);

     const handleSubmit = () => {
          onSubmit({
               cardNumber,
               expirationDate,
               securityCode,
               fullName,
               country,
               address,
               isDefault,
               useAsTeamAddress,
          });
     };

     return (
          <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
               <DialogTitle>Add a Card</DialogTitle>
               <DialogContent dividers>
                    <Typography gutterBottom>
                         Add your credit card details below for team <strong>Branislav</strong>.
                         Please ensure your CVC and postal codes match what is on file for your card.
                    </Typography>

                    <TextField
                         fullWidth
                         margin="normal"
                         label="Card number"
                         placeholder="1234 1234 1234 1234"
                         value={cardNumber}
                         onChange={(e) => setCardNumber(e.target.value)}
                         slotProps={{
                              input: {
                                   endAdornment: (
                                        <InputAdornment position="end">
                                             <img
                                                  src="https://img.icons8.com/color/24/000000/visa.png"
                                                  alt="Visa"
                                                  style={{ marginRight: 4 }}
                                             />
                                             <img
                                                  src="https://img.icons8.com/color/24/000000/mastercard-logo.png"
                                                  alt="MasterCard"
                                                  style={{ marginRight: 4 }}
                                             />
                                             <img
                                                  src="https://img.icons8.com/color/24/000000/amex.png"
                                                  alt="Amex"
                                             />
                                        </InputAdornment>
                                   ),
                              }
                         }}
                    />

                    <Box display="flex" gap={2}>
                         <TextField
                              label="Expiration date"
                              placeholder="MM / YY"
                              fullWidth
                              value={expirationDate}
                              onChange={(e) => setExpirationDate(e.target.value)}
                         />
                         <TextField
                              label="Security code"
                              placeholder="CVC"
                              fullWidth
                              value={securityCode}
                              onChange={(e) => setSecurityCode(e.target.value)}
                              slotProps={{
                                   input: {
                                        endAdornment: (
                                             <InputAdornment position="end">
                                                  <SecurityIcon />
                                             </InputAdornment>
                                        ),
                                   }
                              }}
                         />
                    </Box>

                    <Typography variant="caption" color="textSecondary" mt={1}>
                         By providing your card information, you allow Vercel Inc. to charge your card
                         for future payments in accordance with their terms.
                    </Typography>

                    <TextField
                         fullWidth
                         margin="normal"
                         label="Full name"
                         value={fullName}
                         onChange={(e) => setFullName(e.target.value)}
                    />
                    <TextField
                         fullWidth
                         margin="normal"
                         select
                         label="Country or region"
                         value={country}
                         onChange={(e) => setCountry(e.target.value)}
                    >
                         {countries.map((c) => (
                              <MenuItem key={c} value={c}>
                                   {c}
                              </MenuItem>
                         ))}
                    </TextField>

                    <TextField
                         fullWidth
                         margin="normal"
                         label="Address"
                         value={address}
                         onChange={(e) => setAddress(e.target.value)}
                    />

                    <FormControlLabel
                         control={
                              <Checkbox
                                   checked={isDefault}
                                   onChange={(e) => setIsDefault(e.target.checked)}
                              />
                         }
                         label="Set as default payment method"
                    />
                    <FormControlLabel
                         control={
                              <Checkbox
                                   checked={useAsTeamAddress}
                                   onChange={(e) => setUseAsTeamAddress(e.target.checked)}
                              />
                         }
                         label="Use the billing address as my team's primary address"
                    />
               </DialogContent>

               <DialogActions>
                    <Button onClick={onClose}>Cancel</Button>
                    <Button variant="contained" onClick={handleSubmit}>
                         Continue
                    </Button>
               </DialogActions>
          </Dialog>
     );
};
