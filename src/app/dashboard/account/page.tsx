'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Mail, Phone, MapPin, CheckCircle2, Shield, CircleUser, Calendar, Sparkles } from 'lucide-react';

export default function AccountDetailsPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Get user data
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [supabase]);

  // Extract user information
  const email = user?.email || '';
  const userInitials = user?.user_metadata?.full_name 
    ? user.user_metadata.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase()
    : user?.email?.substring(0, 2).toUpperCase() || 'U';

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="h-8 w-32 bg-primary/20 rounded-full"></div>
          <div className="h-4 w-48 bg-primary/10 rounded-full"></div>
        </div>
      </div>
    );
  }

  const createdAt = user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  }) : 'N/A';

  return (
    <div className="space-y-8">
      {/* Header with futuristic glass design */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-background to-background/80 p-6 border border-border shadow-sm">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-primary/10"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-xs font-medium uppercase tracking-wider text-primary">User Profile</span>
            </div>
            <h1 className="text-2xl font-semibold tracking-tight mb-1">
              {user?.user_metadata?.full_name || email?.split('@')[0] || 'User'}
            </h1>
            <p className="text-muted-foreground text-sm flex items-center gap-2">
              <Mail className="h-4 w-4" />
              {email}
            </p>
          </div>
        </div>
      </div>

      {/* Content split into two columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="space-y-6 md:col-span-2">
          {/* Profile Information Card */}
          <Card className="overflow-hidden rounded-2xl border-white/5 bg-background/30 backdrop-blur-xl shadow-sm">
            <CardHeader className="border-b border-white/5 pb-4">
              <div className="flex items-center gap-2">
                <CircleUser className="h-4 w-4 text-primary/80" />
                <div>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription className="mt-1">
                    Your personal details and contact information
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="pt-6">
              <dl className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <dt className="text-sm text-muted-foreground flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Full Name
                  </dt>
                  <dd className="text-base font-medium p-2 bg-white/5 rounded-md border border-white/5 backdrop-blur-sm">
                    {user?.user_metadata?.full_name || 'Not provided'}
                  </dd>
                </div>
                
                <div className="space-y-2">
                  <dt className="text-sm text-muted-foreground flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email Address
                  </dt>
                  <dd className="text-base font-medium p-2 bg-white/5 rounded-md border border-white/5 backdrop-blur-sm">
                    {email}
                  </dd>
                </div>
                
                <div className="space-y-2">
                  <dt className="text-sm text-muted-foreground flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Phone Number
                  </dt>
                  <dd className="text-base font-medium p-2 bg-white/5 rounded-md border border-white/5 backdrop-blur-sm">
                    {user?.user_metadata?.phone_number || 'Not provided'}
                  </dd>
                </div>
                
                <div className="space-y-2">
                  <dt className="text-sm text-muted-foreground flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Address
                  </dt>
                  <dd className="text-base font-medium p-2 bg-white/5 rounded-md border border-white/5 backdrop-blur-sm">
                    {user?.user_metadata?.billing_address?.line1 ? (
                      <>
                        {user.user_metadata.billing_address.line1}
                        {user.user_metadata.billing_address.city && (
                          <>, {user.user_metadata.billing_address.city}</>
                        )}
                        {user.user_metadata.billing_address.country && (
                          <>, {user.user_metadata.billing_address.country}</>
                        )}
                      </>
                    ) : (
                      'Not provided'
                    )}
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>
        </div>

        {/* Right column - Account information */}
        <div className="space-y-6">
          <Card className="overflow-hidden rounded-2xl border-white/5 bg-background/30 backdrop-blur-xl shadow-sm">
            <CardHeader className="border-b border-white/5 pb-4">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-primary/80" />
                <div>
                  <CardTitle>Account Information</CardTitle>
                  <CardDescription className="mt-1">
                    Details about your account
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-6">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Member Since
                  </p>
                  <p className="font-medium">{createdAt}</p>
                </div>
                
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Account Status
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
                    <p className="font-medium">Active</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    Last Login
                  </p>
                  <p className="font-medium">Today</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Premium status card */}
          <Card className="overflow-hidden rounded-2xl border-white/5 bg-gradient-to-br from-primary/5 to-emerald-500/5 backdrop-blur-xl shadow-sm">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent"></div>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Sparkles className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">Premium Member</h3>
                    <p className="text-sm text-muted-foreground">Unlock all features</p>
                  </div>
                </div>
              </div>
              <Button className="w-full" asChild>
                <a href="/dashboard/billing">View Subscription</a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 