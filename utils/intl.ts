const intlNumberFormat = new Intl.NumberFormat('en-US');

export const getReadableNumber = (number: number) => {
  return intlNumberFormat.format(number);
};
