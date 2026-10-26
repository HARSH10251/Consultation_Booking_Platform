"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { QueueJourneyTracker } from "@/components/waitlist/QueueJourneyTracker";
import { GoldenTicketOffer } from "@/components/waitlist/GoldenTicketOffer";
import {
  Clock,
  HelpCircle,
  PlusCircle,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";

export default function WaitlistPage() {
  const [entries, setEntries] = useState<any[]>([]);
  const [activeOffers, setActiveOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWaitlistData();
  }, []);

  const fetchWaitlistData = async () => {
    try {
      const res = await fetch("/api/waitlist");
      const data = await res.json();
      if (data.entries) setEntries(data.entries);
      if (data.activeOffers) setActiveOffers(data.activeOffers);
    } catch (err) {
      console.error("Error fetching waitlist:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1 container py-8 max-w-5xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-500">
                Dynamic Cascading Engine Active
              </span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight">
              Smart Waitlist & Queue Journey
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Track your triage priority, queue advancement, and claim 15-minute golden ticket offers.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setLoading(true);
                fetchWaitlistData();
              }}
              className="p-2.5 rounded-xl bg-secondary hover:bg-secondary/80 text-foreground transition-colors"
              title="Refresh queue status"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>
            <Link
              href="/doctors"
              className="px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-xs shadow-md shadow-primary/20 hover:bg-primary/90 transition-all hover:scale-105 inline-flex items-center gap-1.5"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              Find More Doctors
            </Link>
          </div>
        </div>

        {/* ACTIVE GOLDEN TICKET OFFERS */}
        {activeOffers.length > 0 && (
          <div className="mb-8 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-amber-500 flex items-center gap-2">
              <Sparkles className="w-4 h-4 fill-current" />
              <span>Pending Action: Vacated Slot Offered to You</span>
            </h3>

            {activeOffers.map((offer) => (
              <GoldenTicketOffer
                key={offer._id}
                offer={offer}
                onRefresh={fetchWaitlistData}
              />
            ))}
          </div>
        )}

        {/* ACTIVE WAITLIST ENTRIES */}
        {loading ? (
          <div className="space-y-4">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="h-44 rounded-3xl bg-secondary/40 animate-pulse" />
            ))}
          </div>
        ) : entries.length === 0 && activeOffers.length === 0 ? (
          <div className="glass-panel p-12 rounded-3xl text-center border border-border/50">
            <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <h3 className="font-bold text-lg">No active waitlist entries</h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto mb-6">
              When a doctor&apos;s schedule is completely booked on a given date, you can join the priority waitlist without any upfront payment.
            </p>
            <Link
              href="/doctors"
              className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-xs shadow-md shadow-primary/25 inline-block"
            >
              Browse Doctors & Schedules
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
              Your Monitored Clinics & Positions ({entries.length})
            </h3>

            {entries.map((entry) => (
              <QueueJourneyTracker
                key={entry._id}
                entry={entry}
                onLeave={fetchWaitlistData}
              />
            ))}
          </div>
        )}

        {/* Transparent Triage Ranking Formula Info Card */}
        <div className="mt-12 glass-panel p-6 rounded-3xl border border-border/50 bg-secondary/30">
          <div className="flex items-center gap-2 mb-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">
            <HelpCircle className="w-4 h-4 text-primary" />
            <span>How CareSlot&apos;s Smart Waitlist Engine Works</span>
          </div>

          <p className="text-xs text-muted-foreground leading-relaxed">
            When an appointment is cancelled, slots do not go to waste or get grabbed by bot scripts. Instead, our deterministic, unit-tested triage ranking algorithm calculates a priority score for every waiting patient:
          </p>

          <div className="p-3 my-3 rounded-2xl bg-background/80 font-mono text-xs border border-border/40 text-primary font-bold">
            Score = (Urgency Weight: 10/25/50) + (Hours Waiting × 2) + (Follow-up Bonus: +20) − (Declined Penalties: −15)
          </div>

          <p className="text-xs text-muted-foreground leading-relaxed">
            The top-ranked patient receives an exclusive 15-minute lock. If the patient accepts and pays, the slot books atomically. If the offer expires or is declined, it automatically cascades to Patient #2.
          </p>
        </div>
      </main>
    </div>
  );
}
