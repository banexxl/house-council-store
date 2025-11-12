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
     TablePagination,
} from "@mui/material"
import DownloadIcon from "@mui/icons-material/Download"
import { ClientBillingInformation } from "@/app/types/billing-information"
import { Payment } from "@/app/types/payment"
import { useState } from "react"
import { Client } from "@/app/types/client"
import { User } from "@supabase/supabase-js"
import toast from "react-hot-toast"
import { Currency } from "@/app/types/currency"
import { ClientSubscription, SubscriptionPlan } from "@/app/types/subscription-plan"
import { generateInvoiceString } from "@/app/lib/invoice-num-creator"
import theme from "@/app/theme"
import { makePaymentAction } from "../../client-payment-actions"

interface PaymentsTabProps {
     clientPayments: Payment[],
     userData: { client: Client; session: User },
     clientSubscriptionObject: ClientSubscription & { subscription_plan: SubscriptionPlan } | null,
     allClientBillingInformation: ClientBillingInformation[]
     currencies: Currency[]
}

export default function PaymentsTab({ clientPayments, userData, clientSubscriptionObject, allClientBillingInformation, currencies }: PaymentsTabProps) {

     const [open, setOpen] = useState(false)
     const [paymentLoading, setPaymentLoading] = useState(false)
     const [amount, setAmount] = useState("")
     const currency = currencies.find(currency => currency.code === "USD")
     const handleOpen = () => setOpen(true)
     const [page, setPage] = useState(0)
     const [rowsPerPage, setRowsPerPage] = useState(5)

     const handleClose = () => {
          setAmount("")
          setOpen(false)
     }

     const handleChangePage = (_event: unknown, newPage: number) => {
          setPage(newPage)
     }

     const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
          setRowsPerPage(parseInt(event.target.value, 10))
          setPage(0)
     }

     const handleAddPayment = async (amount: number) => {

          setPaymentLoading(true)
          if (!amount) return

          const newPayment: Payment = {
               created_at: new Date().toISOString(),
               total_paid: amount,
               status: "succeeded",
               updated_at: new Date().toISOString(),
               invoice_number: generateInvoiceString(),
               subscription_plan: clientSubscriptionObject?.subscription_plan_id!,
               client: userData.client.id,
               billing_information: allClientBillingInformation.find(billingInfo => billingInfo.default_payment_method)?.id || "",
               currency: currencies.find(currency => currency.code === "USD")?.id || "",
               refunded_at: null,
               is_recurring: false,
               tax_percentage: 18
          }

          if (!newPayment.billing_information) {
               toast.error("Please set a default payment method in your billing information before making a payment.")
               setPaymentLoading(false)
               setOpen(false)
               return
          }

          const { success, error } = await makePaymentAction(newPayment)

          if (success) {
               toast.success("Payment added successfully!");
          } else {
               // Display specific error messages based on the error type
               if (error?.includes('No subscription found')) {
                    toast.error("No active subscription found. Please contact support.");
               } else if (error?.includes('Subscription is canceled')) {
                    toast.error("Cannot make payment on a canceled subscription. Please reactivate your subscription.");
               } else if (error?.includes('Subscription is paused')) {
                    toast.error("Cannot make payment on a paused subscription. Please resume your subscription first.");
               } else if (error?.includes('Subscription is expired')) {
                    toast.error("Cannot make payment on an expired subscription. Please renew your subscription.");
               } else if (error?.includes('does not match the subscription price')) {
                    // Extract the expected amount from the error message
                    const amountMatch = error.match(/subscription price (\d+(?:\.\d+)?)/);
                    const expectedAmount = amountMatch ? amountMatch[1] : 'the correct amount';
                    toast.error(`Payment amount is incorrect. Please pay exactly ${currency?.code} ${expectedAmount}.`);
               } else if (error?.includes('already made a payment for this billing period')) {
                    toast.error("You have already paid for this billing period. Only one payment per billing cycle is allowed.");
               } else if (error?.includes('Payment is too early')) {
                    // Extract the date from the error message
                    const dateMatch = error.match(/starting (.+?)\./);
                    const allowedDate = dateMatch ? dateMatch[1] : 'soon';
                    toast.error(`Payment is too early. You can make your next payment starting ${allowedDate}.`);
               } else if (error?.includes('already has a paid invoice')) {
                    toast.error("This billing period has already been paid. Your next payment will be due in the next cycle.");
               } else if (error?.includes('payment is not allowed')) {
                    toast.error("Payment is not allowed for the current subscription status. Please contact support.");
               } else {
                    toast.error(`Error adding payment: ${error || 'Unknown error occurred'}`);
               }
          }
          setPaymentLoading(false)
          handleClose()
     }

     const getPaymentStatusColor = (status: string) => {
          switch (status.toLowerCase()) {
               case "processing":
                    return theme.palette.primary.main
               case "pending":
                    return theme.palette.warning.main
               case "succeeded":
                    return theme.palette.success.main
               case "failed":
                    return theme.palette.error.main
               case "chargeback":
                    return theme.palette.error.main
               case "refunded":
                    return theme.palette.error.main
               case "cancelled":
                    return theme.palette.error.main
               case "disputed":
                    return theme.palette.error.main
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
                                   <TableCell align="right">Actions</TableCell>
                              </TableRow>
                         </TableHead>
                         <TableBody>
                              {clientPayments && clientPayments.length > 0
                                   ? clientPayments.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((payment: Payment) => (
                                        <TableRow key={payment.id}>
                                             <TableCell>{payment.invoice_number}</TableCell>
                                             <TableCell>
                                                  {new Intl.DateTimeFormat("en-US", {
                                                       year: "numeric",
                                                       month: "2-digit",
                                                       day: "2-digit",
                                                       hour: "2-digit",
                                                       minute: "2-digit",
                                                       second: "2-digit",
                                                  }).format(new Date(payment.created_at))}
                                             </TableCell>
                                             <TableCell>{currency && currency.code} {payment.total_paid}</TableCell>
                                             <TableCell>
                                                  <Chip label={payment.status} sx={{ backgroundColor: getPaymentStatusColor(payment.status), color: theme.palette.common.white }} size="small" />
                                             </TableCell>
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
                    <TablePagination
                         component="div"
                         count={clientPayments.length}
                         page={page}
                         onPageChange={handleChangePage}
                         rowsPerPage={rowsPerPage}
                         onRowsPerPageChange={handleChangeRowsPerPage}
                         rowsPerPageOptions={[5, 10, 25]}
                    />
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
                         Showing {Math.min((page + 1) * rowsPerPage, clientPayments.length)} of {clientPayments.length} payments
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
                         <Button
                              variant="contained"
                              onClick={() => handleAddPayment(Number(amount))}
                              loading={paymentLoading}
                         >
                              Add
                         </Button>
                    </DialogActions>
               </Dialog>
          </>
     )
}

