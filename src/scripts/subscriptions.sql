-- ==========================================
-- Subscription Plans, Subscriptions, Payments, and Invoices Tables
-- ==========================================

-- Create subscription_plans table
CREATE TABLE IF NOT EXISTS public.subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price BIGINT NOT NULL,
  interval VARCHAR(50) NOT NULL CHECK (interval IN ('weekly', 'monthly', 'yearly')),
  features JSONB, 
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Insert default subscription plans
INSERT INTO public.subscription_plans (name, description, price, interval, features, active)
VALUES 
  ('Starter', 'Perfect for individuals and small projects', 999, 'monthly', '{"basicDashboard": true, "fileStorage": true}', true),
  ('Professional', 'Great for professionals and growing teams', 2499, 'monthly', '{"basicDashboard": true, "advancedDashboard": true, "prioritySupport": true, "apiAccess": true, "teamMembers": true, "fileStorage": true, "unlimitedProjects": true, "bulkOperations": true}', true),
  ('Enterprise', 'For large organizations with advanced needs', 6999, 'monthly', '{"basicDashboard": true, "advancedDashboard": true, "prioritySupport": true, "customBranding": true, "apiAccess": true, "teamMembers": true, "fileStorage": true, "unlimitedProjects": true, "advancedAnalytics": true, "customReports": true, "dedicatedManager": true, "bulkOperations": true}', true),
  ('Starter', 'Perfect for individuals and small projects', 299, 'weekly', '{"basicDashboard": true, "fileStorage": true}', true),
  ('Professional', 'Great for professionals and growing teams', 799, 'weekly', '{"basicDashboard": true, "advancedDashboard": true, "prioritySupport": true, "apiAccess": true, "teamMembers": true, "fileStorage": true, "unlimitedProjects": true, "bulkOperations": true}', true),
  ('Enterprise', 'For large organizations with advanced needs', 1999, 'weekly', '{"basicDashboard": true, "advancedDashboard": true, "prioritySupport": true, "customBranding": true, "apiAccess": true, "teamMembers": true, "fileStorage": true, "unlimitedProjects": true, "advancedAnalytics": true, "customReports": true, "dedicatedManager": true, "bulkOperations": true}', true),
  ('Starter', 'Perfect for individuals and small projects', 9999, 'yearly', '{"basicDashboard": true, "fileStorage": true}', true),
  ('Professional', 'Great for professionals and growing teams', 24999, 'yearly', '{"basicDashboard": true, "advancedDashboard": true, "prioritySupport": true, "apiAccess": true, "teamMembers": true, "fileStorage": true, "unlimitedProjects": true, "bulkOperations": true}', true),
  ('Enterprise', 'For large organizations with advanced needs', 69999, 'yearly', '{"basicDashboard": true, "advancedDashboard": true, "prioritySupport": true, "customBranding": true, "apiAccess": true, "teamMembers": true, "fileStorage": true, "unlimitedProjects": true, "advancedAnalytics": true, "customReports": true, "dedicatedManager": true, "bulkOperations": true}', true);

-- Create subscriptions table
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES public.subscription_plans(id),
  status VARCHAR(50) NOT NULL CHECK (status IN ('active', 'past_due', 'cancelled', 'trialing')),
  current_period_start TIMESTAMPTZ NOT NULL,
  current_period_end TIMESTAMPTZ NOT NULL,
  cancel_at_period_end BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  metadata JSONB
);

-- Create payments table
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES public.subscriptions(id),
  razorpay_payment_id VARCHAR(255),
  razorpay_order_id VARCHAR(255),
  razorpay_signature VARCHAR(255),
  amount BIGINT NOT NULL,
  currency VARCHAR(3) NOT NULL DEFAULT 'INR',
  status VARCHAR(50) NOT NULL CHECK (status IN ('created', 'authorized', 'captured', 'refunded', 'failed')),
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  receipt_url TEXT,
  metadata JSONB
);

-- Create invoices table
CREATE TABLE IF NOT EXISTS public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES public.subscriptions(id),
  payment_id VARCHAR(255),
  status VARCHAR(50) NOT NULL CHECK (status IN ('draft', 'open', 'paid', 'uncollectible', 'void')),
  amount_due BIGINT NOT NULL,
  amount_paid BIGINT NOT NULL DEFAULT 0,
  invoice_number VARCHAR(255) NOT NULL,
  invoice_date TIMESTAMPTZ NOT NULL,
  due_date TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Add trigger for updated_at on subscription_plans
CREATE OR REPLACE FUNCTION trigger_update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_subscription_plans_timestamp
BEFORE UPDATE ON public.subscription_plans
FOR EACH ROW
EXECUTE FUNCTION trigger_update_timestamp();

-- Add trigger for updated_at on subscriptions
CREATE TRIGGER update_subscriptions_timestamp
BEFORE UPDATE ON public.subscriptions
FOR EACH ROW
EXECUTE FUNCTION trigger_update_timestamp();

-- Add trigger for updated_at on payments
CREATE TRIGGER update_payments_timestamp
BEFORE UPDATE ON public.payments
FOR EACH ROW
EXECUTE FUNCTION trigger_update_timestamp();

-- Add trigger for updated_at on invoices
CREATE TRIGGER update_invoices_timestamp
BEFORE UPDATE ON public.invoices
FOR EACH ROW
EXECUTE FUNCTION trigger_update_timestamp();

-- Add Row Level Security (RLS) policies

-- Enable RLS on all tables
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

-- RLS for subscription_plans: everyone can read, only service role can write
CREATE POLICY "Anyone can read subscription plans"
ON public.subscription_plans
FOR SELECT
USING (true);

CREATE POLICY "Only service role can modify subscription plans"
ON public.subscription_plans
FOR ALL
USING (current_setting('role') = 'service_role')
WITH CHECK (current_setting('role') = 'service_role');

-- RLS for subscriptions: users can read their own, service role can write
CREATE POLICY "Users can read their own subscriptions"
ON public.subscriptions
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Service role can write subscriptions"
ON public.subscriptions
FOR ALL
USING (current_setting('role') = 'service_role');

-- RLS for payments: users can read their own, service role can write
CREATE POLICY "Users can read their own payments"
ON public.payments
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Service role can write payments"
ON public.payments
FOR ALL
USING (current_setting('role') = 'service_role');

-- RLS for invoices: users can read their own, service role can write
CREATE POLICY "Users can read their own invoices"
ON public.invoices
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Service role can write invoices"
ON public.invoices
FOR ALL
USING (current_setting('role') = 'service_role'); 