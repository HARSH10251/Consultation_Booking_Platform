import { NextRequest, NextResponse } from "next/server";
import { SlotService } from "@/server/services/slotService";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const doctorId = searchParams.get("doctorId");
    const startDateParam = searchParams.get("startDate");

    if (!doctorId) {
      return NextResponse.json(
        { error: "doctorId is required query parameter" },
        { status: 400 }
      );
    }

    const startDate = startDateParam ? new Date(startDateParam) : undefined;
    const heatStrip = await SlotService.getHeatStrip(doctorId, startDate);

    return NextResponse.json({ heatStrip });
  } catch (error: any) {
    console.error("GET /api/slots/heat-strip error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch heat strip" },
      { status: 500 }
    );
  }
}
