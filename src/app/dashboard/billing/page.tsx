'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { createClient } from '@/lib/supabase/client';
import { 
  Loader2, 
  Download, 
  AlertTriangle, 
  CheckCircle2, 
  Calendar, 
  RefreshCw, 
  PackageOpen, 
  ArrowRight, 
  CreditCard,
  Clock,
  Sparkles,
  Shield,
  History,
  Receipt
} from 'lucide-react';
import { formatPrice } from '@/config/subscriptions';
import { useRouter } from 'next/navigation';
import { PRICING_TIERS } from '@/config/subscriptions';
import { SubscriptionInterval, SubscriptionStatus, PaymentStatus } from '@/types/subscription';
import { toast } from 'sonner';
import { format, parseISO, addDays } from 'date-fns';
import { Progress } from '@/components/ui/progress';
import { v4 as uuidv4 } from 'uuid';

// Subscription badge variants
const getStatusBadgeVariant = (status: SubscriptionStatus) => {
  switch (status) {
    case 'active':
      return 'success';
    case 'trialing':
      return 'warning';
    case 'past_due':
      return 'destructive';
    case 'cancelled':
      return 'secondary';
    default:
      return 'outline';
  }
};

export default function BillingPage() {
  const supabase = createClient();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<any>(null);
  const [plan, setPlan] = useState<any>(null);
  const [interval, setInterval] = useState<SubscriptionInterval>('monthly');
  const [payments, setPayments] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('subscription');
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const fetchBillingData = async () => {
      setLoading(true);

      // Get current user
      const { data: userData } = await supabase.auth.getUser();
      
      if (!userData?.user) {
        router.push('/auth/login');
        return;
      }

      setUser(userData.user);

      // Get active subscription
      const { data: subscriptionData } = await supabase
        .from('subscriptions')
        .select('*, subscription_plans(*)')
        .eq('user_id', userData.user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (subscriptionData) {
        setSubscription(subscriptionData);
        setPlan(subscriptionData.subscription_plans);
        
        // Set interval directly from the plan data instead of guessing based on price
        if (subscriptionData.subscription_plans?.interval) {
          // Use the interval directly from the plan
          setInterval(subscriptionData.subscription_plans.interval as SubscriptionInterval);
        } else {
          // Fallback to determining interval based on price (only as a backup)
          if (subscriptionData.subscription_plans?.price < 1000) {
            setInterval('weekly');
          } else if (subscriptionData.subscription_plans?.price < 10000) {
            setInterval('monthly');
          } else {
            setInterval('yearly');
          }
        }
      }

      // Get payment history
      const { data: paymentsData } = await supabase
        .from('payments')
        .select('*')
        .eq('user_id', userData.user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (paymentsData) {
        setPayments(paymentsData);
      }

      setLoading(false);
    };

    fetchBillingData();
  }, [supabase, router]);

  const handleChangePlan = () => {
    router.push('/pricing');
  };

  const handleCancelSubscription = async () => {
    if (!subscription) return;

    try {
      const { error } = await supabase
        .from('subscriptions')
        .update({
          cancel_at_period_end: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', subscription.id);

      if (error) throw error;

      // Update local state
      setSubscription({
        ...subscription,
        cancel_at_period_end: true
      });

      toast.success('Your subscription will be cancelled at the end of the billing period');
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      toast.error('Failed to cancel subscription');
    }
  };

  const handleResumeSubscription = async () => {
    if (!subscription) return;

    try {
      const { error } = await supabase
        .from('subscriptions')
        .update({
          cancel_at_period_end: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', subscription.id);

      if (error) throw error;

      // Update local state
      setSubscription({
        ...subscription,
        cancel_at_period_end: false
      });

      toast.success('Your subscription has been resumed');
    } catch (error) {
      console.error('Error resuming subscription:', error);
      toast.error('Failed to resume subscription');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="h-10 w-40 bg-primary/20 rounded-full"></div>
          <div className="h-4 w-64 bg-primary/10 rounded-full"></div>
        </div>
      </div>
    );
  }

  // Tab options with icons
  const tabOptions = [
    { id: "subscription", label: "Subscription", icon: <CreditCard className="w-4 h-4" /> },
    { id: "payment-history", label: "Payment History", icon: <History className="w-4 h-4" /> },
    { id: "plans", label: "View Plans", icon: <PackageOpen className="w-4 h-4" /> }
  ];

  return (
    <div className="space-y-8">
      {/* Header section with futuristic design */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-background to-background/80 p-6 border border-border shadow-sm">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-primary/10"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <CreditCard className="h-4 w-4 text-primary" />
              <span className="text-xs font-medium uppercase tracking-wider text-primary">Billing & Subscription</span>
            </div>
            <h1 className="text-2xl font-semibold tracking-tight mb-1">Subscription Management</h1>
            <p className="text-muted-foreground text-sm">
              Manage your subscription, view billing history, and download invoices
            </p>
          </div>
          
          {subscription && (
            <div className="md:ml-auto flex items-center">
              <div className="bg-background/50 backdrop-blur-md px-4 py-2 rounded-full border border-border">
                <span className="font-medium">Current Plan: </span>
                <span className="font-bold">{plan?.name || 'Free'}</span>
                <Badge 
                  className={`ml-2 ${
                    subscription.status === 'active' ? 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30' : 
                    subscription.status === 'trialing' ? 'bg-amber-500/20 text-amber-300 hover:bg-amber-500/30' : 
                    'bg-red-500/20 text-red-300 hover:bg-red-500/30'
                  }`}
                >
                  {subscription.status}
                </Badge>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Custom tab navigation */}
      <div className="flex overflow-x-auto gap-2 pb-2 no-scrollbar">
        {tabOptions.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-full transition-all duration-200 whitespace-nowrap ${
              activeTab === tab.id
                ? "bg-primary/10 text-primary border-primary border backdrop-blur-sm"
                : "bg-white/5 text-foreground/70 hover:bg-white/10 hover:text-foreground border border-white/10"
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Subscription Tab */}
      {activeTab === 'subscription' && (
        <div className="space-y-6">
          {/* Current Plan */}
          <Card className="overflow-hidden rounded-2xl border-white/5 bg-background/30 backdrop-blur-xl shadow-sm">
            <CardHeader className="border-b border-white/5">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary/80" />
                <div>
                  <CardTitle>Current Plan</CardTitle>
                  <CardDescription>
                    Details about your current subscription plan
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              {subscription ? (
                <div className="space-y-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white/5 p-6 rounded-xl border border-white/5 backdrop-blur-sm">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <PackageOpen className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="text-lg font-medium">{plan?.name || 'Free Plan'}</h3>
                          <p className="text-sm text-muted-foreground">
                            {plan?.price ? formatPrice(plan.price) : '₹0'} / {interval}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-3">
                      {subscription.status === 'active' ? (
                        <div className="flex items-center gap-2 bg-emerald-500/10 text-emerald-400 px-4 py-2 rounded-lg border border-emerald-500/20">
                          <CheckCircle2 className="h-4 w-4" />
                          <span>Active until {format(parseISO(subscription.current_period_end), 'MMMM d, yyyy')}</span>
                        </div>
                      ) : subscription.status === 'past_due' ? (
                        <div className="flex items-center gap-2 bg-red-500/10 text-red-400 px-4 py-2 rounded-lg border border-red-500/20">
                          <AlertTriangle className="h-4 w-4" />
                          <span>Payment Past Due</span>
                        </div>
                      ) : subscription.status === 'cancelled' ? (
                        <div className="flex items-center gap-2 bg-amber-500/10 text-amber-400 px-4 py-2 rounded-lg border border-amber-500/20">
                          <Clock className="h-4 w-4" />
                          <span>Subscription Ends {format(parseISO(subscription.current_period_end), 'MMMM d, yyyy')}</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 bg-white/5 text-muted-foreground px-4 py-2 rounded-lg border border-white/10">
                          <AlertTriangle className="h-4 w-4" />
                          <span>Inactive Subscription</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {subscription.cancel_at_period_end && (
                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex items-center gap-4">
                      <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" />
                      <div>
                        <h4 className="font-medium text-amber-500">Subscription Cancellation Scheduled</h4>
                        <p className="text-sm text-muted-foreground">
                          Your subscription will be cancelled on {subscription.current_period_end ? format(parseISO(subscription.current_period_end), 'MMMM d, yyyy') : 'the end of your billing period'}.
                          You can resume your subscription anytime before this date.
                        </p>
                      </div>
                    </div>
                  )}
                  
                  <Separator className="bg-white/5" />
                  
                  <div className="space-y-4">
                    <h4 className="font-medium">Plan Features</h4>
                    <ul className="space-y-2">
                      {plan?.features ? (
                        typeof plan.features === 'string' ? 
                          <li className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                            <span>{plan.features}</span>
                          </li>
                        : Array.isArray(plan.features) ? 
                          plan.features.map((feature: string, index: number) => (
                            <li key={index} className="flex items-center gap-2">
                              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                              <span>{feature}</span>
                            </li>
                          ))
                        : Object.entries(plan.features).map(([key, value]: [string, any]) => (
                            <li key={key} className="flex items-center gap-2">
                              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                              <span>{key}: {value}</span>
                            </li>
                          ))
                      ) : (
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                          <span>Basic features</span>
                        </li>
                      )}
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6">
                  <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <PackageOpen className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">No Active Subscription</h3>
                  <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                    You don't have an active subscription plan. Choose a plan to access premium features.
                  </p>
                  <Button onClick={() => router.push('/pricing')}>View Plans</Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Payment History Tab */}
      {activeTab === 'payment-history' && (
        <div className="space-y-6">
          <Card className="overflow-hidden rounded-2xl border-white/5 bg-background/30 backdrop-blur-xl shadow-sm">
            <CardHeader className="border-b border-white/5">
              <div className="flex items-center gap-2">
                <History className="h-4 w-4 text-primary/80" />
                <div>
                  <CardTitle>Payment History</CardTitle>
                  <CardDescription>
                    View your recent payment transactions
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {payments.length > 0 ? (
                <div className="divide-y divide-white/5">
                  {payments.map((payment) => (
                    <div key={payment.id} className="flex flex-col md:flex-row md:items-center md:justify-between p-6 hover:bg-white/5 transition-all duration-200">
                      <div className="space-y-1 mb-4 md:mb-0">
                        <div className="flex items-center gap-2">
                          <CreditCard className="h-4 w-4 text-primary/80" />
                          <p className="font-medium">Payment #{payment.razorpay_payment_id}</p>
                          <Badge 
                            className={`${
                              payment.status === 'captured' ? 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30' : 
                              payment.status === 'authorized' ? 'bg-amber-500/20 text-amber-300 hover:bg-amber-500/30' : 
                              'bg-red-500/20 text-red-300 hover:bg-red-500/30'
                            }`}
                          >
                            {payment.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5" />
                            <span>{format(parseISO(payment.created_at), 'MMM d, yyyy')}</span>
                          </div>
                          <div>
                            {payment.amount ? formatPrice(payment.amount) : '₹0'}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {payment.receipt_url && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20"
                            onClick={() => window.open(payment.receipt_url, '_blank')}
                          >
                            <Receipt className="mr-2 h-4 w-4" />
                            View Receipt
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 px-4">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <CreditCard className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">No Payment History</h3>
                  <p className="text-muted-foreground text-center max-w-md">
                    You don't have any payment transactions yet. They will appear here once you make a payment.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Plans Tab */}
      {activeTab === 'plans' && (
        <div className="space-y-6">
          <Card className="overflow-hidden rounded-2xl border-white/5 bg-background/30 backdrop-blur-xl shadow-sm">
            <CardHeader className="border-b border-white/5">
              <div className="flex items-center gap-2">
                <PackageOpen className="h-4 w-4 text-primary/80" />
                <div>
                  <CardTitle>Available Plans</CardTitle>
                  <CardDescription>
                    Compare plans and choose the best one for you
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <Button 
                className="w-full" 
                onClick={() => router.push('/pricing')}
              >
                <PackageOpen className="mr-2 h-4 w-4" />
                Compare Plans
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
} 