"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { formatMinutesToTime, generateSlotsForDay } from "@/server/domain/slotGenerator";
import { DaySchedule } from "@/server/domain/conflictMatrix";
import {
  Calendar,
  Clock,
  DollarSign,
  HelpCircle,
  Plus,
  RefreshCw,
  Save,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

const DAYS = [
  { id: 1, name: "Monday" },
  { id: 2, name: "Tuesday" },
  { id: 3, name: "Wednesday" },
  { id: 4, name: "Thursday" },
  { id: 5, name: "Friday" },
  { id: 6, name: "Saturday" },
  { id: 0, name: "Sunday" },
];

export default function DoctorSchedulePage() {
  const [selectedDay, setSelectedDay] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [rooms, setRooms] = useState<any[]>([]);
  const [assignedRoomId, setAssignedRoomId] = useState("");
  const [fee, setFee] = useState(1200);
  const [slotDurationMin, setSlotDurationMin] = useState(30);
  const [bufferMin, setBufferMin] = useState(5);

  const [weeklySchedule, setWeeklySchedule] = useState<DaySchedule[]>([
    { day: 1, ranges: [{ start: "09:00", end: "17:00" }], breaks: [{ start: "13:00", end: "14:00" }] },
    { day: 2, ranges: [{ start: "09:00", end: "17:00" }], breaks: [{ start: "13:00", end: "14:00" }] },
    { day: 3, ranges: [{ start: "09:00", end: "17:00" }], breaks: [{ start: "13:00", end: "14:00" }] },
    { day: 4, ranges: [{ start: "09:00", end: "17:00" }], breaks: [{ start: "13:00", end: "14:00" }] },
    { day: 5, ranges: [{ start: "09:00", end: "17:00" }], breaks: [{ start: "13:00", end: "14:00" }] },
    { day: 6, ranges: [{ start: "09:30", end: "13:30" }], breaks: [] },
    { day: 0, ranges: [], breaks: [] },
  ]);

  useEffect(() => {
    fetch("/api/doctor/schedule")
      .then((res) => res.json())
      .then((data) => {
        if (data.rooms) setRooms(data.rooms);
        if (data.profile) {
          if (data.profile.weeklySchedule?.length > 0) {
            setWeeklySchedule(data.profile.weeklySchedule);
          }
          if (data.profile.fee) setFee(data.profile.fee);
          if (data.profile.slotDurationMin) setSlotDurationMin(data.profile.slotDurationMin);
          if (data.profile.bufferMin !== undefined) setBufferMin(data.profile.bufferMin);
          if (data.profile.assignedRoomId) {
            setAssignedRoomId(
              typeof data.profile.assignedRoomId === "object"
                ? data.profile.assignedRoomId._id
                : data.profile.assignedRoomId
            );
          }
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading schedule:", err);
        setLoading(false);
      });
  }, []);

  const currentDaySchedule =
    weeklySchedule.find((d) => d.day === selectedDay) || {
      day: selectedDay,
      ranges: [],
      breaks: [],
    };

  const updateCurrentDayRanges = (newRanges: any[]) => {
    setWeeklySchedule((prev) =>
      prev.map((d) => (d.day === selectedDay ? { ...d, ranges: newRanges } : d))
    );
  };

  const updateCurrentDayBreaks = (newBreaks: any[]) => {
    setWeeklySchedule((prev) =>
      prev.map((d) => (d.day === selectedDay ? { ...d, breaks: newBreaks } : d))
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/doctor/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          weeklySchedule,
          slotDurationMin,
          bufferMin,
          fee,
          assignedRoomId: assignedRoomId || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to update schedule");
        setSaving(false);
        return;
      }

      toast.success(
        `Schedule verified & synced! ${data.syncResult?.created || 0} slots generated for the next 30 days.`
      );
    } catch (err: any) {
      toast.error(err.message || "An unexpected error occurred");
    } finally {
      setSaving(false);
    }
  };

  // Preview slots for current day
  const previewDate = new Date();
  const previewSlots = generateSlotsForDay(
    previewDate,
    currentDaySchedule,
    slotDurationMin,
    bufferMin
  );

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1 container py-8 max-w-7xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">Schedule Matrix & Slots</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Configure weekly availability, slot durations, room assignment, and zero-conflict validation.
            </p>
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm shadow-md shadow-primary/20 hover:bg-primary/90 transition-all hover:scale-105 disabled:opacity-50"
          >
            {saving ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>Save & Generate Slots</span>
          </button>
        </div>

        {/* Global Settings Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="glass-panel p-4 rounded-2xl border border-border/60">
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
              Consultation Fee (INR)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-sm font-bold text-muted-foreground">₹</span>
              <input
                type="number"
                min="100"
                value={fee}
                onChange={(e) => setFee(Number(e.target.value))}
                className="w-full pl-8 pr-3 py-2 rounded-xl bg-background/80 border border-input text-sm font-bold"
              />
            </div>
          </div>

          <div className="glass-panel p-4 rounded-2xl border border-border/60">
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
              Slot Duration
            </label>
            <select
              value={slotDurationMin}
              onChange={(e) => setSlotDurationMin(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl bg-background/80 border border-input text-sm font-bold"
            >
              <option value="15">15 Minutes</option>
              <option value="20">20 Minutes</option>
              <option value="30">30 Minutes</option>
              <option value="45">45 Minutes</option>
              <option value="60">60 Minutes</option>
            </select>
          </div>

          <div className="glass-panel p-4 rounded-2xl border border-border/60">
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
              Buffer Between Slots
            </label>
            <select
              value={bufferMin}
              onChange={(e) => setBufferMin(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl bg-background/80 border border-input text-sm font-bold"
            >
              <option value="0">0 Minutes (Back to back)</option>
              <option value="5">5 Minutes</option>
              <option value="10">10 Minutes</option>
              <option value="15">15 Minutes</option>
            </select>
          </div>

          <div className="glass-panel p-4 rounded-2xl border border-border/60">
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
              Assigned Clinic Room
            </label>
            <select
              value={assignedRoomId}
              onChange={(e) => setAssignedRoomId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-background/80 border border-input text-sm font-bold"
            >
              <option value="">No Room Assigned</option>
              {rooms.map((r) => (
                <option key={r._id} value={r._id}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Weekday Selector Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6">
          {DAYS.map((d) => {
            const hasRanges = (weeklySchedule.find((s) => s.day === d.id)?.ranges.length || 0) > 0;
            return (
              <button
                key={d.id}
                onClick={() => setSelectedDay(d.id)}
                className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all shrink-0 ${
                  selectedDay === d.id
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/25 scale-105"
                    : hasRanges
                    ? "bg-secondary text-foreground hover:bg-secondary/80"
                    : "bg-secondary/40 text-muted-foreground hover:bg-secondary/70"
                }`}
              >
                {d.name} {hasRanges ? "•" : "(Off)"}
              </button>
            );
          })}
        </div>

        {/* Schedule Matrix Editor for Selected Day */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Working Hours & Breaks (2 cols) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Working Ranges */}
            <div className="glass-panel p-6 rounded-3xl border border-border/60">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-base flex items-center gap-2">
                  <Clock className="w-4 h-4 text-primary" />
                  Working Shift Hours
                </h3>
                <button
                  onClick={() =>
                    updateCurrentDayRanges([
                      ...currentDaySchedule.ranges,
                      { start: "09:00", end: "17:00" },
                    ])
                  }
                  className="px-3 py-1 rounded-xl text-xs font-semibold bg-secondary hover:bg-secondary/80 flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Range
                </button>
              </div>

              {currentDaySchedule.ranges.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">
                  No working hours set for this day (Doctor is off).
                </p>
              ) : (
                <div className="space-y-3">
                  {currentDaySchedule.ranges.map((r, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-3 p-3 rounded-2xl bg-secondary/40 border border-border/40"
                    >
                      <span className="text-xs font-semibold text-muted-foreground w-16">
                        Shift #{idx + 1}
                      </span>
                      <input
                        type="time"
                        value={r.start}
                        onChange={(e) => {
                          const updated = [...currentDaySchedule.ranges];
                          updated[idx].start = e.target.value;
                          updateCurrentDayRanges(updated);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-background border border-input text-xs font-mono font-bold"
                      />
                      <span className="text-xs text-muted-foreground">to</span>
                      <input
                        type="time"
                        value={r.end}
                        onChange={(e) => {
                          const updated = [...currentDaySchedule.ranges];
                          updated[idx].end = e.target.value;
                          updateCurrentDayRanges(updated);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-background border border-input text-xs font-mono font-bold"
                      />
                      <button
                        onClick={() =>
                          updateCurrentDayRanges(
                            currentDaySchedule.ranges.filter((_, i) => i !== idx)
                          )
                        }
                        className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-xl ml-auto"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Breaks */}
            <div className="glass-panel p-6 rounded-3xl border border-border/60">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-base flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-amber-500" />
                  Lunch & Break Windows (Excluded from booking)
                </h3>
                <button
                  onClick={() =>
                    updateCurrentDayBreaks([
                      ...currentDaySchedule.breaks,
                      { start: "13:00", end: "14:00" },
                    ])
                  }
                  className="px-3 py-1 rounded-xl text-xs font-semibold bg-secondary hover:bg-secondary/80 flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Break
                </button>
              </div>

              {currentDaySchedule.breaks.length === 0 ? (
                <p className="text-sm text-muted-foreground py-2 text-center">
                  No breaks scheduled for this day.
                </p>
              ) : (
                <div className="space-y-3">
                  {currentDaySchedule.breaks.map((b, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-3 p-3 rounded-2xl bg-secondary/40 border border-border/40"
                    >
                      <span className="text-xs font-semibold text-muted-foreground w-16">
                        Break #{idx + 1}
                      </span>
                      <input
                        type="time"
                        value={b.start}
                        onChange={(e) => {
                          const updated = [...currentDaySchedule.breaks];
                          updated[idx].start = e.target.value;
                          updateCurrentDayBreaks(updated);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-background border border-input text-xs font-mono font-bold"
                      />
                      <span className="text-xs text-muted-foreground">to</span>
                      <input
                        type="time"
                        value={b.end}
                        onChange={(e) => {
                          const updated = [...currentDaySchedule.breaks];
                          updated[idx].end = e.target.value;
                          updateCurrentDayBreaks(updated);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-background border border-input text-xs font-mono font-bold"
                      />
                      <button
                        onClick={() =>
                          updateCurrentDayBreaks(
                            currentDaySchedule.breaks.filter((_, i) => i !== idx)
                          )
                        }
                        className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-xl ml-auto"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Live Slot Preview (1 col) */}
          <div className="glass-panel p-6 rounded-3xl border border-border/60 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-base">Live Slot Preview</h3>
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary">
                {previewSlots.length} Slots
              </span>
            </div>

            <p className="text-xs text-muted-foreground mb-4">
              Slots generated in real time based on shift hours, break exclusion, and buffer time.
            </p>

            <div className="flex-1 overflow-y-auto max-h-[380px] space-y-2 pr-1">
              {previewSlots.map((s, idx) => (
                <div
                  key={idx}
                  className="px-3 py-2 rounded-xl bg-secondary/50 border border-border/30 flex items-center justify-between text-xs"
                >
                  <span className="font-mono font-bold">
                    {s.startTime} - {s.endTime}
                  </span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-medium">Available</span>
                </div>
              ))}
              {previewSlots.length === 0 && (
                <div className="text-center py-12 text-muted-foreground text-xs">
                  No slots will be generated. Add working shift hours on the left.
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
