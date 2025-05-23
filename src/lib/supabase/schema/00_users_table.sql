-- 00_users_table.sql
-- This script creates the users table and sets up RLS policies

-- Check if the table exists before creating it
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'users') THEN
    -- Create the users table
    CREATE TABLE public.users (
      id UUID REFERENCES auth.users(id) PRIMARY KEY,
      email TEXT NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
      full_name TEXT,
      avatar_url TEXT,
      billing_address JSONB,
      phone_number TEXT,
      onboarding_completed BOOLEAN DEFAULT false
    );

    -- Set up RLS (Row Level Security)
    ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

    -- Create policy to allow users to view and update only their own data
    CREATE POLICY users_policy_select ON public.users
      FOR SELECT USING (auth.uid() = id);

    CREATE POLICY users_policy_update ON public.users
      FOR UPDATE USING (auth.uid() = id);

    -- Create a trigger to update the updated_at column
    CREATE OR REPLACE FUNCTION update_updated_at()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = now();
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

    CREATE TRIGGER users_updated_at_trigger
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

    -- Create a trigger to automatically create a user profile after sign-up
    CREATE OR REPLACE FUNCTION public.handle_new_user()
    RETURNS TRIGGER AS $$
    BEGIN
      INSERT INTO public.users (id, email, full_name)
      VALUES (
        NEW.id,
        NEW.email,
        NEW.raw_user_meta_data->>'full_name'
      );
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;

    -- Create the trigger for automatic profile creation
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
  END IF;
END $$; 