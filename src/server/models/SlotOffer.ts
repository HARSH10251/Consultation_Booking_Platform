import mongoose, { Schema, Document, Model, Types } from "mongoose";

export type SlotOfferStatus = "pending" | "accepted" | "declined" | "expired";

export interface ISlotOffer extends Document {
  slotId: Types.ObjectId;
  waitlistEntryId: Types.ObjectId;
  patientId: Types.ObjectId;
  expiresAt: Date;
  status: SlotOfferStatus;
  rankScore: number;
  rankBreakdown: {
    urgencyWeight: number;
    waitHoursWeight: number;
    followUpBonus: number;
    penalties: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const SlotOfferSchema = new Schema<ISlotOffer>(
  {
    slotId: { type: Schema.Types.ObjectId, ref: "Slot", required: true, index: true },
    waitlistEntryId: {
      type: Schema.Types.ObjectId,
      ref: "WaitlistEntry",
      required: true,
      index: true,
    },
    patientId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    expiresAt: { type: Date, required: true, index: true },
    status: {
      type: String,
      enum: ["pending", "accepted", "declined", "expired"],
      default: "pending",
      index: true,
    },
    rankScore: { type: Number, required: true },
    rankBreakdown: {
      urgencyWeight: { type: Number, default: 0 },
      waitHoursWeight: { type: Number, default: 0 },
      followUpBonus: { type: Number, default: 0 },
      penalties: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

export const SlotOffer: Model<ISlotOffer> =
  mongoose.models.SlotOffer || mongoose.model<ISlotOffer>("SlotOffer", SlotOfferSchema);
