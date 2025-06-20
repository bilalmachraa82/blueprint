import { NextResponse } from 'next/server';
import { getNeonClient } from '@/lib/db/neon-client';

export async function GET() {
  try {
    const sql = getNeonClient();
    
    // Test 1: Basic connection
    const test1 = await sql`SELECT 1 as test`;
    
    // Test 2: Get all projects
    const projects = await sql`
      SELECT id, name, description, "createdAt"
      FROM "Project"
      ORDER BY "createdAt" DESC
      LIMIT 10
    `;
    
    // Test 3: Get organizations
    const orgs = await sql`
      SELECT id, name 
      FROM "Organization"
      LIMIT 5
    `;
    
    return NextResponse.json({
      status: 'success',
      tests: {
        connection: test1[0].test === 1 ? 'OK' : 'Failed',
        projectCount: projects.length,
        orgCount: orgs.length
      },
      projects: projects,
      organizations: orgs
    });
  } catch (error) {
    console.error('Test projects error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to test projects',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}