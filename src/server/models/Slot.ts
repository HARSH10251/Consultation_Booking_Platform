import mongoose, { Schema, Document, Model, Types } from "mongoose";

export type SlotStatus = "available" | "held" | "held_for_offer" | "booked" | "blocked";

export interface ISlot extends Document {
  doctorId: Types.ObjectId;
  roomId?: Types.ObjectId;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  startAt: Date;
  status: SlotStatus;
  heldBy?: Types.ObjectId;
  holdExpiresAt?: Date;
  appointmentId?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const SlotSchema = new Schema<ISlot>(
  {
    doctorId: { type: Schema.Types.ObjectId, ref: "DoctorProfile", required: true },
    roomId: { type: Schema.Types.ObjectId, ref: "FacilityRoom" },
    date: { type: String, required: true, index: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    startAt: { type: Date, required: true, index: true },
    status: {
      type: String,
      enum: ["available", "held", "held_for_offer", "booked", "blocked"],
      default: "available",
      index: true,
    },
    heldBy: { type: Schema.Types.ObjectId, ref: "User" },
    holdExpiresAt: { type: Date, index: true },
    appointmentId: { type: Schema.Types.ObjectId, ref: "Appointment" },
  },
  { timestamps: true }
);

// Indexes
SlotSchema.index({ doctorId: 1, startAt: 1 }, { unique: true });
SlotSchema.index({ roomId: 1, startAt: 1 });
SlotSchema.index({ doctorId: 1, date: 1, status: 1 });

export const Slot: Model<ISlot> =
  mongoose.models.Slot || mongoose.model<ISlot>("Slot", SlotSchema);
