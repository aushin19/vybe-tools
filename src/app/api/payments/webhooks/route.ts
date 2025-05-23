import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import crypto from 'crypto';

export const runtime = 'edge';

export async function POST(request: NextRequest) {
  try {
    // Get webhook signature from headers
    const webhookSignature = request.headers.get('X-Razorpay-Signature');
    
    if (!webhookSignature) {
      return NextResponse.json(
        { error: 'Missing webhook signature' },
        { status: 401 }
      );
    }
    
    // Parse the webhook payload
    const payload = await request.text();
    
    // Verify webhook signature
    const secret = process.env.NEXT_PUBLIC_RAZORPAY_WEBHOOK_SECRET;
    
    if (!secret) {
      console.error('NEXT_PUBLIC_RAZORPAY_WEBHOOK_SECRET is not configured');
      return NextResponse.json(
        { error: 'Webhook secret not configured' },
        { status: 500 }
      );
    }
    
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');
    
    if (expectedSignature !== webhookSignature) {
      return NextResponse.json(
        { error: 'Invalid webhook signature' },
        { status: 401 }
      );
    }
    
    // Parse the payload as JSON
    const event = JSON.parse(payload);
    const { event: eventName, payload: eventPayload } = event;
    
    // Handle different event types
    switch (eventName) {
      case 'payment.captured': {
        await handlePaymentCaptured(eventPayload.payment.entity);
        break;
      }
      case 'payment.failed': {
        await handlePaymentFailed(eventPayload.payment.entity);
        break;
      }
      case 'refund.created': {
        await handleRefundCreated(eventPayload.refund.entity, eventPayload.payment.entity);
        break;
      }
      case 'subscription.charged': {
        await handleSubscriptionCharged(eventPayload.subscription.entity, eventPayload.payment.entity);
        break;
      }
      // Add more event handlers as needed
    }
    
    // Return a success response
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error handling webhook:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Handler for payment.captured event
async function handlePaymentCaptured(payment: any) {
  // Create a Supabase client
  const supabase = createClient();
  
  // Update payment status if it exists
  const { data, error } = await supabase
    .from('payments')
    .update({ status: 'captured' })
    .eq('razorpay_payment_id', payment.id)
    .select();
  
  if (error) {
    console.error('Error updating payment status:', error);
  }
  
  // If payment doesn't exist, it might have been created through a different channel
  if (!data || data.length === 0) {
    console.log('Payment not found in the database. It might be from another source.');
    // You could potentially create a new payment record here
  }
}

// Handler for payment.failed event
async function handlePaymentFailed(payment: any) {
  const supabase = createClient();
  
  // Update payment status if it exists
  const { error } = await supabase
    .from('payments')
    .update({ 
      status: 'failed',
      metadata: {
        error_code: payment.error_code,
        error_description: payment.error_description
      }
    })
    .eq('razorpay_payment_id', payment.id);
  
  if (error) {
    console.error('Error updating failed payment:', error);
  }
}

// Handler for refund.created event
async function handleRefundCreated(refund: any, payment: any) {
  const supabase = createClient();
  
  // Update payment status
  const { error: paymentError } = await supabase
    .from('payments')
    .update({ 
      status: 'refunded',
      metadata: {
        refund_id: refund.id,
        refund_amount: refund.amount,
        refund_status: refund.status,
        refund_created_at: new Date(refund.created_at * 1000).toISOString()
      }
    })
    .eq('razorpay_payment_id', payment.id);
  
  if (paymentError) {
    console.error('Error updating refunded payment:', paymentError);
  }
  
  // You might also want to update the subscription status
  if (payment.notes && payment.notes.subscription_id) {
    const { error: subscriptionError } = await supabase
      .from('subscriptions')
      .update({ status: 'cancelled' })
      .eq('id', payment.notes.subscription_id);
    
    if (subscriptionError) {
      console.error('Error updating subscription after refund:', subscriptionError);
    }
  }
}

// Handler for subscription.charged event
async function handleSubscriptionCharged(subscription: any, payment: any) {
  const supabase = createClient();
  
  // Create a new payment record
  const { error: paymentError } = await supabase
    .from('payments')
    .insert({
      user_id: subscription.customer_id,
      subscription_id: subscription.id,
      razorpay_payment_id: payment.id,
      razorpay_order_id: payment.order_id,
      amount: payment.amount,
      currency: payment.currency,
      status: payment.status
    });
  
  if (paymentError) {
    console.error('Error creating payment record for subscription:', paymentError);
  }
  
  // Update subscription dates if needed
  const { error: subscriptionError } = await supabase
    .from('subscriptions')
    .update({
      current_period_start: new Date().toISOString(),
      current_period_end: subscription.current_end 
        ? new Date(subscription.current_end * 1000).toISOString()
        : undefined
    })
    .eq('id', subscription.id);
  
  if (subscriptionError) {
    console.error('Error updating subscription period:', subscriptionError);
  }
} 