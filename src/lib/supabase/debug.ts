import { SupabaseClient } from '@supabase/supabase-js';

// Types for table existence check results
interface TableExistenceResult {
  tableName: string;
  exists: boolean;
  recordCount?: number;
  error?: string;
}

// Types for RLS policy check results
interface RLSPolicyResult {
  tableName: string;
  enabled: boolean;
  policies: { policyName: string; definition: string }[];
  error?: string;
}

/**
 * Database debugging utility to check table existence and record counts
 */
export const checkTablesExistence = async (
  supabase: SupabaseClient
): Promise<TableExistenceResult[]> => {
  const tables = ['users', 'subscription_plans', 'subscriptions', 'payments', 'invoices'];
  const results: TableExistenceResult[] = [];

  for (const tableName of tables) {
    try {
      // Check if table exists
      const { data: tableExists, error: tableError } = await supabase.rpc(
        'check_table_exists',
        { table_name: tableName }
      );

      if (tableError) {
        results.push({
          tableName,
          exists: false,
          error: tableError.message,
        });
        continue;
      }

      if (!tableExists) {
        results.push({
          tableName,
          exists: false,
        });
        continue;
      }

      // Count records if table exists
      const { count, error: countError } = await supabase
        .from(tableName)
        .select('*', { count: 'exact', head: true });

      if (countError) {
        results.push({
          tableName,
          exists: true,
          error: `Table exists but error counting records: ${countError.message}`,
        });
        continue;
      }

      results.push({
        tableName,
        exists: true,
        recordCount: count || 0,
      });
    } catch (error) {
      results.push({
        tableName,
        exists: false,
        error: `Error checking table: ${(error as Error).message}`,
      });
    }
  }

  return results;
};

/**
 * Check if RLS policies are properly set up for all tables
 */
export const checkRLSPolicies = async (
  supabase: SupabaseClient
): Promise<RLSPolicyResult[]> => {
  const tables = ['users', 'subscription_plans', 'subscriptions', 'payments', 'invoices'];
  const results: RLSPolicyResult[] = [];

  for (const tableName of tables) {
    try {
      // Check if RLS is enabled
      const { data: rlsEnabled, error: rlsError } = await supabase.rpc(
        'check_rls_enabled',
        { table_name: tableName }
      );

      if (rlsError) {
        results.push({
          tableName,
          enabled: false,
          policies: [],
          error: rlsError.message,
        });
        continue;
      }

      // Get policies for this table
      const { data: policies, error: policiesError } = await supabase.rpc(
        'get_table_policies',
        { table_name: tableName }
      );

      if (policiesError) {
        results.push({
          tableName,
          enabled: rlsEnabled,
          policies: [],
          error: policiesError.message,
        });
        continue;
      }

      results.push({
        tableName,
        enabled: rlsEnabled,
        policies: policies || [],
      });
    } catch (error) {
      results.push({
        tableName,
        enabled: false,
        policies: [],
        error: `Error checking RLS policies: ${(error as Error).message}`,
      });
    }
  }

  return results;
};

/**
 * Run database diagnostics and return a comprehensive report
 */
export const runDatabaseDiagnostics = async (
  supabase: SupabaseClient
): Promise<{
  tables: TableExistenceResult[];
  rlsPolicies: RLSPolicyResult[];
  status: 'ok' | 'warning' | 'error';
  message: string;
}> => {
  const tables = await checkTablesExistence(supabase);
  const rlsPolicies = await checkRLSPolicies(supabase);

  // Check if any critical issues were found
  const tableErrors = tables.filter(t => !t.exists || t.error);
  const rlsErrors = rlsPolicies.filter(
    r => !r.enabled || r.error || r.policies.length === 0
  );

  let status: 'ok' | 'warning' | 'error' = 'ok';
  let message = 'Database setup is complete and functioning correctly.';

  if (tableErrors.length > 0) {
    status = 'error';
    message = `Database issues detected: ${tableErrors.length} tables are missing or have errors.`;
  } else if (rlsErrors.length > 0) {
    status = 'warning';
    message = `RLS policy issues detected: ${rlsErrors.length} tables have RLS issues.`;
  }

  return {
    tables,
    rlsPolicies,
    status,
    message,
  };
};

/**
 * A function to automatically run database fixes for common issues
 */
export const runDatabaseFixes = async (
  supabase: SupabaseClient
): Promise<{ success: boolean; message: string }> => {
  try {
    // Call Supabase function that runs the fix scripts
    const { data, error } = await supabase.rpc('repair_database_setup');

    if (error) {
      return {
        success: false,
        message: `Failed to run database fixes: ${error.message}`,
      };
    }

    return {
      success: true,
      message: 'Database fixes applied successfully. Please run diagnostics again to verify.',
    };
  } catch (error) {
    return {
      success: false,
      message: `Error running database fixes: ${(error as Error).message}`,
    };
  }
}; 