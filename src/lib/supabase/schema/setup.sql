-- setup.sql
-- Master script that runs all individual table creation scripts
-- Use this in the Supabase SQL Editor to set up the entire database schema

-- 00. Create users table and related functions
\i 00_users_table.sql

-- 01. Create subscription_plans table
\i 01_subscription_plans_table.sql

-- 02. Create subscriptions table
\i 02_subscriptions_table.sql

-- 03. Create payments table
\i 03_payments_table.sql

-- 04. Create invoices table
\i 04_invoices_table.sql

-- 05. Create helper functions
\i 05_helper_functions.sql

-- Verify setup by counting records in each table
SELECT 'users' as table_name, COUNT(*) FROM public.users
UNION
SELECT 'subscription_plans' as table_name, COUNT(*) FROM public.subscription_plans
UNION
SELECT 'subscriptions' as table_name, COUNT(*) FROM public.subscriptions
UNION
SELECT 'payments' as table_name, COUNT(*) FROM public.payments
UNION
SELECT 'invoices' as table_name, COUNT(*) FROM public.invoices
ORDER BY table_name; 