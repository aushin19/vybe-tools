import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { runDatabaseDiagnostics } from '@/lib/supabase/debug';

export async function GET() {
  try {
    // Get Supabase server client
    const supabase = createClient();
    
    // Check if the user has admin access
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized. You must be logged in to view database status.' },
        { status: 401 }
      );
    }
    
    // Run database diagnostics
    const diagnostics = await runDatabaseDiagnostics(supabase);
    
    return NextResponse.json(diagnostics);
  } catch (error) {
    console.error('Error checking database status:', error);
    return NextResponse.json(
      { error: 'Failed to check database status' },
      { status: 500 }
    );
  }
} 