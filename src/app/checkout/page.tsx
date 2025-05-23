import { Suspense } from 'react';
import CheckoutForm from './checkout-form';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';

// A simple skeleton loader for the Suspense fallback
function CheckoutPageSkeleton() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-3xl">
        <Skeleton className="h-8 w-32 mb-6 rounded-md" /> {/* Back button skeleton */}
        <Card>
          <CardHeader className="pb-2">
            <Skeleton className="h-6 w-1/3 mb-2 rounded-md" />
            <Skeleton className="h-4 w-2/3 rounded-md" />
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <div className="space-y-2">
              <Skeleton className="h-14 w-full rounded-md" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-full rounded-md" />
                <Skeleton className="h-4 w-full rounded-md" />
                <Skeleton className="h-4 w-full rounded-md" />
              </div>
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-2/3 rounded-md" />
              <Skeleton className="h-4 w-3/4 rounded-md" />
            </div>
          </CardContent>
          <CardFooter>
            <Skeleton className="h-10 w-full rounded-md" />
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<CheckoutPageSkeleton />}>
      <CheckoutForm />
    </Suspense>
  );
} 