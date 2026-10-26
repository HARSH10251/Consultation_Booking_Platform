"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { ThemeToggle } from "./ThemeToggle";
import { Activity, Calendar, Clock, LogOut, ShieldCheck, Stethoscope, User, Users } from "lucide-react";

export function Navbar() {
  const { data: session } = useSession();
  const user = session?.user;

  return (
    <header className="sticky top-0 z-50 w-full glass-panel border-b border-border/40 transition-colors">
      <div className="container flex h-16 items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-blue-400 flex items-center justify-center text-white shadow-md shadow-primary/25 group-hover:scale-105 transition-transform">
            <Activity className="w-5 h-5" />
          </div>
          <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent">
            CareSlot
          </span>
        </Link>

        {/* Center Nav Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          <Link
            href="/doctors"
            className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5"
          >
            <Stethoscope className="w-4 h-4" />
            Find Doctors
          </Link>

          {user?.role === "patient" && (
            <>
              <Link
                href="/dashboard"
                className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5"
              >
                <Calendar className="w-4 h-4" />
                My Appointments
              </Link>
              <Link
                href="/waitlist"
                className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5"
              >
                <Clock className="w-4 h-4" />
                Live Waitlist
              </Link>
            </>
          )}

          {user?.role === "doctor" && (
            <>
              <Link
                href="/doctor/dashboard"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Dashboard
              </Link>
              <Link
                href="/doctor/queue"
                className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5"
              >
                <Clock className="w-4 h-4 text-emerald-500 animate-pulse" />
                Live Queue
              </Link>
              <Link
                href="/doctor/schedule"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Schedule Matrix
              </Link>
            </>
          )}

          {user?.role === "admin" && (
            <>
              <Link
                href="/admin/dashboard"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Overview
              </Link>
              <Link
                href="/admin/doctors"
                className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5"
              >
                <Users className="w-4 h-4" />
                Doctors
              </Link>
              <Link
                href="/admin/evaluator"
                className="text-amber-500 hover:text-amber-600 transition-colors font-semibold flex items-center gap-1.5"
              >
                <ShieldCheck className="w-4 h-4" />
                Evaluator Panel
              </Link>
            </>
          )}
        </nav>

        {/* Right side / Auth */}
        <div className="flex items-center gap-3">
          <ThemeToggle />

          {user ? (
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-sm font-semibold leading-none">{user.name}</span>
                <span className="text-xs text-muted-foreground capitalize font-mono mt-0.5">
                  {user.role}
                </span>
              </div>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="p-2 rounded-xl bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="px-4 py-2 text-sm font-medium rounded-xl hover:bg-secondary transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="px-4 py-2 text-sm font-medium rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 shadow-md shadow-primary/20 transition-all hover:scale-105"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
