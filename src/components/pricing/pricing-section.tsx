'use client';

import { useState, useEffect } from 'react';
import { SubscriptionPlan } from '@/types/subscription';
import { PricingCard } from './pricing-card';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

interface PricingSectionProps {
  showTitle?: boolean;
}

export function PricingSection({ showTitle = true }: PricingSectionProps) {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [currentPlanId, setCurrentPlanId] = useState<string | null>(null);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch subscription plans
        const { data: plansData, error: plansError } = await supabase
          .from('subscription_plans')
          .select('*')
          .eq('active', true)
          .order('price');
        
        if (plansError) {
          console.error('Error fetching plans:', plansError);
          return;
        }
        
        if (plansData) {
          setPlans(plansData);
        }
        
        // Check authentication
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setIsLoggedIn(true);
          
          // If logged in, fetch current subscription
          const { data: subscription } = await supabase
            .from('subscriptions')
            .select('plan_id, status')
            .eq('user_id', session.user.id)
            .eq('status', 'active')
            .order('created_at', { ascending: false })
            .limit(1)
            .single();
          
          if (subscription) {
            setCurrentPlanId(subscription.plan_id);
          }
        } else {
          setIsLoggedIn(false);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);

  return (
    <section className="py-16 px-4 md:px-6 w-full max-w-7xl mx-auto">
      {showTitle && (
        <div className="mb-16 text-center space-y-4">
          <h2 className="text-3xl md:text-4xl font-bold">Simple, Transparent Pricing</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Choose the plan that fits your needs. All plans include full access to our platform with different levels of features.
          </p>
        </div>
      )}
      
      {isLoading ? (
        <div className="flex justify-center items-center min-h-[300px]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : (
        <>
          <div className="grid gap-8 md:grid-cols-3 sm:grid-cols-1 mx-auto">
            {plans.map((plan, index) => {
              // Determine if this is the popular plan (middle one) or enterprise (last one)
              const isMostPopular = plan.interval === 'monthly';
              const isHighlighted = plan.interval === 'yearly';
              
              return (
                <div key={plan.id}>
                  <PricingCard
                    plan={plan}
                    isMostPopular={isMostPopular}
                    isHighlighted={isHighlighted}
                    disabled={!isLoggedIn}
                    currentPlan={currentPlanId === plan.id}
                  />
                </div>
              );
            })}
          </div>
          
          <div className="mt-12 text-center">
            <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
              All prices are in Indian Rupees (₹). If you need custom plans or have specific requirements, please 
              <button 
                onClick={() => router.push('/contact')}
                className="text-primary hover:underline mx-1"
              >
                contact us
              </button>
              for more information.
            </p>
          </div>
        </>
      )}
    </section>
  );
} 