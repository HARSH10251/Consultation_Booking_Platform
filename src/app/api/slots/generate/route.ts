import { NextRequest, NextResponse } from "next/server";
import { SlotService } from "@/server/services/slotService";
import { requireAuth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await req.json();
    const { doctorId, daysAhead = 30 } = body;

    const targetDocId = doctorId || user.doctorId;

    if (!targetDocId) {
      return NextResponse.json(
        { error: "doctorId is required" },
        { status: 400 }
      );
    }

    const result = await SlotService.syncDoctorSlots(targetDocId, daysAhead);
    return NextResponse.json({
      message: `Generated slots successfully`,
      ...result,
    });
  } catch (error: any) {
    console.error("POST /api/slots/generate error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate slots" },
      { status: error.message === "UNAUTHORIZED" ? 401 : 500 }
    );
  }
}
