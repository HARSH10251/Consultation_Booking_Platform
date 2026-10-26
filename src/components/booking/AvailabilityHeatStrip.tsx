"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface HeatDay {
  date: string;
  dayOfWeek: string;
  availableCount: number;
  bookedCount?: number;
  intensity: "none" | "low" | "medium" | "high";
}

interface AvailabilityHeatStripProps {
  days: HeatDay[];
  selectedDate: string;
  onSelectDate: (date: string) => void;
  className?: string;
}

export function AvailabilityHeatStrip({
  days,
  selectedDate,
  onSelectDate,
  className,
}: AvailabilityHeatStripProps) {
  return (
    <div className={cn("w-full flex items-center justify-between gap-1.5 sm:gap-2", className)}>
      {days.map((day) => {
        const isSelected = day.date === selectedDate;
        const isFullyBooked = day.availableCount === 0;

        return (
          <button
            key={day.date}
            type="button"
            onClick={() => onSelectDate(day.date)}
            className={cn(
              "flex-1 flex flex-col items-center py-2.5 px-1 rounded-2xl transition-all duration-200 border text-center relative group",
              isSelected
                ? "bg-primary text-primary-foreground border-primary shadow-md shadow-primary/25 scale-[1.03]"
                : "bg-secondary/40 hover:bg-secondary/80 border-border/50 text-foreground"
            )}
          >
            <span
              className={cn(
                "text-[10px] sm:text-xs font-medium uppercase tracking-wider",
                isSelected ? "text-primary-foreground/90" : "text-muted-foreground"
              )}
            >
              {day.dayOfWeek}
            </span>

            <span className="text-sm sm:text-base font-extrabold my-0.5">
              {day.date.split("-")[2]}
            </span>

            {/* Intensity / volume bar */}
            <div className="w-full px-2 mt-1 flex flex-col items-center gap-1">
              <span
                className={cn(
                  "text-[9px] font-bold px-1.5 py-0.5 rounded-full transition-colors",
                  isSelected
                    ? "bg-white/20 text-white"
                    : isFullyBooked
                    ? "bg-rose-500/10 text-rose-500 dark:text-rose-400 font-semibold"
                    : day.intensity === "high"
                    ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                    : day.intensity === "medium"
                    ? "bg-blue-500/15 text-blue-600 dark:text-blue-400"
                    : "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                )}
              >
                {isFullyBooked ? "Waitlist" : `${day.availableCount} slots`}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
