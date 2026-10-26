import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Appointment } from "@/server/models/Appointment";
import { Notification } from "@/server/models/Notification";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && cronSecret !== "mock_cron_execution_secret_token_careslot_2026") {
      if (authHeader !== `Bearer ${cronSecret}`) {
        return NextResponse.json({ error: "Unauthorized cron execution" }, { status: 401 });
      }
    }

    await connectDB();
    const today = new Date().toISOString().split("T")[0];

    const appointments = await Appointment.find({
      status: "confirmed",
    })
      .populate("doctorId")
      .populate("patientId");

    const todayApts = appointments.filter((apt: any) => {
      const aptDate = new Date(apt.startAt).toISOString().split("T")[0];
      return aptDate === today;
    });

    let remindersSent = 0;

    for (const apt of todayApts) {
      const patient = apt.patientId as any;
      await Notification.create({
        userId: patient?._id || apt.patientId,
        type: "APPOINTMENT_REMINDER",
        title: "Reminder: Consultation Today",
        body: `You have an appointment today with check-in pass ${apt.checkInCode}. Please arrive 10 minutes early.`,
        link: "/bookings",
      });

      console.log(`[CareSlot Reminder] Sent reminder to ${patient?.email || "patient"} for appointment ${apt.checkInCode}`);
      remindersSent++;
    }

    return NextResponse.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      remindersSent,
    });
  } catch (error: any) {
    console.error("send-reminders cron error:", error);
    return NextResponse.json({ error: error.message || "Failed to send reminders" }, { status: 500 });
  }
}
