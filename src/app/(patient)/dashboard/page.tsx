"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import {
  Calendar,
  Clock,
  FileText,
  Heart,
  PlusCircle,
  Search,
  Sparkles,
  Stethoscope,
  TrendingUp,
  User,
} from "lucide-react";

export default function PatientDashboard() {
  const { data: session } = useSession();
  const user = session?.user;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1 container py-8 max-w-7xl">
        {/* Welcome Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">
              Hello, {user?.name || "Patient"} 👋
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Welcome to your personal health hub. View your appointments, waitlists, and records.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/doctors"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm shadow-md shadow-primary/20 hover:bg-primary/90 transition-all hover:scale-105"
            >
              <PlusCircle className="w-4 h-4" />
              Book Appointment
            </Link>
          </div>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {/* Card 1: Next Upcoming Visit (Spans 2 cols) */}
          <div className="md:col-span-2 glass-panel p-6 rounded-3xl border border-border/60 shadow-sm relative overflow-hidden flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary">
                <Calendar className="w-4 h-4" />
                <span>Next Upcoming Visit</span>
              </div>
              <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                Confirmed & Paid
              </span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-4 my-2">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-500 to-indigo-600 text-white flex items-center justify-center font-bold text-xl shadow-md">
                AM
              </div>
              <div>
                <h3 className="font-bold text-lg">Dr. Arvind Mehta</h3>
                <p className="text-sm text-muted-foreground">Cardiology • Exam Room 2</p>
                <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1 font-medium text-foreground">
                    <Calendar className="w-3.5 h-3.5 text-primary" /> Tomorrow
                  </span>
                  <span className="flex items-center gap-1 font-medium text-foreground">
                    <Clock className="w-3.5 h-3.5 text-primary" /> 10:00 AM - 10:30 AM
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-border/50 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-xl">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Doctor is on schedule (Estimated delay: 0 min)</span>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  href="/bookings"
                  className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-secondary hover:bg-secondary/80 transition-colors"
                >
                  View Details & Pass
                </Link>
              </div>
            </div>
          </div>

          {/* Card 2: Smart Waitlist Engine Tracker */}
          <div className="glass-panel p-6 rounded-3xl border border-border/60 shadow-sm relative overflow-hidden flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-500">
                  <Clock className="w-4 h-4" />
                  <span>Smart Waitlist</span>
                </div>
                <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-amber-500/10 text-amber-500">
                  Active Hold
                </span>
              </div>

              <h4 className="font-bold text-base mt-2">Dr. Ananya Roy</h4>
              <p className="text-xs text-muted-foreground">Dermatology • Morning slot requested</p>

              {/* Mini Queue Tracker */}
              <div className="mt-4 p-3 rounded-2xl bg-secondary/50 border border-border/40">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-muted-foreground">Queue Position:</span>
                  <span className="font-bold text-primary">#1 in line</span>
                </div>
                <div className="w-full bg-background rounded-full h-2 overflow-hidden">
                  <div className="bg-primary h-2 rounded-full w-4/5" />
                </div>
                <p className="text-[11px] text-muted-foreground mt-2">
                  High chance of offer if cancellation happens!
                </p>
              </div>
            </div>

            <Link
              href="/waitlist"
              className="mt-4 text-xs font-semibold text-primary hover:underline flex items-center justify-between"
            >
              <span>Manage Waitlist Entry</span>
              <span>→</span>
            </Link>
          </div>

          {/* Card 3: Quick Action Search */}
          <div className="glass-panel p-6 rounded-3xl border border-border/60 shadow-sm flex flex-col justify-between bg-gradient-to-br from-primary/5 via-transparent to-transparent">
            <div>
              <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-3">
                <Search className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-base">Find Specialists</h4>
              <p className="text-xs text-muted-foreground mt-1">
                Search by symptoms like chest pain, acne, or migraine.
              </p>
            </div>
            <Link
              href="/doctors"
              className="mt-4 w-full py-2.5 rounded-xl bg-secondary hover:bg-secondary/80 font-medium text-xs text-center transition-colors block"
            >
              Browse 12 Verified Doctors
            </Link>
          </div>

          {/* Card 4: Prescription & Records */}
          <div className="md:col-span-2 glass-panel p-6 rounded-3xl border border-border/60 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                <FileText className="w-4 h-4" />
                <span>Recent Prescriptions & Invoices</span>
              </div>
              <Link href="/bookings" className="text-xs text-primary font-medium hover:underline">
                View all
              </Link>
            </div>

            <div className="space-y-3">
              <div className="p-3 rounded-2xl bg-secondary/40 border border-border/40 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-sm font-semibold">General Health Review & Blood Panel</h5>
                    <p className="text-xs text-muted-foreground">Dr. Siddharth Sen • Completed 2 weeks ago</p>
                  </div>
                </div>
                <span className="text-xs px-2.5 py-1 rounded-lg bg-background font-mono border border-border/40">
                  Receipt #CS-9102
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-secondary/40 border border-border/40 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center">
                    <Heart className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-sm font-semibold">ECG & Cardiology Follow-up</h5>
                    <p className="text-xs text-muted-foreground">Dr. Arvind Mehta • Completed last month</p>
                  </div>
                </div>
                <span className="text-xs px-2.5 py-1 rounded-lg bg-background font-mono border border-border/40">
                  Receipt #CS-8441
                </span>
              </div>
            </div>
          </div>

          {/* Card 5: Health Profile & Family */}
          <div className="md:col-span-2 glass-panel p-6 rounded-3xl border border-border/60 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                <User className="w-4 h-4" />
                <span>Dependents & Family Booking</span>
              </div>
              <span className="text-xs text-muted-foreground">Family Access Active</span>
            </div>

            <p className="text-sm text-muted-foreground">
              Book consultations for your parents, spouse, or children under your primary account with single-click checkout.
            </p>

            <div className="mt-4 flex items-center gap-3">
              <span className="px-3 py-1.5 rounded-xl bg-secondary text-xs font-medium">Self (Rohan)</span>
              <span className="px-3 py-1.5 rounded-xl bg-secondary/60 text-xs text-muted-foreground">Spouse (Priya)</span>
              <span className="px-3 py-1.5 rounded-xl bg-secondary/60 text-xs text-muted-foreground">+ Add Dependent</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
