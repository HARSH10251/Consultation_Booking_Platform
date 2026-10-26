import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IFamilyMember extends Document {
  ownerId: Types.ObjectId;
  name: string;
  relation: string;
  dob?: Date;
  gender?: string;
  createdAt: Date;
}

const FamilyMemberSchema = new Schema<IFamilyMember>(
  {
    ownerId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true },
    relation: { type: String, required: true },
    dob: { type: Date },
    gender: { type: String },
  },
  { timestamps: true }
);

export const FamilyMember: Model<IFamilyMember> =
  mongoose.models.FamilyMember ||
  mongoose.model<IFamilyMember>("FamilyMember", FamilyMemberSchema);
