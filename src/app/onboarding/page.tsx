'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export default function OnboardingPage() {
  const router = useRouter();
  const supabase = createClient();
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    billingAddress: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'India',
    },
    jobTitle: '',
    companyName: '',
  });
  const [user, setUser] = useState<any>(null);

  // Check if user is logged in and redirect if they've already completed onboarding
  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/auth/login');
        return;
      }
      
      setUser(user);
      
      // Pre-fill form data with existing user data
      if (user.user_metadata?.full_name) {
        setFormData(prev => ({
          ...prev,
          fullName: user.user_metadata.full_name
        }));
      }
      
      // Check if user has already completed onboarding
      const { data } = await supabase
        .from('users')
        .select('onboarding_completed, phone_number, billing_address')
        .eq('id', user.id)
        .single();
        
      if (data?.onboarding_completed) {
        router.push('/dashboard');
        return;
      }
      
      // Pre-fill with any existing data
      if (data) {
        if (data.phone_number) {
          setFormData(prev => ({
            ...prev,
            phoneNumber: data.phone_number
          }));
        }
        
        if (data.billing_address) {
          setFormData(prev => ({
            ...prev,
            billingAddress: {
              ...prev.billingAddress,
              ...data.billing_address
            }
          }));
        }
      }
    };
    
    checkUser();
  }, [router, supabase]);

  const handleNext = () => {
    if (step === 1 && !formData.fullName) {
      toast.error('Please enter your full name');
      return;
    }
    
    setStep(step + 1);
  };

  const handlePrevious = () => {
    setStep(step - 1);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      // Handle nested fields like billingAddress.street
      const [parent, child] = name.split('.');
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent as keyof typeof formData] as any,
          [child]: value
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Update user metadata
      const { error: metadataError } = await supabase.auth.updateUser({
        data: {
          full_name: formData.fullName,
          job_title: formData.jobTitle,
          company_name: formData.companyName,
        }
      });
      
      if (metadataError) {
        throw metadataError;
      }
      
      // Update user profile in database
      const { error: profileError } = await supabase
        .from('users')
        .update({
          full_name: formData.fullName,
          phone_number: formData.phoneNumber,
          billing_address: formData.billingAddress,
          onboarding_completed: true
        })
        .eq('id', user.id);
        
      if (profileError) {
        throw profileError;
      }
      
      toast.success('Onboarding completed successfully!');
      router.push('/dashboard');
    } catch (error: any) {
      toast.error(error.message || 'Failed to complete onboarding');
    } finally {
      setIsLoading(false);
    }
  };

  // Render the appropriate step
  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <>
            <CardHeader className="space-y-2">
              <div className="space-y-2">
                <div className="flex justify-center mb-2">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  </div>
                </div>
                <div className="flex justify-center mb-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 rounded-full bg-primary"></div>
                    <div className="w-2 h-2 rounded-full bg-primary/30"></div>
                    <div className="w-2 h-2 rounded-full bg-primary/30"></div>
                  </div>
                </div>
                <CardTitle className="text-2xl font-bold text-center">Personal Information</CardTitle>
                <CardDescription className="text-center">
                  Let's get to know you a little better
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="fullName" className="text-sm font-medium block">
                  Full Name
                </label>
                <Input
                  id="fullName"
                  name="fullName"
                  placeholder="John Doe"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  required
                  className="bg-card/40 border border-border/60 focus:border-primary/40 transition-colors"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="phoneNumber" className="text-sm font-medium block">
                  Phone Number
                </label>
                <Input
                  id="phoneNumber"
                  name="phoneNumber"
                  placeholder="+91 xxxxxxxx"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  className="bg-card/40 border border-border/60 focus:border-primary/40 transition-colors"
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full rounded-md h-11 text-sm font-medium transition-all"
                onClick={handleNext}
              >
                Continue
              </Button>
            </CardFooter>
          </>
        );
      case 2:
        return (
          <>
            <CardHeader className="space-y-2">
              <div className="space-y-2">
                <div className="flex justify-center mb-2">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                  </div>
                </div>
                <div className="flex justify-center mb-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 rounded-full bg-primary/30"></div>
                    <div className="w-2 h-2 rounded-full bg-primary"></div>
                    <div className="w-2 h-2 rounded-full bg-primary/30"></div>
                  </div>
                </div>
                <CardTitle className="text-2xl font-bold text-center">Billing Address</CardTitle>
                <CardDescription className="text-center">
                  Add your billing information
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="street" className="text-sm font-medium block">
                  Street Address
                </label>
                <Input
                  id="street"
                  name="billingAddress.street"
                  placeholder="123 Main St"
                  value={formData.billingAddress.street}
                  onChange={handleInputChange}
                  className="bg-card/40 border border-border/60 focus:border-primary/40 transition-colors"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label htmlFor="city" className="text-sm font-medium block">
                    City
                  </label>
                  <Input
                    id="city"
                    name="billingAddress.city"
                    placeholder="Mumbai"
                    value={formData.billingAddress.city}
                    onChange={handleInputChange}
                    className="bg-card/40 border border-border/60 focus:border-primary/40 transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="state" className="text-sm font-medium block">
                    State
                  </label>
                  <Input
                    id="state"
                    name="billingAddress.state"
                    placeholder="Maharashtra"
                    value={formData.billingAddress.state}
                    onChange={handleInputChange}
                    className="bg-card/40 border border-border/60 focus:border-primary/40 transition-colors"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label htmlFor="zipCode" className="text-sm font-medium block">
                    ZIP / Postal Code
                  </label>
                  <Input
                    id="zipCode"
                    name="billingAddress.zipCode"
                    placeholder="400001"
                    value={formData.billingAddress.zipCode}
                    onChange={handleInputChange}
                    className="bg-card/40 border border-border/60 focus:border-primary/40 transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="country" className="text-sm font-medium block">
                    Country
                  </label>
                  <Input
                    id="country"
                    name="billingAddress.country"
                    placeholder="India"
                    value={formData.billingAddress.country}
                    onChange={handleInputChange}
                    className="bg-card/40 border border-border/60 focus:border-primary/40 transition-colors"
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between gap-3">
              <Button 
                variant="outline"
                className="flex-1 rounded-md h-11 text-sm font-medium transition-all"
                onClick={handlePrevious}
              >
                Back
              </Button>
              <Button 
                className="flex-1 rounded-md h-11 text-sm font-medium transition-all"
                onClick={handleNext}
              >
                Continue
              </Button>
            </CardFooter>
          </>
        );
      case 3:
        return (
          <>
            <CardHeader className="space-y-2">
              <div className="space-y-2">
                <div className="flex justify-center mb-2">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                      <rect width="20" height="14" x="2" y="7" rx="2" ry="2" />
                      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                    </svg>
                  </div>
                </div>
                <div className="flex justify-center mb-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 rounded-full bg-primary/30"></div>
                    <div className="w-2 h-2 rounded-full bg-primary/30"></div>
                    <div className="w-2 h-2 rounded-full bg-primary"></div>
                  </div>
                </div>
                <CardTitle className="text-2xl font-bold text-center">Professional Details</CardTitle>
                <CardDescription className="text-center">
                  Tell us about your work
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="jobTitle" className="text-sm font-medium block">
                  Job Title (Optional)
                </label>
                <Input
                  id="jobTitle"
                  name="jobTitle"
                  placeholder="Product Manager"
                  value={formData.jobTitle}
                  onChange={handleInputChange}
                  className="bg-card/40 border border-border/60 focus:border-primary/40 transition-colors"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="companyName" className="text-sm font-medium block">
                  Company Name (Optional)
                </label>
                <Input
                  id="companyName"
                  name="companyName"
                  placeholder="Acme Inc."
                  value={formData.companyName}
                  onChange={handleInputChange}
                  className="bg-card/40 border border-border/60 focus:border-primary/40 transition-colors"
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between gap-3">
              <Button 
                variant="outline"
                className="flex-1 rounded-md h-11 text-sm font-medium transition-all"
                onClick={handlePrevious}
              >
                Back
              </Button>
              <Button 
                type="submit"
                className="flex-1 rounded-md h-11 text-sm font-medium transition-all"
                disabled={isLoading}
                onClick={handleSubmit}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </span>
                ) : (
                  'Complete Setup'
                )}
              </Button>
            </CardFooter>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md"
      >
        <Card className="border-none shadow-lg bg-card/50 backdrop-blur-sm">
          <form onSubmit={handleSubmit}>
            {renderStep()}
          </form>
        </Card>
      </motion.div>
    </div>
  );
} 