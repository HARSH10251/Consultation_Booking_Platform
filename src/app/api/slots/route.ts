import { NextRequest, NextResponse } from "next/server";
import { SlotService } from "@/server/services/slotService";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const doctorId = searchParams.get("doctorId");
    const date = searchParams.get("date");

    if (!doctorId || !date) {
      return NextResponse.json(
        { error: "doctorId and date are required query parameters" },
        { status: 400 }
      );
    }

    const slots = await SlotService.getSlotsForDate(doctorId, date);
    return NextResponse.json({ slots });
  } catch (error: any) {
    console.error("GET /api/slots error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch slots" },
      { status: 500 }
    );
  }
}
