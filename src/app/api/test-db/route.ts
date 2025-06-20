import { NextResponse } from 'next/server';
import { getNeonClient } from '@/lib/db/neon-client';

export async function GET() {
  try {
    console.log('Testing database connection...');
    console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);
    
    // Use Neon client directly as a workaround for Prisma client issues in WSL
    const sql = getNeonClient();
    
    // Test database connection
    const result = await sql`SELECT NOW() as current_time`;
    
    // Count tables
    const tableCount = await sql`
      SELECT COUNT(*) as count 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;
    
    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      data: {
        currentTime: result[0].current_time,
        tableCount: tableCount[0].count,
        connectionType: 'neon-direct'
      }
    });
  } catch (error) {
    console.error('Database connection error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Database connection failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        env: {
          hasDatabaseUrl: !!process.env.DATABASE_URL,
          nodeEnv: process.env.NODE_ENV
        }
      },
      { status: 500 }
    );
  }
}