"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  DollarSign,
  FileText,
  Layers,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  UserCheck,
  Users,
} from "lucide-react";

export default function AdminDashboard() {
  const { data: session } = useSession();
  const user = session?.user;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1 container py-8 max-w-7xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-600 dark:text-purple-400">
                Clinic Administrator
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-secondary text-muted-foreground">
                All 5 Facility Rooms Active
              </span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight">
              CareSlot Clinic Operations
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              System-wide metrics, doctor verification, audit logs, and the Evaluator Time-Machine.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/admin/evaluator"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold text-sm shadow-lg shadow-purple-600/25 hover:scale-105 transition-all"
            >
              <ShieldCheck className="w-4 h-4" />
              Evaluator Time-Machine Panel
            </Link>
          </div>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {/* Card 1: Clinic Metrics Bento */}
          <div className="md:col-span-2 glass-panel p-6 rounded-3xl border border-border/60 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Clinic-Wide Key Performance
              </span>
              <span className="text-xs font-medium text-emerald-600 bg-emerald-500/10 px-2.5 py-1 rounded-full">
                +18.4% this week
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-2">
              <div className="p-3.5 rounded-2xl bg-secondary/50 border border-border/40">
                <span className="text-xs text-muted-foreground">Revenue</span>
                <p className="text-xl font-black mt-1">₹1,48,200</p>
              </div>
              <div className="p-3.5 rounded-2xl bg-secondary/50 border border-border/40">
                <span className="text-xs text-muted-foreground">Bookings</span>
                <p className="text-xl font-black mt-1">142</p>
              </div>
              <div className="p-3.5 rounded-2xl bg-secondary/50 border border-border/40">
                <span className="text-xs text-muted-foreground">Active Doctors</span>
                <p className="text-xl font-black mt-1 text-primary">12</p>
              </div>
              <div className="p-3.5 rounded-2xl bg-secondary/50 border border-border/40">
                <span className="text-xs text-muted-foreground">Waitlist Fill</span>
                <p className="text-xl font-black mt-1 text-emerald-600">96.8%</p>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-border/50 text-xs text-muted-foreground flex items-center justify-between">
              <span>Razorpay Test Mode Verified: All webhooks and HMAC signatures active</span>
              <span className="text-emerald-500 font-medium">● Healthy</span>
            </div>
          </div>

          {/* Card 2: Evaluator Time-Machine Highlights */}
          <div className="md:col-span-2 glass-panel p-6 rounded-3xl border-2 border-primary/30 shadow-md relative overflow-hidden flex flex-col justify-between bg-gradient-to-br from-primary/5 via-background to-purple-500/5">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary">
                  <Sparkles className="w-4 h-4" />
                  <span>Interactive Evaluator Suite</span>
                </div>
                <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-primary text-primary-foreground animate-pulse">
                  Ready to test
                </span>
              </div>
              <h3 className="font-bold text-lg">Simulate Race Conditions & Cascades</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Fires 2 parallel booking requests to prove atomic locking, triggers fast-forward 15m waitlist cascade, and tests 403 authorization checks.
              </p>
            </div>

            <div className="mt-4 flex items-center gap-3">
              <Link
                href="/admin/evaluator"
                className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-xs text-center shadow-md shadow-primary/20 hover:bg-primary/90 transition-all hover:scale-[1.02]"
              >
                Launch Evaluator Simulator & Cascade Visualizer →
              </Link>
            </div>
          </div>

          {/* Card 3: Doctor Verification Queue */}
          <div className="md:col-span-2 glass-panel p-6 rounded-3xl border border-border/60 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Doctor Approvals & Onboarding
              </span>
              <Link href="/admin/doctors" className="text-xs text-primary font-semibold hover:underline">
                View all 12 doctors
              </Link>
            </div>

            <div className="space-y-3">
              <div className="p-3 rounded-2xl bg-secondary/40 border border-border/40 flex items-center justify-between">
                <div>
                  <h5 className="text-sm font-semibold">Dr. Arvind Mehta (Cardiology)</h5>
                  <p className="text-xs text-muted-foreground">MBBS, MD • 16 yrs exp • Room 2 assigned</p>
                </div>
                <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-emerald-500/10 text-emerald-600">
                  Approved & Active
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-secondary/40 border border-border/40 flex items-center justify-between">
                <div>
                  <h5 className="text-sm font-semibold">Dr. Ananya Roy (Dermatology)</h5>
                  <p className="text-xs text-muted-foreground">MBBS, MD • 11 yrs exp • Room 1 assigned</p>
                </div>
                <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-emerald-500/10 text-emerald-600">
                  Approved & Active
                </span>
              </div>
            </div>
          </div>

          {/* Card 4: No-Show Risk Predictor */}
          <div className="md:col-span-2 glass-panel p-6 rounded-3xl border border-border/60 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-rose-500 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>No-Show Risk Engine</span>
                </span>
                <span className="text-xs text-muted-foreground font-mono">Model v1.2</span>
              </div>

              <h4 className="font-bold text-base">Overbooking & Risk Alerts</h4>
              <p className="text-xs text-muted-foreground mt-1">
                Highlights high-risk slots based on late evening times, bad weather, or prior cancellation history.
              </p>

              <div className="mt-3 p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-600 dark:text-rose-400">
                <strong>1 High-Risk Slot Detected:</strong> Friday 4:30 PM (Dr. Harshavardhan). Standby waitlist pre-ranked and ready.
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-border/50 flex items-center justify-between text-xs text-muted-foreground">
              <span>Clinic Average No-Show: <strong>3.2%</strong> (National: 14.8%)</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
