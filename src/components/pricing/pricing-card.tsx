'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, HelpCircle } from 'lucide-react';
import { SubscriptionPlan } from '@/types/subscription';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Add keyframes for shimmer animation
const shimmerAnimation = `
@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}
.premium-badge {
  position: relative;
  overflow: hidden;
}
.premium-badge::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 200%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
  animation: shimmer 2s infinite linear;
}
`;

interface PricingCardProps {
  plan: SubscriptionPlan;
  isMostPopular?: boolean;
  isHighlighted?: boolean;
  disabled?: boolean;
  currentPlan?: boolean;
}

export function PricingCard({ 
  plan, 
  isMostPopular = false, 
  isHighlighted = false, 
  disabled = false, 
  currentPlan = false 
}: PricingCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [currency, setCurrency] = useState<'INR' | 'USD'>('INR');
  const router = useRouter();

  // Format price (convert from paise/cents to rupees/dollars)
  const formatPrice = (amount: number, currency = 'INR'): string => {
    const formattedAmount = (amount / 100).toLocaleString(
      currency === 'INR' ? 'en-IN' : 'en-US', 
      { minimumFractionDigits: 0 }
    );
    
    return currency === 'INR' ? `₹${formattedAmount}` : `$${formattedAmount}`;
  };

  const handleSubscribe = async () => {
    if (currentPlan) {
      toast.info('You are already subscribed to this plan');
      return;
    }

    if (disabled) {
      toast.error('Please sign in to subscribe to a plan');
      router.push('/auth/login');
      return;
    }

    setIsLoading(true);

    try {
      // Create order via API
      const response = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId: plan.id,
          interval: plan.interval,
          receiptId: `receipt_${Date.now()}`,
          currency: currency,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create order');
      }

      // Redirect to checkout page with order details
      router.push(`/checkout?orderId=${data.data.orderId}&planId=${plan.id}&interval=${plan.interval}&currency=${currency}`);
    } catch (error) {
      console.error('Error creating order:', error);
      toast.error('Failed to create order. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Parse features from the database (stored as an array of strings)
  const features = Array.isArray(plan.features) ? plan.features : [];

  // Get plan duration label
  const getDurationLabel = () => {
    switch (plan.interval) {
      case 'weekly':
        return 'week';
      case 'monthly':
        return 'month';
      case 'yearly':
        return 'year';
      default:
        return plan.interval;
    }
  };

  return (
    <Card className={cn(
      "flex flex-col border-border/50 h-full", 
      isHighlighted && "border-primary/50 bg-primary/5",
      isMostPopular && "border-primary/30 shadow-md"
    )}>
      <CardHeader className="relative">
        {isMostPopular && (
          <>
            <style dangerouslySetInnerHTML={{ __html: shimmerAnimation }} />
            <Badge 
              variant="default" 
              className="absolute -top-3 left-0 right-0 w-fit mx-auto bg-primary text-white px-3 py-1 border border-primary/30 premium-badge"
            >
              Most Popular
            </Badge>
          </>
        )}
        <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
        <CardDescription>{plan.description}</CardDescription>
        
        <div className="mt-4 space-y-2">
          <Tabs 
            defaultValue="INR" 
            className="w-full"
            onValueChange={(v) => setCurrency(v as 'INR' | 'USD')}
          >
            <TabsList className="text-muted-foreground flex items-center gap-2 p-1 bg-background/50 rounded-lg border border-border/50 backdrop-blur-sm">
              <TabsTrigger 
                value="INR" 
                className="flex-1 rounded-md px-3 py-1.5 text-sm data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=inactive]:hover:bg-muted/50 transition-colors"
              >
                ₹ INR
              </TabsTrigger>
              <TabsTrigger 
                value="USD" 
                className="flex-1 rounded-md px-3 py-1.5 text-sm data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=inactive]:hover:bg-muted/50 transition-colors"
              >
                $ USD
              </TabsTrigger>
            </TabsList>
            <TabsContent value="INR" className="mt-2">
              <div className="text-3xl font-extrabold">
                {formatPrice(plan.price, 'INR')}
                <span className="text-sm font-normal text-muted-foreground ml-1">
                  /{getDurationLabel()}
                </span>
              </div>
            </TabsContent>
            <TabsContent value="USD" className="mt-2">
              <div className="text-3xl font-extrabold">
                {formatPrice(plan.price_usd || Math.round(plan.price * 0.012), 'USD')}
                <span className="text-sm font-normal text-muted-foreground ml-1">
                  /{getDurationLabel()}
                </span>
              </div>
            </TabsContent>
          </Tabs>
          
          {plan.interval === 'yearly' && (
            <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
              Save 15-20% with yearly billing
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <ul className="space-y-2">
          {features.map((feature, index) => (
            <li key={index} className="flex items-center gap-2 text-sm">
              <Check size={16} className="text-primary" />
              <span>{feature}</span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle size={14} className="text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs text-xs">{feature}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter className="mt-auto pt-4">
        <Button 
          className={cn(
            "w-full mt-4", 
            isHighlighted && !currentPlan ? "bg-primary hover:bg-primary/90" : "",
            currentPlan ? "bg-green-600 hover:bg-green-700" : ""
          )}
          onClick={handleSubscribe}
          disabled={isLoading || currentPlan}
        >
          {isLoading ? (
            <>
              <span className="animate-spin mr-2">⏳</span>
              Processing...
            </>
          ) : currentPlan ? (
            "Current Plan"
          ) : (
            `Subscribe to ${plan.name}`
          )}
        </Button>
      </CardFooter>
    </Card>
  );
} 