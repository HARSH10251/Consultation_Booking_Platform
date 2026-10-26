import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const startTime = Date.now();
  let dbStatus = "disconnected";

  try {
    const mongooseInstance = await connectDB();
    if (mongooseInstance.connection.readyState === 1) {
      dbStatus = "connected";
    } else {
      dbStatus = `state_${mongooseInstance.connection.readyState}`;
    }
  } catch (error) {
    dbStatus = "error";
  }

  return NextResponse.json({
    status: "ok",
    service: "CareSlot API",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
    database: dbStatus,
    latencyMs: Date.now() - startTime,
    uptime: process.uptime(),
  });
}
