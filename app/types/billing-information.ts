export type ClientBillingInformation = {
     id?: string | null;
     created_at?: number | null;
     updated_at?: number | null;
     client_id: string;
     default_payment_method: boolean;
     payment_method_id: string;
     billing_status_id: string;
     contact_person: string;
     billing_address: string;
     email_receipt?: string;
     company_name?: string;
     // card details
     card_number?: string | null;
     cvc?: string;
     expiration_date?: string;
     // cash payment
     cash_amount?: number;
};

export const clientBillingInformationInitialValues: ClientBillingInformation = {
     id: null,
     created_at: null,
     updated_at: null,
     client_id: '',
     default_payment_method: false,
     payment_method_id: '',
     billing_status_id: '',
     contact_person: '',
     billing_address: '',
     card_number: '',
     cvc: '',
     expiration_date: new Date().toLocaleDateString('en-GB', {
          month: '2-digit',
          year: '2-digit'
     }).replace('/', '/'), // 👉 preformatted MM/YY
     cash_amount: 0,
};
