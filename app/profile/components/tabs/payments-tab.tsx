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
     Dialog,
     DialogTitle,
     DialogContent,
     TextField,
     DialogActions,
} from "@mui/material"
import DownloadIcon from "@mui/icons-material/Download"
import { ClientBillingInformation } from "@/app/types/billing-information"
import { Payment } from "@/app/types/payment"
import { useState } from "react"
import { makePaymentAction } from "../../payment-actions"
import { Client } from "@/app/types/client"
import { User } from "@supabase/supabase-js"
import toast from "react-hot-toast"
import { Currency } from "@/app/types/currency"
import { ClientSubscription, SubscriptionPlan } from "@/app/types/subscription-plan"
import { generateInvoiceString } from "@/app/lib/invoice-num-creator"

interface PaymentsTabProps {
     clientPayments: Payment[],
     userData: { client: Client; session: User },
     clientSubscriptionObject: ClientSubscription & { subscription_plan: SubscriptionPlan } | null,
     allClientBillingInformation: ClientBillingInformation[]
     currencies: Currency[]
}


export default function PaymentsTab({ clientPayments, userData, clientSubscriptionObject, allClientBillingInformation, currencies }: PaymentsTabProps) {

     const [open, setOpen] = useState(false)
     const [amount, setAmount] = useState("")

     const handleOpen = () => setOpen(true)

     const handleClose = () => {
          setAmount("")
          setOpen(false)
     }

     const handleAddPayment = async (amount: number) => {

          if (!amount) return

          const newPayment: Payment = {
               created_at: new Date().toISOString(),
               total_paid: amount,
               status: "succeeded",
               updated_at: new Date().toISOString(),
               total_cost: clientSubscriptionObject?.subscription_plan?.total_price || 0,
               invoice_number: generateInvoiceString(),
               subscription_plan: clientSubscriptionObject?.subscription_plan_id!,
               client: userData.client.id,
               billing_information: allClientBillingInformation.find(info => info.default_payment_method)?.id || "",
               currency: currencies.find(currency => currency.code === "USD")?.id || "",
               refunded_at: null,
               is_recurring: false
          }
          console.log('newPayment', newPayment);


          const { success, error } = await makePaymentAction(newPayment)

          if (success) {
               toast.success("Payment added successfully!");
          } else {
               toast.error(`Error adding payment: ${error}`);
          }
          handleClose()
     }

     const getPaymentStatusColor = (status: string) => {
          switch (status.toLowerCase()) {
               case "succeeded":
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
                              {clientPayments && clientPayments.length > 0
                                   ? clientPayments.map((payment: Payment) => (
                                        <TableRow key={payment.id}>
                                             <TableCell>{payment.invoice_number}</TableCell>
                                             <TableCell>{payment.created_at}</TableCell>
                                             <TableCell>{payment.total_paid}</TableCell>
                                             <TableCell>
                                                  <Chip label={payment.status} color={getPaymentStatusColor(payment.status)} size="small" />
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
                    <Button
                         onClick={handleOpen}
                         variant="outlined"
                         disabled={!clientSubscriptionObject}
                    >
                         Make Payment
                    </Button>
                    <Typography variant="body2" color="text.secondary">
                         Showing 5 of 12 payments
                    </Typography>
               </Box>

               {/* Modal Dialog */}
               <Dialog open={open} onClose={handleClose}>
                    <DialogTitle>Add Payment</DialogTitle>
                    <DialogContent>
                         <TextField
                              fullWidth
                              label="Amount"
                              type="number"
                              value={amount}
                              onChange={(e) => setAmount(e.target.value)}
                              sx={{ mt: 1 }}
                         />
                    </DialogContent>
                    <DialogActions>
                         <Button onClick={handleClose}>Cancel</Button>
                         <Button variant="contained" onClick={() => handleAddPayment(Number(amount))}>Add</Button>
                    </DialogActions>
               </Dialog>
          </>
     )
}

