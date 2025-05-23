/**
 * Razorpay Integration Utility
 */
import Razorpay from 'razorpay';
import { createClient } from '@/lib/supabase/server';
import { SubscriptionPlan } from '@/types/subscription';
import crypto from 'crypto';

interface CreateOrderParams {
  amount: number;
  currency: string;
  receipt: string;
  notes?: Record<string, string>;
}

interface VerifyPaymentParams {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}

// Initialize Razorpay instance
export const getRazorpayInstance = () => {
  const key_id = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
  const key_secret = process.env.NEXT_PUBLIC_RAZORPAY_KEY_SECRET;

  if (!key_id || !key_secret) {
    throw new Error('Razorpay credentials are not configured');
  }

  return new Razorpay({
    key_id,
    key_secret,
  });
};

// Create Razorpay order
export const createOrder = async ({ amount, currency, receipt, notes }: CreateOrderParams) => {
  try {
    const instance = getRazorpayInstance();
    
    const order = await instance.orders.create({
      amount,
      currency,
      receipt,
      notes,
      payment_capture: 1,
    });
    
    return { success: true, data: order };
  } catch (error) {
    console.error('Razorpay order creation failed:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};

// Verify Razorpay payment
export const verifyPayment = ({ razorpayOrderId, razorpayPaymentId, razorpaySignature }: VerifyPaymentParams) => {
  try {
    const key_secret = process.env.NEXT_PUBLIC_RAZORPAY_KEY_SECRET;
    
    if (!key_secret) {
      throw new Error('Razorpay key_secret is not configured');
    }
    
    // Create a signature using HMAC SHA256
    const payload = `${razorpayOrderId}|${razorpayPaymentId}`;
    const expectedSignature = crypto
      .createHmac('sha256', key_secret)
      .update(payload)
      .digest('hex');
    
    // Compare the generated signature with the one sent by Razorpay
    const isSignatureValid = expectedSignature === razorpaySignature;
    
    return { success: isSignatureValid };
  } catch (error) {
    console.error('Payment verification failed:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};

// Fetch payment details from Razorpay
export const fetchPayment = async (paymentId: string) => {
  try {
    const instance = getRazorpayInstance();
    const payment = await instance.payments.fetch(paymentId);
    return { success: true, data: payment };
  } catch (error) {
    console.error('Fetch payment failed:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};

// Get subscription plans with pricing
export const getSubscriptionPlans = async (): Promise<SubscriptionPlan[]> => {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('subscription_plans')
    .select('*')
    .eq('active', true)
    .order('price');
  
  if (error) {
    console.error('Error fetching subscription plans:', error);
    return [];
  }
  
  return data || [];
};

// Create a subscription in the database
export const createSubscription = async (
  userId: string,
  planId: string,
  paymentId: string,
  orderId: string,
  amount: number,
  currency: string = 'INR'
) => {
  const supabase = createClient();
  
  try {
    // Get plan details to calculate period end
    const { data: plan } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('id', planId)
      .single();
    
    if (!plan) {
      throw new Error('Subscription plan not found');
    }
    
    const now = new Date();
    let periodEnd = new Date(now);
    
    // Calculate subscription end date based on interval
    switch (plan.interval) {
      case 'weekly':
        periodEnd.setDate(periodEnd.getDate() + 7);
        break;
      case 'monthly':
        periodEnd.setMonth(periodEnd.getMonth() + 1);
        break;
      case 'yearly':
        periodEnd.setFullYear(periodEnd.getFullYear() + 1);
        break;
    }
    
    // Insert subscription record
    const { data: subscription, error: subscriptionError } = await supabase
      .from('subscriptions')
      .insert({
        user_id: userId,
        plan_id: planId,
        status: 'active',
        current_period_start: now.toISOString(),
        current_period_end: periodEnd.toISOString(),
        cancel_at_period_end: false
      })
      .select()
      .single();
    
    if (subscriptionError) {
      throw subscriptionError;
    }
    
    // Insert payment record
    const { error: paymentError } = await supabase
      .from('payments')
      .insert({
        user_id: userId,
        subscription_id: subscription.id,
        razorpay_payment_id: paymentId,
        razorpay_order_id: orderId,
        amount,
        currency,
        status: 'captured'
      });
    
    if (paymentError) {
      throw paymentError;
    }
    
    // Generate invoice number
    const invoiceNumber = `INV-${Date.now()}-${userId.substring(0, 6)}`;
    
    // Insert invoice record
    const { error: invoiceError } = await supabase
      .from('invoices')
      .insert({
        user_id: userId,
        subscription_id: subscription.id,
        payment_id: paymentId,
        status: 'paid',
        amount_due: amount,
        amount_paid: amount,
        invoice_number: invoiceNumber,
        invoice_date: now.toISOString(),
        due_date: now.toISOString()
      });
    
    if (invoiceError) {
      throw invoiceError;
    }
    
    return { success: true, data: subscription };
  } catch (error) {
    console.error('Creating subscription failed:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}; 