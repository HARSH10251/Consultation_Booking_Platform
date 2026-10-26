import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { Appointment } from "@/server/models/Appointment";
import { DoctorProfile } from "@/server/models/DoctorProfile";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth();
    await connectDB();

    let query: any = {};
    if (user.role === "patient") {
      query.patientId = user.id;
    } else if (user.role === "doctor") {
      const doc = await DoctorProfile.findOne({ userId: user.id });
      if (doc) query.doctorId = doc._id;
    }

    const appointments = await Appointment.find(query)
      .populate({
        path: "doctorId",
        populate: [
          { path: "userId", select: "name email image phone" },
          { path: "specialtyId", select: "name icon" },
          { path: "assignedRoomId", select: "name" },
        ],
      })
      .populate("slotId")
      .populate("patientId", "name email phone")
      .sort({ startAt: -1 })
      .lean();

    return NextResponse.json({ appointments });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch appointments" },
      { status: error.message === "UNAUTHORIZED" ? 401 : 500 }
    );
  }
}
