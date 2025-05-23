import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getRazorpayInstance } from '@/lib/razorpay';
import { type UnsafeUnwrappedCookies } from 'next/headers';

export const runtime = 'edge'; // Re-added for Cloudflare Pages requirement

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    // The 'params' object itself is a Promise that resolves to the actual parameters.
    const actualParams = await params;
    const { orderId } = actualParams;
    
    // Create a Supabase client
    const supabase = createClient();
    
    // Get the current user from the session
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized - You must be logged in to access order details' },
        { status: 401 }
      );
    }
    
    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      );
    }
    
    // Get Razorpay instance
    const razorpay = getRazorpayInstance();
    
    try {
      // Fetch order details from Razorpay
      const order = await razorpay.orders.fetch(orderId);
      
      if (!order) {
        return NextResponse.json(
          { error: 'Order not found' },
          { status: 404 }
        );
      }
      
      // Get plan ID from order notes
      const planId = order.notes?.plan_id;
      
      if (!planId) {
        return NextResponse.json(
          { error: 'Plan ID not found in order notes' },
          { status: 400 }
        );
      }
      
      // Get plan from Supabase
      const { data: plan, error: planError } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('id', planId)
        .single();
      
      if (planError || !plan) {
        return NextResponse.json(
          { error: 'Subscription plan not found' },
          { status: 404 }
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
      
      // Return the order details
      return NextResponse.json({
        success: true,
        data: {
          orderId: order.id,
          amount: order.amount,
          currency: order.currency,
          receipt: order.receipt,
          planId: plan.id,
          planName: plan.name,
          planInterval: plan.interval,
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
          user: {
            name: user.full_name,
            email: user.email,
            contact: user.phone_number || '',
          },
        },
      });
    } catch (error: any) {
      console.error('Error fetching order details:', error);
      return NextResponse.json(
        { error: `Failed to fetch order: ${error.message}` },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Error in order API:', error);
    return NextResponse.json(
      { error: `Internal server error: ${error.message}` },
      { status: 500 }
    );
  }
} 