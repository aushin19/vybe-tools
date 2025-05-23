-- 04_add_price_usd_column.sql
-- This script adds the price_usd column to the subscription_plans table

-- Add price_usd column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'subscription_plans' 
    AND column_name = 'price_usd'
  ) THEN
    ALTER TABLE public.subscription_plans ADD COLUMN price_usd INTEGER;
  END IF;
END $$;

-- Update existing plans with USD equivalent prices (example conversion rate: 1 INR = 0.012 USD)
-- This sets price_usd to approximately price * 0.012, converted to cents
UPDATE public.subscription_plans
SET price_usd = ROUND(price * 0.012)
WHERE price_usd IS NULL;

-- Comment: The above conversion is just an example. In a production environment, 
-- you might want to use a currency conversion API or manually set precise USD values. 