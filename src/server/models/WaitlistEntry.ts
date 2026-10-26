import mongoose, { Schema, Document, Model, Types } from "mongoose";

export type WaitlistUrgency = "routine" | "soon" | "urgent";
export type WaitlistTimeOfDay = "any" | "morning" | "afternoon" | "evening";
export type WaitlistStatus =
  | "waiting"
  | "offered"
  | "accepted"
  | "declined"
  | "expired"
  | "left";

export interface IWaitlistEntry extends Document {
  patientId: Types.ObjectId;
  doctorId: Types.ObjectId;
  dateFrom: string; // YYYY-MM-DD
  dateTo: string;   // YYYY-MM-DD
  timeOfDay: WaitlistTimeOfDay;
  urgency: WaitlistUrgency;
  symptomNotes: string;
  isFollowUp: boolean;
  status: WaitlistStatus;
  declinedCount: number;
  joinedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const WaitlistEntrySchema = new Schema<IWaitlistEntry>(
  {
    patientId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    doctorId: { type: Schema.Types.ObjectId, ref: "DoctorProfile", required: true, index: true },
    dateFrom: { type: String, required: true },
    dateTo: { type: String, required: true },
    timeOfDay: {
      type: String,
      enum: ["any", "morning", "afternoon", "evening"],
      default: "any",
    },
    urgency: {
      type: String,
      enum: ["routine", "soon", "urgent"],
      default: "routine",
    },
    symptomNotes: { type: String, default: "" },
    isFollowUp: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ["waiting", "offered", "accepted", "declined", "expired", "left"],
      default: "waiting",
      index: true,
    },
    declinedCount: { type: Number, default: 0 },
    joinedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const WaitlistEntry: Model<IWaitlistEntry> =
  mongoose.models.WaitlistEntry ||
  mongoose.model<IWaitlistEntry>("WaitlistEntry", WaitlistEntrySchema);
