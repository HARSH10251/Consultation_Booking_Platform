"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  Calendar,
  Clock,
  Home,
  Plus,
  Search,
  Stethoscope,
  User,
} from "lucide-react";

export function MobileNav() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const user = session?.user;

  // Don't render on login or register pages
  if (pathname.startsWith("/login") || pathname.startsWith("/register")) {
    return null;
  }

  const role = user?.role || "patient";
  const dashboardLink =
    role === "doctor"
      ? "/doctor/dashboard"
      : role === "admin"
      ? "/admin/dashboard"
      : "/dashboard";

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 glass-panel border-t border-border/50 px-4 py-2 pb-5 backdrop-blur-lg">
      <div className="flex items-center justify-around relative">
        <Link
          href="/"
          className={`flex flex-col items-center text-[10px] font-semibold transition-colors ${
            pathname === "/" ? "text-primary" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Home className="w-5 h-5 mb-0.5" />
          <span>Home</span>
        </Link>

        <Link
          href="/doctors"
          className={`flex flex-col items-center text-[10px] font-semibold transition-colors ${
            pathname.startsWith("/doctors")
              ? "text-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Search className="w-5 h-5 mb-0.5" />
          <span>Search</span>
        </Link>

        {/* Center Floating FAB */}
        <Link
          href="/doctors"
          className="flex items-center justify-center -mt-6 w-12 h-12 rounded-full bg-gradient-to-tr from-primary to-blue-500 text-white shadow-lg shadow-primary/30 hover:scale-105 active:scale-95 transition-transform"
          aria-label="Book appointment"
        >
          <Plus className="w-6 h-6" />
        </Link>

        <Link
          href="/waitlist"
          className={`flex flex-col items-center text-[10px] font-semibold transition-colors ${
            pathname.startsWith("/waitlist")
              ? "text-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Clock className="w-5 h-5 mb-0.5" />
          <span>Waitlist</span>
        </Link>

        <Link
          href={user ? dashboardLink : "/login"}
          className={`flex flex-col items-center text-[10px] font-semibold transition-colors ${
            pathname.includes("dashboard")
              ? "text-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <User className="w-5 h-5 mb-0.5" />
          <span>{user ? "Portal" : "Sign In"}</span>
        </Link>
      </div>
    </nav>
  );
}
