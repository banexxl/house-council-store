"use client"

import {
     Box,
     Button,
     Typography,
     TableContainer,
     Paper,
     Table,
     TableHead,
     TableRow,
     TableCell,
     TableBody,
     Chip,
} from "@mui/material"
import DownloadIcon from "@mui/icons-material/Download"
import { ClientBillingInformation } from "@/app/types/billing-information"

interface PaymentsTabProps {
     allClientBillingInformation: ClientBillingInformation[]
}

export default function PaymentsTab({ allClientBillingInformation }: PaymentsTabProps) {

     const getPaymentStatusColor = (status: string) => {
          switch (status.toLowerCase()) {
               case "paid":
                    return "success"
               case "pending":
                    return "warning"
               case "failed":
                    return "error"
               default:
                    return "default"
          }
     }

     return (
          <>
               <Typography variant="h5" gutterBottom>
                    Payment History
               </Typography>

               <TableContainer component={Paper} variant="outlined" sx={{ mb: 3 }}>
                    <Table>
                         <TableHead>
                              <TableRow>
                                   <TableCell>Invoice</TableCell>
                                   <TableCell>Date</TableCell>
                                   <TableCell>Amount</TableCell>
                                   <TableCell>Status</TableCell>
                                   <TableCell>Payment Method</TableCell>
                                   <TableCell align="right">Actions</TableCell>
                              </TableRow>
                         </TableHead>
                         <TableBody>
                              {allClientBillingInformation && allClientBillingInformation.length > 0
                                   ? allClientBillingInformation.map((payment) => (
                                        <TableRow key={payment.id}>
                                             <TableCell>{payment.id}</TableCell>
                                             <TableCell>{payment.expiration_date}</TableCell>
                                             <TableCell>{payment.cash_amount}</TableCell>
                                             <TableCell>
                                                  <Chip label={payment.billing_status_id} color={getPaymentStatusColor(payment.billing_status_id)} size="small" />
                                             </TableCell>
                                             <TableCell>{payment.id}</TableCell>
                                             <TableCell align="right">
                                                  <Button variant="text" size="small" startIcon={<DownloadIcon />}>
                                                       Receipt
                                                  </Button>
                                             </TableCell>
                                        </TableRow>
                                   ))
                                   :
                                   <TableRow>
                                        <TableCell colSpan={6}>No payments found.</TableCell>
                                   </TableRow>
                              }
                         </TableBody>
                    </Table>
               </TableContainer>

               <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Button variant="outlined">View All Invoices</Button>
                    <Typography variant="body2" color="text.secondary">
                         Showing 5 of 12 payments
                    </Typography>
               </Box>
          </>
     )
}

