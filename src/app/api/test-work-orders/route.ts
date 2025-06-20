import { NextResponse } from 'next/server';
import { getNeonClient } from '@/lib/db/neon-client';

export async function GET() {
  try {
    const sql = getNeonClient();
    
    // Test 1: Basic connection
    const test1 = await sql`SELECT 1 as test`;
    
    // Test 2: Count work orders
    const count = await sql`
      SELECT COUNT(*)::int as count 
      FROM "WorkOrder"
    `;
    
    // Test 3: Get sample work orders
    const workOrders = await sql`
      SELECT 
        wo.id, 
        wo.code, 
        wo.title, 
        wo.status,
        wo."projectId",
        p.name as "projectName"
      FROM "WorkOrder" wo
      LEFT JOIN "Project" p ON wo."projectId" = p.id
      LIMIT 5
    `;
    
    return NextResponse.json({
      status: 'success',
      tests: {
        connection: test1[0].test === 1 ? 'OK' : 'Failed',
        workOrderCount: count[0].count,
      },
      workOrders: workOrders
    });
  } catch (error) {
    console.error('Test work orders error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to test work orders',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}