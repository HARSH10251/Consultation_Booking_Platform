import mongoose, { Schema, Document, Model, Types } from "mongoose";

export type AppointmentStatus =
  | "pending"
  | "confirmed"
  | "checked_in"
  | "in_progress"
  | "completed"
  | "cancelled"
  | "no_show"
  | "rescheduled";

export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";
export type ConsultationMode = "in_person" | "video";

export interface IAppointment extends Document {
  patientId: Types.ObjectId;
  forPatient?: Types.ObjectId; // self or FamilyMember
  doctorId: Types.ObjectId;
  slotId: Types.ObjectId;
  startAt: Date;
  status: AppointmentStatus;
  reason: string;
  symptoms: string[];
  urgencyScore: number;
  mode: ConsultationMode;
  fee: number;
  paymentStatus: PaymentStatus;
  paymentId?: string;
  razorpayOrderId?: string;
  estimatedDelayMin: number;
  cancelReason?: string;
  cancelledBy?: Types.ObjectId;
  lateCancel?: boolean;
  checkInCode: string;
  createdAt: Date;
  updatedAt: Date;
}

const AppointmentSchema = new Schema<IAppointment>(
  {
    patientId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    forPatient: { type: Schema.Types.ObjectId, ref: "FamilyMember" },
    doctorId: { type: Schema.Types.ObjectId, ref: "DoctorProfile", required: true, index: true },
    slotId: { type: Schema.Types.ObjectId, ref: "Slot", required: true, index: true },
    startAt: { type: Date, required: true, index: true },
    status: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "checked_in",
        "in_progress",
        "completed",
        "cancelled",
        "no_show",
        "rescheduled",
      ],
      default: "confirmed",
      index: true,
    },
    reason: { type: String, required: true },
    symptoms: [{ type: String }],
    urgencyScore: { type: Number, default: 0 },
    mode: { type: String, enum: ["in_person", "video"], default: "in_person" },
    fee: { type: Number, required: true },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
      index: true,
    },
    paymentId: { type: String },
    razorpayOrderId: { type: String },
    estimatedDelayMin: { type: Number, default: 0 },
    cancelReason: { type: String },
    cancelledBy: { type: Schema.Types.ObjectId, ref: "User" },
    lateCancel: { type: Boolean, default: false },
    checkInCode: { type: String, required: true },
  },
  { timestamps: true }
);

export const Appointment: Model<IAppointment> =
  mongoose.models.Appointment ||
  mongoose.model<IAppointment>("Appointment", AppointmentSchema);
