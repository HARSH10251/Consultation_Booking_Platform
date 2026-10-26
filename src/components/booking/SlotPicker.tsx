"use client";

import React from "react";
import { Sunrise, Sun, Sunset, Clock, Sparkles } from "lucide-react";

export interface SlotItem {
  _id: string;
  startTime: string;
  endTime: string;
  status: "available" | "held" | "held_for_offer" | "booked" | "blocked";
  date: string;
}

interface SlotPickerProps {
  slots: SlotItem[];
  selectedSlotId?: string;
  onSelectSlot: (slot: SlotItem) => void;
  onJoinWaitlist?: () => void;
  loading?: boolean;
}

export function SlotPicker({
  slots,
  selectedSlotId,
  onSelectSlot,
  onJoinWaitlist,
  loading,
}: SlotPickerProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5 py-4">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="h-11 rounded-2xl bg-secondary/50 animate-pulse border border-border/40"
          />
        ))}
      </div>
    );
  }

  // Filter into Morning, Afternoon, Evening
  const morningSlots = slots.filter((s) => {
    const hour = parseInt(s.startTime.split(":")[0], 10);
    return hour < 12;
  });

  const afternoonSlots = slots.filter((s) => {
    const hour = parseInt(s.startTime.split(":")[0], 10);
    return hour >= 12 && hour < 17;
  });

  const eveningSlots = slots.filter((s) => {
    const hour = parseInt(s.startTime.split(":")[0], 10);
    return hour >= 17;
  });

  const totalAvailable = slots.filter((s) => s.status === "available").length;

  const renderSlotButton = (slot: SlotItem, themeGradient: string) => {
    const isSelected = selectedSlotId === slot._id;
    const isAvailable = slot.status === "available";

    return (
      <button
        key={slot._id}
        type="button"
        disabled={!isAvailable}
        onClick={() => onSelectSlot(slot)}
        className={`relative py-2.5 px-3 rounded-2xl text-xs font-bold font-mono transition-all duration-200 border text-center ${
          isSelected
            ? "bg-primary text-primary-foreground border-primary shadow-md shadow-primary/25 scale-105"
            : isAvailable
            ? `bg-secondary/40 hover:bg-secondary border-border/60 text-foreground hover:scale-[1.02] ${themeGradient}`
            : "bg-muted/30 border-transparent text-muted-foreground/50 opacity-40 cursor-not-allowed scale-95"
        }`}
      >
        <span>{slot.startTime}</span>
        {isAvailable && (
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 absolute top-2 right-2 animate-pulse-subtle" />
        )}
      </button>
    );
  };

  if (slots.length > 0 && totalAvailable === 0) {
    return (
      <div className="p-6 rounded-3xl bg-secondary/40 border border-border/50 text-center space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto">
          <Sparkles className="w-6 h-6" />
        </div>
        <h4 className="font-bold text-base">All Slots Booked for This Date</h4>
        <p className="text-xs text-muted-foreground max-w-sm mx-auto">
          Our smart waitlist engine automatically monitors cancellations and offers vacated slots to top-ranked waiting patients.
        </p>
        {onJoinWaitlist && (
          <button
            type="button"
            onClick={onJoinWaitlist}
            className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs shadow-md shadow-amber-500/20 transition-all hover:scale-105 inline-flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Join Priority Waitlist
          </button>
        )}
      </div>
    );
  }

  if (slots.length === 0) {
    return (
      <div className="py-8 text-center text-xs text-muted-foreground">
        No slots available on this date. Doctor may be off duty.
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Morning Section */}
      {morningSlots.length > 0 && (
        <div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-500 mb-2.5">
            <Sunrise className="w-4 h-4" />
            <span>Morning (Sunrise)</span>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {morningSlots.map((slot) =>
              renderSlotButton(slot, "hover:border-amber-400/50")
            )}
          </div>
        </div>
      )}

      {/* Afternoon Section */}
      {afternoonSlots.length > 0 && (
        <div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-sky-500 mb-2.5">
            <Sun className="w-4 h-4" />
            <span>Afternoon (Warm Sun)</span>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {afternoonSlots.map((slot) =>
              renderSlotButton(slot, "hover:border-sky-400/50")
            )}
          </div>
        </div>
      )}

      {/* Evening Section */}
      {eveningSlots.length > 0 && (
        <div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-purple-500 mb-2.5">
            <Sunset className="w-4 h-4" />
            <span>Evening (Dusk)</span>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {eveningSlots.map((slot) =>
              renderSlotButton(slot, "hover:border-purple-400/50")
            )}
          </div>
        </div>
      )}
    </div>
  );
}
