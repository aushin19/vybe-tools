-- 01_subscription_plans_table.sql
-- This script creates the subscription_plans table and sets up RLS policies

-- Check if the table exists before creating it
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'subscription_plans') THEN
    -- Create the subscription_plans table
    CREATE TABLE public.subscription_plans (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL,
      interval TEXT NOT NULL CHECK (interval IN ('weekly', 'monthly', 'yearly')),
      price INTEGER NOT NULL,
      description TEXT,
      features JSONB,
      active BOOLEAN DEFAULT true,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
    );

    -- Set up RLS (Row Level Security)
    ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;

    -- Create policy to allow all authenticated users to view plans
    CREATE POLICY subscription_plans_policy_select ON public.subscription_plans
      FOR SELECT USING (auth.role() = 'authenticated');

    -- Create policy to allow only service role to insert, update, delete
    CREATE POLICY subscription_plans_policy_all ON public.subscription_plans
      USING (auth.role() = 'service_role');

    -- Create a trigger to update the updated_at column
    CREATE TRIGGER subscription_plans_updated_at_trigger
    BEFORE UPDATE ON public.subscription_plans
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

    -- Insert default subscription plans - one per duration
    INSERT INTO public.subscription_plans (name, interval, price, description, features, active)
    VALUES 
    (
      'Starter', 
      'weekly', 
      29900, 
      'Try it out with our weekly plan', 
      '["Basic dashboard access", "Limited file storage", "Email support", "Up to 3 projects"]'::jsonb, 
      true
    ),
    (
      'Pro', 
      'monthly', 
      199900, 
      'Our most popular plan for professionals', 
      '["Advanced dashboard", "Priority support", "API access", "Team collaboration", "50GB storage", "Unlimited projects", "Analytics"]'::jsonb, 
      true
    ),
    (
      'Enterprise', 
      'yearly', 
      1999000, 
      'Best value for serious businesses', 
      '["Everything in Pro", "Dedicated account manager", "Custom integrations", "Unlimited storage", "Advanced security", "Custom reporting", "99.9% uptime SLA", "24/7 support"]'::jsonb, 
      true
    );
  END IF;
END $$; 