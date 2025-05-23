'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

export function Navbar() {
  const pathname = usePathname();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();
  
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setIsLoggedIn(!!session);
      } catch (error) {
        console.error('Error checking auth status:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuth();
  }, [supabase]);

  const handleScroll = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  };
  
  return (
    <header className="w-full py-5 px-6 border-b border-border/40 backdrop-blur-md bg-background/80 fixed top-0 z-50">
      <div className="container mx-auto flex justify-between items-center">
        <div className="text-2xl font-bold text-primary flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
            <span className="text-primary-foreground text-sm font-bold">N</span>
          </div>
          <Link href="/">Nox</Link>
        </div>
        <nav className="hidden md:flex space-x-8">
          <Link 
            href="/" 
            className={`transition-colors text-sm font-medium ${pathname === '/' ? 'text-primary' : 'text-foreground hover:text-primary'}`}
          >
            Home
          </Link>
          {pathname === '/' ? (
            <a 
              href="#cta" 
              onClick={(e) => handleScroll(e, 'cta')}
              className="text-foreground hover:text-primary transition-colors text-sm font-medium cursor-pointer"
            >
              Pricing
            </a>
          ) : (
            <Link 
              href="/pricing" 
              className={`transition-colors text-sm font-medium ${pathname === '/pricing' ? 'text-primary' : 'text-foreground hover:text-primary'}`}
            >
              Pricing
            </Link>
          )}
          <a 
            href="#features" 
            onClick={(e) => handleScroll(e, 'features')}
            className="text-foreground hover:text-primary transition-colors text-sm font-medium cursor-pointer"
          >
            Features
          </a>
          <a 
            href="#testimonials" 
            onClick={(e) => handleScroll(e, 'testimonials')}
            className="text-foreground hover:text-primary transition-colors text-sm font-medium cursor-pointer"
          >
            Testimonials
          </a>
        </nav>
        
        <div className="flex items-center gap-4">
          {isLoading ? (
            <div className="h-9 w-20 bg-muted/20 animate-pulse rounded-md"></div>
          ) : isLoggedIn ? (
            <Button size="sm" className="font-medium" asChild>
              <Link href="/dashboard">Go to Dashboard</Link>
            </Button>
          ) : (
            <>
              <Button variant="ghost" size="sm" className="font-medium" asChild>
                <Link href="/auth/login">Login</Link>
              </Button>
              <Button size="sm" className="font-medium" asChild>
                <Link href="/auth/signup">Sign Up</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
} 