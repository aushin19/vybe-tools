'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/update-password`,
      });

      if (error) {
        throw error;
      }

      setIsSubmitted(true);
      toast.success('Check your email for the password reset link');
    } catch (error: any) {
      toast.error(error.message || 'Failed to send password reset email');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <Card className="border-none shadow-lg bg-card/50 backdrop-blur-sm">
        <CardHeader className="space-y-2">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-center">Check your email</CardTitle>
          <CardDescription className="text-center">
            We've sent a password reset link to <span className="font-medium">{email}</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center text-muted-foreground">
          <p className="mb-4">
            Click the link in the email to reset your password.
            If you don't see the email, check your spam folder.
          </p>
          <p className="text-sm">
            The link will expire in 24 hours.
          </p>
        </CardContent>
        <CardFooter className="flex flex-col pt-0">
          <Button 
            onClick={() => router.push('/auth/login')} 
            variant="outline" 
            className="w-full mt-4"
          >
            Back to login
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="border-none shadow-lg bg-card/50 backdrop-blur-sm">
      <CardHeader className="space-y-2">
        <div className="flex justify-center mb-2">
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
              <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
        </div>
        <CardTitle className="text-2xl font-bold text-center">Reset your password</CardTitle>
        <CardDescription className="text-center">
          Enter your email address and we'll send you a link to reset your password
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleResetPassword}>
        <CardContent className="pt-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium block">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="20" height="16" x="2" y="4" rx="2" />
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                  </svg>
                </div>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="pl-10 bg-card/40 border border-border/60 focus:border-primary/40 transition-colors"
                />
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col pt-2">
          <Button 
            type="submit" 
            className="w-full rounded-md h-11 text-sm font-medium transition-all mt-4"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Sending...
              </span>
            ) : (
              'Send reset link'
            )}
          </Button>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            <Link href="/auth/login" className="text-primary font-medium hover:text-primary/80 transition-colors">
              Back to login
            </Link>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
} 