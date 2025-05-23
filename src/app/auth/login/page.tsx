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
import { handleAuthError, validateEmail } from '@/utils/auth-error-handler';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [formErrors, setFormErrors] = useState<{ email?: string; password?: string }>({});
  const router = useRouter();
  const supabase = createClient();

  const validateForm = (): boolean => {
    const errors: { email?: string; password?: string } = {};
    let isValid = true;

    // Validate email
    if (!email) {
      errors.email = 'Email is required';
      isValid = false;
    } else if (!validateEmail(email)) {
      errors.email = 'Please enter a valid email address';
      isValid = false;
    }

    // Validate password
    if (!password) {
      errors.password = 'Password is required';
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      toast.success('Login successful!');
      router.push('/dashboard');
      router.refresh();
    } catch (error: any) {
      const { message } = handleAuthError(error);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border-none shadow-lg bg-card/50 backdrop-blur-sm">
      <CardHeader className="space-y-2 pb-2">
        <div className="flex justify-center mb-2">
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-primary"
            >
              <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
        </div>
        <CardTitle className="text-2xl font-bold text-center">Welcome back</CardTitle>
        <CardDescription className="text-center text-muted-foreground">
          Login to your account to continue
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleLogin} className="form-spacing">
        <CardContent className="pt-4 pb-2">
          <div className="space-y-5">
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
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (formErrors.email) {
                      setFormErrors({ ...formErrors, email: undefined });
                    }
                  }}
                  required
                  className={`pl-10 bg-card/40 border ${formErrors.email ? 'border-red-500' : 'border-border/60'} focus:border-primary/40 transition-colors`}
                  aria-invalid={!!formErrors.email}
                  aria-describedby={formErrors.email ? "email-error" : undefined}
                />
              </div>
              {formErrors.email && (
                <p id="email-error" className="text-xs text-red-500 mt-1">
                  {formErrors.email}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="text-sm font-medium block">
                  Password
                </label>
                <Link
                  href="/auth/reset-password"
                  className="text-xs text-primary hover:text-primary/80 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
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
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (formErrors.password) {
                      setFormErrors({ ...formErrors, password: undefined });
                    }
                  }}
                  required
                  className={`pl-10 bg-card/40 border ${formErrors.password ? 'border-red-500' : 'border-border/60'} focus:border-primary/40 transition-colors`}
                  aria-invalid={!!formErrors.password}
                  aria-describedby={formErrors.password ? "password-error" : undefined}
                />
              </div>
              {formErrors.password && (
                <p id="password-error" className="text-xs text-red-500 mt-1">
                  {formErrors.password}
                </p>
              )}
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col pt-2 pb-6">
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
                Processing...
              </span>
            ) : (
              'Sign in'
            )}
          </Button>
          
          <div className="mt-8 relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border/60"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-card px-4 text-muted-foreground">or continue with</span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3 mt-6">
            <Button variant="outline" className="bg-card/40 border border-border/60 hover:border-border h-10" type="button" disabled={isLoading}>
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Google
            </Button>
            <Button variant="outline" className="bg-card/40 border border-border/60 hover:border-border h-10" type="button" disabled={isLoading}>
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0012 2z"
                  fill="#333"
                />
              </svg>
              GitHub
            </Button>
          </div>
          
          <div className="mt-8 text-center text-sm text-muted-foreground">
            Don&apos;t have an account yet?{' '}
            <Link href="/auth/signup" className="text-primary font-medium hover:text-primary/80 transition-colors">
              Create account
            </Link>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
} 