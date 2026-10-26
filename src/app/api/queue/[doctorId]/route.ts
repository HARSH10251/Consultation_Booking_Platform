import { NextRequest, NextResponse } from "next/server";
import { QueueService } from "@/server/services/queueService";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: { doctorId: string } }
) {
  try {
    const { searchParams } = new URL(req.url);
    const date = searchParams.get("date") || undefined;

    const queueData = await QueueService.getDoctorDailyQueue(params.doctorId, date);
    return NextResponse.json(queueData);
  } catch (error: any) {
    console.error("GET /api/queue/[doctorId] error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch doctor queue" },
      { status: 500 }
    );
  }
}
