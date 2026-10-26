import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface ITimeRange {
  start: string; // "09:00"
  end: string;   // "17:00"
}

export interface IDaySchedule {
  day: number; // 0 = Sunday, 1 = Monday, ...
  ranges: ITimeRange[];
  breaks: ITimeRange[];
}

export interface ITimeOff {
  startDate: Date;
  endDate: Date;
  reason?: string;
}

export interface IDoctorProfile extends Document {
  userId: Types.ObjectId;
  specialtyId: Types.ObjectId;
  qualifications: string[];
  experienceYears: number;
  fee: number; // INR
  bio: string;
  languages: string[];
  assignedRoomId?: Types.ObjectId;
  slotDurationMin: number;
  bufferMin: number;
  weeklySchedule: IDaySchedule[];
  timeOff: ITimeOff[];
  ratingAvg: number;
  ratingCount: number;
  approved: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const TimeRangeSchema = new Schema<ITimeRange>(
  {
    start: { type: String, required: true },
    end: { type: String, required: true },
  },
  { _id: false }
);

const DayScheduleSchema = new Schema<IDaySchedule>(
  {
    day: { type: Number, required: true, min: 0, max: 6 },
    ranges: [TimeRangeSchema],
    breaks: [TimeRangeSchema],
  },
  { _id: false }
);

const TimeOffSchema = new Schema<ITimeOff>(
  {
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    reason: { type: String },
  },
  { _id: false }
);

const DoctorProfileSchema = new Schema<IDoctorProfile>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    specialtyId: { type: Schema.Types.ObjectId, ref: "Specialty", required: true },
    qualifications: [{ type: String }],
    experienceYears: { type: Number, default: 0 },
    fee: { type: Number, required: true, min: 0 },
    bio: { type: String, default: "" },
    languages: [{ type: String }],
    assignedRoomId: { type: Schema.Types.ObjectId, ref: "FacilityRoom" },
    slotDurationMin: { type: Number, default: 30 },
    bufferMin: { type: Number, default: 0 },
    weeklySchedule: [DayScheduleSchema],
    timeOff: [TimeOffSchema],
    ratingAvg: { type: Number, default: 5.0, min: 0, max: 5 },
    ratingCount: { type: Number, default: 0 },
    approved: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const DoctorProfile: Model<IDoctorProfile> =
  mongoose.models.DoctorProfile ||
  mongoose.model<IDoctorProfile>("DoctorProfile", DoctorProfileSchema);
