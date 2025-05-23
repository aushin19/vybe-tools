/**
 * Subscription and payment related types
 */

export type SubscriptionInterval = 'weekly' | 'monthly' | 'yearly';

export type SubscriptionStatus = 'active' | 'past_due' | 'cancelled' | 'trialing';

export type SubscriptionPlan = {
  id: string;
  name: string;
  interval: SubscriptionInterval;
  price: number; // Amount in paise/cents (INR)
  price_usd?: number; // Amount in cents (USD)
  description: string;
  features: string[];
  active: boolean;
  created_at: string;
  updated_at: string;
};

export type Subscription = {
  id: string;
  user_id: string;
  plan_id: string;
  status: SubscriptionStatus;
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  created_at: string;
  updated_at: string;
  metadata?: Record<string, any>;
};

export type PaymentStatus = 'created' | 'authorized' | 'captured' | 'refunded' | 'failed';

export type Payment = {
  id: string;
  user_id: string;
  subscription_id?: string;
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  created_at: string;
  updated_at: string;
  receipt_url?: string;
  metadata?: Record<string, any>;
};

export type InvoiceStatus = 'draft' | 'open' | 'paid' | 'uncollectible' | 'void';

export type Invoice = {
  id: string;
  user_id: string;
  subscription_id?: string;
  payment_id?: string;
  status: InvoiceStatus;
  amount_due: number;
  amount_paid: number;
  invoice_number: string;
  invoice_date: string;
  due_date: string;
  created_at: string;
  updated_at: string;
};

export type PricingFeature = {
  title: string;
  included: boolean;
};

// For the frontend pricing UI
export interface PricingTier {
  id: string;
  name: string;
  description: string;
  price: {
    weekly: number;
    monthly: number;
    yearly: number;
  };
  features: {
    [key: string]: boolean;
  };
  mostPopular?: boolean;
  highlighted?: boolean;
} 