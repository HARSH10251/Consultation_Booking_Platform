import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IPrescriptionItem {
  medicine: string;
  dosage: string;
  duration: string;
  instructions: string;
}

export interface IConsultation extends Document {
  appointmentId: Types.ObjectId;
  actualStartTime?: Date;
  actualEndTime?: Date;
  notes: string;
  diagnosis: string;
  prescription: IPrescriptionItem[];
  followUpDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const PrescriptionItemSchema = new Schema<IPrescriptionItem>(
  {
    medicine: { type: String, required: true },
    dosage: { type: String, required: true },
    duration: { type: String, required: true },
    instructions: { type: String, default: "" },
  },
  { _id: false }
);

const ConsultationSchema = new Schema<IConsultation>(
  {
    appointmentId: {
      type: Schema.Types.ObjectId,
      ref: "Appointment",
      required: true,
      unique: true,
    },
    actualStartTime: { type: Date },
    actualEndTime: { type: Date },
    notes: { type: String, default: "" },
    diagnosis: { type: String, default: "" },
    prescription: [PrescriptionItemSchema],
    followUpDate: { type: Date },
  },
  { timestamps: true }
);

export const Consultation: Model<IConsultation> =
  mongoose.models.Consultation ||
  mongoose.model<IConsultation>("Consultation", ConsultationSchema);
