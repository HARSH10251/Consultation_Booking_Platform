import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Appointment } from "@/server/models/Appointment";
import { DoctorProfile } from "@/server/models/DoctorProfile";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    // Find the primary doctor
    const doc = await DoctorProfile.findOne().populate("userId");
    if (!doc) {
      return NextResponse.json({ error: "No doctors found" }, { status: 400 });
    }

    // Find today's appointments
    const today = new Date().toISOString().split("T")[0];
    const appointments = await Appointment.find({ doctorId: doc._id }).sort({ startAt: 1 });

    const todayApts = appointments.filter((a) => {
      return new Date(a.startAt).toISOString().split("T")[0] === today;
    });

    if (todayApts.length === 0) {
      return NextResponse.json({
        message: "No appointments today for Dr. " + (doc.userId as any)?.name + ". Seed database to test.",
      });
    }

    // Set appointment #1 to in_progress with artificial overrun
    const firstApt = todayApts[0];
    firstApt.status = "in_progress";
    await firstApt.save();

    // Increment estimated delay by 15 mins on downstream appointments
    for (let i = 1; i < todayApts.length; i++) {
      todayApts[i].estimatedDelayMin = (todayApts[i].estimatedDelayMin || 0) + 15;
      await todayApts[i].save();
    }

    return NextResponse.json({
      success: true,
      injectedDelayMinutes: 15,
      doctor: (doc.userId as any)?.name,
      affectedPatientsCount: todayApts.length - 1,
      message: `Injected +15 min consultation delay. All ${todayApts.length - 1} remaining patients today have been updated.`,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
