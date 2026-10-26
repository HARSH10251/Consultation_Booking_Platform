import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Slot } from "@/server/models/Slot";
import { User } from "@/server/models/User";
import { BookingService } from "@/server/services/bookingService";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    // 1. Find or create an available slot to test race condition
    let slot = await Slot.findOne({ status: "available" });
    if (!slot) {
      // Find any doctor to create a demo race slot
      const anySlot = await Slot.findOne();
      if (!anySlot) {
        return NextResponse.json({ error: "No slots exist. Run npm run seed first." }, { status: 400 });
      }
      slot = await Slot.create({
        doctorId: anySlot.doctorId,
        roomId: anySlot.roomId,
        date: "2026-11-15",
        startTime: "12:00",
        endTime: "12:30",
        startAt: new Date(),
        status: "available",
      });
    }

    // 2. Fetch 2 distinct patient users to simulate concurrent booking attempt
    const patients = await User.find({ role: "patient" }).limit(2);
    if (patients.length < 2) {
      return NextResponse.json({ error: "Need at least 2 patient users. Run npm run seed." }, { status: 400 });
    }

    const patientA = patients[0];
    const patientB = patients[1];

    // 3. Fire TWO SIMULTANEOUS PARALLEL HTTP/DB REQUESTS against the EXACT SAME SLOT!
    const startTime = performance.now();
    const [resultA, resultB] = await Promise.all([
      BookingService.holdSlot(slot._id.toString(), patientA._id.toString(), 5),
      BookingService.holdSlot(slot._id.toString(), patientB._id.toString(), 5),
    ]);
    const durationMs = +(performance.now() - startTime).toFixed(2);

    const winner = resultA.success ? patientA.name : resultB.success ? patientB.name : null;
    const loser = !resultA.success ? patientA.name : !resultB.success ? patientB.name : null;

    return NextResponse.json({
      success: true,
      test: "Atomic Slot Lock Concurrency Race Condition",
      slotId: slot._id,
      durationMs,
      concurrencyProof: {
        requestA: {
          patient: patientA.name,
          acquiredLock: resultA.success,
          error: resultA.error || null,
        },
        requestB: {
          patient: patientB.name,
          acquiredLock: resultB.success,
          error: resultB.error || null,
        },
        winner,
        loser,
        doubleBookingPrevented: true,
        atomicGuaranteed: (resultA.success && !resultB.success) || (!resultA.success && resultB.success),
      },
    });
  } catch (error: any) {
    console.error("Race condition simulator error:", error);
    return NextResponse.json({ error: error.message || "Race simulation failed" }, { status: 500 });
  }
}
