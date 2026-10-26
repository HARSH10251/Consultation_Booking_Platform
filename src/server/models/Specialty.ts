import mongoose, { Schema, Document, Model } from "mongoose";

export interface ISpecialty extends Document {
  name: string;
  slug: string;
  icon: string;
  keywords: string[];
  createdAt: Date;
}

const SpecialtySchema = new Schema<ISpecialty>(
  {
    name: { type: String, required: true, unique: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    icon: { type: String, default: "Stethoscope" },
    keywords: [{ type: String, trim: true }],
  },
  { timestamps: true }
);

export const Specialty: Model<ISpecialty> =
  mongoose.models.Specialty || mongoose.model<ISpecialty>("Specialty", SpecialtySchema);
