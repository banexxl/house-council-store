export const parseExpirationDate = (value: string) => {
     const [monthStr, yearStr] = value.split('/');
     if (!monthStr || !yearStr) return null;

     const month = parseInt(monthStr, 10) - 1; // JS months are 0-based
     const year = parseInt('20' + yearStr, 10); // assume 20XX

     if (isNaN(month) || isNaN(year)) return null;

     return new Date(year, month);
};

export const formatExpirationDate = (expiration: string): string => {
     const [monthStr, yearStr] = expiration.split('/');

     const month = Number(monthStr);
     const year = Number(yearStr);

     if (!month || !year || month < 1 || month > 12) {
          return 'Invalid date';
     }

     const fullYear = 2000 + year; // assuming 20xx
     const date = new Date(fullYear, month - 1);

     // Always return a **string**, never a Date
     return date.toLocaleDateString('default', {
          month: 'short',
          year: 'numeric'
     });
}