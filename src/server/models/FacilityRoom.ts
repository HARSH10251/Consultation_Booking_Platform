import mongoose, { Schema, Document, Model } from "mongoose";

export interface IFacilityRoom extends Document {
  name: string;
  equipment: string[];
  isAvailable: boolean;
  createdAt: Date;
}

const FacilityRoomSchema = new Schema<IFacilityRoom>(
  {
    name: { type: String, required: true, trim: true },
    equipment: [{ type: String, trim: true }],
    isAvailable: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const FacilityRoom: Model<IFacilityRoom> =
  mongoose.models.FacilityRoom ||
  mongoose.model<IFacilityRoom>("FacilityRoom", FacilityRoomSchema);
