import Link from "next/link";
import { Button } from "@/components/ui/button";
import { stackServerApp } from "@/lib/auth/stack-server";
import { redirect } from "next/navigation";

export default async function Home() {
  // Check if user is authenticated on the server
  let user = null;
  try {
    user = await stackServerApp.getUser();
  } catch (error) {
    // User not authenticated, show landing page
  }
  
  // If user exists, redirect to dashboard
  if (user) {
    redirect("/dashboard");
  }

  // Show landing page if not logged in
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="text-center space-y-6">
        <h1 className="text-6xl font-bold">Blueprint Pro</h1>
        <p className="text-2xl text-gray-600">Professional Work Order Management</p>
        
        <div className="space-x-4 pt-8">
          <Link href="/auth/signin">
            <Button size="lg">Sign In</Button>
          </Link>
          <Link href="/auth/signup">
            <Button size="lg" variant="outline">Sign Up</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}