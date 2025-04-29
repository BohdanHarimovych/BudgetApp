import { Header } from "@/components/layout/header";
import { requireAuth } from "@/lib/supabase/server";

export default async function DashboardLayout({
    children,
  }: {
    children: React.ReactNode;
  }) {
    // This will automatically redirect to /login if the user isn't authenticated
    // This check happens server-side, before any client component rendering
    await requireAuth();

    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 p-6">{children}</main>
      </div>
    );
  }