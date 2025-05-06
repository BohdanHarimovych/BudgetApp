"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/theme-provider";
import { Menu, X } from "lucide-react";

const navItems = [
  { name: "Dashboard", href: "/dashboard" },
  { name: "Transactions", href: "/transactions" },
  { name: "Upload", href: "/upload" },
];

export function Header() {
  const { user, signOut, isLoading } = useAuth();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 10);
    }
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 w-full z-50 transition-all ${
        scrolled ? "shadow-md backdrop-blur-sm h-14" : "h-16"
      } bg-background border-b`}
    >
      <div className="flex items-center justify-between h-full px-4 max-w-7xl mx-auto">
        {/* Left: Brand */}
        <Link href="/" className="text-xl font-bold tracking-tight">
          <span className="text-primary">Expense</span>Tracker
        </Link>

        {/* Center: Navigation (Desktop) */}
        <nav className="hidden md:flex items-center gap-6">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`text-sm font-medium transition-colors ${
                pathname === item.href
                  ? "text-primary underline underline-offset-4"
                  : "text-muted-foreground hover:text-primary"
              }`}
            >
              {item.name}
            </Link>
          ))}
        </nav>

        {/* Right: User/Auth Controls */}
        <div className="hidden md:flex items-center gap-4">
          {!isLoading && user ? (
            <>
              <div className="text-sm text-muted-foreground">{user.email}</div>
              <Button variant="outline" size="sm" onClick={signOut}>
                Sign Out
              </Button>
            </>
          ) : (
            <Link href="/login">
              <Button size="sm">Sign In</Button>
            </Link>
          )}
          <ModeToggle />
        </div>

        {/* Mobile: Menu Button */}
        <button
          className="md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile: Menu Panel */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-background border-t shadow-md">
          <nav className="flex flex-col p-4 gap-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`text-sm font-medium py-2 px-3 rounded-md transition-colors ${
                  pathname === item.href
                    ? "bg-primary/10 text-primary"
                    : "hover:bg-muted"
                }`}
              >
                {item.name}
              </Link>
            ))}

            <div className="border-t mt-2 pt-2 flex flex-col gap-2">
              {!isLoading && user ? (
                <>
                  <div className="text-sm text-muted-foreground">{user.email}</div>
                  <Button variant="outline" size="sm" onClick={signOut}>
                    Sign Out
                  </Button>
                </>
              ) : (
                <Link href="/login">
                  <Button size="sm" className="w-full">
                    Sign In
                  </Button>
                </Link>
              )}
              <ModeToggle />
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
