'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  CreditCard,
  Sparkles,
  User
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [subscriptionData, setSubscriptionData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Get user data
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
        
        if (user) {
          // Fetch subscription data from Supabase
          const { data: subscriptionData, error } = await supabase
            .from('subscriptions')
            .select(`
              *,
              subscription_plans(*)
            `)
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();
          
          if (error) {
            // Fix: Check error code for "No rows returned" which is an expected case
            if (error.code === 'PGRST116') {
              // This is just "no subscription found" - handle gracefully
              setSubscriptionData(null);
            } else {
              // Log the actual error details
              console.error('Error fetching subscription:', error);
            }
            return;
          }
          
          // Set subscription data with plan name from subscription_plans
          setSubscriptionData({
            ...subscriptionData,
            planName: subscriptionData?.subscription_plans?.name || "No Active Plan"
          });
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error instanceof Error ? error.message : error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
    
    // Subscribe to subscription changes
    const channel = supabase
      .channel('subscription_updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'subscriptions'
        },
        () => {
          fetchDashboardData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, router]);

  // Format user's name - use first name if available, otherwise use email or 'there'
  const firstName = user?.user_metadata?.full_name?.split(' ')[0] || 
                   (user?.email?.split('@')[0] || 'there');
  
  // Format subscription info
  const subscriptionStatus = subscriptionData?.status || 'inactive';
  const renewalDate = subscriptionData?.current_period_end ? 
    new Date(subscriptionData.current_period_end).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }) : 'N/A';

  return (
    <div className="space-y-8">
      {/* Welcome section with futuristic gradient */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-background to-background/80 p-6 border border-border shadow-sm">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-primary/10"></div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-xs font-medium uppercase tracking-wider text-primary">Dashboard Overview</span>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight mb-1 flex flex-wrap items-center gap-1">
            Welcome back, {firstName}
            <span className="inline-flex items-center mt-1 sm:mt-0 sm:ml-2 bg-background/50 px-2 py-1 rounded-full text-sm gap-1.5 border border-border w-auto sm:w-auto">
              {subscriptionData?.planName || 'No Active Plan'}
              {subscriptionStatus === 'active' && (
                <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-300 ml-2">
                  Active
                </span>
              )}
            </span>
          </h1>
          <p className="text-muted-foreground text-sm">
            Here's an overview of your account and subscription status
          </p>
          
          <div className="mt-6 flex flex-wrap gap-3">
            <Button variant="secondary" size="sm" className="bg-background/50 hover:bg-background/70 backdrop-blur-md border border-border shadow-sm" asChild>
              <Link href="/dashboard/billing">
                <CreditCard className="h-4 w-4 mr-2" />
                View subscription
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Quick navigation cards */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Account card */}
        <Card className="overflow-hidden rounded-xl border-white/5 bg-background/30 backdrop-blur-xl shadow-sm">
          <CardHeader className="border-b border-white/5 pb-3">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-primary/80" />
              <CardTitle className="text-base">Account</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="text-sm font-medium">{user?.email}</p>
              </div>
              <div className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground">Member Since</p>
                <p className="text-sm font-medium">
                  {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            </div>
            <div className="mt-4">
              <Button variant="outline" size="sm" className="w-full border-white/10" asChild>
                <Link href="/dashboard/account">
                  <User className="h-4 w-4 mr-2" />
                  Manage Account
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Billing card */}
        <Card className="overflow-hidden rounded-xl border-white/5 bg-background/30 backdrop-blur-xl shadow-sm">
          <CardHeader className="border-b border-white/5 pb-3">
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-primary/80" />
              <CardTitle className="text-base">Subscription</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground">Current Plan</p>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium">
                    {subscriptionData?.planName || 'No Active Plan'}
                  </p>
                  {subscriptionStatus === 'active' && (
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-300">
                      Active
                    </span>
                  )}
                </div>
              </div>
              <div className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground">Next Billing</p>
                <p className="text-sm font-medium">{renewalDate}</p>
              </div>
            </div>
            <div className="mt-4">
              <Button variant="outline" size="sm" className="w-full border-white/10" asChild>
                <Link href="/dashboard/billing">
                  <CreditCard className="h-4 w-4 mr-2" />
                  Manage Subscription
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 