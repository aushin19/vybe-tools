/**
 * Utility functions for formatting values
 */

// Helper to convert raw amount (in paise/cents) to display format
export const formatPrice = (amount?: number, currency = 'INR'): string => {
  if (amount === undefined) return currency === 'INR' ? '₹0' : '$0';
  
  const amountInStandardUnit = amount / 100;
  const formatter = new Intl.NumberFormat(
    currency === 'INR' ? 'en-IN' : 'en-US', 
    { 
      style: 'currency', 
      currency: currency,
      maximumFractionDigits: 0
    }
  );
  
  return formatter.format(amountInStandardUnit);
}; 