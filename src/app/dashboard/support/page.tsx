'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { MessageSquare, Mail, Phone, Clock, CheckCircle2, ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

export default function SupportPage() {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      toast.success('Support request submitted successfully');
      setSubject('');
      setMessage('');
      setIsSubmitting(false);
    }, 1500);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-background to-background/80 p-6 border border-border shadow-sm">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-primary/10"></div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <MessageSquare className="h-4 w-4 text-primary" />
            <span className="text-xs font-medium uppercase tracking-wider text-primary">Help Center</span>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight mb-1">
            Support
          </h1>
          <p className="text-muted-foreground text-sm">
            Get help from our support team. We're here to assist you with any questions or issues.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card className="overflow-hidden rounded-2xl border-white/5 bg-background/30 backdrop-blur-xl shadow-sm">
            <CardHeader className="border-b border-white/5">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-primary/80 mr-2" />
                <div>
                  <CardTitle>Contact Support</CardTitle>
                  <CardDescription>
                    Send us a message and we'll get back to you as soon as possible
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="subject" className="text-sm font-medium mb-1.5 block">Subject</label>
                  <Input 
                    id="subject" 
                    placeholder="Brief description of your issue" 
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    required
                    className="bg-background/50 border-white/10 focus:border-primary focus:ring-primary/20"
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="message" className="text-sm font-medium mb-1.5 block">Message</label>
                  <Textarea 
                    id="message" 
                    placeholder="Please describe your issue in detail" 
                    rows={6}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                    className="bg-background/50 border-white/10 focus:border-primary focus:ring-primary/20"
                  />
                </div>
                
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full"
                >
                  {isSubmitting ? (
                    <>
                      <span className="animate-spin mr-2">◌</span>
                      Submitting...
                    </>
                  ) : (
                    <>
                      Submit Request
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="overflow-hidden rounded-2xl border-white/5 bg-background/30 backdrop-blur-xl shadow-sm">
            <CardHeader className="border-b border-white/5">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary/80 mr-2" />
                <CardTitle>Contact Information</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
                    <Mail className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">Email</h3>
                    <p className="text-sm text-muted-foreground">support@example.com</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
                    <Phone className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">Phone</h3>
                    <p className="text-sm text-muted-foreground">+1 (555) 123-4567</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
                    <Clock className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">Hours</h3>
                    <p className="text-sm text-muted-foreground">Monday - Friday: 9am - 5pm EST</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden rounded-2xl border-white/5 bg-gradient-to-br from-primary/5 to-emerald-500/5 backdrop-blur-xl shadow-sm">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent"></div>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                </div>
                <h3 className="font-medium">Average Response Time</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-2">
                We typically respond to all inquiries within:
              </p>
              <p className="text-2xl font-bold text-primary">2-4 Hours</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 