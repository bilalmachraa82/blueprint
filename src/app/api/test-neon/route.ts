import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

export async function GET() {
  try {
    // Check if DATABASE_URL exists
    if (!process.env.DATABASE_URL) {
      return NextResponse.json({
        error: 'DATABASE_URL not configured',
        env: {
          hasDatabase: false,
          nodeEnv: process.env.NODE_ENV
        }
      }, { status: 500 });
    }

    // Create Neon client
    const sql = neon(process.env.DATABASE_URL);
    
    // Test database connection
    const versionResult = await sql`SELECT version()`;
    const version = versionResult[0].version;
    
    // Get organization count
    const orgResult = await sql`SELECT COUNT(*) as count FROM "Organization"`;
    const orgCount = orgResult[0].count;
    
    // Get table list
    const tablesResult = await sql`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public'
      ORDER BY tablename
    `;
    const tables = tablesResult.map(t => t.tablename);
    
    return NextResponse.json({
      status: 'success',
      database: {
        connected: true,
        version: version,
        organizationCount: orgCount,
        tables: tables
      },
      env: {
        hasDatabase: true,
        nodeEnv: process.env.NODE_ENV
      }
    });
    
  } catch (error) {
    console.error('Neon test error:', error);
    return NextResponse.json({
      error: 'Database connection failed',
      details: error instanceof Error ? error.message : String(error),
      env: {
        hasDatabase: !!process.env.DATABASE_URL,
        nodeEnv: process.env.NODE_ENV
      }
    }, { status: 500 });
  }
}