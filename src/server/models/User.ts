import mongoose, { Schema, Document, Model } from "mongoose";

export type UserRole = "patient" | "doctor" | "admin";
export type UserStatus = "active" | "pending" | "suspended";

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash?: string;
  role: UserRole;
  image?: string;
  phone?: string;
  status: UserStatus;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String },
    role: { type: String, enum: ["patient", "doctor", "admin"], default: "patient" },
    image: { type: String },
    phone: { type: String, trim: true },
    status: { type: String, enum: ["active", "pending", "suspended"], default: "active" },
  },
  { timestamps: true }
);

export const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
