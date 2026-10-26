"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Navbar } from "@/components/layout/Navbar";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  Activity,
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Clock,
  DollarSign,
  FileText,
  Play,
  Plus,
  QrCode,
  RefreshCw,
  Sparkles,
  Stethoscope,
  Trash2,
  User,
  UserX,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";

export default function DoctorQueuePage() {
  const { data: session } = useSession();
  const user = session?.user;

  const [queueData, setQueueData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Modal for Ending consultation & writing prescription
  const [activeConsultationModal, setActiveConsultationModal] = useState<any>(null);
  const [notes, setNotes] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [prescriptions, setPrescriptions] = useState<
    Array<{ medicine: string; dosage: string; duration: string; instructions: string }>
  >([
    {
      medicine: "Tab Atorvastatin 20mg",
      dosage: "1-0-0 (After breakfast)",
      duration: "30 Days",
      instructions: "Take with water daily",
    },
  ]);
  const [submittingNotes, setSubmittingNotes] = useState(false);

  useEffect(() => {
    fetchQueue();
    // Poll queue status every 15 seconds
    const interval = setInterval(fetchQueue, 15000);
    return () => clearInterval(interval);
  }, [user]);

  const fetchQueue = async () => {
    if (!user?.doctorId) {
      setLoading(false);
      return;
    }
    try {
      const res = await fetch(`/api/queue/${user.doctorId}`);
      const data = await res.json();
      setQueueData(data);
    } catch (err) {
      console.error("Error fetching doctor queue:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (
    appointmentId: string,
    targetStatus: string,
    consultData?: any
  ) => {
    try {
      const res = await fetch(`/api/queue/appointments/${appointmentId}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetStatus,
          ...consultData,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to update status");
        return;
      }

      toast.success(`Patient marked as ${targetStatus.replace("_", " ")}`);
      fetchQueue();
    } catch (err: any) {
      toast.error(err.message || "An error occurred");
    }
  };

  const handleFinishConsultation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeConsultationModal) return;

    setSubmittingNotes(true);
    await handleUpdateStatus(activeConsultationModal._id, "completed", {
      notes,
      diagnosis,
      prescription: prescriptions,
    });
    setSubmittingNotes(false);
    setActiveConsultationModal(null);
    setNotes("");
    setDiagnosis("");
  };

  const addPrescriptionItem = () => {
    setPrescriptions((prev) => [
      ...prev,
      { medicine: "", dosage: "", duration: "", instructions: "" },
    ]);
  };

  const removePrescriptionItem = (index: number) => {
    setPrescriptions((prev) => prev.filter((_, i) => i !== index));
  };

  const delayMinutes = queueData?.delays?.cumulativeDelayMin || 0;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1 container py-8 max-w-6xl">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                Live Queue Timeline Active
              </span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight">Today&apos;s Patient Queue</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Real-time consultation tracker with dynamic delay cascading.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setLoading(true);
                fetchQueue();
              }}
              className="p-2.5 rounded-xl bg-secondary hover:bg-secondary/80 text-foreground transition-colors"
              title="Refresh queue"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        {/* Top Bento Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="glass-panel p-5 rounded-2xl border border-border/60 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs text-muted-foreground">Today&apos;s Appointments</span>
              <p className="text-2xl font-black mt-1">{queueData?.totalCount || 0}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
              <Calendar className="w-5 h-5" />
            </div>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-border/60 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs text-muted-foreground">Today&apos;s Revenue</span>
              <p className="text-2xl font-black text-emerald-600 mt-1">
                {formatCurrency(queueData?.dailyEarnings || 0)}
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-border/60 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs text-muted-foreground">Completed Visits</span>
              <p className="text-2xl font-black mt-1">{queueData?.completedCount || 0}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center font-bold">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-border/60 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs text-muted-foreground">Current Live Delay</span>
              <p
                className={`text-2xl font-black mt-1 ${
                  delayMinutes > 0 ? "text-amber-500" : "text-emerald-500"
                }`}
              >
                {delayMinutes > 0 ? `+${delayMinutes} mins` : "On Track"}
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold">
              <Clock className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Live Delay Alert Banner */}
        {delayMinutes > 0 && (
          <div className="mb-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
              <span>
                <strong>Live Delay Cascade Active:</strong> Appointment running over by +{delayMinutes} mins. Remaining patients have received updated check-in advisories automatically.
              </span>
            </div>
          </div>
        )}

        {/* Vertical Timeline Queue */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-border/60 shadow-md relative">
          <h3 className="font-bold text-base mb-6 flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary" />
            <span>Timeline Queue Schedule</span>
          </h3>

          {loading ? (
            <div className="py-12 text-center text-xs text-muted-foreground animate-pulse">
              Loading queue timeline...
            </div>
          ) : !queueData?.appointments || queueData.appointments.length === 0 ? (
            <div className="py-16 text-center text-xs text-muted-foreground">
              No appointments scheduled for today.
            </div>
          ) : (
            <div className="space-y-6 relative before:absolute before:inset-0 before:left-5 sm:before:left-6 before:w-0.5 before:bg-border/60">
              {queueData.appointments.map((apt: any, idx: number) => {
                const isInProgress = apt.status === "in_progress";
                const isCompleted = apt.status === "completed";
                const isCheckedIn = apt.status === "checked_in";
                const isCancelled = apt.status === "cancelled";
                const isNoShow = apt.status === "no_show";

                const delayInfo = queueData.delays?.estimatedItems?.find(
                  (d: any) => d.id === apt._id
                );

                return (
                  <div key={apt._id} className="relative flex items-start gap-4 sm:gap-6 pl-2">
                    {/* Glowing Red Real-Time NOW Marker Line if In-Progress */}
                    {isInProgress && (
                      <div className="absolute -left-2 sm:-left-3 top-6 w-full pointer-events-none z-10 flex items-center">
                        <div className="w-3.5 h-3.5 rounded-full bg-rose-500 shadow-md shadow-rose-500/50 animate-ping absolute" />
                        <div className="w-3.5 h-3.5 rounded-full bg-rose-500 border-2 border-white shadow-md relative" />
                        <div className="h-0.5 w-full bg-gradient-to-r from-rose-500 via-rose-500/50 to-transparent ml-2" />
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-rose-500 text-white shrink-0 mr-4 shadow-sm">
                          NOW IN CONSULTATION
                        </span>
                      </div>
                    )}

                    {/* Timeline Node Dot */}
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0 z-10 border-2 ${
                        isCompleted
                          ? "bg-purple-600 text-white border-purple-600"
                          : isInProgress
                          ? "bg-rose-500 text-white border-rose-500 shadow-lg shadow-rose-500/40"
                          : isCheckedIn
                          ? "bg-emerald-500 text-white border-emerald-500"
                          : "bg-background text-muted-foreground border-border/80"
                      }`}
                    >
                      {idx + 1}
                    </div>

                    {/* Appointment Card */}
                    <div
                      className={`flex-1 p-5 rounded-2xl border transition-all ${
                        isInProgress
                          ? "bg-primary/5 border-primary/50 shadow-md ring-2 ring-primary/20"
                          : isCompleted
                          ? "bg-secondary/30 border-border/40 opacity-75"
                          : "bg-secondary/40 border-border/50"
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm font-extrabold text-foreground">
                            {delayInfo?.scheduledTime || "10:00 AM"}
                          </span>
                          {delayInfo?.estimatedDelayMin > 0 && !isCompleted && (
                            <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400">
                              Est: {delayInfo.estimatedStartTime} (+{delayInfo.estimatedDelayMin}m)
                            </span>
                          )}
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              isCompleted
                                ? "bg-purple-500/10 text-purple-600"
                                : isInProgress
                                ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 animate-pulse"
                                : isCheckedIn
                                ? "bg-emerald-500/10 text-emerald-600"
                                : "bg-blue-500/10 text-blue-600"
                            }`}
                          >
                            {apt.status.replace("_", " ")}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-primary px-2.5 py-0.5 rounded-lg bg-secondary border border-border/40">
                            Code: {apt.checkInCode}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <h4 className="font-bold text-base text-foreground">
                            {apt.patientId?.name || "Patient"}
                          </h4>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Reason: {apt.reason}
                          </p>
                          {apt.symptoms?.length > 0 && (
                            <div className="flex items-center gap-1.5 mt-2">
                              {apt.symptoms.map((sym: string, i: number) => (
                                <span
                                  key={i}
                                  className="px-2 py-0.5 rounded-md text-[10px] bg-secondary border border-border/40 text-muted-foreground"
                                >
                                  {sym}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Quick Action Toggles */}
                        <div className="flex items-center gap-2 shrink-0">
                          {apt.status === "confirmed" && (
                            <button
                              onClick={() => handleUpdateStatus(apt._id, "checked_in")}
                              className="px-3.5 py-2 rounded-xl bg-emerald-600 text-white font-semibold text-xs shadow-sm hover:bg-emerald-700 transition-colors"
                            >
                              Check In Patient
                            </button>
                          )}

                          {apt.status === "checked_in" && (
                            <button
                              onClick={() => handleUpdateStatus(apt._id, "in_progress")}
                              className="px-4 py-2 rounded-xl bg-primary text-white font-semibold text-xs shadow-md shadow-primary/25 hover:bg-primary/90 transition-all hover:scale-105 flex items-center gap-1.5"
                            >
                              <Play className="w-3.5 h-3.5 fill-current" />
                              Start Visit
                            </button>
                          )}

                          {isInProgress && (
                            <button
                              onClick={() => setActiveConsultationModal(apt)}
                              className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-semibold text-xs shadow-md shadow-emerald-600/25 hover:bg-emerald-700 transition-all hover:scale-105 flex items-center gap-1.5"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Finish & Prescribe
                            </button>
                          )}

                          {!isCompleted && !isCancelled && !isNoShow && (
                            <button
                              onClick={() => handleUpdateStatus(apt._id, "no_show")}
                              className="p-2 rounded-xl text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                              title="Flag No-Show"
                            >
                              <UserX className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Consultation Notes & Structured Prescription Modal */}
        {activeConsultationModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="glass-panel p-6 rounded-3xl max-w-2xl w-full border border-white/20 shadow-2xl relative max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-border/40 mb-4">
                <div>
                  <h3 className="text-xl font-bold">Complete Consultation & Prescribe</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Patient: {activeConsultationModal.patientId?.name} • Code: {activeConsultationModal.checkInCode}
                  </p>
                </div>
                <button
                  onClick={() => setActiveConsultationModal(null)}
                  className="text-muted-foreground hover:text-foreground text-xs"
                >
                  Cancel
                </button>
              </div>

              <form onSubmit={handleFinishConsultation} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                    Clinical Diagnosis
                  </label>
                  <input
                    type="text"
                    required
                    value={diagnosis}
                    onChange={(e) => setDiagnosis(e.target.value)}
                    placeholder="e.g., Stage 1 Essential Hypertension with mild tachycardia"
                    className="w-full px-3.5 py-2 rounded-xl bg-background border border-input text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                    Consultation Notes & Lifestyle Guidance
                  </label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Advised reduced sodium diet, daily 30m aerobic exercise, and hydration tracking..."
                    className="w-full px-3.5 py-2 rounded-xl bg-background border border-input text-xs"
                  />
                </div>

                {/* Structured Prescription Items */}
                <div className="pt-2">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-semibold text-muted-foreground">
                      Structured Prescriptions
                    </label>
                    <button
                      type="button"
                      onClick={addPrescriptionItem}
                      className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-secondary hover:bg-secondary/80 flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" /> Add Medicine
                    </button>
                  </div>

                  <div className="space-y-2">
                    {prescriptions.map((p, idx) => (
                      <div
                        key={idx}
                        className="grid grid-cols-1 sm:grid-cols-4 gap-2 p-3 rounded-2xl bg-secondary/40 border border-border/40"
                      >
                        <input
                          type="text"
                          required
                          placeholder="Medicine Name & Dosage"
                          value={p.medicine}
                          onChange={(e) => {
                            const updated = [...prescriptions];
                            updated[idx].medicine = e.target.value;
                            setPrescriptions(updated);
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-background border border-input text-xs sm:col-span-2"
                        />
                        <input
                          type="text"
                          placeholder="Duration (e.g. 14 days)"
                          value={p.duration}
                          onChange={(e) => {
                            const updated = [...prescriptions];
                            updated[idx].duration = e.target.value;
                            setPrescriptions(updated);
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-background border border-input text-xs"
                        />
                        <div className="flex items-center gap-1">
                          <input
                            type="text"
                            placeholder="Dosage instruction"
                            value={p.dosage}
                            onChange={(e) => {
                              const updated = [...prescriptions];
                              updated[idx].dosage = e.target.value;
                              setPrescriptions(updated);
                            }}
                            className="w-full px-2.5 py-1.5 rounded-lg bg-background border border-input text-xs"
                          />
                          {prescriptions.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removePrescriptionItem(idx)}
                              className="p-1.5 text-rose-500 hover:bg-rose-500/10 rounded-lg"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/40">
                  <button
                    type="button"
                    onClick={() => setActiveConsultationModal(null)}
                    className="px-4 py-2 rounded-xl bg-secondary text-xs font-semibold hover:bg-secondary/80"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingNotes}
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/25 disabled:opacity-50"
                  >
                    {submittingNotes ? "Saving..." : "Save Prescription & Mark Complete"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
