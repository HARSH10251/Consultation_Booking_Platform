"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Clock,
  Sparkles,
  User,
  X,
  XCircle,
  Zap,
} from "lucide-react";
import { toast } from "sonner";

interface CascadeVisualizerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CascadeVisualizerModal({ isOpen, onClose }: CascadeVisualizerModalProps) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Simulation step: 0: Initial, 1: Slot unlocked, 2: Offered to Patient 1 (countdown), 3: Expired/Declined, 4: Cascaded to Patient 2!
  const [simulationStep, setSimulationStep] = useState<number>(0);
  const [simulating, setSimulating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchCascadeData();
      setSimulationStep(0);
    }
  }, [isOpen]);

  const fetchCascadeData = async () => {
    try {
      const res = await fetch("/api/evaluator/cascade-data");
      const d = await res.json();
      setData(d);
    } catch (err) {
      console.error("Error fetching cascade data:", err);
    } finally {
      setLoading(false);
    }
  };

  const runVisualSimulation = async () => {
    setSimulating(true);

    // Step 1: Appointment Cancelled, Slot Unlocked
    setSimulationStep(1);
    await new Promise((r) => setTimeout(r, 1200));

    // Step 2: Slot flies to Patient #1 with 15m hold
    setSimulationStep(2);
    await new Promise((r) => setTimeout(r, 2000));

    // Step 3: Fast forward 15 mins -> Offer expires / Patient declines
    setSimulationStep(3);
    await new Promise((r) => setTimeout(r, 1600));

    // Step 4: Slot automatically cascades to Patient #2!
    setSimulationStep(4);
    setSimulating(false);
    toast.success("Cascade completed! Slot offered to Patient #2 with zero downtime.");
  };

  if (!isOpen) return null;

  const queue = data?.rankedQueue || [];
  const patient1 = queue[0] || { patientName: "Aarav Patel", score: 58.4, urgency: "urgent" };
  const patient2 = queue[1] || { patientName: "Diya Sharma", score: 49.0, urgency: "soon" };
  const patient3 = queue[2] || { patientName: "Kabir Khan", score: 32.5, urgency: "routine" };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
      <div className="relative w-full max-w-3xl glass-panel rounded-3xl p-6 sm:p-8 border border-white/20 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-border/50">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-md">
              <Sparkles className="w-5 h-5 fill-current" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-500 block">
                Evaluator Live Visualizer
              </span>
              <h3 className="text-xl font-black">Smart Waitlist Cascading Engine</h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Doctor Context */}
        <div className="my-4 p-3 rounded-2xl bg-secondary/50 border border-border/40 flex items-center justify-between text-xs">
          <span>
            Doctor: <strong>Dr. Arvind Mehta</strong> (Cardiology)
          </span>
          <span className="font-mono text-primary font-bold">Slot: Tomorrow at 10:00 AM</span>
        </div>

        {/* Animated Cascade Arena */}
        <div className="p-6 rounded-3xl bg-background/80 border border-border/50 relative min-h-[260px] flex flex-col justify-between overflow-hidden">
          {/* Top: Slot State Badge */}
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Slot Lifecycle State
            </span>
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold font-mono transition-colors ${
                simulationStep === 0
                  ? "bg-secondary text-muted-foreground"
                  : simulationStep === 1
                  ? "bg-rose-500/15 text-rose-600 border border-rose-500/30"
                  : simulationStep === 2
                  ? "bg-amber-500/15 text-amber-600 border border-amber-500/30 animate-pulse"
                  : simulationStep === 3
                  ? "bg-rose-500/15 text-rose-600 border border-rose-500/30"
                  : "bg-emerald-500/15 text-emerald-600 border border-emerald-500/30 font-black"
              }`}
            >
              {simulationStep === 0 && "STATUS: Slot Booked (Normal)"}
              {simulationStep === 1 && "EVENT: Patient Cancels -> Slot Vacated!"}
              {simulationStep === 2 && "STATUS: held_for_offer (Patient #1)"}
              {simulationStep === 3 && "EVENT: 15m Window Expires / Declined"}
              {simulationStep === 4 && "STATUS: held_for_offer (Cascaded to Patient #2!)"}
            </span>
          </div>

          {/* Middle: Waiting Queue Cards with Animated Slot Token Flying */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 relative py-3">
            {/* Patient 1 */}
            <div
              className={`p-4 rounded-2xl border transition-all ${
                simulationStep === 2
                  ? "bg-amber-500/10 border-amber-500 ring-2 ring-amber-500/30 scale-105 shadow-lg"
                  : simulationStep >= 3
                  ? "bg-secondary/30 border-border/40 opacity-60 line-through"
                  : "bg-secondary/50 border-border/50"
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-mono text-xs font-bold text-primary">Rank #1</span>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/10 text-amber-500">
                  {patient1.score} pts
                </span>
              </div>
              <h5 className="font-bold text-sm">{patient1.patientName}</h5>
              <p className="text-[11px] text-muted-foreground capitalize">
                {patient1.urgency} triage • Follow-up
              </p>
              {simulationStep === 2 && (
                <div className="mt-3 text-[10px] text-amber-600 font-bold flex items-center gap-1 animate-pulse">
                  <Clock className="w-3 h-3" />
                  <span>15m Countdown Ring Active</span>
                </div>
              )}
              {simulationStep >= 3 && (
                <div className="mt-3 text-[10px] text-rose-500 font-bold flex items-center gap-1">
                  <XCircle className="w-3 h-3" />
                  <span>Expired / Declined</span>
                </div>
              )}
            </div>

            {/* Patient 2 */}
            <div
              className={`p-4 rounded-2xl border transition-all ${
                simulationStep === 4
                  ? "bg-emerald-500/10 border-emerald-500 ring-2 ring-emerald-500/40 scale-105 shadow-xl"
                  : "bg-secondary/50 border-border/50"
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-mono text-xs font-bold text-primary">Rank #2</span>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-secondary text-muted-foreground">
                  {patient2.score} pts
                </span>
              </div>
              <h5 className="font-bold text-sm">{patient2.patientName}</h5>
              <p className="text-[11px] text-muted-foreground capitalize">
                {patient2.urgency} triage
              </p>
              {simulationStep === 4 && (
                <div className="mt-3 text-[10px] text-emerald-600 font-black flex items-center gap-1 animate-bounce">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>CASCADED! 15m Golden Ticket</span>
                </div>
              )}
            </div>

            {/* Patient 3 */}
            <div className="p-4 rounded-2xl bg-secondary/50 border border-border/50">
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-mono text-xs font-bold text-muted-foreground">Rank #3</span>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-secondary text-muted-foreground">
                  {patient3.score} pts
                </span>
              </div>
              <h5 className="font-bold text-sm">{patient3.patientName}</h5>
              <p className="text-[11px] text-muted-foreground capitalize">
                {patient3.urgency} triage
              </p>
              <span className="text-[10px] text-muted-foreground mt-3 block">Next in line</span>
            </div>
          </div>

          {/* Explanation Step Note */}
          <div className="mt-4 pt-3 border-t border-border/40 text-xs text-muted-foreground flex items-center justify-between">
            <span>
              {simulationStep === 0 && "Ready: Click 'Run Cancellation Simulation' to watch cascade in action."}
              {simulationStep === 1 && "Step 1: Patient cancels visit -> Slot unlocks automatically."}
              {simulationStep === 2 && "Step 2: Engine ranks candidates and offers slot to Patient #1 with a 15m hold."}
              {simulationStep === 3 && "Step 3: Patient #1 timer expires without checkout."}
              {simulationStep === 4 && "Step 4: Engine cascades automatically to Patient #2 with a fresh 15m hold!"}
            </span>
            <span className="text-primary font-bold">Step {simulationStep}/4</span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-secondary text-xs font-semibold hover:bg-secondary/80"
          >
            Close
          </button>

          <button
            disabled={simulating}
            onClick={runVisualSimulation}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-xs shadow-md shadow-amber-500/25 hover:scale-105 transition-all disabled:opacity-50 flex items-center gap-2"
          >
            <Zap className="w-4 h-4 fill-current" />
            <span>{simulating ? "Simulating Cascade..." : "Simulate Slot Cancellation & Cascade"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
