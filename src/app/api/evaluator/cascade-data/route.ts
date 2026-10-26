import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { WaitlistEntry } from "@/server/models/WaitlistEntry";
import { SlotOffer } from "@/server/models/SlotOffer";
import { Slot } from "@/server/models/Slot";
import { DoctorProfile } from "@/server/models/DoctorProfile";
import { rankWaitlistCandidates } from "@/server/domain/waitlistRanker";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const doctor = await DoctorProfile.findOne().populate("userId").populate("specialtyId");
    if (!doctor) {
      return NextResponse.json({ error: "No doctors found" }, { status: 400 });
    }

    const waitingEntries = await WaitlistEntry.find({
      doctorId: doctor._id,
      status: { $in: ["waiting", "offered"] },
    })
      .populate("patientId", "name email")
      .lean();

    const candidates = waitingEntries.map((e: any) => ({
      id: e._id.toString(),
      patientId: e.patientId?._id?.toString() || e.patientId?.toString(),
      urgency: e.urgency,
      joinedAt: e.joinedAt,
      isFollowUp: e.isFollowUp,
      declinedCount: e.declinedCount,
    }));

    const ranked = rankWaitlistCandidates(candidates, new Date());

    const activeOffer = await SlotOffer.findOne({ status: "pending" })
      .populate("patientId", "name email")
      .populate("slotId")
      .lean();

    return NextResponse.json({
      doctor: {
        id: doctor._id,
        name: (doctor.userId as any)?.name,
        specialty: (doctor.specialtyId as any)?.name,
      },
      rankedQueue: ranked.map((r) => {
        const entry = waitingEntries.find((w: any) => w._id.toString() === r.entry.id);
        return {
          rank: r.rank,
          score: r.score,
          breakdown: r.breakdown,
          patientName: (entry?.patientId as any)?.name || "Patient",
          urgency: r.entry.urgency,
          isFollowUp: r.entry.isFollowUp,
          declinedCount: r.entry.declinedCount,
        };
      }),
      activeOffer,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
