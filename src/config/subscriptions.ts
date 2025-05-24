import { PricingTier } from '@/types/subscription';

// Define the features available in different plans
export const FEATURE_LIST = {
  basicDashboard: 'Basic Dashboard Access',
  advancedDashboard: 'Advanced Dashboard Access',
  prioritySupport: 'Priority Support',
  customBranding: 'Custom Branding',
  apiAccess: 'API Access',
  teamMembers: 'Team Members',
  fileStorage: 'File Storage',
  unlimitedProjects: 'Unlimited Projects',
  advancedAnalytics: 'Advanced Analytics',
  customReports: 'Custom Reports',
  dedicatedManager: 'Dedicated Account Manager',
  bulkOperations: 'Bulk Operations',
};

// Feature explanations for tooltip
export const FEATURE_EXPLANATIONS = {
  basicDashboard: 'Access to the basic dashboard with key metrics and data visualization',
  advancedDashboard: 'Enhanced dashboard with advanced metrics, custom views, and detailed insights',
  prioritySupport: 'Get faster responses from our support team with priority ticket handling',
  customBranding: 'Remove Nox branding and add your own logo and colors',
  apiAccess: 'Access our API for custom integrations with your existing tools',
  teamMembers: 'Add team members to collaborate on your projects',
  fileStorage: 'Store and manage files directly in the platform',
  unlimitedProjects: 'Create and manage unlimited projects',
  advancedAnalytics: 'Get deeper insights with advanced analytics and reporting',
  customReports: 'Create and schedule custom reports for your specific needs',
  dedicatedManager: 'Get a dedicated account manager to help you maximize value',
  bulkOperations: 'Perform operations on multiple items simultaneously',
};

// Pricing tiers configuration
export const PRICING_TIERS: PricingTier[] = [
  {
    id: 'starter',
    name: 'Starter',
    description: 'Perfect for individuals and small projects',
    price: {
      weekly: 299,
      monthly: 999,
      yearly: 9999,
    },
    features: {
      basicDashboard: true,
      advancedDashboard: false,
      prioritySupport: false,
      customBranding: false,
      apiAccess: false,
      teamMembers: false,
      fileStorage: true,
      unlimitedProjects: false,
      advancedAnalytics: false,
      customReports: false,
      dedicatedManager: false,
      bulkOperations: false,
    },
  },
  {
    id: 'pro',
    name: 'Professional',
    description: 'Great for professionals and growing teams',
    price: {
      weekly: 799,
      monthly: 2499,
      yearly: 24999,
    },
    features: {
      basicDashboard: true,
      advancedDashboard: true,
      prioritySupport: true,
      customBranding: false,
      apiAccess: true,
      teamMembers: true,
      fileStorage: true,
      unlimitedProjects: true,
      advancedAnalytics: false,
      customReports: false,
      dedicatedManager: false,
      bulkOperations: true,
    },
    mostPopular: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'For large organizations with advanced needs',
    price: {
      weekly: 1999,
      monthly: 6999,
      yearly: 69999,
    },
    features: {
      basicDashboard: true,
      advancedDashboard: true,
      prioritySupport: true,
      customBranding: true,
      apiAccess: true,
      teamMembers: true,
      fileStorage: true,
      unlimitedProjects: true,
      advancedAnalytics: true,
      customReports: true,
      dedicatedManager: true,
      bulkOperations: true,
    },
    highlighted: true,
  },
];

// Helper to convert raw amount (in paise/cents) to display format
export const formatPrice = (amount: number | null | undefined, currency = 'INR'): string => {
  // Map currency codes to their symbols
  const currencySymbols: Record<string, string> = {
    'INR': '₹',
    'USD': '$',
    'EUR': '€',
    'GBP': '£',
    // Add more currencies as needed
  };

  if (amount === null || amount === undefined) {
    // Return a default price with the correct currency symbol
    const symbol = currencySymbols[currency] || currency;
    return `${symbol}0`;
  }
  
  const amountInMainUnit = amount / 100;
  
  // Get the symbol based on the currency code, default to the code itself if not found
  const symbol = currencySymbols[currency] || currency;
  
  // Format based on the currency
  if (currency === 'INR') {
    return `${symbol}${amountInMainUnit.toLocaleString('en-IN')}`;
  } else if (currency === 'USD') {
    // Ensure we display proper USD formatting with 2 decimal places
    // For USD, we want to show $99.00 format
    const formattedAmount = 
      amountInMainUnit % 1 === 0 
        ? `${Math.floor(amountInMainUnit)}` 
        : amountInMainUnit.toFixed(2);
    return `${symbol}${formattedAmount}`;
  } else {
    return `${symbol}${amountInMainUnit.toLocaleString('en-US')}`;
  }
};

// Get the savings percentage for yearly vs monthly plans
export const getYearlySavingsPercentage = (tier: PricingTier): number => {
  const monthlyCostForYear = tier.price.monthly * 12;
  const yearlyCost = tier.price.yearly;
  const savings = monthlyCostForYear - yearlyCost;
  const savingsPercentage = Math.round((savings / monthlyCostForYear) * 100);
  return savingsPercentage;
}; 