'use client';

import { PricingSection } from '@/components/pricing/pricing-section';
import { FaqSection } from '@/components/pricing/faq-section';
import { TestimonialsSection } from '@/components/blocks/testimonials-with-marquee';
import { Navbar } from '@/components/shared/navbar';
import { Star, Heart, Zap, Users, Clock, Shield } from 'lucide-react';
import { motion } from 'framer-motion';

export default function PricingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 pt-16">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent h-80 w-full" />
          <PricingSection />
          
          {/* Stats Section */}
          <section className="py-16 border-y border-border/10 bg-gradient-to-r from-background via-background/95 to-background/90 backdrop-blur-xl relative overflow-hidden">
            <div className="absolute inset-0 bg-grid-white/5 bg-[size:20px_20px] opacity-20"></div>
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-transparent"></div>
            
            <div className="container mx-auto max-w-5xl px-6 relative z-10">
              <div className="text-center mb-10">
                <h2 className="text-3xl font-bold mb-3">Why Customers Choose Nox</h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Join thousands of satisfied customers who trust our platform for their business needs
                </p>
              </div>
              
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
                  <p className="text-muted-foreground text-sm uppercase tracking-wider">Customer Rating</p>
                </motion.div>

                {/* Active Users */}
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
                      <Users className="size-6 text-emerald-500" strokeWidth={1.5} />
                    </div>
                  </div>
                  <h3 className="text-4xl font-bold mb-1 bg-clip-text text-transparent bg-gradient-to-r from-white to-white/80">50K+</h3>
                  <p className="text-muted-foreground text-sm uppercase tracking-wider">Active Users</p>
                </motion.div>

                {/* Data Security */}
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
                      <Shield className="size-6 text-emerald-500" strokeWidth={1.5} />
                    </div>
                  </div>
                  <h3 className="text-4xl font-bold mb-1 bg-clip-text text-transparent bg-gradient-to-r from-white to-white/80">99.9%</h3>
                  <p className="text-muted-foreground text-sm uppercase tracking-wider">Data Security</p>
                </motion.div>
              </div>
            </div>
          </section>
        </div>
        
        {/* Testimonials Section */}
        <section className="bg-secondary/50 border-y border-border/40 my-16">
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
        
        {/* FAQ Section */}
        <FaqSection />
      </main>
    </div>
  );
} 