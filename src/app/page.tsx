'use client';

import { Button } from '@/components/ui/button';
import { CTAButton } from '@/components/ui/cta-button';
import Link from 'next/link';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { TestimonialsSection } from '@/components/blocks/testimonials-with-marquee';
import { FeatureGridSection } from '@/components/blocks/feature-grid-section';
import { Navbar } from '@/components/shared/navbar';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Footer } from '@/components/shared/footer';
import { Star, Heart, Zap, ArrowRight } from 'lucide-react';

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6 }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const supabase = createClient();
  
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

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setIsLoggedIn(!!session);
      } catch (error) {
        console.error('Error checking auth status:', error);
      }
    };
    
    checkAuth();
  }, [supabase]);
  
  return (
    <main className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero Section with Gradient Background */}
      <section className="pt-32 pb-20 px-6 md:pt-40 md:pb-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-background/70 z-0"></div>
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-primary/10 rounded-full blur-3xl"></div>
        
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="container mx-auto max-w-5xl text-center relative z-10"
        >
          <motion.div variants={fadeIn} className="mb-3">
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium">
              Modern SaaS Platform
            </span>
          </motion.div>
          <motion.h1 
            variants={fadeIn} 
            className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 leading-tight"
          >
            Elevate Your Business with <span className="text-primary">Nox</span>
          </motion.h1>
          <motion.p 
            variants={fadeIn} 
            className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto"
          >
            A powerful, subscription-based platform with all the features you need to scale, manage, and grow your business efficiently.
          </motion.p>
          <motion.div 
            variants={fadeIn} 
            className="flex flex-col sm:flex-row justify-center gap-4"
          >
            {isLoggedIn ? (
              <CTAButton href="/dashboard" animate>
                Go to Dashboard
              </CTAButton>
            ) : (
            <CTAButton href="/pricing" animate>
              Get Started
            </CTAButton>
            )}
            <Button size="lg" variant="outline" className="rounded-lg" onClick={(e) => handleScroll(e as any, 'features')}>
              Explore Features
            </Button>
          </motion.div>
          
          {/* Hero Image/Dashboard Preview */}
          <motion.div 
            variants={fadeIn}
            className="mt-16 relative mx-auto max-w-4xl shadow-2xl rounded-xl overflow-hidden border border-border/40"
          >
            <div className="w-full h-[300px] sm:h-[400px] md:h-[500px] bg-gradient-to-br from-background/80 to-background/40 backdrop-blur-md rounded-lg flex flex-col">
              {/* Mock Dashboard Header */}
              <div className="flex items-center justify-between p-4 border-b border-border/30">
                <div className="flex items-center gap-3">
                  <div className="h-3 w-3 rounded-full bg-red-500"></div>
                  <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                  <div className="h-3 w-3 rounded-full bg-green-500"></div>
                </div>
                <div className="flex gap-4 items-center">
                  <div className="w-24 h-7 rounded-md bg-card/50"></div>
                  <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center">
                    <span className="text-xs text-primary">N</span>
                  </div>
                </div>
              </div>
              
              {/* Chat Interface */}
              <div className="flex flex-col h-full p-4 overflow-hidden">
                {/* Chat Messages */}
                <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                  {/* AI Message */}
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                    className="flex items-start gap-3 max-w-[80%]"
                  >
                    <div className="h-8 w-8 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                      <Zap className="h-4 w-4 text-emerald-500" strokeWidth={1.5} />
                    </div>
                    <div className="bg-card/20 backdrop-blur-sm p-3 rounded-r-xl rounded-bl-xl border border-white/5">
                      <p className="text-sm">Hello! How can I assist you with Nox today?</p>
                    </div>
                  </motion.div>
                  
                  {/* User Message */}
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 1.2 }}
                    className="flex items-start gap-3 max-w-[80%] ml-auto"
                  >
                    <div className="bg-primary/20 backdrop-blur-sm p-3 rounded-l-xl rounded-br-xl border border-primary/10">
                      <p className="text-sm">I'd like to learn more about the analytics features.</p>
                    </div>
                    <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                      <span className="text-sm text-primary">U</span>
                    </div>
                  </motion.div>
                  
                  {/* AI Message with Typing Animation */}
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 1.8 }}
                    className="flex items-start gap-3 max-w-[80%]"
                  >
                    <div className="h-8 w-8 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                      <Zap className="h-4 w-4 text-emerald-500" strokeWidth={1.5} />
                    </div>
                    <div className="bg-card/20 backdrop-blur-sm p-3 rounded-r-xl rounded-bl-xl border border-white/5">
                      <motion.p 
                        initial={{ width: "0%" }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 2, delay: 2.2, ease: "easeInOut" }}
                        className="text-sm overflow-hidden whitespace-nowrap"
                      >
                        Our analytics dashboard provides real-time insights with customizable reports and AI-powered predictions.
                      </motion.p>
                    </div>
                  </motion.div>
                  
                  {/* AI Message with Chart Preview */}
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 4.5 }}
                    className="flex items-start gap-3 max-w-[90%]"
                  >
                    <div className="h-8 w-8 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                      <Zap className="h-4 w-4 text-emerald-500" strokeWidth={1.5} />
                    </div>
                    <div className="bg-card/20 backdrop-blur-sm p-3 rounded-r-xl rounded-bl-xl border border-white/5">
                      <p className="text-sm mb-3">Here's a preview of our analytics dashboard:</p>
                      <div className="bg-background/30 rounded-md p-3 h-24 flex items-end gap-1 relative">
                        {/* Chart legend */}
                        <div className="absolute -top-2 right-2 flex items-center gap-2 text-xs">
                          <div className="flex items-center gap-1">
                            <div className="w-2 h-2 bg-emerald-500/60 rounded-sm"></div>
                            <span className="text-white/70">Conversions</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <div className="w-2 h-2 bg-primary/60 rounded-sm"></div>
                            <span className="text-white/70">Traffic</span>
                          </div>
                        </div>
                        
                        {Array.from({ length: 7 }).map((_, i) => {
                          const height = Math.floor(Math.random() * 60) + 20;
                          return (
                            <div key={i} className="flex-1 flex flex-col items-center gap-1">
                              <motion.div 
                                initial={{ height: "0%" }}
                                animate={{ height: `${height}%` }}
                                transition={{ duration: 0.8, delay: 4.8 + (i * 0.1) }}
                                className="w-full bg-emerald-500/40 rounded-sm relative"
                              >
                                {i === 3 && (
                                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-emerald-500/90 text-white text-[10px] px-1 rounded">
                                    +24%
                                  </div>
                                )}
                              </motion.div>
                              <span className="text-[10px] text-white/50 mt-1">{['M','T','W','T','F','S','S'][i]}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </motion.div>
                </div>
                
                {/* Chat Input */}
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder="Type your message..." 
                    className="w-full bg-card/20 backdrop-blur-md border border-white/10 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary/30"
                    disabled
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 rounded-full bg-emerald-500/80 flex items-center justify-center">
                    <ArrowRight className="h-3 w-3 text-white" />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="py-16 border-y border-border/10 bg-gradient-to-r from-background via-background/95 to-background/90 backdrop-blur-xl relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/5 bg-[size:20px_20px] opacity-20"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-transparent"></div>
        
        <div className="container mx-auto max-w-5xl px-6 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Service Rating */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
              className="flex flex-col items-center justify-center p-6 rounded-xl bg-background/30 border border-white/5 backdrop-blur-md"
            >
              <div className="flex items-center justify-center mb-4 relative">
                <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-xl"></div>
                <div className="h-14 w-14 rounded-full bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 flex items-center justify-center relative z-10">
                  <Star className="size-6 text-emerald-500" strokeWidth={1.5} />
                </div>
              </div>
              <h3 className="text-4xl font-bold mb-1 bg-clip-text text-transparent bg-gradient-to-r from-white to-white/80">4.9/5</h3>
              <p className="text-muted-foreground text-sm uppercase tracking-wider">Service Rating</p>
            </motion.div>

            {/* Happy Customers */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
              className="flex flex-col items-center justify-center p-6 rounded-xl bg-background/30 border border-white/5 backdrop-blur-md"
            >
              <div className="flex items-center justify-center mb-4 relative">
                <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-xl"></div>
                <div className="h-14 w-14 rounded-full bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 flex items-center justify-center relative z-10">
                  <Heart className="size-6 text-emerald-500" strokeWidth={1.5} />
                </div>
              </div>
              <h3 className="text-4xl font-bold mb-1 bg-clip-text text-transparent bg-gradient-to-r from-white to-white/80">10K+</h3>
              <p className="text-muted-foreground text-sm uppercase tracking-wider">Happy Customers</p>
            </motion.div>

            {/* 24/7 Support */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              viewport={{ once: true }}
              className="flex flex-col items-center justify-center p-6 rounded-xl bg-background/30 border border-white/5 backdrop-blur-md"
            >
              <div className="flex items-center justify-center mb-4 relative">
                <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-xl"></div>
                <div className="h-14 w-14 rounded-full bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 flex items-center justify-center relative z-10">
                  <Zap className="size-6 text-emerald-500" strokeWidth={1.5} />
                </div>
              </div>
              <h3 className="text-4xl font-bold mb-1 bg-clip-text text-transparent bg-gradient-to-r from-white to-white/80">24/7</h3>
              <p className="text-muted-foreground text-sm uppercase tracking-wider">Customer Support</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-6">
        <FeatureGridSection 
          title="Powerful Features" 
          subtitle="Everything you need to grow your business, all in one place."
          className="py-8"
        />
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="bg-secondary/50 border-y border-border/40">
        <TestimonialsSection
          title="What Our Customers Say"
          description="See why businesses trust Nox for their growth and management needs"
          testimonials={[
            {
              author: {
                name: "Emma Thompson",
                handle: "@emmaai",
                avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face"
              },
              text: "Using Nox has transformed how we handle data analysis. The speed and accuracy are unprecedented.",
              href: "https://twitter.com/emmaai"
            },
            {
              author: {
                name: "David Park",
                handle: "@davidtech",
                avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"
              },
              text: "The API integration is flawless. We've reduced our development time by 60% since implementing this solution.",
              href: "https://twitter.com/davidtech"
            },
            {
              author: {
                name: "Sofia Rodriguez",
                handle: "@sofiaml",
                avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face"
              },
              text: "Finally, a SaaS platform that actually understands our needs! The accuracy and features are impressive."
            },
            {
              author: {
                name: "Sarah Johnson",
                handle: "@sarahj",
                avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop&crop=face"
              },
              text: "Nox has transformed how we manage our business operations. The dashboard is intuitive and the analytics are incredibly helpful."
            },
            {
              author: {
                name: "Michael Chen",
                handle: "@michaeltech",
                avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face"
              },
              text: "The security features and subscription management have made scaling our service so much simpler. Well worth the investment."
            }
          ]}
        />
      </section>
      
      {/* CTA Section */}
      <section id="cta" className="py-24 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5 z-0"></div>
        <div className="absolute top-1/3 right-1/3 w-72 h-72 bg-primary/5 rounded-full blur-3xl"></div>
        
        <div className="container mx-auto max-w-4xl text-center relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Transform Your Business?</h2>
          <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto">
            Join thousands of businesses that trust Nox to power their growth. Get started today with a free trial.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <CTAButton href="/pricing" animate>
              View Pricing
            </CTAButton>
          </div>
        </div>
      </section>
      {/* Footer */}
      <Footer />
    </main>
  );
}
