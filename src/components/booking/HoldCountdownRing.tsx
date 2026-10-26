"use client";

import React, { useEffect, useState } from "react";
import { AlertTriangle, Clock } from "lucide-react";

interface HoldCountdownRingProps {
  expiresAt: Date | string;
  onExpire?: () => void;
  size?: number;
}

export function HoldCountdownRing({
  expiresAt,
  onExpire,
  size = 64,
}: HoldCountdownRingProps) {
  const [secondsRemaining, setSecondsRemaining] = useState<number>(300);

  useEffect(() => {
    const target = new Date(expiresAt).getTime();

    const interval = setInterval(() => {
      const now = Date.now();
      const diff = Math.max(0, Math.floor((target - now) / 1000));
      setSecondsRemaining(diff);

      if (diff <= 0) {
        clearInterval(interval);
        onExpire?.();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [expiresAt, onExpire]);

  const total = 300; // 5 mins in seconds
  const progress = Math.min(1, Math.max(0, secondsRemaining / total));
  const strokeWidth = 5;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - progress * circumference;

  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const timeFormatted = `${minutes}:${seconds.toString().padStart(2, "0")}`;

  // Dynamic color transition: green -> amber -> red
  let colorClass = "stroke-emerald-500 text-emerald-600 dark:text-emerald-400";
  if (secondsRemaining <= 60) {
    colorClass = "stroke-rose-500 text-rose-600 dark:text-rose-400 animate-pulse";
  } else if (secondsRemaining <= 120) {
    colorClass = "stroke-amber-500 text-amber-600 dark:text-amber-400";
  }

  return (
    <div className="flex items-center gap-3 p-3 rounded-2xl bg-secondary/60 border border-border/50">
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-border/50"
            fill="transparent"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className={`${colorClass} transition-all duration-500`}
            fill="transparent"
          />
        </svg>
        <span className="absolute font-mono text-xs font-bold">{timeFormatted}</span>
      </div>

      <div className="flex flex-col">
        <span className="text-xs font-bold flex items-center gap-1 text-foreground">
          <Clock className="w-3.5 h-3.5 text-primary" />
          5-Minute Temporary Slot Hold
        </span>
        <p className="text-[11px] text-muted-foreground mt-0.5">
          Reserved exclusively for you. Slot releases if payment is not completed.
        </p>
      </div>
    </div>
  );
}
