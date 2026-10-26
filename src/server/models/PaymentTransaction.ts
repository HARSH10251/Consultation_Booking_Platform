import mongoose, { Schema, Document, Model, Types } from "mongoose";

export type PaymentTxStatus = "created" | "captured" | "failed" | "refunded";

export interface IPaymentTransaction extends Document {
  appointmentId: Types.ObjectId;
  patientId: Types.ObjectId;
  doctorId: Types.ObjectId;
  amount: number; // in INR
  currency: string;
  razorpayOrderId: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  status: PaymentTxStatus;
  refundId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentTransactionSchema = new Schema<IPaymentTransaction>(
  {
    appointmentId: { type: Schema.Types.ObjectId, ref: "Appointment", required: true },
    patientId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    doctorId: { type: Schema.Types.ObjectId, ref: "DoctorProfile", required: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: "INR" },
    razorpayOrderId: { type: String, required: true },
    razorpayPaymentId: { type: String },
    razorpaySignature: { type: String },
    status: {
      type: String,
      enum: ["created", "captured", "failed", "refunded"],
      default: "created",
    },
    refundId: { type: String },
  },
  { timestamps: true }
);

export const PaymentTransaction: Model<IPaymentTransaction> =
  mongoose.models.PaymentTransaction ||
  mongoose.model<IPaymentTransaction>("PaymentTransaction", PaymentTransactionSchema);
