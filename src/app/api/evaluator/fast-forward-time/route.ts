import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { SlotOffer } from "@/server/models/SlotOffer";
import { Slot } from "@/server/models/Slot";
import { WaitlistEntry } from "@/server/models/WaitlistEntry";
import { WaitlistService } from "@/server/services/waitlistService";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    // 1. If an active pending offer exists, fast-forward its expiresAt to the past
    let activeOffer = await SlotOffer.findOne({ status: "pending" });

    if (!activeOffer) {
      // Find a slot and trigger a cascade first to have an offer to fast forward!
      const slot = await Slot.findOne({ status: "booked" });
      if (slot) {
        await WaitlistService.triggerSlotCascade(slot._id);
        activeOffer = await SlotOffer.findOne({ status: "pending" });
      }
    }

    if (activeOffer) {
      // Fast forward expiresAt to 1 minute in the past
      activeOffer.expiresAt = new Date(Date.now() - 60 * 1000);
      await activeOffer.save();
    }

    // Also expire any slot holds
    await Slot.updateMany(
      { status: "held" },
      { $set: { holdExpiresAt: new Date(Date.now() - 60 * 1000) } }
    );

    // 2. Process expired offers & trigger cascade
    const cascadedCount = await WaitlistService.processExpiredOffers();

    return NextResponse.json({
      success: true,
      message: "Fast-forwarded 15 minutes! Offer expired and slot cascaded to next waiting patient.",
      expiredOfferId: activeOffer?._id,
      cascadedCount,
    });
  } catch (error: any) {
    console.error("fast-forward error:", error);
    return NextResponse.json({ error: error.message || "Failed to fast forward" }, { status: 500 });
  }
}
