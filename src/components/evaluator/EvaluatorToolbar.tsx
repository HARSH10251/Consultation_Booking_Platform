"use client";

import React, { useState } from "react";
import { CascadeVisualizerModal } from "./CascadeVisualizerModal";
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  CreditCard,
  Lock,
  Play,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  TrendingDown,
  X,
  Zap,
} from "lucide-react";
import { toast } from "sonner";

export function EvaluatorToolbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [showVisualizer, setShowVisualizer] = useState(false);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<any>(null);

  // 1. Race Condition Simulator
  const handleSimulateRace = async () => {
    setLoadingAction("race");
    try {
      const res = await fetch("/api/evaluator/simulate-race", { method: "POST" });
      const data = await res.json();
      setTestResult({
        title: "⚡ Concurrency Race Condition Test Result",
        details: data,
      });
      if (data.concurrencyProof?.atomicGuaranteed) {
        toast.success(
          `Race condition blocked! Winner: ${data.concurrencyProof.winner}. Second request rejected.`
        );
      } else {
        toast.error("Race condition check completed.");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to simulate race");
    } finally {
      setLoadingAction(null);
    }
  };

  // 2. Fast-Forward Time
  const handleFastForwardTime = async () => {
    setLoadingAction("time");
    try {
      const res = await fetch("/api/evaluator/fast-forward-time", { method: "POST" });
      const data = await res.json();
      setTestResult({
        title: "⏱️ Time Fast-Forward Test Result",
        details: data,
      });
      toast.success(data.message || "15 minutes fast-forwarded! Cascaded offers.");
    } catch (err: any) {
      toast.error(err.message || "Failed to fast-forward");
    } finally {
      setLoadingAction(null);
    }
  };

  // 3. Simulate Live Delay
  const handleSimulateDelay = async () => {
    setLoadingAction("delay");
    try {
      const res = await fetch("/api/evaluator/simulate-delay", { method: "POST" });
      const data = await res.json();
      setTestResult({
        title: "📉 Live Delay Estimator Injection",
        details: data,
      });
      toast.success(data.message || "Delay injected! Check-in times recalculated.");
    } catch (err: any) {
      toast.error(err.message || "Failed to simulate delay");
    } finally {
      setLoadingAction(null);
    }
  };

  // 4. Privilege Escalation Test (403 Forbidden check)
  const handlePrivilegeTest = async () => {
    setLoadingAction("privilege");
    try {
      const res = await fetch("/api/evaluator/privilege-test");
      const data = await res.json();
      setTestResult({
        title: "🔒 RBAC Privilege Escalation Check",
        status: res.status,
        details: data,
      });
      if (res.status === 403) {
        toast.error("Security Guard Enforced: 403 Forbidden on Cross-Patient Medical Record!");
      } else {
        toast.info(data.message || "Privilege test evaluated");
      }
    } catch (err: any) {
      toast.error(err.message || "Privilege test completed");
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <>
      <CascadeVisualizerModal
        isOpen={showVisualizer}
        onClose={() => setShowVisualizer(false)}
      />

      {/* Floating Toolbar Container */}
      <div className="fixed bottom-5 right-5 z-40 max-w-sm w-full sm:w-96 select-none font-sans">
        <div className="glass-panel rounded-3xl border-2 border-primary/40 shadow-2xl overflow-hidden backdrop-blur-xl">
          {/* Header pill button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="w-full px-4 py-3 bg-gradient-to-r from-primary to-blue-600 text-white flex items-center justify-between text-xs font-black tracking-wide"
          >
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" />
              <span>EVALUATOR TIME-MACHINE & TEST PANEL</span>
            </div>
            {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>

          {/* Expanded Drawer */}
          {isOpen && (
            <div className="p-4 space-y-2.5 max-h-[460px] overflow-y-auto bg-background/95">
              <p className="text-[11px] text-muted-foreground leading-tight">
                Single-click simulators built specifically for end-term evaluation:
              </p>

              {/* Action 1: Race Condition */}
              <button
                disabled={loadingAction !== null}
                onClick={handleSimulateRace}
                className="w-full p-2.5 rounded-2xl bg-secondary/70 hover:bg-secondary border border-border/50 text-left flex items-center justify-between transition-all hover:scale-[1.01]"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
                    <Zap className="w-4 h-4 fill-current" />
                  </div>
                  <div>
                    <strong className="text-xs block text-foreground">Simulate Race Condition</strong>
                    <span className="text-[10px] text-muted-foreground">
                      2 parallel hold requests on 1 slot
                    </span>
                  </div>
                </div>
                <span className="text-xs text-primary font-bold">
                  {loadingAction === "race" ? "Testing..." : "Fire →"}
                </span>
              </button>

              {/* Action 2: Live Waitlist Cascade Visualizer */}
              <button
                onClick={() => setShowVisualizer(true)}
                className="w-full p-2.5 rounded-2xl bg-gradient-to-r from-amber-500/15 via-orange-500/15 to-transparent border border-amber-500/40 text-left flex items-center justify-between transition-all hover:scale-[1.01]"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-sm">
                    <Sparkles className="w-4 h-4 fill-current" />
                  </div>
                  <div>
                    <strong className="text-xs block text-foreground">Live Cascade Visualizer</strong>
                    <span className="text-[10px] text-muted-foreground">
                      Watch slot fly between queue ranks
                    </span>
                  </div>
                </div>
                <span className="text-xs text-amber-500 font-bold">Open →</span>
              </button>

              {/* Action 3: Fast-Forward Time (15 Mins) */}
              <button
                disabled={loadingAction !== null}
                onClick={handleFastForwardTime}
                className="w-full p-2.5 rounded-2xl bg-secondary/70 hover:bg-secondary border border-border/50 text-left flex items-center justify-between transition-all hover:scale-[1.01]"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="text-xs block text-foreground">Fast-Forward Time (+15m)</strong>
                    <span className="text-[10px] text-muted-foreground">
                      Expires offers & triggers next cascade
                    </span>
                  </div>
                </div>
                <span className="text-xs text-primary font-bold">
                  {loadingAction === "time" ? "Skipping..." : "Run →"}
                </span>
              </button>

              {/* Action 4: Simulate Live Delay */}
              <button
                disabled={loadingAction !== null}
                onClick={handleSimulateDelay}
                className="w-full p-2.5 rounded-2xl bg-secondary/70 hover:bg-secondary border border-border/50 text-left flex items-center justify-between transition-all hover:scale-[1.01]"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-rose-500/10 text-rose-500 flex items-center justify-center shrink-0">
                    <TrendingDown className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="text-xs block text-foreground">Inject Artificial Delay (+15m)</strong>
                    <span className="text-[10px] text-muted-foreground">
                      Recalculates downstream queue check-ins
                    </span>
                  </div>
                </div>
                <span className="text-xs text-primary font-bold">
                  {loadingAction === "delay" ? "Injecting..." : "Inject →"}
                </span>
              </button>

              {/* Action 5: Privilege Escalation Check */}
              <button
                disabled={loadingAction !== null}
                onClick={handlePrivilegeTest}
                className="w-full p-2.5 rounded-2xl bg-secondary/70 hover:bg-secondary border border-border/50 text-left flex items-center justify-between transition-all hover:scale-[1.01]"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-purple-500/10 text-purple-600 flex items-center justify-center shrink-0">
                    <Lock className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="text-xs block text-foreground">Simulate Privilege Escalation</strong>
                    <span className="text-[10px] text-muted-foreground">
                      Verify 403 Forbidden on Patient B data
                    </span>
                  </div>
                </div>
                <span className="text-xs text-primary font-bold">
                  {loadingAction === "privilege" ? "Checking..." : "Verify →"}
                </span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Test Output Modal */}
      {testResult && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel p-6 rounded-3xl max-w-lg w-full border border-white/20 shadow-2xl relative max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-border/40 mb-3">
              <h4 className="font-bold text-sm text-foreground">{testResult.title}</h4>
              <button
                onClick={() => setTestResult(null)}
                className="p-1 rounded-lg text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <pre className="p-3.5 rounded-2xl bg-secondary/60 text-[11px] font-mono overflow-x-auto text-foreground border border-border/40">
              {JSON.stringify(testResult.details, null, 2)}
            </pre>

            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setTestResult(null)}
                className="px-4 py-2 rounded-xl bg-primary text-primary-foreground font-semibold text-xs"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
