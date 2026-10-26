import { connectDB } from "@/lib/db";
import { Slot, ISlot } from "@/server/models/Slot";
import { Appointment, IAppointment } from "@/server/models/Appointment";
import { PaymentTransaction } from "@/server/models/PaymentTransaction";
import { DoctorProfile } from "@/server/models/DoctorProfile";
import { AuditLog } from "@/server/models/AuditLog";
import { Types } from "mongoose";

export interface HoldSlotResult {
  success: boolean;
  slot?: any;
  error?: string;
  expiresAt?: Date;
}

export interface ConfirmBookingInput {
  slotId: string;
  patientId: string;
  forPatient?: string;
  reason: string;
  symptoms: string[];
  mode: "in_person" | "video";
  urgencyScore?: number;
  paymentId?: string;
  razorpayOrderId?: string;
  razorpaySignature?: string;
}

export class BookingService {
  /**
   * Atomically places a 5-minute hold on an available slot.
   * If slot is already held by someone else, or already booked, fails gracefully.
   */
  static async holdSlot(
    slotId: string,
    patientId: string,
    holdDurationMinutes: number = 5
  ): Promise<HoldSlotResult> {
    await connectDB();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + holdDurationMinutes * 60 * 1000);

    const slot = await Slot.findOneAndUpdate(
      {
        _id: slotId,
        $or: [
          { status: "available" },
          { status: "held", holdExpiresAt: { $lt: now } }, // Expired hold can be acquired
          { status: "held", heldBy: new Types.ObjectId(patientId) }, // Same patient refreshing hold
        ],
      },
      {
        $set: {
          status: "held",
          heldBy: new Types.ObjectId(patientId),
          holdExpiresAt: expiresAt,
        },
      },
      { new: true }
    );

    if (!slot) {
      return {
        success: false,
        error: "This slot is currently held or booked by another patient.",
      };
    }

    return {
      success: true,
      slot,
      expiresAt,
    };
  }

  /**
   * Explicitly releases a held slot back to 'available' if abandoned.
   */
  static async releaseHold(slotId: string, patientId: string): Promise<boolean> {
    await connectDB();
    const res = await Slot.updateOne(
      {
        _id: slotId,
        status: "held",
        heldBy: new Types.ObjectId(patientId),
      },
      {
        $set: { status: "available" },
        $unset: { heldBy: 1, holdExpiresAt: 1 },
      }
    );

    return res.modifiedCount > 0;
  }

  /**
   * Atomic booking completion:
   * Transitions slot from 'held' or 'held_for_offer' to 'booked'.
   * Zero double booking is guaranteed through atomic findOneAndUpdate.
   */
  static async confirmBooking(input: ConfirmBookingInput): Promise<IAppointment> {
    await connectDB();

    const patientObjId = new Types.ObjectId(input.patientId);
    const slotObjId = new Types.ObjectId(input.slotId);

    // Atomic slot lock transition
    const lockedSlot = await Slot.findOneAndUpdate(
      {
        _id: slotObjId,
        status: { $in: ["held", "held_for_offer"] },
        heldBy: patientObjId,
      },
      {
        $set: {
          status: "booked",
        },
        $unset: {
          holdExpiresAt: 1,
        },
      },
      { new: true }
    );

    if (!lockedSlot) {
      throw new Error("DOUBLE_BOOKING_OR_EXPIRED_HOLD");
    }

    // Fetch doctor profile for fee and details
    const doctor = await DoctorProfile.findById(lockedSlot.doctorId);
    const fee = doctor?.fee || 1000;

    const checkInCode = `CS-${Math.floor(1000 + Math.random() * 9000)}`;

    const appointment = await Appointment.create({
      patientId: patientObjId,
      forPatient: input.forPatient ? new Types.ObjectId(input.forPatient) : undefined,
      doctorId: lockedSlot.doctorId,
      slotId: lockedSlot._id,
      startAt: lockedSlot.startAt,
      status: "confirmed",
      reason: input.reason || "General Consultation",
      symptoms: input.symptoms || [],
      urgencyScore: input.urgencyScore || 0,
      mode: input.mode || "in_person",
      fee,
      paymentStatus: "paid",
      paymentId: input.paymentId || `pay_mock_${Date.now()}`,
      razorpayOrderId: input.razorpayOrderId || `order_mock_${Date.now()}`,
      estimatedDelayMin: 0,
      checkInCode,
    });

    // Link slot to appointment
    lockedSlot.appointmentId = appointment._id as any;
    await lockedSlot.save();

    // Record Payment Transaction
    await PaymentTransaction.create({
      appointmentId: appointment._id,
      patientId: patientObjId,
      doctorId: lockedSlot.doctorId,
      amount: fee,
      currency: "INR",
      razorpayOrderId: appointment.razorpayOrderId,
      razorpayPaymentId: appointment.paymentId,
      razorpaySignature: input.razorpaySignature || "mock_signature_verified",
      status: "captured",
    });

    await AuditLog.create({
      actorId: patientObjId,
      action: "APPOINTMENT_CONFIRMED",
      entityType: "Appointment",
      entityId: appointment._id.toString(),
      meta: { slotId: lockedSlot._id.toString(), fee },
    });

    return appointment;
  }
}
