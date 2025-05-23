-- 05_helper_functions.sql
-- Contains helper functions for database management and debugging

-- Function to check if a table exists
CREATE OR REPLACE FUNCTION check_table_exists(table_name TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = table_name
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if RLS is enabled for a table
CREATE OR REPLACE FUNCTION check_rls_enabled(table_name TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = table_name
    AND rowsecurity = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get policies for a table
CREATE OR REPLACE FUNCTION get_table_policies(table_name TEXT)
RETURNS JSONB AS $$
DECLARE
  policies JSONB;
BEGIN
  SELECT json_agg(
    json_build_object(
      'policyName', polname,
      'definition', pg_get_expr(polqual, polrelid)
    )
  )::jsonb INTO policies
  FROM pg_policy
  WHERE polrelid = ('public.' || table_name)::regclass;
  
  RETURN COALESCE(policies, '[]'::jsonb);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to execute arbitrary SQL (admin only)
CREATE OR REPLACE FUNCTION run_sql(sql_query TEXT)
RETURNS VOID AS $$
BEGIN
  -- This function should only be callable by admin users
  -- or in a secure server environment
  IF auth.role() = 'service_role' OR auth.role() = 'supabase_admin' THEN
    EXECUTE sql_query;
  ELSE
    RAISE EXCEPTION 'Permission denied. Only admins can run arbitrary SQL.';
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if the entire database setup is correct
CREATE OR REPLACE FUNCTION check_database_setup()
RETURNS JSONB AS $$
DECLARE
  all_tables TEXT[] := ARRAY['users', 'subscription_plans', 'subscriptions', 'payments', 'invoices'];
  result JSONB := '{}'::jsonb;
  table_exists BOOLEAN;
  rls_enabled BOOLEAN;
  table_result JSONB;
  all_complete BOOLEAN := TRUE;
BEGIN
  -- Check each table
  FOR i IN 1..array_length(all_tables, 1) LOOP
    -- Check if table exists
    SELECT check_table_exists(all_tables[i]) INTO table_exists;
    
    -- Check if RLS is enabled
    SELECT check_rls_enabled(all_tables[i]) INTO rls_enabled;
    
    -- Build result for this table
    table_result := json_build_object(
      'exists', table_exists,
      'rlsEnabled', rls_enabled
    );
    
    -- Add to overall result
    result := result || json_build_object(all_tables[i], table_result);
    
    -- Update completion status
    IF NOT table_exists OR NOT rls_enabled THEN
      all_complete := FALSE;
    END IF;
  END LOOP;
  
  -- Add overall status
  result := result || json_build_object('complete', all_complete);
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to repair common database issues
CREATE OR REPLACE FUNCTION repair_database_setup()
RETURNS JSONB AS $$
DECLARE
  result JSONB := '{}'::jsonb;
  fixed_count INTEGER := 0;
BEGIN
  -- This function should only be callable by admin users
  IF NOT (auth.role() = 'service_role' OR auth.role() = 'supabase_admin') THEN
    RETURN json_build_object('success', FALSE, 'message', 'Permission denied. Only admins can repair the database.');
  END IF;
  
  -- Enable RLS on tables if it's disabled
  FOR table_name IN
    SELECT tablename FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename IN ('users', 'subscription_plans', 'subscriptions', 'payments', 'invoices')
    AND rowsecurity = false
  LOOP
    EXECUTE 'ALTER TABLE public.' || table_name || ' ENABLE ROW LEVEL SECURITY';
    fixed_count := fixed_count + 1;
  END LOOP;
  
  -- Return result
  RETURN json_build_object(
    'success', TRUE,
    'message', 'Repair complete. Fixed ' || fixed_count || ' issues.'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 