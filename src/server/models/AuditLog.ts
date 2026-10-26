import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IAuditLog extends Document {
  actorId?: Types.ObjectId;
  action: string;
  entityType: string;
  entityId?: string;
  meta?: Record<string, unknown>;
  createdAt: Date;
}

const AuditLogSchema = new Schema<IAuditLog>(
  {
    actorId: { type: Schema.Types.ObjectId, ref: "User" },
    action: { type: String, required: true },
    entityType: { type: String, required: true },
    entityId: { type: String },
    meta: { type: Schema.Types.Mixed },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const AuditLog: Model<IAuditLog> =
  mongoose.models.AuditLog || mongoose.model<IAuditLog>("AuditLog", AuditLogSchema);
