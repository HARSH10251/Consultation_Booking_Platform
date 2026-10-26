import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { WaitlistService } from "@/server/services/waitlistService";

export const dynamic = "force-dynamic";

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth();
    const success = await WaitlistService.leaveWaitlist(params.id, user.id);

    return NextResponse.json({ success, message: "Left waitlist" });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to leave waitlist" },
      { status: error.message === "UNAUTHORIZED" ? 401 : 500 }
    );
  }
}
