"use client";

import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { CommandPalette } from "@/components/search/CommandPalette";
import { SpotlightCard } from "@/components/ui/SpotlightCard";
import {
  Activity,
  ArrowRight,
  Calendar,
  CheckCircle2,
  Clock,
  CreditCard,
  Heart,
  Lock,
  Play,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  TrendingUp,
  User,
  Users,
  Zap,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-background selection:bg-primary/20 selection:text-primary">
      <Navbar />
      <CommandPalette />

      <main className="flex-1">
        {/* HERO SECTION */}
        <section className="relative pt-12 pb-20 md:pt-20 md:pb-32 overflow-hidden aurora-bg">
          <div className="container relative z-10 max-w-6xl text-center">
            {/* Pill */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20 mb-6 shadow-sm animate-pulse-subtle">
              <Sparkles className="w-3.5 h-3.5" />
              <span>CareSlot 2026 • Clinic Platform with Smart Waitlist Engine</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-foreground max-w-4xl mx-auto leading-[1.08]">
              Never Lose a Slot. <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-primary via-blue-500 to-indigo-600 bg-clip-text text-transparent">
                Never Keep Patients Waiting.
              </span>
            </h1>

            {/* Subtitle */}
            <p className="mt-6 text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Book consultations instantly with verified doctors. When cancellations occur, our pure algorithmic waitlist engine offers the opening to the top-ranked patient within 15 minutes.
            </p>

            {/* CTA Group */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/doctors"
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-primary text-primary-foreground font-bold text-sm shadow-xl shadow-primary/25 hover:bg-primary/90 transition-all hover:scale-105 flex items-center justify-center gap-2 group"
              >
                <Stethoscope className="w-4 h-4" />
                <span>Find Doctors & Book Slots</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                href="/admin/evaluator"
                className="w-full sm:w-auto px-8 py-4 rounded-2xl glass-panel text-foreground font-bold text-sm border border-border/80 hover:bg-secondary/80 transition-all hover:scale-105 flex items-center justify-center gap-2"
              >
                <ShieldCheck className="w-4 h-4 text-amber-500" />
                <span>Launch Evaluator Suite</span>
              </Link>
            </div>

            {/* Quick Symptom Chips */}
            <div className="mt-10 pt-6 border-t border-border/40 max-w-xl mx-auto">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block mb-3">
                Quick Search by Symptom
              </span>
              <div className="flex flex-wrap items-center justify-center gap-2">
                <Link
                  href="/doctors?symptom=heart"
                  className="px-3.5 py-1.5 rounded-xl bg-secondary/60 hover:bg-secondary text-xs font-medium text-foreground transition-all hover:scale-105 flex items-center gap-1.5 border border-border/40"
                >
                  <Heart className="w-3.5 h-3.5 text-rose-500" /> Chest Pain
                </Link>
                <Link
                  href="/doctors?symptom=skin"
                  className="px-3.5 py-1.5 rounded-xl bg-secondary/60 hover:bg-secondary text-xs font-medium text-foreground transition-all hover:scale-105 flex items-center gap-1.5 border border-border/40"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Skin & Acne
                </Link>
                <Link
                  href="/doctors?symptom=child"
                  className="px-3.5 py-1.5 rounded-xl bg-secondary/60 hover:bg-secondary text-xs font-medium text-foreground transition-all hover:scale-105 flex items-center gap-1.5 border border-border/40"
                >
                  <User className="w-3.5 h-3.5 text-emerald-500" /> Child Fever
                </Link>
                <Link
                  href="/doctors?symptom=migraine"
                  className="px-3.5 py-1.5 rounded-xl bg-secondary/60 hover:bg-secondary text-xs font-medium text-foreground transition-all hover:scale-105 flex items-center gap-1.5 border border-border/40"
                >
                  <Activity className="w-3.5 h-3.5 text-purple-500" /> Migraine
                </Link>
                <Link
                  href="/doctors?symptom=joint"
                  className="px-3.5 py-1.5 rounded-xl bg-secondary/60 hover:bg-secondary text-xs font-medium text-foreground transition-all hover:scale-105 flex items-center gap-1.5 border border-border/40"
                >
                  <Clock className="w-3.5 h-3.5 text-blue-500" /> Joint & Knee Pain
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* 4 CORE ADVANTAGES BENTO GRID */}
        <section className="container py-16 max-w-6xl">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-primary">
              Core Technical Architecture
            </span>
            <h2 className="text-3xl font-black tracking-tight mt-1">
              Engineered for Zero Failure & Maximum Utilization
            </h2>
            <p className="text-muted-foreground text-xs mt-2">
              Unlike generic appointment apps, CareSlot addresses real clinical friction: double-booking race conditions, delayed check-ins, and vacant cancellation holes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Bento 1: Atomic Slot Locking */}
            <SpotlightCard className="p-6 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4">
                  <Lock className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-base">Atomic Slot Reservation</h3>
                <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                  Mongoose atomic locks with compound unique indexes guarantee absolute zero double-booking even under concurrent traffic spikes.
                </p>
              </div>
              <div className="mt-6 pt-3 border-t border-border/40 text-[11px] font-mono text-primary font-bold">
                5-min temporary hold ring
              </div>
            </SpotlightCard>

            {/* Bento 2: Smart Waitlist Engine */}
            <SpotlightCard className="p-6 flex flex-col justify-between" spotlightColor="rgba(245, 158, 11, 0.15)">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mb-4">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-base">15-Min Cascading Waitlist</h3>
                <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                  Dynamic triage score ranks waiting patients. Top patient receives a golden ticket with a 15-minute hold before auto-cascading.
                </p>
              </div>
              <div className="mt-6 pt-3 border-t border-border/40 text-[11px] font-mono text-amber-500 font-bold">
                Auto-fills 100% of cancellations
              </div>
            </SpotlightCard>

            {/* Bento 3: Live Delay Estimator */}
            <SpotlightCard className="p-6 flex flex-col justify-between" spotlightColor="rgba(16, 185, 129, 0.15)">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center mb-4">
                  <Clock className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-base">Dynamic Delay Estimator</h3>
                <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                  Tracks doctor&apos;s actual vs. scheduled consultation times in real time. Cumulative delay recalculates downstream patient check-in times.
                </p>
              </div>
              <div className="mt-6 pt-3 border-t border-border/40 text-[11px] font-mono text-emerald-600 font-bold">
                Live queue timeline + NOW line
              </div>
            </SpotlightCard>

            {/* Bento 4: Razorpay Verification */}
            <SpotlightCard className="p-6 flex flex-col justify-between" spotlightColor="rgba(168, 85, 247, 0.15)">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-600 flex items-center justify-center mb-4">
                  <CreditCard className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-base">HMAC-SHA256 Razorpay</h3>
                <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                  Cryptographic server-side HMAC validation, auto-refunds on cancellation &gt;2 hours before visit, and full mock test fallback.
                </p>
              </div>
              <div className="mt-6 pt-3 border-t border-border/40 text-[11px] font-mono text-purple-600 font-bold">
                Instant digital passes & receipts
              </div>
            </SpotlightCard>
          </div>
        </section>

        {/* 3-STEP FLOW WALKTHROUGH */}
        <section className="container py-12 max-w-5xl">
          <div className="p-8 sm:p-12 rounded-3xl glass-panel border border-border/60 shadow-lg">
            <h3 className="text-2xl font-black tracking-tight text-center mb-8">
              Seamless Consultation Lifecycle
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
              <div className="text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center mx-auto font-black text-lg shadow-md shadow-primary/25">
                  1
                </div>
                <h4 className="font-bold text-sm">Select & Hold Slot</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Browse 7-day availability heat strips. When choosing a slot, a 5-minute SVG countdown ring reserves it exclusively for you.
                </p>
              </div>

              <div className="text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center mx-auto font-black text-lg shadow-md shadow-primary/25">
                  2
                </div>
                <h4 className="font-bold text-sm">Check-in with Live Code</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Receive a digital pass with QR code and check-in code. View doctor delay adjustments (+12m) before leaving your home.
                </p>
              </div>

              <div className="text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center mx-auto font-black text-lg shadow-md shadow-primary/25">
                  3
                </div>
                <h4 className="font-bold text-sm">Prescription & Records</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Doctor writes structured dosage instructions and private notes. Download styled PDF medical records and submit verified visit reviews.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* DEMO CREDENTIALS CALLOUT BAR */}
        <section className="container py-12 max-w-4xl text-center">
          <div className="p-6 rounded-3xl bg-secondary/50 border border-border/50">
            <span className="text-xs font-bold text-primary uppercase tracking-wider block mb-2">
              Evaluator Quick Credentials
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
              <div className="p-3 rounded-xl bg-background border border-border/40">
                <span className="text-muted-foreground font-sans block text-[10px]">Patient</span>
                <strong>patient@careslot.demo</strong>
                <span className="text-muted-foreground block text-[10px]">Patient@123</span>
              </div>
              <div className="p-3 rounded-xl bg-background border border-border/40">
                <span className="text-muted-foreground font-sans block text-[10px]">Doctor</span>
                <strong>doctor@careslot.demo</strong>
                <span className="text-muted-foreground block text-[10px]">Doctor@123</span>
              </div>
              <div className="p-3 rounded-xl bg-background border border-border/40">
                <span className="text-muted-foreground font-sans block text-[10px]">Admin</span>
                <strong>admin@careslot.demo</strong>
                <span className="text-muted-foreground block text-[10px]">Admin@123</span>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-border/50 py-8 bg-secondary/20">
        <div className="container max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-primary text-white flex items-center justify-center">
              <Activity className="w-3.5 h-3.5" />
            </div>
            <span className="font-bold text-foreground">CareSlot Platform</span>
            <span>• Next.js 14, MongoDB Atlas & Razorpay</span>
          </div>

          <div className="flex items-center gap-6">
            <Link href="/doctors" className="hover:text-foreground transition-colors">
              Find Doctors
            </Link>
            <Link href="/admin/evaluator" className="hover:text-foreground transition-colors text-amber-500 font-semibold">
              Evaluator Panel
            </Link>
            <Link href="/api/health" className="hover:text-foreground transition-colors font-mono">
              /api/health
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
