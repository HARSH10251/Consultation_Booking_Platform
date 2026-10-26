import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { QueueService } from "@/server/services/queueService";

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth();
    const body = await req.json().catch(() => ({}));
    const reason = body?.reason || "Patient requested cancellation";

    const result = await QueueService.cancelAppointment(params.id, user.id, reason);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Cancel appointment error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to cancel appointment" },
      { status: error.message === "UNAUTHORIZED" ? 401 : 500 }
    );
  }
}
