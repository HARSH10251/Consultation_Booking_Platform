"use client";

import React from "react";
import { CheckCircle2, Clock, Sparkles, UserCheck, X } from "lucide-react";
import { toast } from "sonner";

interface QueueJourneyTrackerProps {
  entry: any;
  onLeave?: () => void;
}

export function QueueJourneyTracker({ entry, onLeave }: QueueJourneyTrackerProps) {
  const position = entry.queuePosition || 1;
  const isOffered = entry.status === "offered";

  // Calculate visual step (1 to 4)
  let currentStep = 1;
  if (isOffered) {
    currentStep = 4;
  } else if (position === 1) {
    currentStep = 3;
  } else if (position <= 3) {
    currentStep = 2;
  }

  const handleLeave = async () => {
    if (!confirm("Are you sure you want to leave this waitlist?")) return;

    try {
      const res = await fetch(`/api/waitlist/${entry._id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success("Removed from waitlist");
        onLeave?.();
      }
    } catch (err) {
      toast.error("Failed to leave waitlist");
    }
  };

  return (
    <div className="glass-panel p-6 rounded-3xl border border-border/60 shadow-sm space-y-4">
      {/* Top Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-500 border border-amber-500/20">
              {entry.urgency} Urgency
            </span>
            <span className="text-xs text-muted-foreground font-mono">
              Requested: {entry.dateFrom} ({entry.timeOfDay})
            </span>
          </div>

          <h3 className="font-bold text-base text-foreground">
            Dr. {entry.doctorId?.userId?.name}
          </h3>
          <p className="text-xs text-primary font-medium">
            {entry.doctorId?.specialtyId?.name}
          </p>
        </div>

        <button
          onClick={handleLeave}
          className="text-xs text-muted-foreground hover:text-rose-500 flex items-center gap-1 transition-colors p-1.5 rounded-lg hover:bg-rose-500/10"
          title="Leave waitlist"
        >
          <X className="w-4 h-4" />
          <span className="hidden sm:inline">Leave</span>
        </button>
      </div>

      {/* Queue Journey Pipeline */}
      <div className="pt-2">
        <div className="flex items-center justify-between text-xs font-semibold mb-2">
          <span className="text-muted-foreground">Queue Journey Tracker</span>
          <span className="text-primary font-bold">
            {isOffered ? "Offer Dispatched!" : `Position #${position} in line`}
          </span>
        </div>

        <div className="grid grid-cols-4 gap-2 relative">
          {/* Step 1: Joined */}
          <div
            className={`p-3 rounded-2xl text-center border transition-all ${
              currentStep >= 1
                ? "bg-primary/10 border-primary/30 text-primary"
                : "bg-secondary/40 border-border/40 text-muted-foreground"
            }`}
          >
            <div className="w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center mx-auto text-[10px] font-bold mb-1">
              ✓
            </div>
            <span className="text-[11px] font-bold block">Joined</span>
            <span className="text-[9px] text-muted-foreground block">Triaged</span>
          </div>

          {/* Step 2: Queue */}
          <div
            className={`p-3 rounded-2xl text-center border transition-all ${
              currentStep >= 2
                ? "bg-primary/10 border-primary/30 text-primary"
                : "bg-secondary/40 border-border/40 text-muted-foreground"
            }`}
          >
            <div className="w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center mx-auto text-[10px] font-bold mb-1">
              #
            </div>
            <span className="text-[11px] font-bold block">Advancing</span>
            <span className="text-[9px] text-muted-foreground block">Position #{position}</span>
          </div>

          {/* Step 3: Top Priority */}
          <div
            className={`p-3 rounded-2xl text-center border transition-all ${
              currentStep >= 3
                ? "bg-primary/10 border-primary/30 text-primary"
                : "bg-secondary/40 border-border/40 text-muted-foreground"
            }`}
          >
            <div className="w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center mx-auto text-[10px] font-bold mb-1">
              ⚡
            </div>
            <span className="text-[11px] font-bold block">Next Up</span>
            <span className="text-[9px] text-muted-foreground block">Priority #1</span>
          </div>

          {/* Step 4: Golden Ticket Offer */}
          <div
            className={`p-3 rounded-2xl text-center border transition-all ${
              currentStep === 4
                ? "bg-amber-500/15 border-amber-500 text-amber-600 animate-pulse"
                : "bg-secondary/40 border-border/40 text-muted-foreground"
            }`}
          >
            <div className="w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center mx-auto text-[10px] font-bold mb-1">
              ★
            </div>
            <span className="text-[11px] font-bold block">Golden Offer</span>
            <span className="text-[9px] block">15m Window</span>
          </div>
        </div>
      </div>

      {/* Chance Indicator Banner */}
      <div className="p-3 rounded-2xl bg-secondary/50 border border-border/40 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span className="text-muted-foreground">
            Estimated Chance:{" "}
            <strong className="text-foreground">
              {position === 1 ? "Very High (Next vacancy)" : position <= 3 ? "High" : "Moderate"}
            </strong>
          </span>
        </div>
        <span className="text-[10px] text-muted-foreground font-mono">
          Auto-cascading enabled
        </span>
      </div>
    </div>
  );
}
