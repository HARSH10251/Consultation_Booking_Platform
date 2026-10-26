import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { AuditLog } from "@/server/models/AuditLog";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    await requireRole(["admin"]);
    await connectDB();

    const logs = await AuditLog.find()
      .populate("actorId", "name email role")
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    return NextResponse.json({ logs });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch audit logs" },
      { status: error.message === "FORBIDDEN" ? 403 : 500 }
    );
  }
}
