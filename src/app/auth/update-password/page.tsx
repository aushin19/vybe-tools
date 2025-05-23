'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function UpdatePasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  // Verify that the user came here from a reset password flow
  useEffect(() => {
    const checkResetFlow = async () => {
      const { data, error } = await supabase.auth.getSession();
      
      if (error || !data.session) {
        toast.error('Invalid or expired password reset link. Please try again.');
        router.push('/auth/reset-password');
      }
    };

    checkResetFlow();
  }, [router, supabase]);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password,
      });

      if (error) {
        throw error;
      }

      setIsSuccess(true);
      toast.success('Password has been updated successfully');
      
      // Redirect to login after a short delay
      setTimeout(() => {
        router.push('/auth/login');
      }, 2000);
    } catch (error: any) {
      toast.error(error.message || 'Failed to update password');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
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
          <CardTitle className="text-2xl font-bold text-center">Password updated</CardTitle>
          <CardDescription className="text-center">
            Your password has been updated successfully
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center text-muted-foreground">
          <p>
            You can now log in with your new password
          </p>
        </CardContent>
        <CardFooter className="flex flex-col pt-0">
          <Button 
            onClick={() => router.push('/auth/login')} 
            className="w-full mt-4"
          >
            Go to login
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
        <CardTitle className="text-2xl font-bold text-center">Update your password</CardTitle>
        <CardDescription className="text-center">
          Create a new password for your account
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleUpdatePassword}>
        <CardContent className="pt-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium block">
                New Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  className="pl-10 bg-card/40 border border-border/60 focus:border-primary/40 transition-colors"
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Must be at least 8 characters long
              </p>
            </div>
            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium block">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </div>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
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
            className="w-full rounded-md h-11 text-sm font-medium transition-all"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Updating...
              </span>
            ) : (
              'Update password'
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
} 