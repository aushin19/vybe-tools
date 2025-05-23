import { createClient } from '../server';
import fs from 'fs';
import path from 'path';

/**
 * This script helps set up the database schema for the project
 * It can be executed server-side to run all the SQL scripts
 */
export async function setupDatabaseSchema() {
  console.log('Starting database schema setup...');
  
  try {
    // Get Supabase server client
    const supabase = createClient();
    
    // Read SQL files from the schema directory
    const schemaDir = path.join(process.cwd(), 'src', 'lib', 'supabase', 'schema');
    const sqlFiles = fs.readdirSync(schemaDir)
      .filter(file => file.endsWith('.sql') && !file.startsWith('setup'))
      .sort(); // Ensure files are processed in order

    console.log(`Found ${sqlFiles.length} SQL files to process`);
    
    // Process each SQL file
    for (const file of sqlFiles) {
      console.log(`Processing ${file}...`);
      const sqlContent = fs.readFileSync(path.join(schemaDir, file), 'utf8');
      
      // Execute the SQL content
      const { error } = await supabase.rpc('run_sql', { sql_query: sqlContent });
      
      if (error) {
        console.error(`Error executing ${file}:`, error);
        throw new Error(`Database setup failed at ${file}: ${error.message}`);
      }
      
      console.log(`Successfully processed ${file}`);
    }
    
    console.log('Database schema setup complete.');
    return { success: true, message: 'Database schema setup complete' };
  } catch (error) {
    console.error('Error setting up database schema:', error);
    return { 
      success: false, 
      message: `Database schema setup failed: ${(error as Error).message}` 
    };
  }
}

// Helper to check if all tables are set up correctly
export async function checkDatabaseSetup() {
  try {
    const supabase = createClient();
    
    // Check if all tables exist
    const { data, error } = await supabase.rpc('check_database_setup');
    
    if (error) {
      throw error;
    }
    
    return {
      success: true,
      data,
      message: 'Database setup check complete',
    };
  } catch (error) {
    return {
      success: false,
      message: `Database setup check failed: ${(error as Error).message}`,
    };
  }
}

// Only run if this script is executed directly
if (require.main === module) {
  (async () => {
    const result = await setupDatabaseSchema();
    console.log(result);
    process.exit(result.success ? 0 : 1);
  })();
} 