import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import { User } from "@/server/models/User";
import { DoctorProfile } from "@/server/models/DoctorProfile";
import { AuditLog } from "@/server/models/AuditLog";
import { registerPatientSchema, registerDoctorSchema } from "@/lib/validators/auth";
import { checkRateLimit } from "@/lib/rateLimit";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "client_reg";
    const rateCheck = checkRateLimit(`reg_${ip}`, 10, 60000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: "Too many registration attempts. Please wait a minute." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { role } = body;

    await connectDB();

    if (role === "doctor") {
      const parsed = registerDoctorSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json(
          { error: "Validation failed", details: parsed.error.flatten() },
          { status: 400 }
        );
      }

      const { email, password, name, phone, specialtyId, qualifications, experienceYears, fee, bio, languages, assignedRoomId } = parsed.data;

      const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
      if (existingUser) {
        return NextResponse.json(
          { error: "An account with this email already exists" },
          { status: 409 }
        );
      }

      const passwordHash = await bcrypt.hash(password, 10);
      const user = await User.create({
        name,
        email: email.toLowerCase().trim(),
        passwordHash,
        role: "doctor",
        phone,
        status: "pending", // Doctors remain pending until admin approves
      });

      const profile = await DoctorProfile.create({
        userId: user._id,
        specialtyId,
        qualifications,
        experienceYears,
        fee,
        bio,
        languages,
        assignedRoomId,
        slotDurationMin: 30,
        bufferMin: 5,
        weeklySchedule: [
          {
            day: 1, // Mon
            ranges: [{ start: "09:00", end: "17:00" }],
            breaks: [{ start: "13:00", end: "14:00" }],
          },
          {
            day: 2, // Tue
            ranges: [{ start: "09:00", end: "17:00" }],
            breaks: [{ start: "13:00", end: "14:00" }],
          },
          {
            day: 3, // Wed
            ranges: [{ start: "09:00", end: "17:00" }],
            breaks: [{ start: "13:00", end: "14:00" }],
          },
          {
            day: 4, // Thu
            ranges: [{ start: "09:00", end: "17:00" }],
            breaks: [{ start: "13:00", end: "14:00" }],
          },
          {
            day: 5, // Fri
            ranges: [{ start: "09:00", end: "17:00" }],
            breaks: [{ start: "13:00", end: "14:00" }],
          },
        ],
        approved: false,
      });

      await AuditLog.create({
        actorId: user._id,
        action: "DOCTOR_REGISTERED",
        entityType: "DoctorProfile",
        entityId: profile._id.toString(),
        meta: { email: user.email },
      });

      return NextResponse.json(
        {
          message: "Doctor registration submitted successfully. Your account is pending admin approval.",
          userId: user._id,
        },
        { status: 201 }
      );
    } else {
      // Patient registration
      const parsed = registerPatientSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json(
          { error: "Validation failed", details: parsed.error.flatten() },
          { status: 400 }
        );
      }

      const { email, password, name, phone } = parsed.data;

      const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
      if (existingUser) {
        return NextResponse.json(
          { error: "An account with this email already exists" },
          { status: 409 }
        );
      }

      const passwordHash = await bcrypt.hash(password, 10);
      const user = await User.create({
        name,
        email: email.toLowerCase().trim(),
        passwordHash,
        role: "patient",
        phone,
        status: "active",
      });

      await AuditLog.create({
        actorId: user._id,
        action: "PATIENT_REGISTERED",
        entityType: "User",
        entityId: user._id.toString(),
        meta: { email: user.email },
      });

      return NextResponse.json(
        { message: "Patient registered successfully", userId: user._id },
        { status: 201 }
      );
    }
  } catch (error: any) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to register" },
      { status: 500 }
    );
  }
}
