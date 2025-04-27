export function recognizeCardManufacturer(cardNumber: string): string {
     const cardNumberTrimmed = cardNumber.replace(/\s/g, '');
     if (cardNumberTrimmed.length < 2) {
          return '';
     }

     const firstDigit = cardNumberTrimmed[0];
     const firstTwoDigits = cardNumberTrimmed.slice(0, 2);

     if (firstDigit === '5' || firstTwoDigits === '51' || firstTwoDigits === '52' || firstTwoDigits === '53' || firstTwoDigits === '54' || firstTwoDigits === '55') {
          return 'Mastercard';
     }

     if (firstTwoDigits === '60' || firstTwoDigits === '64' || firstTwoDigits === '65') {
          return 'Discover';
     }

     if (firstTwoDigits === '34' || firstTwoDigits === '37') {
          return 'American Express';
     }

     if (firstTwoDigits === '35') {
          return 'JCB';
     }

     if (firstTwoDigits === '36' || firstTwoDigits === '38' || firstTwoDigits === '39') {
          return 'Diners Club';
     }

     if (firstDigit === '6' || firstTwoDigits === '62' || firstTwoDigits === '63' || firstTwoDigits === '66' || firstTwoDigits === '67' || firstTwoDigits === '68' || firstTwoDigits === '69') {
          return 'Maestro';
     }

     if (firstTwoDigits === '51' || firstTwoDigits === '52' || firstTwoDigits === '53' || firstTwoDigits === '54' || firstTwoDigits === '55') {
          return 'Mastercard';
     }

     if (firstDigit === '2' || firstTwoDigits === '22') {
          return 'Mir';
     }

     if (firstTwoDigits === '30' || firstTwoDigits === '36' || firstTwoDigits === '38' || firstTwoDigits === '39') {
          return 'Diners Club';
     }

     if (firstTwoDigits === '44' || firstTwoDigits === '45' || firstTwoDigits === '46' || firstTwoDigits === '47' || firstTwoDigits === '48' || firstTwoDigits === '49') {
          return 'VISA';
     }

     return 'Unknown';
}
