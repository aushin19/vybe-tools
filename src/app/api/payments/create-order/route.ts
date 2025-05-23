import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createOrder } from '@/lib/razorpay';

// export const runtime = 'edge'; // Removed for Node.js runtime

export async function POST(request: NextRequest) {
  try {
    // Create a Supabase client
    const supabase = createClient();
    
    // Get the current user from the session
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized - You must be logged in to create an order' }, 
        { status: 401 }
      );
    }
    
    // Parse the request body
    const body = await request.json();
    const { planId, receiptId, currency = 'INR' } = body;
    
    if (!planId) {
      return NextResponse.json(
        { error: 'Missing required field: planId' },
        { status: 400 }
      );
    }
    
    // Get the subscription plan from Supabase
    const { data: plan, error: planError } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('id', planId)
      .eq('active', true)
      .single();
    
    if (planError || !plan) {
      return NextResponse.json(
        { error: 'Invalid subscription plan' },
        { status: 400 }
      );
    }
    
    // Get user details
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', session.user.id)
      .single();
    
    if (userError || !user) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 400 }
      );
    }
    
    // Determine the amount and currency for the order
    const amount = currency === 'USD' 
      ? (plan.price_usd || Math.round(plan.price * 0.012)) 
      : plan.price;
    
    // Create a Razorpay order
    const receipt = receiptId || `receipt_${Date.now()}`;
    const orderResult = await createOrder({
      amount,
      currency,
      receipt,
      notes: {
        plan_id: plan.id,
        plan_name: plan.name,
        interval: plan.interval,
        user_id: user.id,
        user_email: user.email,
        currency,
      },
    });
    
    if (!orderResult.success || !orderResult.data) {
      return NextResponse.json(
        { error: orderResult.error || 'Failed to create order' },
        { status: 500 }
      );
    }
    
    // Return the order details
    return NextResponse.json({
      success: true,
      data: {
        orderId: orderResult.data.id,
        amount: orderResult.data.amount,
        currency: orderResult.data.currency,
        receipt: orderResult.data.receipt,
        planId: plan.id,
        planName: plan.name,
        interval: plan.interval,
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        user: {
          name: user.full_name,
          email: user.email,
          contact: user.phone_number || '',
        },
      },
    });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 