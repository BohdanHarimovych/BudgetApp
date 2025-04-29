import Link from "next/link";
import { Button } from "@/components/ui/button";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function HomePage() {
  // Check authentication server-side
  const supabase = await createServerSupabaseClient();
  
  // Get and verify user session
  const { data: sessionData } = await supabase.auth.getSession();
  if (sessionData?.session) {
    // Verify user with getUser()
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (!userError && user) {
      redirect('/dashboard');
    }
  }

  // Otherwise show the home page for guests
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <h1 className="text-4xl font-bold">Expense Tracker</h1>
      <p className="mt-4">Track and manage your expenses easily</p>
      <div className="mt-8">
        <Link href="/login">
          <Button className="px-8 py-2">Sign In</Button>
        </Link>
      </div>
    </div>
  );
}