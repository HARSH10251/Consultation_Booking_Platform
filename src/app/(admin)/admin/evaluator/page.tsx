"use client";

import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { CascadeVisualizerModal } from "@/components/evaluator/CascadeVisualizerModal";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock,
  CreditCard,
  Lock,
  Play,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  TrendingDown,
  Zap,
} from "lucide-react";
import { toast } from "sonner";

export default function AdminEvaluatorPage() {
  const [showVisualizer, setShowVisualizer] = useState(false);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [testOutput, setTestOutput] = useState<any>(null);

  const runRaceCondition = async () => {
    setLoadingAction("race");
    try {
      const res = await fetch("/api/evaluator/simulate-race", { method: "POST" });
      const data = await res.json();
      setTestOutput(data);
      toast.success("Race condition executed! Check results below.");
    } catch (err: any) {
      toast.error(err.message || "Failed");
    } finally {
      setLoadingAction(null);
    }
  };

  const runFastForward = async () => {
    setLoadingAction("time");
    try {
      const res = await fetch("/api/evaluator/fast-forward-time", { method: "POST" });
      const data = await res.json();
      setTestOutput(data);
      toast.success("15 minutes fast-forwarded! Offer expired and cascaded.");
    } catch (err: any) {
      toast.error(err.message || "Failed");
    } finally {
      setLoadingAction(null);
    }
  };

  const runInjectDelay = async () => {
    setLoadingAction("delay");
    try {
      const res = await fetch("/api/evaluator/simulate-delay", { method: "POST" });
      const data = await res.json();
      setTestOutput(data);
      toast.success("+15 min delay injected into queue timeline.");
    } catch (err: any) {
      toast.error(err.message || "Failed");
    } finally {
      setLoadingAction(null);
    }
  };

  const runPrivilegeTest = async () => {
    setLoadingAction("privilege");
    try {
      const res = await fetch("/api/evaluator/privilege-test");
      const data = await res.json();
      setTestOutput({ httpStatus: res.status, ...data });
      if (res.status === 403) {
        toast.error("Security Guard Enforced: 403 Forbidden alert rendered!");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed");
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <CascadeVisualizerModal
        isOpen={showVisualizer}
        onClose={() => setShowVisualizer(false)}
      />

      <main className="flex-1 container py-8 max-w-7xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20">
                Evaluation Center
              </span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight">
              Evaluator Time-Machine & Test Suite
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Interactive test console to verify concurrency locks, dynamic waitlist cascading, and RBAC guards.
            </p>
          </div>
        </div>

        {/* Bento Grid of Evaluator Simulators */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* 1: Race Condition Simulator */}
          <div className="glass-panel p-6 rounded-3xl border border-border/60 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-500 flex items-center gap-1.5">
                  <Zap className="w-4 h-4 fill-current" />
                  <span>Atomic Concurrency</span>
                </span>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-secondary font-bold">
                  2 Parallel Threads
                </span>
              </div>
              <h3 className="font-bold text-base">Simulate Race Condition</h3>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                Fires two concurrent HTTP hold requests at the exact same millisecond against the same slot to visually prove atomic lock handling.
              </p>
            </div>

            <button
              disabled={loadingAction !== null}
              onClick={runRaceCondition}
              className="mt-5 w-full py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-xs shadow-md shadow-primary/20 hover:bg-primary/90 transition-all hover:scale-[1.02] disabled:opacity-50"
            >
              {loadingAction === "race" ? "Firing Simultaneous Requests..." : "Run Race Test"}
            </button>
          </div>

          {/* 2: Live Waitlist Cascade Visualizer */}
          <div className="glass-panel p-6 rounded-3xl border-2 border-amber-500/40 shadow-md flex flex-col justify-between bg-gradient-to-br from-amber-500/10 via-background to-amber-500/5">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-500 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 fill-current" />
                  <span>Cascade Engine</span>
                </span>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500 text-white animate-pulse">
                  Visualizer
                </span>
              </div>
              <h3 className="font-bold text-base">Live Waitlist Cascade Visualizer</h3>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                Step-by-step visual animation: slot unlocks → flies to Patient #1 with 15m hold → countdown expires → cascades smoothly to Patient #2.
              </p>
            </div>

            <button
              onClick={() => setShowVisualizer(true)}
              className="mt-5 w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-md shadow-amber-500/25 transition-all hover:scale-[1.02]"
            >
              Launch Cascade Visualizer Modal →
            </button>
          </div>

          {/* 3: Fast-Forward Time */}
          <div className="glass-panel p-6 rounded-3xl border border-border/60 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-500 flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  <span>Time-Machine</span>
                </span>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-secondary font-bold">
                  +15 Mins
                </span>
              </div>
              <h3 className="font-bold text-base">Fast-Forward Time (+15 Mins)</h3>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                Fast-forwards server clock by 15 minutes to test automatic expiration of pending offers and trigger instantaneous cascading.
              </p>
            </div>

            <button
              disabled={loadingAction !== null}
              onClick={runFastForward}
              className="mt-5 w-full py-2.5 rounded-xl bg-secondary hover:bg-secondary/80 text-foreground font-semibold text-xs border border-border/50 transition-colors disabled:opacity-50"
            >
              {loadingAction === "time" ? "Advancing Clock..." : "Fast-Forward 15 Mins"}
            </button>
          </div>

          {/* 4: Privilege Escalation Simulator */}
          <div className="glass-panel p-6 rounded-3xl border border-border/60 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-purple-600 flex items-center gap-1.5">
                  <Lock className="w-4 h-4" />
                  <span>Security Guard</span>
                </span>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-rose-500/10 text-rose-500 font-bold">
                  403 Alert
                </span>
              </div>
              <h3 className="font-bold text-base">Simulate Privilege Escalation</h3>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                Attempts to fetch Patient B&apos;s medical record while authenticated as Patient A, demonstrating strict server-side RBAC rejection.
              </p>
            </div>

            <button
              disabled={loadingAction !== null}
              onClick={runPrivilegeTest}
              className="mt-5 w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs shadow-md shadow-purple-600/20 transition-all hover:scale-[1.02] disabled:opacity-50"
            >
              {loadingAction === "privilege" ? "Testing RBAC..." : "Test 403 Security Guard"}
            </button>
          </div>

          {/* 5: Live Delay Injection */}
          <div className="glass-panel p-6 rounded-3xl border border-border/60 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-rose-500 flex items-center gap-1.5">
                  <TrendingDown className="w-4 h-4" />
                  <span>Delay Estimator</span>
                </span>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-secondary font-bold">
                  +15 Mins
                </span>
              </div>
              <h3 className="font-bold text-base">Inject Consultation Delay</h3>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                Injects artificial consultation delay into today&apos;s queue and dynamically recalculates downstream patient check-in times.
              </p>
            </div>

            <button
              disabled={loadingAction !== null}
              onClick={runInjectDelay}
              className="mt-5 w-full py-2.5 rounded-xl bg-secondary hover:bg-secondary/80 text-foreground font-semibold text-xs border border-border/50 transition-colors disabled:opacity-50"
            >
              {loadingAction === "delay" ? "Injecting Delay..." : "Inject +15m Consultation Delay"}
            </button>
          </div>
        </div>

        {/* Live Output Inspector Console */}
        {testOutput && (
          <div className="glass-panel p-6 rounded-3xl border border-border/60 shadow-lg">
            <div className="flex items-center justify-between pb-3 border-b border-border/40 mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Simulator Real-Time Server Output
              </span>
              <button
                onClick={() => setTestOutput(null)}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Clear Console
              </button>
            </div>

            <pre className="p-4 rounded-2xl bg-secondary/60 text-xs font-mono overflow-x-auto text-foreground border border-border/40 leading-relaxed">
              {JSON.stringify(testOutput, null, 2)}
            </pre>
          </div>
        )}
      </main>
    </div>
  );
}
