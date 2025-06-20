import { stackServerApp } from "@/lib/auth/stack-server";
import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  // Skip auth for public paths
  const publicPaths = [
    "/",
    "/auth",
    "/handler",
    "/api/test-db",
    "/_next",
    "/favicon.ico"
  ];
  
  const isPublicPath = publicPaths.some(path => 
    request.nextUrl.pathname.startsWith(path)
  );

  if (isPublicPath) {
    return NextResponse.next();
  }

  try {
    const user = await stackServerApp.getUser({ tokenStore: request, or: "anonymous-if-exists" });
    
    if (!user) {
      // Redirect to sign in if not authenticated
      const signInUrl = new URL("/auth/signin", request.url);
      signInUrl.searchParams.set("redirect", request.nextUrl.pathname);
      return NextResponse.redirect(signInUrl);
    }

    return NextResponse.next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    // Allow access if auth check fails (for development)
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)",
  ],
};