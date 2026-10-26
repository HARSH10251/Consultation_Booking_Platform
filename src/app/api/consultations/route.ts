import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Consultation } from "@/server/models/Consultation";
import { Appointment } from "@/server/models/Appointment";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const appointmentId = searchParams.get("appointmentId");

    if (!appointmentId) {
      return NextResponse.json(
        { error: "appointmentId query param required" },
        { status: 400 }
      );
    }

    await connectDB();
    const consultation = await Consultation.findOne({ appointmentId })
      .populate({
        path: "appointmentId",
        populate: [
          {
            path: "doctorId",
            populate: [
              { path: "userId", select: "name email phone" },
              { path: "specialtyId", select: "name" },
            ],
          },
          { path: "patientId", select: "name email phone" },
        ],
      })
      .lean();

    return NextResponse.json({ consultation });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch consultation" },
      { status: 500 }
    );
  }
}
