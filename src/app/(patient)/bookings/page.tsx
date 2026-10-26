"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  Calendar,
  Clock,
  Download,
  FileText,
  MapPin,
  QrCode,
  ShieldCheck,
  Stethoscope,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";

export default function BookingsListPage() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const res = await fetch("/api/bookings");
      const data = await res.json();
      if (data.appointments) {
        setAppointments(data.appointments);
      }
    } catch (err) {
      console.error("Error fetching bookings:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (appointmentId: string) => {
    if (!confirm("Are you sure you want to cancel this appointment? If cancelled >2h before, a 100% refund is processed automatically.")) {
      return;
    }

    try {
      const res = await fetch(`/api/bookings/${appointmentId}/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: "Patient requested cancellation" }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to cancel appointment");
        return;
      }

      toast.success(data.message || "Appointment cancelled and refund processed");
      fetchBookings();
    } catch (err: any) {
      toast.error(err.message || "An error occurred");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1 container py-8 max-w-5xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">My Consultations</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Active passes, digital check-in codes, and visit receipts.
            </p>
          </div>

          <Link
            href="/doctors"
            className="px-4 py-2 rounded-xl bg-primary text-primary-foreground font-semibold text-xs shadow-md shadow-primary/20 hover:bg-primary/90 transition-all hover:scale-105"
          >
            + Book New Slot
          </Link>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 rounded-3xl bg-secondary/40 animate-pulse" />
            ))}
          </div>
        ) : appointments.length === 0 ? (
          <div className="glass-panel p-12 rounded-3xl text-center border border-border/50">
            <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <h3 className="font-bold text-lg">No appointments booked yet</h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto mb-6">
              Browse our verified practitioners, check live availability heat strips, and book your first consultation.
            </p>
            <Link
              href="/doctors"
              className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-xs shadow-md shadow-primary/25 inline-block"
            >
              Browse Doctors
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {appointments.map((apt) => {
              const isPast = new Date(apt.startAt) < new Date();
              const isCancelled = apt.status === "cancelled";

              return (
                <div
                  key={apt._id}
                  className="glass-panel p-6 rounded-3xl border border-border/60 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-primary to-blue-500 text-white flex items-center justify-center font-bold text-lg shrink-0 shadow-md">
                      {apt.doctorId?.userId?.name
                        ?.split(" ")
                        .map((n: string) => n[0])
                        .slice(0, 2)
                        .join("") || "DR"}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            isCancelled
                              ? "bg-rose-500/10 text-rose-500"
                              : apt.status === "completed"
                              ? "bg-purple-500/10 text-purple-600"
                              : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                          }`}
                        >
                          {apt.status}
                        </span>
                        <span className="font-mono text-xs font-bold text-primary px-2 py-0.5 rounded-lg bg-secondary/80">
                          {apt.checkInCode}
                        </span>
                      </div>

                      <h3 className="font-bold text-base text-foreground">
                        Dr. {apt.doctorId?.userId?.name}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {apt.doctorId?.specialtyId?.name} • {apt.doctorId?.assignedRoomId?.name || "Clinic Room"}
                      </p>

                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-primary" />
                          {formatDate(apt.startAt)}
                        </span>
                        <span className="flex items-center gap-1 font-mono">
                          <Clock className="w-3.5 h-3.5 text-primary" />
                          {apt.slotId?.startTime || "10:00"}
                        </span>
                        <span>{formatCurrency(apt.fee)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    {!isCancelled && apt.status !== "completed" && (
                      <button
                        onClick={() => handleCancel(apt._id)}
                        className="px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-500/10 border border-rose-500/20 transition-colors"
                      >
                        Cancel Visit
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
