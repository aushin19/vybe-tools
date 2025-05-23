-- 02_subscriptions_table.sql
-- This script creates the subscriptions table and sets up RLS policies

-- Check if the table exists before creating it
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'subscriptions') THEN
    -- Create the subscriptions table
    CREATE TABLE public.subscriptions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
      plan_id UUID NOT NULL REFERENCES public.subscription_plans(id),
      status TEXT NOT NULL CHECK (status IN ('active', 'past_due', 'cancelled', 'trialing')),
      current_period_start TIMESTAMP WITH TIME ZONE NOT NULL,
      current_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
      cancel_at_period_end BOOLEAN DEFAULT false,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
      metadata JSONB
    );

    -- Create index for faster lookups by user_id
    CREATE INDEX subscriptions_user_id_idx ON public.subscriptions(user_id);
    
    -- Set up RLS (Row Level Security)
    ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

    -- Create policy to allow users to view only their own subscriptions
    CREATE POLICY subscriptions_policy_select ON public.subscriptions
      FOR SELECT USING (auth.uid() = user_id);

    -- Create policy to allow only service role to insert, update, delete
    CREATE POLICY subscriptions_policy_all ON public.subscriptions
      USING (auth.role() = 'service_role');

    -- Create a trigger to update the updated_at column
    CREATE TRIGGER subscriptions_updated_at_trigger
    BEFORE UPDATE ON public.subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();
  END IF;
END $$; 