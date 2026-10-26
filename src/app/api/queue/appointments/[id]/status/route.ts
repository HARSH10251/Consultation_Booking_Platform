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
    const body = await req.json();
    const { targetStatus, notes, diagnosis, prescription, followUpDate } = body;

    if (!targetStatus) {
      return NextResponse.json({ error: "targetStatus is required" }, { status: 400 });
    }

    const updated = await QueueService.updateStatus(
      params.id,
      targetStatus,
      user.id,
      { notes, diagnosis, prescription, followUpDate }
    );

    return NextResponse.json({
      success: true,
      appointment: updated,
    });
  } catch (error: any) {
    console.error("update status error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update appointment status" },
      { status: error.message?.includes("Illegal") ? 400 : 500 }
    );
  }
}
