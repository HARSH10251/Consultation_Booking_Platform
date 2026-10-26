"use client";

import React, { useState } from "react";
import confetti from "canvas-confetti";
import { formatCurrency } from "@/lib/utils";
import { SlotPicker, SlotItem } from "./SlotPicker";
import { HoldCountdownRing } from "./HoldCountdownRing";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Calendar,
  CheckCircle2,
  Clock,
  CreditCard,
  Download,
  FileText,
  MapPin,
  QrCode,
  ShieldCheck,
  Sparkles,
  User,
  Video,
} from "lucide-react";
import { toast } from "sonner";

interface BookingStepperProps {
  doctor: any;
  slots: SlotItem[];
  selectedDate: string;
  onJoinWaitlist?: () => void;
  onSuccess?: () => void;
}

export function BookingStepper({
  doctor,
  slots,
  selectedDate,
  onJoinWaitlist,
  onSuccess,
}: BookingStepperProps) {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1); // 1: Slot, 2: Details, 3: Payment Hold, 4: Confirmed
  const [selectedSlot, setSelectedSlot] = useState<SlotItem | null>(null);

  // Visit details
  const [reason, setReason] = useState("Routine consultation and health review");
  const [symptoms, setSymptoms] = useState<string>("Fever, Body ache");
  const [mode, setMode] = useState<"in_person" | "video">("in_person");
  const [urgencyScore, setUrgencyScore] = useState<number>(10);

  // Hold & Payment state
  const [holding, setHolding] = useState(false);
  const [holdExpiresAt, setHoldExpiresAt] = useState<Date | null>(null);
  const [orderData, setOrderData] = useState<any>(null);
  const [paying, setPaying] = useState(false);
  const [confirmedAppointment, setConfirmedAppointment] = useState<any>(null);

  // Trigger Hold when moving to Step 3
  const handleProceedToPayment = async () => {
    if (!selectedSlot) {
      toast.error("Please select an available slot first");
      return;
    }

    setHolding(true);
    try {
      // 1. Hold the slot
      const holdRes = await fetch("/api/slots/hold", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slotId: selectedSlot._id }),
      });

      const holdData = await holdRes.json();
      if (!holdRes.ok) {
        toast.error(holdData.error || "Could not hold this slot. It may have been booked.");
        setHolding(false);
        return;
      }

      setHoldExpiresAt(new Date(holdData.expiresAt));

      // 2. Create Razorpay Order
      const orderRes = await fetch("/api/payments/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slotId: selectedSlot._id }),
      });

      const oData = await orderRes.json();
      if (!orderRes.ok) {
        toast.error(oData.error || "Could not create payment order");
        setHolding(false);
        return;
      }

      setOrderData(oData);
      setStep(3);
    } catch (err: any) {
      toast.error(err.message || "An error occurred");
    } finally {
      setHolding(false);
    }
  };

  // Execute Payment Verification & Confirmation
  const handleCompletePayment = async (forceSimulateFailure = false) => {
    if (forceSimulateFailure) {
      toast.error("Simulated payment failure: Card declined by issuing bank.");
      return;
    }

    setPaying(true);
    try {
      const verifyRes = await fetch("/api/payments/verify-signature", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slotId: selectedSlot!._id,
          razorpayOrderId: orderData.orderId,
          razorpayPaymentId: `pay_mock_${Date.now()}`,
          razorpaySignature: "mock_signature_evaluator_bypass",
          reason,
          symptoms: symptoms.split(",").map((s) => s.trim()).filter(Boolean),
          mode,
          urgencyScore,
        }),
      });

      const verifyData = await verifyRes.json();

      if (!verifyRes.ok) {
        toast.error(verifyData.error || "Payment verification failed");
        setPaying(false);
        return;
      }

      // Celebratory Confetti Burst!
      confetti({
        particleCount: 120,
        spread: 70,
        origin: { y: 0.6 },
      });

      setConfirmedAppointment(verifyData.appointment);
      setStep(4);
      onSuccess?.();
    } catch (err: any) {
      toast.error(err.message || "Payment verification failed");
    } finally {
      setPaying(false);
    }
  };

  const handleDownloadReceipt = () => {
    const text = `================================================
CARESLOT CLINIC CONSULTATION INVOICE & PASS
================================================
Appointment ID: ${confirmedAppointment?._id}
Check-In Code:  ${confirmedAppointment?.checkInCode}
Doctor:         Dr. ${doctor?.userId?.name}
Specialty:      ${doctor?.specialtyId?.name}
Room:           ${doctor?.assignedRoomId?.name || "General Clinic"}
Date & Time:    ${selectedDate} at ${selectedSlot?.startTime}
Mode:           ${mode === "in_person" ? "In-Person Clinic Visit" : "Secure Telehealth Video"}
Patient Symptoms: ${symptoms}

FEE BREAKDOWN:
Doctor Fee:     ₹${orderData?.doctorFee || doctor.fee}
Platform GST:   ₹${orderData?.gstTax || 0}
TOTAL PAID:     ₹${orderData?.totalAmount || doctor.fee}
Payment Status: VERIFIED & CAPTURED (Razorpay Test Mode)
================================================
Please present this pass or your Check-In Code upon arrival.`;

    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `CareSlot_Receipt_${confirmedAppointment?.checkInCode}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Receipt downloaded!");
  };

  const handleDownloadICS = () => {
    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//CareSlot//Clinic Appointment//EN
BEGIN:VEVENT
SUMMARY:Doctor Visit: Dr. ${doctor?.userId?.name} (${doctor?.specialtyId?.name})
DESCRIPTION:Consultation with Dr. ${doctor?.userId?.name}. Check-In Code: ${confirmedAppointment?.checkInCode}
LOCATION:${doctor?.assignedRoomId?.name || "CareSlot Clinic Room"}
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: "text/calendar" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `CareSlot_Visit_${confirmedAppointment?.checkInCode}.ics`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Calendar event (.ics) downloaded!");
  };

  return (
    <div className="glass-panel p-6 rounded-3xl border border-border/60 shadow-lg relative">
      {/* Progress Indicators */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-border/40">
        <div className="flex items-center gap-2">
          <span
            className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
              step >= 1 ? "bg-primary text-white" : "bg-secondary text-muted-foreground"
            }`}
          >
            1
          </span>
          <span className="text-xs font-semibold hidden sm:inline">Select Slot</span>
        </div>
        <div className="h-0.5 w-8 bg-border/60" />
        <div className="flex items-center gap-2">
          <span
            className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
              step >= 2 ? "bg-primary text-white" : "bg-secondary text-muted-foreground"
            }`}
          >
            2
          </span>
          <span className="text-xs font-semibold hidden sm:inline">Visit Details</span>
        </div>
        <div className="h-0.5 w-8 bg-border/60" />
        <div className="flex items-center gap-2">
          <span
            className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
              step >= 3 ? "bg-primary text-white" : "bg-secondary text-muted-foreground"
            }`}
          >
            3
          </span>
          <span className="text-xs font-semibold hidden sm:inline">Payment Hold</span>
        </div>
        <div className="h-0.5 w-8 bg-border/60" />
        <div className="flex items-center gap-2">
          <span
            className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
              step === 4 ? "bg-emerald-600 text-white" : "bg-secondary text-muted-foreground"
            }`}
          >
            ✓
          </span>
          <span className="text-xs font-semibold hidden sm:inline">Confirmed</span>
        </div>
      </div>

      {/* STEP 1: Select Slot */}
      {step === 1 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-base">Choose an Available Slot</h4>
            <span className="text-xs font-medium text-muted-foreground">
              Date: <strong className="text-foreground">{selectedDate}</strong>
            </span>
          </div>

          <SlotPicker
            slots={slots}
            selectedSlotId={selectedSlot?._id}
            onSelectSlot={(slot) => setSelectedSlot(slot)}
            onJoinWaitlist={onJoinWaitlist}
          />

          <div className="mt-6 pt-4 border-t border-border/40 flex items-center justify-between">
            <div className="text-xs text-muted-foreground">
              Selected:{" "}
              {selectedSlot ? (
                <strong className="text-primary font-mono">{selectedSlot.startTime}</strong>
              ) : (
                "None"
              )}
            </div>

            <button
              type="button"
              disabled={!selectedSlot}
              onClick={() => setStep(2)}
              className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-xs shadow-md shadow-primary/20 hover:bg-primary/90 transition-all hover:scale-105 disabled:opacity-40 flex items-center gap-1.5"
            >
              <span>Continue to Details</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: Visit Details */}
      {step === 2 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-base">Consultation Details</h4>
            <button
              onClick={() => setStep(1)}
              className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Slots
            </button>
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
              Reason for Visit
            </label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g., Routine health assessment, acute chest tightness, skin rash"
              className="w-full px-3.5 py-2 rounded-xl bg-background border border-input text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
              Symptoms Experienced (comma separated)
            </label>
            <input
              type="text"
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              placeholder="e.g., Shortness of breath, palpitations, fatigue"
              className="w-full px-3.5 py-2 rounded-xl bg-background border border-input text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                Consultation Mode
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setMode("in_person")}
                  className={`flex-1 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border transition-all ${
                    mode === "in_person"
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-secondary/40 text-muted-foreground border-border/50"
                  }`}
                >
                  <MapPin className="w-3.5 h-3.5" /> In-Person
                </button>
                <button
                  type="button"
                  onClick={() => setMode("video")}
                  className={`flex-1 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border transition-all ${
                    mode === "video"
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-secondary/40 text-muted-foreground border-border/50"
                  }`}
                >
                  <Video className="w-3.5 h-3.5" /> Telehealth
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                Urgency Level
              </label>
              <select
                value={urgencyScore}
                onChange={(e) => setUrgencyScore(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-background border border-input text-xs"
              >
                <option value="10">Routine (Check-up / prescription refill)</option>
                <option value="25">Moderate (Symptoms interfering with work)</option>
                <option value="50">High (Acute discomfort / worsening pain)</option>
              </select>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-border/40 flex items-center justify-between">
            <button
              onClick={() => setStep(1)}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Cancel
            </button>

            <button
              type="button"
              disabled={holding}
              onClick={handleProceedToPayment}
              className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-xs shadow-md shadow-primary/20 hover:bg-primary/90 transition-all hover:scale-105 flex items-center gap-1.5"
            >
              {holding ? "Holding Slot..." : "Review & Lock Slot"}
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Payment Summary & 5-Min Hold */}
      {step === 3 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-base">Review & Pay Consultation Fee</h4>
            <span className="text-xs font-mono font-bold text-primary">
              Order: {orderData?.orderId?.slice(0, 16)}...
            </span>
          </div>

          {/* SVG Animated 5-Minute Hold Countdown */}
          {holdExpiresAt && (
            <HoldCountdownRing
              expiresAt={holdExpiresAt}
              onExpire={() => {
                toast.error("5-minute hold expired. Slot has been released.");
                setStep(1);
              }}
            />
          )}

          {/* Fee Breakdown Card */}
          <div className="p-4 rounded-2xl bg-secondary/40 border border-border/50 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Doctor Consultation Fee:</span>
              <span className="font-bold">{formatCurrency(orderData?.doctorFee || doctor.fee)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Platform GST & Handling (18%):</span>
              <span className="font-bold">{formatCurrency(orderData?.gstTax || 0)}</span>
            </div>
            <div className="pt-2 border-t border-border/40 flex items-center justify-between text-sm">
              <strong className="text-foreground">Total Payable Amount:</strong>
              <strong className="text-primary font-black text-base">
                {formatCurrency(orderData?.totalAmount || doctor.fee)}
              </strong>
            </div>
          </div>

          {/* Razorpay Test Mode Banner */}
          <div className="p-3 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-700 dark:text-blue-300 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 shrink-0 text-blue-500" />
            <span>
              Razorpay Test Mode Integration: Server-side HMAC SHA256 signature verification active.
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              type="button"
              disabled={paying}
              onClick={() => handleCompletePayment(false)}
              className="py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/25 transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
            >
              <CreditCard className="w-4 h-4" />
              <span>{paying ? "Verifying..." : "Pay with Razorpay (Success)"}</span>
            </button>

            <button
              type="button"
              disabled={paying}
              onClick={() => handleCompletePayment(true)}
              className="py-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 border border-rose-500/30 font-semibold text-xs transition-colors"
            >
              Simulate Failure
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: Confirmed & Pass */}
      {step === 4 && (
        <div className="text-center py-4 space-y-4">
          <div className="w-16 h-16 rounded-full bg-emerald-500/15 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <div>
            <h3 className="text-xl font-black">Consultation Confirmed!</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Your appointment has been atomically locked and payment verified.
            </p>
          </div>

          {/* Pass Card */}
          <div className="p-5 rounded-3xl bg-secondary/40 border border-border/60 max-w-sm mx-auto text-left space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-border/40">
              <span className="text-xs text-muted-foreground">Digital Check-In Pass</span>
              <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-primary text-primary-foreground">
                {confirmedAppointment?.checkInCode}
              </span>
            </div>

            <div className="space-y-1 text-xs">
              <p>
                <strong>Doctor:</strong> Dr. {doctor?.userId?.name}
              </p>
              <p>
                <strong>Time:</strong> {selectedDate} at {selectedSlot?.startTime}
              </p>
              <p>
                <strong>Room:</strong> {doctor?.assignedRoomId?.name || "Clinic Room"}
              </p>
              <p>
                <strong>Mode:</strong> {mode === "in_person" ? "In-Person Clinic Visit" : "Video Telehealth"}
              </p>
            </div>

            <div className="pt-2 flex items-center justify-center gap-3">
              <div className="w-16 h-16 bg-white dark:bg-slate-900 rounded-xl border border-border/50 flex items-center justify-center p-2">
                <QrCode className="w-12 h-12 text-foreground" />
              </div>
            </div>
          </div>

          {/* Download Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={handleDownloadReceipt}
              className="px-4 py-2 rounded-xl bg-secondary hover:bg-secondary/80 font-semibold text-xs flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5" /> Download PDF Receipt
            </button>
            <button
              onClick={handleDownloadICS}
              className="px-4 py-2 rounded-xl bg-secondary hover:bg-secondary/80 font-semibold text-xs flex items-center gap-1.5 transition-colors"
            >
              <Calendar className="w-3.5 h-3.5" /> Add to Calendar (.ics)
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
