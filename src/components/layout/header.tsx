"use client";

import Link from "next/link";
import { useAuth } from "@/lib/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/theme-provider";

export function Header() {
  const { user, signOut, isLoading } = useAuth();
  
  console.log("[Header] Auth State:", { user, isLoading });

  return (
    <header className="border-b">
      <div className="container flex items-center justify-between h-16 px-4">
        <Link href="/" className="text-xl font-bold">
          Expense Tracker
        </Link>
        <nav className="flex items-center gap-4">
          {!isLoading && user ? (
            <>
              <div className="bg-primary/10 px-4 py-2 rounded-md">
                <p className="text-sm">
                  <span className="font-medium">{user.email}</span>
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={signOut}
              >
                Sign Out
              </Button>
            </>
          ) : (
            <Link href="/login">
              <Button size="sm">Sign In</Button>
            </Link>
          )}
          <ModeToggle />
        </nav>
      </div>
    </header>
  );
}
