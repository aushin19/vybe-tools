'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* Left side branding panel */}
      <div className="md:w-1/2 bg-gradient-to-br from-background via-background/90 to-primary/10 relative overflow-hidden hidden md:flex md:flex-col md:justify-between">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-primary/10 rounded-full blur-3xl"></div>
        </div>
        
        <div className="p-8 relative z-10">
          <Link href="/" className="text-2xl font-bold text-primary flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <span className="text-primary-foreground text-sm font-bold">N</span>
            </div>
            Nox
          </Link>
        </div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="p-12 relative z-10 spacing-stack-lg"
        >
          <h1 className="text-4xl font-bold tracking-tight">Welcome to Nox</h1>
          <p className="text-xl text-muted-foreground mt-4 max-w-md">
            The modern SaaS platform that helps you grow your business with powerful tools and analytics.
          </p>
          <div className="mt-12 grid grid-cols-2 gap-6">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m9 12 2 2 4-4" />
                  <path d="M12 3c-1.2 0-2.4.6-3 1.7A3.6 3.6 0 0 0 4.6 9c-1 .6-1.7 1.8-1.7 3a3.9 3.9 0 0 0 3.9 4h10.2a3.9 3.9 0 0 0 3.9-4c0-1.2-.7-2.4-1.7-3a3.6 3.6 0 0 0-4.4-4.3C14.4 3.6 13.2 3 12 3Z" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium">Secure Platform</h3>
                <p className="text-sm text-muted-foreground">Enterprise-grade security</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22V8" />
                  <path d="m2 10 10-8 10 8" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium">Business Growth</h3>
                <p className="text-sm text-muted-foreground">Scale with analytics</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
                  <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium">Intuitive Tools</h3>
                <p className="text-sm text-muted-foreground">Easy to use dashboard</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium">Premium Support</h3>
                <p className="text-sm text-muted-foreground">24/7 customer service</p>
              </div>
            </div>
          </div>
        </motion.div>
        
        <div className="p-8 text-sm text-muted-foreground relative z-10">
          © 2023 Nox. All rights reserved.
        </div>
      </div>
      
      {/* Right side auth content */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-4 md:p-8">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-md"
        >
          {children}
        </motion.div>
      </div>
    </div>
  );
} 