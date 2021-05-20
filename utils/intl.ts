const intlNumberFormat = new Intl.NumberFormat('en-US');
const intlNumberCurrencyFormat = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

export const getReadableNumber = (number: number) => {
  return intlNumberFormat.format(number);
};

export const getReadableNumberAsCurrency = (number: number) => {
  return intlNumberCurrencyFormat.format(number);
};
