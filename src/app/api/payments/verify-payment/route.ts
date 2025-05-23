import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verifyPayment, createSubscription, fetchPayment } from '@/lib/razorpay';

export const runtime = 'edge'; // Re-added for Cloudflare Pages requirement

export async function POST(request: NextRequest) {
  try {
    // Create a Supabase client
    const supabase = createClient();
    
    // Get the current user from the session
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized - You must be logged in to verify a payment' },
        { status: 401 }
      );
    }
    
    // Parse the request body
    const body = await request.json();
    const {
      razorpayPaymentId,
      razorpayOrderId,
      razorpaySignature,
      planId,
    } = body;
    
    // Validate the required fields
    if (!razorpayPaymentId || !razorpayOrderId || !razorpaySignature || !planId) {
      return NextResponse.json(
        { error: 'Missing required fields for payment verification' },
        { status: 400 }
      );
    }
    
    // Verify the payment signature
    const verificationResult = await verifyPayment({
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    });
    
    if (!verificationResult.success) {
      return NextResponse.json(
        { error: 'Payment verification failed: Invalid signature' },
        { status: 400 }
      );
    }
    
    // Get payment details from Razorpay
    const paymentResult = await fetchPayment(razorpayPaymentId);
    
    if (!paymentResult.success) {
      return NextResponse.json(
        { error: 'Failed to fetch payment details from Razorpay' },
        { status: 500 }
      );
    }
    
    const payment = paymentResult.data;
    
    if (!payment) {
      return NextResponse.json(
        { error: 'Payment data not found after fetching payment details.' },
        { status: 500 } 
      );
    }
    
    // Verify payment status
    if (payment.status !== 'captured') {
      return NextResponse.json(
        { error: `Payment not captured. Current status: ${payment.status}` },
        { status: 400 }
      );
    }
    
    // Create a subscription for the user
    const subscriptionResult = await createSubscription(
      session.user.id,
      planId,
      razorpayPaymentId,
      razorpayOrderId,
      payment.amount,
      payment.currency
    );
    
    if (!subscriptionResult.success) {
      return NextResponse.json(
        { error: subscriptionResult.error || 'Failed to create subscription' },
        { status: 500 }
      );
    }
    
    // Return success response
    return NextResponse.json({
      success: true,
      data: {
        subscription: subscriptionResult.data,
        payment: {
          id: payment.id,
          amount: payment.amount,
          currency: payment.currency,
          status: payment.status,
        }
      },
    });
  } catch (error) {
    console.error('Error verifying payment:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 