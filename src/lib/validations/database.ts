import { z } from 'zod';

// User schema
export const userSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
  full_name: z.string().nullable(),
  avatar_url: z.string().url().nullable(),
  billing_address: z.record(z.string(), z.any()).nullable(),
  phone_number: z.string().nullable(),
  onboarding_completed: z.boolean().default(false),
});

export type User = z.infer<typeof userSchema>;

// Subscription plan schema
export const subscriptionPlanSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  interval: z.enum(['weekly', 'monthly', 'yearly']),
  price: z.number().int().positive(),
  description: z.string(),
  features: z.array(z.string()),
  active: z.boolean().default(true),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export type SubscriptionPlan = z.infer<typeof subscriptionPlanSchema>;

// Subscription schema
export const subscriptionSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  plan_id: z.string().uuid(),
  status: z.enum(['active', 'past_due', 'cancelled', 'trialing']),
  current_period_start: z.string().datetime(),
  current_period_end: z.string().datetime(),
  cancel_at_period_end: z.boolean().default(false),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
  metadata: z.record(z.string(), z.any()).nullable(),
});

export type Subscription = z.infer<typeof subscriptionSchema>;

// Payment schema
export const paymentSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  subscription_id: z.string().uuid(),
  razorpay_payment_id: z.string(),
  razorpay_order_id: z.string(),
  razorpay_signature: z.string().nullable(),
  amount: z.number().int().positive(),
  currency: z.string().default('INR'),
  status: z.enum(['created', 'authorized', 'captured', 'refunded', 'failed']),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
  receipt_url: z.string().url().nullable(),
  metadata: z.record(z.string(), z.any()).nullable(),
});

export type Payment = z.infer<typeof paymentSchema>;

// Invoice schema
export const invoiceSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  subscription_id: z.string().uuid(),
  payment_id: z.string().uuid().nullable(),
  status: z.enum(['draft', 'open', 'paid', 'uncollectible', 'void']),
  amount_due: z.number().int().positive(),
  amount_paid: z.number().int().default(0),
  invoice_number: z.string(),
  invoice_date: z.string().datetime(),
  due_date: z.string().datetime(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export type Invoice = z.infer<typeof invoiceSchema>; 