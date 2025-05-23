'use client';

import { useState, useEffect, Suspense } from 'react'; // Added Suspense just in case, though not strictly needed here
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { createClient } from '@/lib/supabase/client';
import { formatPrice } from '@/utils/format-utils';
import { toast } from 'sonner';
import { ArrowLeft, CheckCircle, Clock, ShieldCheck } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

// Script to load Razorpay
const loadRazorpay = () => {
  return new Promise<boolean>((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export default function CheckoutForm() { // Renamed component
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get('orderId');
  const planId = searchParams.get('planId');
  const currency = searchParams.get('currency') || 'INR';
  const [loading, setLoading] = useState(true);
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        toast.error('You must be logged in to access the checkout page');
        router.push('/auth/login');
        return;
      }

      if (!orderId || !planId) {
        toast.error('Invalid checkout information');
        router.push('/pricing');
        return;
      }

      // Fetch order details
      try {
        const response = await fetch(`/api/payments/order/${orderId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch order details');
        }
        const data = await response.json();
        setOrderDetails(data.data);
      } catch (error) {
        console.error('Error fetching order details:', error);
        toast.error('Failed to load order details. Please try again.');
        router.push('/pricing');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [orderId, planId, router, supabase]); // Added supabase to dependency array

  const handlePayment = async () => {
    if (!orderDetails) return;

    setPaymentProcessing(true);

    try {
      // Load Razorpay script
      const isRazorpayLoaded = await loadRazorpay();
      
      if (!isRazorpayLoaded) {
        throw new Error('Failed to load Razorpay SDK');
      }

      // Initialize Razorpay
      const rzp = new (window as any).Razorpay({
        key: orderDetails.key,
        amount: calculateTotal(orderDetails.amount), // ensure this uses the correct final amount for Razorpay
        currency: orderDetails.currency,
        order_id: orderDetails.orderId,
        name: 'Nox SaaS Platform',
        description: `Subscription to ${orderDetails.planName}`,
        image: '/logo.png', 
        prefill: {
          name: orderDetails.user.name,
          email: orderDetails.user.email,
          contact: orderDetails.user.contact,
        },
        theme: {
          color: '#00c573',
        },
        handler: async function (response: any) {
          // Payment successful, verify payment on server
          try {
            const verifyResponse = await fetch('/api/payments/verify-payment', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                razorpayPaymentId: response.razorpay_payment_id,
                razorpayOrderId: response.razorpay_order_id,
                razorpaySignature: response.razorpay_signature,
                planId: planId,
              }),
            });

            const verifyData = await verifyResponse.json();

            if (!verifyResponse.ok) {
              throw new Error(verifyData.error || 'Payment verification failed');
            }

            // Payment verified successfully
            setPaymentSuccess(true);
            toast.success('Payment successful! Your subscription is now active.');
            
            // Redirect to dashboard after 3 seconds
            setTimeout(() => {
              router.push('/dashboard');
            }, 3000);
          } catch (error: any) { // Added type for error
            console.error('Payment verification error:', error);
            toast.error(error.message || 'Payment verification failed. Please contact support.');
          }
        },
        modal: {
          ondismiss: function() {
            setPaymentProcessing(false);
            toast.info('Payment cancelled');
          },
        },
      });

      rzp.open();
    } catch (error: any) { // Added type for error
      console.error('Error initializing payment:', error);
      toast.error(error.message || 'Failed to initialize payment. Please try again.');
      setPaymentProcessing(false);
    }
  };

  // Get currency symbol for display
  const getCurrencySymbol = () => {
    return orderDetails?.currency === 'USD' ? '$' : '₹';
  };

  // Calculate total amount to be paid (this is what Razorpay expects)
  // The amount from orderDetails should be the final amount.
  const calculateTotal = (baseAmount: number) => {
    // Assuming orderDetails.amount is the final amount to be paid
    return baseAmount; 
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-3xl">
        <Button 
          variant="ghost" 
          className="mb-6" 
          onClick={() => router.push('/pricing')}
          disabled={paymentProcessing || paymentSuccess}
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to pricing
        </Button>

        {paymentSuccess ? (
          <Card className="border-green-500/20">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-center mb-2">
                <CheckCircle className="h-12 w-12 text-green-500/90" />
              </div>
              <CardTitle className="text-center text-xl">Payment Successful</CardTitle>
              <CardDescription className="text-center">
                Your subscription has been activated
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center text-sm text-muted-foreground">
              <p>Redirecting to dashboard shortly...</p>
            </CardContent>
            <CardFooter className="flex justify-center pt-2">
              <Button size="sm" variant="outline" onClick={() => router.push('/dashboard')}>
                Go to Dashboard
              </Button>
            </CardFooter>
          </Card>
        ) : loading ? (
          <Card>
            <CardHeader className="pb-2">
              <Skeleton className="h-6 w-1/3 mb-2" />
              <Skeleton className="h-4 w-2/3" />
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              <div className="space-y-2">
                <Skeleton className="h-14 w-full rounded-md" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                </div>
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </CardContent>
            <CardFooter>
              <Skeleton className="h-10 w-full" />
            </CardFooter>
          </Card>
        ) : (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xl">Complete Your Order</CardTitle>
              <CardDescription>
                Review your order details and proceed to payment
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="rounded-lg border border-border/50 overflow-hidden">
                <div className="bg-primary/10 p-3 border-b border-border/50">
                  <h3 className="font-medium">{orderDetails?.planName} Plan</h3>
                  <p className="text-xs text-muted-foreground">
                    {orderDetails?.planInterval === 'weekly' 
                      ? 'Weekly subscription' 
                      : orderDetails?.planInterval === 'monthly'
                        ? 'Monthly subscription'
                        : 'Annual subscription'}
                  </p>
                </div>
                
                <div className="p-3 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Base Price</span>
                    <span className="text-sm font-medium">
                      {getCurrencySymbol()}{formatPrice(orderDetails?.amount ? calculateTotal(orderDetails.amount) : 0, orderDetails?.currency || 'INR')}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Taxes (18% GST)</span>
                    <span className="text-sm font-medium">
                      {getCurrencySymbol()}{formatPrice(orderDetails?.amount ? Math.round((calculateTotal(orderDetails.amount) * 0.18)) : 0, orderDetails?.currency || 'INR')}
                    </span>
                  </div>
                   <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Gateway Fee (2%)</span>
                    <span className="text-sm font-medium">
                      {getCurrencySymbol()}{formatPrice(orderDetails?.amount ? Math.round((calculateTotal(orderDetails.amount) * 0.02)) : 0, orderDetails?.currency || 'INR')}
                    </span>
                  </div>
                  <hr className="border-border/50" />
                  <div className="flex justify-between items-center text-lg font-semibold">
                    <span>Total Amount</span>
                    <span>
                      {getCurrencySymbol()}{formatPrice(orderDetails?.amount || 0, orderDetails?.currency || 'INR')}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-green-500/10 border border-green-500/20 p-4 rounded-lg text-sm">
                <div className="flex items-start">
                  <ShieldCheck className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-green-400">Secure Payment Guarantee</h4>
                    <p className="text-green-300/80">
                      Your payment is processed securely through Razorpay. We do not store your card details. 
                      All transactions are encrypted and protected.
                    </p>
                  </div>
                </div>
              </div>

              {orderDetails && (
                <Button 
                  onClick={handlePayment} 
                  className="w-full" 
                  size="lg"
                  disabled={paymentProcessing}
                >
                  {paymentProcessing ? (
                    <Clock className="mr-2 h-5 w-5 animate-spin" />
                  ) : (
                    <ShieldCheck className="mr-2 h-5 w-5" />
                  )}
                  {paymentProcessing ? 'Processing Payment...' : `Pay ${getCurrencySymbol()}${formatPrice(orderDetails.amount, orderDetails.currency || 'INR')} Securely`}
                </Button>
              )}
            </CardContent>
            <CardFooter className="text-xs text-muted-foreground text-center">
              By clicking "Pay Securely", you agree to our Terms of Service and Privacy Policy.
            </CardFooter>
          </Card>
        )}
      </div>
    </div>
  );
} 