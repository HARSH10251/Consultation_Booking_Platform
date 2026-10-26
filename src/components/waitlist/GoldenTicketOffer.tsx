"use client";

import React, { useEffect, useState } from "react";
import confetti from "canvas-confetti";
import { formatCurrency } from "@/lib/utils";
import {
  Bell,
  Calendar,
  CheckCircle2,
  Clock,
  Sparkles,
  Volume2,
  VolumeX,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";

interface GoldenTicketOfferProps {
  offer: any;
  onRefresh?: () => void;
}

export function GoldenTicketOffer({ offer, onRefresh }: GoldenTicketOfferProps) {
  const [secondsLeft, setSecondsLeft] = useState<number>(900); // 15 mins default
  const [responding, setResponding] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  useEffect(() => {
    const target = new Date(offer.expiresAt).getTime();

    // Play subtle audio chime on first mount if sound enabled
    if (soundEnabled && typeof window !== "undefined" && window.AudioContext) {
      try {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = "sine";
        osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
        osc.frequency.setValueAtTime(880, ctx.currentTime + 0.15); // A5
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
        osc.start();
        osc.stop(ctx.currentTime + 0.5);
      } catch (e) {
        // audio context blocked or unsupported
      }
    }

    const interval = setInterval(() => {
      const now = Date.now();
      const diff = Math.max(0, Math.floor((target - now) / 1000));
      setSecondsLeft(diff);

      if (diff <= 0) {
        clearInterval(interval);
        onRefresh?.();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [offer.expiresAt, onRefresh, soundEnabled]);

  const handleRespond = async (action: "accept" | "decline") => {
    setResponding(true);
    try {
      const res = await fetch(`/api/waitlist/offers/${offer._id}/respond`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to respond to offer");
        setResponding(false);
        return;
      }

      if (action === "accept") {
        confetti({
          particleCount: 150,
          spread: 80,
          origin: { y: 0.6 },
        });
        toast.success("Golden ticket accepted! Slot reserved.");
      } else {
        toast.info("Offer declined. Slot cascaded to the next waiting patient.");
      }

      onRefresh?.();
    } catch (err: any) {
      toast.error(err.message || "An error occurred");
    } finally {
      setResponding(false);
    }
  };

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const timeFormatted = `${minutes}:${seconds.toString().padStart(2, "0")}`;

  const slot = offer.slotId;
  const doctor = slot?.doctorId;

  return (
    <div className="p-6 rounded-3xl bg-gradient-to-br from-amber-500/10 via-background to-amber-500/5 border-2 border-amber-500/40 shadow-xl relative overflow-hidden">
      {/* Golden Badge Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-md shadow-amber-500/30">
            <Sparkles className="w-4 h-4 fill-current" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-500 block">
              Exclusive Golden Ticket
            </span>
            <h4 className="font-bold text-base text-foreground">Priority Slot Offer!</h4>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-1.5 rounded-lg bg-secondary/80 text-muted-foreground hover:text-foreground text-xs"
            title={soundEnabled ? "Mute audio chimes" : "Enable audio chimes"}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400 font-mono font-bold text-xs">
            <Clock className="w-3.5 h-3.5 animate-spin" />
            <span>{timeFormatted}</span>
          </div>
        </div>
      </div>

      <p className="text-xs text-muted-foreground leading-relaxed">
        A cancelled appointment slot has opened up with <strong>Dr. {doctor?.userId?.name || "Specialist"}</strong>. Because of your priority ranking score (<strong>{offer.rankScore?.toFixed(1)} pts</strong>), this slot has been locked exclusively for you for 15 minutes.
      </p>

      {/* Slot Details Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 my-4 p-3.5 rounded-2xl bg-background/80 border border-border/50 text-xs">
        <div>
          <span className="text-[10px] text-muted-foreground uppercase block">Date</span>
          <strong className="text-foreground">{slot?.date}</strong>
        </div>
        <div>
          <span className="text-[10px] text-muted-foreground uppercase block">Time</span>
          <strong className="text-primary font-mono">{slot?.startTime} - {slot?.endTime}</strong>
        </div>
        <div>
          <span className="text-[10px] text-muted-foreground uppercase block">Specialty</span>
          <strong className="text-foreground">{doctor?.specialtyId?.name || "Consultation"}</strong>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-3 pt-2">
        <button
          disabled={responding || secondsLeft <= 0}
          onClick={() => handleRespond("accept")}
          className="flex-1 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-lg shadow-amber-500/25 transition-all hover:scale-[1.02] flex items-center justify-center gap-1.5 disabled:opacity-50"
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Accept & Confirm with Razorpay</span>
        </button>

        <button
          disabled={responding || secondsLeft <= 0}
          onClick={() => handleRespond("decline")}
          className="px-4 py-3 rounded-xl bg-secondary/80 hover:bg-secondary text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
        >
          Decline & Pass to #2
        </button>
      </div>
    </div>
  );
}
