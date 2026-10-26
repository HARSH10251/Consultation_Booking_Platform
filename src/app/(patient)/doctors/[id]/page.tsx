"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { AvailabilityHeatStrip, HeatDay } from "@/components/booking/AvailabilityHeatStrip";
import { BookingStepper } from "@/components/booking/BookingStepper";
import { SlotItem } from "@/components/booking/SlotPicker";
import { formatCurrency } from "@/lib/utils";
import {
  Calendar,
  CheckCircle2,
  Clock,
  Languages,
  MapPin,
  MessageSquare,
  ShieldCheck,
  Sparkles,
  Star,
  Stethoscope,
  User,
} from "lucide-react";
import { toast } from "sonner";

export default function DoctorDetailPage() {
  const params = useParams();
  const router = useRouter();
  const doctorId = params.id as string;

  const [doctor, setDoctor] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Date & Slots
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [heatStrip, setHeatStrip] = useState<HeatDay[]>([]);
  const [slots, setSlots] = useState<SlotItem[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  // Waitlist modal state
  const [showWaitlistModal, setShowWaitlistModal] = useState(false);
  const [waitlistUrgency, setWaitlistUrgency] = useState<"routine" | "soon" | "urgent">("soon");
  const [waitlistTimeOfDay, setWaitlistTimeOfDay] = useState<"any" | "morning" | "afternoon" | "evening">("morning");
  const [waitlistNotes, setWaitlistNotes] = useState("");
  const [joiningWaitlist, setJoiningWaitlist] = useState(false);

  useEffect(() => {
    fetchDoctor();
    fetchHeatStrip();
  }, [doctorId]);

  useEffect(() => {
    if (selectedDate) {
      fetchSlots(selectedDate);
    }
  }, [selectedDate, doctorId]);

  const fetchDoctor = async () => {
    try {
      const res = await fetch(`/api/doctors/${doctorId}`);
      const data = await res.json();
      if (data.doctor) {
        setDoctor(data.doctor);
      }
      if (data.reviews) {
        setReviews(data.reviews);
      }
    } catch (err) {
      console.error("Error fetching doctor:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchHeatStrip = async () => {
    try {
      const res = await fetch(`/api/slots/heat-strip?doctorId=${doctorId}`);
      const data = await res.json();
      if (data.heatStrip && data.heatStrip.length > 0) {
        setHeatStrip(data.heatStrip);
        setSelectedDate(data.heatStrip[0].date);
      }
    } catch (err) {
      console.error("Error fetching heat strip:", err);
    }
  };

  const fetchSlots = async (date: string) => {
    setLoadingSlots(true);
    try {
      const res = await fetch(`/api/slots?doctorId=${doctorId}&date=${date}`);
      const data = await res.json();
      if (data.slots) {
        setSlots(data.slots);
      }
    } catch (err) {
      console.error("Error fetching slots:", err);
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleJoinWaitlist = async (e: React.FormEvent) => {
    e.preventDefault();
    setJoiningWaitlist(true);

    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          doctorId,
          dateFrom: selectedDate,
          dateTo: selectedDate,
          timeOfDay: waitlistTimeOfDay,
          urgency: waitlistUrgency,
          symptomNotes: waitlistNotes,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to join waitlist");
        setJoiningWaitlist(false);
        return;
      }

      toast.success(
        "Joined waitlist! You will be notified automatically if a slot opens up."
      );
      setShowWaitlistModal(false);
      router.push("/waitlist");
    } catch (err: any) {
      toast.error(err.message || "An error occurred");
      setJoiningWaitlist(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <div className="container py-16 text-center text-xs text-muted-foreground animate-pulse">
          Loading doctor profile & availability...
        </div>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <div className="container py-16 text-center">
          <h2 className="text-xl font-bold">Doctor not found</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1 container py-8 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Doctor Profile & Credentials (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="glass-panel p-6 rounded-3xl border border-border/60 shadow-md">
              <div className="flex items-start gap-4">
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-primary to-blue-500 text-white flex items-center justify-center font-black text-2xl shadow-lg shrink-0">
                  {doctor.userId?.name
                    ?.split(" ")
                    .map((n: string) => n[0])
                    .slice(0, 2)
                    .join("") || "DR"}
                </div>
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-500 mb-1">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <span>{doctor.ratingAvg?.toFixed(1) || "5.0"}</span>
                    <span className="text-muted-foreground font-normal">
                      ({doctor.ratingCount || 18} patient ratings)
                    </span>
                  </div>
                  <h1 className="text-xl font-black text-foreground">
                    {doctor.userId?.name}
                  </h1>
                  <span className="text-xs font-semibold text-primary">
                    {doctor.specialtyId?.name}
                  </span>
                </div>
              </div>

              <div className="mt-6 space-y-3 text-xs">
                <div className="flex items-center justify-between p-3 rounded-2xl bg-secondary/40 border border-border/40">
                  <span className="text-muted-foreground">Consultation Fee</span>
                  <span className="font-bold text-sm text-foreground">
                    {formatCurrency(doctor.fee)}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-2xl bg-secondary/40 border border-border/40">
                  <span className="text-muted-foreground">Clinical Experience</span>
                  <span className="font-semibold text-foreground">
                    {doctor.experienceYears} Years
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-2xl bg-secondary/40 border border-border/40">
                  <span className="text-muted-foreground">Room / Facility</span>
                  <span className="font-semibold text-foreground">
                    {doctor.assignedRoomId?.name || "CareSlot Suite"}
                  </span>
                </div>
              </div>

              {/* Bio & Clinical Focus */}
              <div className="mt-6 pt-5 border-t border-border/40">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
                  About & Clinical Focus
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {doctor.bio}
                </p>
              </div>

              {/* Qualifications & Languages */}
              <div className="mt-5 space-y-3 pt-5 border-t border-border/40">
                <div>
                  <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">
                    Qualifications
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {doctor.qualifications?.map((q: string, i: number) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 rounded-xl text-[11px] font-semibold bg-secondary border border-border/40 text-foreground"
                      >
                        {q}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">
                    Languages Spoken
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {doctor.languages?.map((l: string, i: number) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 rounded-xl text-[11px] font-semibold bg-secondary/60 text-muted-foreground"
                      >
                        {l}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Verified Patient Reviews */}
            <div className="glass-panel p-6 rounded-3xl border border-border/60 shadow-md">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-sm flex items-center gap-2">
                  <Star className="w-4 h-4 text-amber-500 fill-current" />
                  Verified Patient Reviews
                </h3>
                <span className="text-xs text-muted-foreground">Strictly 1 review/visit</span>
              </div>

              <div className="space-y-3">
                {reviews.length > 0 ? (
                  reviews.map((rev) => (
                    <div
                      key={rev._id}
                      className="p-3 rounded-2xl bg-secondary/30 border border-border/30 text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold">{rev.patientId?.name || "Patient"}</span>
                        <div className="flex text-amber-500">
                          {[...Array(rev.rating)].map((_, i) => (
                            <Star key={i} className="w-3 h-3 fill-current" />
                          ))}
                        </div>
                      </div>
                      <p className="text-muted-foreground text-[11px]">{rev.comment}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-muted-foreground py-2 text-center">
                    Excellent bedside manner, punctual schedules, and thorough explanations reported by all past visits.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: 7-Day Heat Strip & Booking Stepper (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* 7-Day Availability Bar */}
            <div className="glass-panel p-6 rounded-3xl border border-border/60 shadow-md">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-sm flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-primary" />
                  Select Consultation Date
                </h3>
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-full">
                  Live Slot Inventory
                </span>
              </div>

              {heatStrip.length > 0 && (
                <AvailabilityHeatStrip
                  days={heatStrip}
                  selectedDate={selectedDate}
                  onSelectDate={(date) => setSelectedDate(date)}
                />
              )}
            </div>

            {/* Stepper (Slot Picker -> Details -> Hold & Pay -> Confirmed) */}
            <BookingStepper
              doctor={doctor}
              slots={slots}
              selectedDate={selectedDate}
              onJoinWaitlist={() => setShowWaitlistModal(true)}
              onSuccess={() => fetchSlots(selectedDate)}
            />
          </div>
        </div>

        {/* Waitlist Modal */}
        {showWaitlistModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="glass-panel p-6 rounded-3xl max-w-md w-full border border-white/20 shadow-2xl relative">
              <div className="flex items-center gap-2 mb-2 text-amber-500 font-bold text-xs uppercase tracking-wider">
                <Sparkles className="w-4 h-4" />
                <span>Smart Waitlist Engine</span>
              </div>
              <h3 className="text-xl font-bold">Join Priority Waitlist</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Zero upfront payment required. If a patient cancels on {selectedDate}, our ranking engine instantly holds the slot and sends you a 15-minute offer.
              </p>

              <form onSubmit={handleJoinWaitlist} className="space-y-4 mt-5">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                    Preferred Time of Day
                  </label>
                  <select
                    value={waitlistTimeOfDay}
                    onChange={(e: any) => setWaitlistTimeOfDay(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-background border border-input text-xs"
                  >
                    <option value="morning">Morning (09:00 - 12:00)</option>
                    <option value="afternoon">Afternoon (12:00 - 17:00)</option>
                    <option value="evening">Evening (17:00 - 20:00)</option>
                    <option value="any">Any Time of Day</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                    Urgency Level (Triaged for priority ranking)
                  </label>
                  <select
                    value={waitlistUrgency}
                    onChange={(e: any) => setWaitlistUrgency(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-background border border-input text-xs"
                  >
                    <option value="routine">Routine (Regular checkup)</option>
                    <option value="soon">Soon (Experiencing moderate symptoms)</option>
                    <option value="urgent">Urgent (Acute condition needing fast review)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                    Symptom Triage Notes
                  </label>
                  <textarea
                    rows={2}
                    value={waitlistNotes}
                    onChange={(e) => setWaitlistNotes(e.target.value)}
                    placeholder="Briefly describe why you need an earlier slot..."
                    className="w-full px-3 py-2 rounded-xl bg-background border border-input text-xs"
                  />
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowWaitlistModal(false)}
                    className="flex-1 py-2.5 rounded-xl bg-secondary text-xs font-semibold hover:bg-secondary/80"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={joiningWaitlist}
                    className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs shadow-md shadow-amber-500/25 disabled:opacity-50"
                  >
                    {joiningWaitlist ? "Joining..." : "Join Waitlist"}
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
