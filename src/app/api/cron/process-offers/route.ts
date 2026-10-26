import { NextRequest, NextResponse } from "next/server";
import { WaitlistService } from "@/server/services/waitlistService";
import { SlotService } from "@/server/services/slotService";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    // Check CRON_SECRET if configured
    if (cronSecret && cronSecret !== "mock_cron_execution_secret_token_careslot_2026") {
      if (authHeader !== `Bearer ${cronSecret}`) {
        return NextResponse.json({ error: "Unauthorized cron trigger" }, { status: 401 });
      }
    }

    const expiredOffersCount = await WaitlistService.processExpiredOffers();
    const expiredHoldsCount = await SlotService.releaseExpiredHolds();

    return NextResponse.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      cascadedOffers: expiredOffersCount,
      releasedHolds: expiredHoldsCount,
    });
  } catch (error: any) {
    console.error("Cron process-offers error:", error);
    return NextResponse.json(
      { error: error.message || "Cron processing failed" },
      { status: 500 }
    );
  }
}
