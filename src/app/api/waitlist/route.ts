import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { WaitlistEntry } from "@/server/models/WaitlistEntry";
import { SlotOffer } from "@/server/models/SlotOffer";
import { WaitlistService } from "@/server/services/waitlistService";
import { Types } from "mongoose";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth();
    await connectDB();

    // Lazy process any expired offers
    await WaitlistService.processExpiredOffers();

    const entries = await WaitlistEntry.find({
      patientId: new Types.ObjectId(user.id),
      status: { $in: ["waiting", "offered"] },
    })
      .populate({
        path: "doctorId",
        populate: [
          { path: "userId", select: "name email image phone" },
          { path: "specialtyId", select: "name icon" },
        ],
      })
      .sort({ joinedAt: -1 })
      .lean();

    // Find any pending slot offers for this patient
    const offers = await SlotOffer.find({
      patientId: new Types.ObjectId(user.id),
      status: "pending",
      expiresAt: { $gt: new Date() },
    })
      .populate({
        path: "slotId",
        populate: [
          {
            path: "doctorId",
            populate: [
              { path: "userId", select: "name" },
              { path: "specialtyId", select: "name" },
            ],
          },
        ],
      })
      .lean();

    // Calculate queue position for each entry
    const enrichedEntries = await Promise.all(
      entries.map(async (entry: any) => {
        const earlierCount = await WaitlistEntry.countDocuments({
          doctorId: entry.doctorId?._id || entry.doctorId,
          dateFrom: entry.dateFrom,
          status: "waiting",
          joinedAt: { $lt: entry.joinedAt },
        });

        return {
          ...entry,
          queuePosition: earlierCount + 1,
        };
      })
    );

    return NextResponse.json({
      entries: enrichedEntries,
      activeOffers: offers,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch waitlist" },
      { status: error.message === "UNAUTHORIZED" ? 401 : 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await req.json();

    const { doctorId, dateFrom, dateTo, timeOfDay, urgency, symptomNotes, isFollowUp } = body;

    if (!doctorId || !dateFrom) {
      return NextResponse.json(
        { error: "doctorId and dateFrom are required" },
        { status: 400 }
      );
    }

    const entry = await WaitlistService.joinWaitlist({
      patientId: user.id,
      doctorId,
      dateFrom,
      dateTo: dateTo || dateFrom,
      timeOfDay,
      urgency,
      symptomNotes,
      isFollowUp,
    });

    return NextResponse.json({
      message: "Joined waitlist successfully",
      entry,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to join waitlist" },
      { status: error.message === "UNAUTHORIZED" ? 401 : 500 }
    );
  }
}
