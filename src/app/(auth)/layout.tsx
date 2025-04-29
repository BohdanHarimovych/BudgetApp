import React from 'react';
import Link from 'next/link';
import { requireGuest } from '@/lib/supabase/server';

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // This will automatically redirect to /dashboard if the user is already authenticated
  // This check happens server-side, before any client component rendering
  await requireGuest();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-12">
      <div className="mb-6 w-full max-w-md text-center">
        <Link href="/" className="text-2xl font-bold">
          Expense Tracker
        </Link>
      </div>
      <div className="w-full max-w-md px-6">
        {children}
      </div>
    </div>
  );
}