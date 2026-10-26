import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { DoctorProfile } from "@/server/models/DoctorProfile";
import { FacilityRoom } from "@/server/models/FacilityRoom";
import {
  validateInternalSchedule,
  validateRoomScheduleOverlap,
  DoctorScheduleConfig,
} from "@/server/domain/conflictMatrix";
import { SlotService } from "@/server/services/slotService";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth();
    await connectDB();

    const profile = await DoctorProfile.findOne({ userId: user.id })
      .populate("assignedRoomId")
      .populate("specialtyId");

    const rooms = await FacilityRoom.find({ isAvailable: true }).lean();

    return NextResponse.json({ profile, rooms });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch schedule" },
      { status: error.message === "UNAUTHORIZED" ? 401 : 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    await connectDB();

    const profile = await DoctorProfile.findOne({ userId: user.id });
    if (!profile) {
      return NextResponse.json({ error: "Doctor profile not found" }, { status: 404 });
    }

    const body = await req.json();
    const { weeklySchedule, slotDurationMin, bufferMin, fee, assignedRoomId } = body;

    const incomingConfig: DoctorScheduleConfig = {
      doctorId: profile._id.toString(),
      roomId: assignedRoomId || (profile.assignedRoomId ? profile.assignedRoomId.toString() : undefined),
      weeklySchedule,
    };

    // 1. Internal check (end > start, no internal overlaps)
    const internalCheck = validateInternalSchedule(incomingConfig);
    if (internalCheck.hasConflict) {
      return NextResponse.json(
        {
          error: "Schedule validation failed: " + internalCheck.conflicts[0].description,
          conflicts: internalCheck.conflicts,
        },
        { status: 400 }
      );
    }

    // 2. Room collision check with other doctors
    if (incomingConfig.roomId) {
      const otherProfiles = await DoctorProfile.find({
        _id: { $ne: profile._id },
        assignedRoomId: incomingConfig.roomId,
      });

      const existingConfigs: DoctorScheduleConfig[] = otherProfiles.map((p) => ({
        doctorId: p._id.toString(),
        roomId: p.assignedRoomId?.toString(),
        weeklySchedule: p.weeklySchedule,
      }));

      const roomCheck = validateRoomScheduleOverlap(incomingConfig, existingConfigs);
      if (roomCheck.hasConflict) {
        return NextResponse.json(
          {
            error: "Room schedule conflict: " + roomCheck.conflicts[0].description,
            conflicts: roomCheck.conflicts,
          },
          { status: 409 }
        );
      }
    }

    // Save changes
    profile.weeklySchedule = weeklySchedule;
    if (slotDurationMin) profile.slotDurationMin = slotDurationMin;
    if (bufferMin !== undefined) profile.bufferMin = bufferMin;
    if (fee) profile.fee = fee;
    if (assignedRoomId) profile.assignedRoomId = assignedRoomId;

    await profile.save();

    // Auto-sync concrete slots for rolling 30 days
    const syncResult = await SlotService.syncDoctorSlots(profile._id, 30);

    return NextResponse.json({
      message: "Schedule updated and 30-day slots generated cleanly!",
      profile,
      syncResult,
    });
  } catch (error: any) {
    console.error("POST /api/doctor/schedule error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update schedule" },
      { status: error.message === "UNAUTHORIZED" ? 401 : 500 }
    );
  }
}
