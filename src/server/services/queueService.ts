import { connectDB } from "@/lib/db";
import { Appointment, IAppointment, AppointmentStatus } from "@/server/models/Appointment";
import { Consultation, IPrescriptionItem } from "@/server/models/Consultation";
import { PaymentTransaction } from "@/server/models/PaymentTransaction";
import { Slot } from "@/server/models/Slot";
import { AuditLog } from "@/server/models/AuditLog";
import { Notification } from "@/server/models/Notification";
import { assertLegalTransition } from "@/server/domain/stateMachine";
import { calculateLiveQueueDelays, QueueAppointmentItem } from "@/server/domain/delayEstimator";
import { WaitlistService } from "./waitlistService";
import { Types } from "mongoose";

export class QueueService {
  /**
   * Fetches today's appointments for a doctor with live delay estimation.
   */
  static async getDoctorDailyQueue(doctorId: string | Types.ObjectId, dateStr?: string) {
    await connectDB();

    const targetDate = dateStr || new Date().toISOString().split("T")[0];

    const appointments = await Appointment.find({
      doctorId: new Types.ObjectId(doctorId),
    })
      .populate("patientId", "name email phone image")
      .populate("slotId")
      .sort({ startAt: 1 })
      .lean();

    // Filter appointments for the target date
    const todayAppointments = appointments.filter((apt: any) => {
      const aptDate = new Date(apt.startAt).toISOString().split("T")[0];
      return aptDate === targetDate;
    });

    // Map to QueueAppointmentItems for pure delay estimator
    const queueItems: QueueAppointmentItem[] = todayAppointments.map((apt: any) => ({
      id: apt._id.toString(),
      startAt: apt.startAt,
      slotDurationMin: 30,
      status: apt.status,
    }));

    const delayCalculation = calculateLiveQueueDelays(queueItems, new Date());

    // Calculate daily earnings
    const dailyEarnings = todayAppointments
      .filter((apt: any) => apt.paymentStatus === "paid" && apt.status !== "cancelled")
      .reduce((sum: number, apt: any) => sum + (apt.fee || 0), 0);

    return {
      date: targetDate,
      appointments: todayAppointments,
      delays: delayCalculation,
      dailyEarnings,
      totalCount: todayAppointments.length,
      completedCount: todayAppointments.filter((a: any) => a.status === "completed").length,
      inProgressCount: todayAppointments.filter((a: any) => a.status === "in_progress").length,
      waitingCount: todayAppointments.filter((a: any) => ["confirmed", "checked_in"].includes(a.status)).length,
    };
  }

  /**
   * Transitions appointment state and optionally creates consultation notes.
   */
  static async updateStatus(
    appointmentId: string,
    targetStatus: AppointmentStatus,
    actorId: string,
    consultationData?: {
      notes?: string;
      diagnosis?: string;
      prescription?: IPrescriptionItem[];
      followUpDate?: Date;
    }
  ) {
    await connectDB();
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) throw new Error("Appointment not found");

    assertLegalTransition(appointment.status, targetStatus);

    appointment.status = targetStatus;

    if (targetStatus === "in_progress") {
      // Find or create consultation
      let consultation = await Consultation.findOne({ appointmentId: appointment._id });
      if (!consultation) {
        consultation = await Consultation.create({
          appointmentId: appointment._id,
          actualStartTime: new Date(),
        });
      } else {
        consultation.actualStartTime = new Date();
        await consultation.save();
      }
    } else if (targetStatus === "completed") {
      let consultation = await Consultation.findOne({ appointmentId: appointment._id });
      if (!consultation) {
        consultation = await Consultation.create({
          appointmentId: appointment._id,
          actualEndTime: new Date(),
          notes: consultationData?.notes || "",
          diagnosis: consultationData?.diagnosis || "",
          prescription: consultationData?.prescription || [],
          followUpDate: consultationData?.followUpDate,
        });
      } else {
        consultation.actualEndTime = new Date();
        if (consultationData?.notes) consultation.notes = consultationData.notes;
        if (consultationData?.diagnosis) consultation.diagnosis = consultationData.diagnosis;
        if (consultationData?.prescription) consultation.prescription = consultationData.prescription;
        if (consultationData?.followUpDate) consultation.followUpDate = consultationData.followUpDate;
        await consultation.save();
      }

      // Notify patient of consultation completion
      await Notification.create({
        userId: appointment.patientId,
        type: "CONSULTATION_COMPLETED",
        title: "Consultation Completed",
        body: "Your prescription and clinical summary are ready to view and download.",
        link: `/bookings`,
      });
    }

    await appointment.save();

    await AuditLog.create({
      actorId: new Types.ObjectId(actorId),
      action: `APPOINTMENT_STATUS_${targetStatus.toUpperCase()}`,
      entityType: "Appointment",
      entityId: appointment._id.toString(),
    });

    return appointment;
  }

  /**
   * Cancels appointment, executes 100% refund policy if >2h before visit,
   * and triggers smart waitlist cascade to fill the vacated slot!
   */
  static async cancelAppointment(
    appointmentId: string,
    actorId: string,
    reason: string = "Patient cancelled"
  ) {
    await connectDB();
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) throw new Error("Appointment not found");

    if (appointment.status === "completed" || appointment.status === "cancelled") {
      throw new Error(`Cannot cancel appointment with status '${appointment.status}'`);
    }

    const now = new Date();
    const startAt = new Date(appointment.startAt);
    const hoursDifference = (startAt.getTime() - now.getTime()) / (1000 * 60 * 60);

    const isEligibleForRefund = hoursDifference >= 2;

    appointment.status = "cancelled";
    appointment.cancelReason = reason;
    appointment.cancelledBy = new Types.ObjectId(actorId);
    appointment.lateCancel = !isEligibleForRefund;

    if (isEligibleForRefund && appointment.paymentStatus === "paid") {
      appointment.paymentStatus = "refunded";

      // Mark payment transaction as refunded
      await PaymentTransaction.updateOne(
        { appointmentId: appointment._id },
        {
          $set: {
            status: "refunded",
            refundId: `rfnd_auto_${Date.now()}`,
          },
        }
      );
    }

    await appointment.save();

    // Trigger Smart Waitlist Cascading for the freed slot!
    let cascadeResult = null;
    if (appointment.slotId) {
      cascadeResult = await WaitlistService.triggerSlotCascade(appointment.slotId);
    }

    await AuditLog.create({
      actorId: new Types.ObjectId(actorId),
      action: "APPOINTMENT_CANCELLED",
      entityType: "Appointment",
      entityId: appointment._id.toString(),
      meta: {
        refunded: isEligibleForRefund,
        hoursNotice: hoursDifference.toFixed(1),
        cascaded: cascadeResult?.cascaded,
      },
    });

    return {
      success: true,
      refunded: isEligibleForRefund,
      message: isEligibleForRefund
        ? "Appointment cancelled. 100% consultation fee refund processed."
        : "Appointment cancelled under late cancellation window (<2h).",
      cascadeResult,
    };
  }
}
