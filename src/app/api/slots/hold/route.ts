import { NextRequest, NextResponse } from "next/server";
import { BookingService } from "@/server/services/bookingService";
import { requireAuth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await req.json();
    const { slotId } = body;

    if (!slotId) {
      return NextResponse.json({ error: "slotId is required" }, { status: 400 });
    }

    const result = await BookingService.holdSlot(slotId, user.id, 5);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Slot is unavailable" },
        { status: 409 }
      );
    }

    return NextResponse.json({
      message: "Slot held for 5 minutes",
      slot: result.slot,
      expiresAt: result.expiresAt,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to hold slot" },
      { status: error.message === "UNAUTHORIZED" ? 401 : 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await req.json();
    const { slotId } = body;

    if (!slotId) {
      return NextResponse.json({ error: "slotId is required" }, { status: 400 });
    }

    const released = await BookingService.releaseHold(slotId, user.id);
    return NextResponse.json({ success: released });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to release slot hold" },
      { status: error.message === "UNAUTHORIZED" ? 401 : 500 }
    );
  }
}
