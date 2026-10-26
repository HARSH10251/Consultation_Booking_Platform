import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { WaitlistService } from "@/server/services/waitlistService";

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: { id?: string; offerId?: string } }
) {
  try {
    const user = await requireAuth();
    const offerId = params.offerId || params.id;

    if (!offerId) {
      return NextResponse.json({ error: "offerId is required" }, { status: 400 });
    }

    const body = await req.json();
    const { action } = body; // "accept" | "decline"

    if (action !== "accept" && action !== "decline") {
      return NextResponse.json(
        { error: "action must be either 'accept' or 'decline'" },
        { status: 400 }
      );
    }

    const result = await WaitlistService.respondToOffer(offerId, user.id, action);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("respond to offer error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to respond to offer" },
      { status: error.message === "UNAUTHORIZED" ? 401 : 500 }
    );
  }
}
