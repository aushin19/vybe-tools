-- 04_invoices_table.sql
-- This script creates the invoices table and sets up RLS policies

-- Check if the table exists before creating it
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'invoices') THEN
    -- Create the invoices table
    CREATE TABLE public.invoices (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
      subscription_id UUID NOT NULL REFERENCES public.subscriptions(id) ON DELETE CASCADE,
      payment_id UUID REFERENCES public.payments(id) ON DELETE SET NULL,
      status TEXT NOT NULL CHECK (status IN ('draft', 'open', 'paid', 'uncollectible', 'void')),
      amount_due INTEGER NOT NULL,
      amount_paid INTEGER DEFAULT 0,
      invoice_number TEXT NOT NULL,
      invoice_date TIMESTAMP WITH TIME ZONE NOT NULL,
      due_date TIMESTAMP WITH TIME ZONE NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
    );

    -- Create indexes for faster lookups
    CREATE INDEX invoices_user_id_idx ON public.invoices(user_id);
    CREATE INDEX invoices_subscription_id_idx ON public.invoices(subscription_id);
    CREATE INDEX invoices_payment_id_idx ON public.invoices(payment_id);
    
    -- Set up RLS (Row Level Security)
    ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

    -- Create policy to allow users to view only their own invoices
    CREATE POLICY invoices_policy_select ON public.invoices
      FOR SELECT USING (auth.uid() = user_id);

    -- Create policy to allow only service role to insert, update, delete
    CREATE POLICY invoices_policy_all ON public.invoices
      USING (auth.role() = 'service_role');

    -- Create a trigger to update the updated_at column
    CREATE TRIGGER invoices_updated_at_trigger
    BEFORE UPDATE ON public.invoices
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();
  END IF;
END $$; 