import { NextRequest, NextResponse } from 'next/server';
import { stackServerApp } from '@/lib/auth/stack-server';

export async function GET(request: NextRequest) {
  try {
    // Test 1: Check if Stack Auth is configured
    const config = {
      hasProjectId: !!process.env.NEXT_PUBLIC_STACK_PROJECT_ID,
      hasPublishableKey: !!process.env.NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY,
      hasServerKey: !!process.env.STACK_SECRET_SERVER_KEY,
    };
    
    // Test 2: Try to get user
    let userTest = { status: 'not tested', user: null, error: null };
    try {
      const user = await stackServerApp.getUser({ 
        tokenStore: request, 
        or: 'return-null' 
      });
      userTest = {
        status: user ? 'authenticated' : 'not authenticated',
        user: user ? { id: user.id, email: user.primaryEmail } : null,
        error: null
      };
    } catch (error) {
      userTest = {
        status: 'error',
        user: null,
        error: error instanceof Error ? error.message : String(error)
      };
    }
    
    return NextResponse.json({
      status: 'success',
      config,
      auth: userTest,
      headers: {
        hasAuthHeader: !!request.headers.get('authorization'),
        hasCookie: !!request.cookies.get('stack-auth')
      }
    });
  } catch (error) {
    console.error('Test auth error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to test auth',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}