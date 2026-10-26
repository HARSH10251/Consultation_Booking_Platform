import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { Appointment } from "@/server/models/Appointment";
import { AuditLog } from "@/server/models/AuditLog";
import { Types } from "mongoose";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth();
    await connectDB();

    // Find an appointment belonging to ANOTHER patient
    const otherAppointment = await Appointment.findOne({
      patientId: { $ne: new Types.ObjectId(user.id) },
    }).populate("patientId", "name email");

    if (!otherAppointment) {
      return NextResponse.json({
        message: "No other patient appointments found. Run seed script.",
      });
    }

    // RBAC Security Check: A patient must get a 403 when requesting another patient's data!
    if (user.role === "patient" && otherAppointment.patientId._id.toString() !== user.id) {
      await AuditLog.create({
        actorId: new Types.ObjectId(user.id),
        action: "PRIVILEGE_ESCALATION_BLOCKED",
        entityType: "Appointment",
        entityId: otherAppointment._id.toString(),
        meta: {
          attemptedBy: user.email,
          targetPatient: (otherAppointment.patientId as any)?.email,
        },
      });

      return NextResponse.json(
        {
          error: "403 Forbidden: You do not have permission to view another patient's medical records.",
          blocked: true,
          securityEnforced: "Server-side RBAC & Ownership Guard active",
          targetResource: {
            appointmentId: otherAppointment._id,
            owner: (otherAppointment.patientId as any)?.name,
          },
        },
        { status: 403 }
      );
    }

    return NextResponse.json({
      message: "Authorized access",
      appointment: otherAppointment,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Privilege test error" },
      { status: error.message === "UNAUTHORIZED" ? 401 : 500 }
    );
  }
}
