import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { DoctorProfile } from "@/server/models/DoctorProfile";
import { Review } from "@/server/models/Review";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const doctor = await DoctorProfile.findById(params.id)
      .populate("userId", "name email image phone")
      .populate("specialtyId")
      .populate("assignedRoomId", "name equipment")
      .lean();

    if (!doctor) {
      return NextResponse.json({ error: "Doctor not found" }, { status: 404 });
    }

    const reviews = await Review.find({ doctorId: doctor._id })
      .populate("patientId", "name")
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    return NextResponse.json({ doctor, reviews });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch doctor" },
      { status: 500 }
    );
  }
}
