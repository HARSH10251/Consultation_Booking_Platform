import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IReview extends Document {
  appointmentId: Types.ObjectId;
  patientId: Types.ObjectId;
  doctorId: Types.ObjectId;
  rating: number; // 1-5
  comment?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema = new Schema<IReview>(
  {
    appointmentId: {
      type: Schema.Types.ObjectId,
      ref: "Appointment",
      required: true,
      unique: true,
    },
    patientId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    doctorId: { type: Schema.Types.ObjectId, ref: "DoctorProfile", required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, default: "" },
  },
  { timestamps: true }
);

export const Review: Model<IReview> =
  mongoose.models.Review || mongoose.model<IReview>("Review", ReviewSchema);
