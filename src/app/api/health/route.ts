import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ 
    status: 'ok',
    timestamp: new Date().toISOString(),
    env: {
      hasStackProjectId: !!process.env.NEXT_PUBLIC_STACK_PROJECT_ID,
      hasStackServerKey: !!process.env.STACK_SECRET_SERVER_KEY,
      hasDatabaseUrl: !!process.env.DATABASE_URL,
    }
  });
}