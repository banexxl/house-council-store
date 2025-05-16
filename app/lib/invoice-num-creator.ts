export const generateInvoiceString = (): string => {
     const today = new Date();
     const yyyy = today.getFullYear();
     const mm = String(today.getMonth() + 1).padStart(2, '0');
     const dd = String(today.getDate()).padStart(2, '0');
     const dateStr = `${yyyy}${mm}${dd}`;

     const randomFourDigit = Math.floor(1000 + Math.random() * 9000); // Ensures 4 digits

     return `NLA-${dateStr}-${randomFourDigit}`;
}
