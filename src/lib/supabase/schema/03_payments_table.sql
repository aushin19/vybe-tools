-- 03_payments_table.sql
-- This script creates the payments table and sets up RLS policies

-- Check if the table exists before creating it
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'payments') THEN
    -- Create the payments table
    CREATE TABLE public.payments (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
      subscription_id UUID NOT NULL REFERENCES public.subscriptions(id) ON DELETE CASCADE,
      razorpay_payment_id TEXT NOT NULL,
      razorpay_order_id TEXT NOT NULL,
      razorpay_signature TEXT,
      amount INTEGER NOT NULL,
      currency TEXT NOT NULL DEFAULT 'INR',
      status TEXT NOT NULL CHECK (status IN ('created', 'authorized', 'captured', 'refunded', 'failed')),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
      receipt_url TEXT,
      metadata JSONB
    );

    -- Create indexes for faster lookups
    CREATE INDEX payments_user_id_idx ON public.payments(user_id);
    CREATE INDEX payments_subscription_id_idx ON public.payments(subscription_id);
    CREATE INDEX payments_razorpay_payment_id_idx ON public.payments(razorpay_payment_id);
    
    -- Set up RLS (Row Level Security)
    ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

    -- Create policy to allow users to view only their own payments
    CREATE POLICY payments_policy_select ON public.payments
      FOR SELECT USING (auth.uid() = user_id);

    -- Create policy to allow only service role to insert, update, delete
    CREATE POLICY payments_policy_all ON public.payments
      USING (auth.role() = 'service_role');

    -- Create a trigger to update the updated_at column
    CREATE TRIGGER payments_updated_at_trigger
    BEFORE UPDATE ON public.payments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();
  END IF;
END $$; 