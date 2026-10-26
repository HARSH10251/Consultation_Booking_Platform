import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { DoctorProfile } from "@/server/models/DoctorProfile";
import { User } from "@/server/models/User";
import { AuditLog } from "@/server/models/AuditLog";
import { SlotService } from "@/server/services/slotService";
import { Types } from "mongoose";

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await requireRole(["admin"]);
    await connectDB();

    const profile = await DoctorProfile.findById(params.id);
    if (!profile) {
      return NextResponse.json({ error: "Doctor not found" }, { status: 404 });
    }

    profile.approved = true;
    await profile.save();

    await User.updateOne({ _id: profile.userId }, { $set: { status: "active" } });

    // Sync 30-day slots for newly approved doctor
    await SlotService.syncDoctorSlots(profile._id, 30);

    await AuditLog.create({
      actorId: new Types.ObjectId(admin.id),
      action: "DOCTOR_APPROVED",
      entityType: "DoctorProfile",
      entityId: profile._id.toString(),
    });

    return NextResponse.json({
      success: true,
      message: "Doctor approved and 30-day rolling schedule activated!",
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to approve doctor" },
      { status: error.message === "FORBIDDEN" ? 403 : 500 }
    );
  }
}
