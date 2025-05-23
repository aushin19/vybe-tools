/**
 * Razorpay Integration Utility for Edge Runtime
 */
import type Razorpay from 'razorpay';
import { createClient } from '@/lib/supabase/server';
import { SubscriptionPlan } from '@/types/subscription';

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

interface VerifyPaymentResult {
  success: boolean;
  error?: string;
}

// Edge-compatible fetch implementation for Razorpay API
class EdgeRazorpay {
  private key_id: string;
  private key_secret: string;
  private baseUrl = 'https://api.razorpay.com/v1';

  constructor({ key_id, key_secret }: { key_id: string; key_secret: string }) {
    this.key_id = key_id;
    this.key_secret = key_secret;
  }

  // Helper to make authenticated requests to Razorpay API
  private async makeRequest(path: string, method: string = 'GET', data?: any) {
    const url = `${this.baseUrl}${path}`;
    const auth = btoa(`${this.key_id}:${this.key_secret}`);

    const options: RequestInit = {
      method,
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
      }
    };

    if (data && (method === 'POST' || method === 'PUT')) {
      options.body = JSON.stringify(data);
    }

    const response = await fetch(url, options);
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Razorpay API error: ${response.status} ${errorText}`);
    }

    return response.json();
  }

  // Razorpay API methods
  orders = {
    create: async (data: any) => {
      return this.makeRequest('/orders', 'POST', data);
    },
    fetch: async (orderId: string) => {
      return this.makeRequest(`/orders/${orderId}`);
    }
  };
  
  payments = {
    fetch: async (paymentId: string) => {
      return this.makeRequest(`/payments/${paymentId}`);
    }
  };
}

// Initialize Razorpay instance
export const getRazorpayInstance = () => {
  const key_id = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
  const key_secret = process.env.NEXT_PUBLIC_RAZORPAY_KEY_SECRET;

  if (!key_id || !key_secret) {
    throw new Error('Razorpay credentials are not configured');
  }

  return new EdgeRazorpay({
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

// Helper function to convert ArrayBuffer to hex string
function bufferToHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

// Helper function for HMAC SHA256 using Web Crypto API
async function createHmacSha256(secret: string, data: string): Promise<string> {
  const encoder = new TextEncoder();
  const encodedKey = encoder.encode(secret);
  const encodedData = encoder.encode(data);

  const cryptoKey = await globalThis.crypto.subtle.importKey(
    'raw',
    encodedKey,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signatureBuffer = await globalThis.crypto.subtle.sign(
    'HMAC',
    cryptoKey,
    encodedData
  );

  return bufferToHex(signatureBuffer);
}

// Verify Razorpay payment
export const verifyPayment = async (params: VerifyPaymentParams): Promise<VerifyPaymentResult> => {
  const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = params;
  try {
    const key_secret = process.env.NEXT_PUBLIC_RAZORPAY_KEY_SECRET;
    
    if (!key_secret) {
      console.error('Razorpay key_secret is not configured');
      return { success: false, error: 'Razorpay key_secret is not configured' };
    }
    
    // Create a signature using HMAC SHA256
    const payload = `${razorpayOrderId}|${razorpayPaymentId}`;
    
    // Use the Web Crypto API instead of Node.js crypto
    const expectedSignature = await createHmacSha256(key_secret, payload);
    
    // Compare the generated signature with the one sent by Razorpay
    const isSignatureValid = expectedSignature === razorpaySignature;
    
    if (!isSignatureValid) {
        return { success: false, error: 'Invalid payment signature' };
    }
    return { success: true };

  } catch (error) {
    console.error('Payment verification failed:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred during payment verification'
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