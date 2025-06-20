import { NextResponse } from 'next/server';
import { stackServerApp } from '@/lib/auth/stack-server';
import { prisma } from '@/lib/db/prisma';

export async function GET() {
  try {
    // Test 1: Basic response
    console.log('Test API called');
    
    // Test 2: Stack Auth
    let authTest = 'Stack Auth not tested';
    try {
      const testUser = await stackServerApp.getUser({ or: 'return-null' });
      authTest = testUser ? `User found: ${testUser.id}` : 'No user logged in';
    } catch (e) {
      authTest = `Stack Auth error: ${e}`;
    }
    
    // Test 3: Database connection
    let dbTest = 'Database not tested';
    try {
      const count = await prisma.organization.count();
      dbTest = `Database connected. Organizations: ${count}`;
    } catch (e) {
      dbTest = `Database error: ${e}`;
    }
    
    return NextResponse.json({
      status: 'ok',
      authTest,
      dbTest,
      env: {
        hasStackProjectId: !!process.env.NEXT_PUBLIC_STACK_PROJECT_ID,
        hasStackPublishableKey: !!process.env.NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY,
        hasStackServerKey: !!process.env.STACK_SECRET_SERVER_KEY,
        hasDatabaseUrl: !!process.env.DATABASE_URL,
      }
    });
  } catch (error) {
    console.error('Test API error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}