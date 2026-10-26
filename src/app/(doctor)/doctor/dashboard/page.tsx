"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import {
  Activity,
  Calendar,
  CheckCircle2,
  Clock,
  DollarSign,
  Play,
  Settings,
  Sparkles,
  TrendingUp,
  UserCheck,
  Users,
} from "lucide-react";

export default function DoctorDashboard() {
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
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary">
                Cardiology Specialist
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-secondary text-muted-foreground">
                Exam Room 2
              </span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight">
              Dr. {user?.name || "Practitioner"}
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Here is your clinic timeline and patient queue for today.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/doctor/queue"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-semibold text-sm shadow-md shadow-emerald-600/25 hover:bg-emerald-700 transition-all hover:scale-105"
            >
              <Clock className="w-4 h-4 animate-pulse" />
              Open Live Queue
            </Link>
          </div>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {/* Card 1: Today's Consultations Overview */}
          <div className="md:col-span-2 glass-panel p-6 rounded-3xl border border-border/60 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Today&apos;s Appointments
              </span>
              <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full">
                4 Patients Completed
              </span>
            </div>

            <div className="grid grid-cols-3 gap-4 my-2">
              <div className="p-4 rounded-2xl bg-secondary/50 border border-border/40">
                <span className="text-xs text-muted-foreground">Total Booked</span>
                <p className="text-2xl font-black mt-1">11</p>
              </div>
              <div className="p-4 rounded-2xl bg-secondary/50 border border-border/40">
                <span className="text-xs text-muted-foreground">In Waiting Room</span>
                <p className="text-2xl font-black text-amber-500 mt-1">2</p>
              </div>
              <div className="p-4 rounded-2xl bg-secondary/50 border border-border/40">
                <span className="text-xs text-muted-foreground">Current Status</span>
                <p className="text-sm font-bold text-emerald-600 mt-2">On Track</p>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-border/50 flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                Current Delay: <strong className="text-foreground">+0 mins</strong>
              </span>
              <Link
                href="/doctor/queue"
                className="text-xs font-semibold text-primary hover:underline"
              >
                Launch Queue Controller →
              </Link>
            </div>
          </div>

          {/* Card 2: Daily Earnings Ledger */}
          <div className="glass-panel p-6 rounded-3xl border border-border/60 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Today&apos;s Revenue
                </span>
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                  <DollarSign className="w-4 h-4" />
                </div>
              </div>
              <h3 className="text-3xl font-black tracking-tight">₹13,200</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Net earned from 11 verified Razorpay bookings
              </p>
            </div>

            <div className="mt-4 p-3 rounded-2xl bg-secondary/50 border border-border/40">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Consultation Fee</span>
                <span className="font-bold">₹1,200 / visit</span>
              </div>
              <div className="flex items-center justify-between text-xs mt-1.5">
                <span className="text-muted-foreground">Payout Status</span>
                <span className="text-emerald-600 font-semibold">Ready for EOD</span>
              </div>
            </div>
          </div>

          {/* Card 3: Waitlist Pressure */}
          <div className="glass-panel p-6 rounded-3xl border border-border/60 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-500">
                  Waitlist Engine
                </span>
                <Sparkles className="w-4 h-4 text-amber-500" />
              </div>
              <h3 className="text-2xl font-black">4 Patients</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Currently waiting for tomorrow&apos;s cancellations
              </p>
            </div>

            <div className="mt-4 text-xs text-muted-foreground">
              Auto-fill rate: <strong className="text-foreground">100%</strong> of cancellations auto-filled via cascading holds.
            </div>
          </div>

          {/* Card 4: Next Patient Up (Spans 2 cols) */}
          <div className="md:col-span-2 glass-panel p-6 rounded-3xl border border-border/60 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-primary">
                Next in Line
              </span>
              <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-blue-500/10 text-blue-600">
                Check-in Verified
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-lg">Aarav Patel (Age 42)</h4>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Symptoms: Occasional palpitation and shortness of breath after meals
                </p>
                <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                  <span>Scheduled: <strong>10:30 AM</strong></span>
                  <span>Check-In Code: <strong className="font-mono text-primary">CS-4821</strong></span>
                </div>
              </div>

              <Link
                href="/doctor/queue"
                className="px-4 py-2 rounded-xl bg-primary text-white font-semibold text-xs flex items-center gap-1.5 shadow-md shadow-primary/20 hover:bg-primary/90 transition-transform hover:scale-105"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                Start Visit
              </Link>
            </div>
          </div>

          {/* Card 5: Schedule Matrix Shortcut */}
          <div className="md:col-span-2 glass-panel p-6 rounded-3xl border border-border/60 shadow-sm flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Settings className="w-4 h-4 text-muted-foreground" />
                <h4 className="font-bold text-base">Weekly Schedule Matrix</h4>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Configure 30-day rolling availability, slot durations (15-60m), and break windows.
              </p>
            </div>
            <Link
              href="/doctor/schedule"
              className="px-4 py-2 rounded-xl bg-secondary hover:bg-secondary/80 text-xs font-semibold transition-colors"
            >
              Edit Matrix →
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
