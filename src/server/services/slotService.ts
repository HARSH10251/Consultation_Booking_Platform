import { connectDB } from "@/lib/db";
import { Slot, ISlot } from "@/server/models/Slot";
import { DoctorProfile, IDoctorProfile } from "@/server/models/DoctorProfile";
import { generateRollingSlots, SlotCandidate } from "@/server/domain/slotGenerator";
import { Types } from "mongoose";

export class SlotService {
  /**
   * Generates or syncs rolling slots for a doctor up to `daysAhead` days.
   * Preserves all booked and held slots.
   */
  static async syncDoctorSlots(
    doctorId: string | Types.ObjectId,
    daysAhead: number = 30
  ): Promise<{ created: number; preserved: number }> {
    await connectDB();

    const profile = await DoctorProfile.findById(doctorId);
    if (!profile) {
      throw new Error(`DoctorProfile ${doctorId} not found`);
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const candidates = generateRollingSlots(
      today,
      daysAhead,
      profile.weeklySchedule,
      profile.slotDurationMin || 30,
      profile.bufferMin || 0
    );

    let createdCount = 0;
    let preservedCount = 0;

    for (const cand of candidates) {
      // Check if slot already exists at this exact startAt for this doctor
      const existing = await Slot.findOne({
        doctorId: profile._id,
        startAt: cand.startAt,
      });

      if (existing) {
        // Booked, held, or offered slots MUST NEVER be deleted or modified!
        preservedCount++;
      } else {
        await Slot.create({
          doctorId: profile._id,
          roomId: profile.assignedRoomId,
          date: cand.date,
          startTime: cand.startTime,
          endTime: cand.endTime,
          startAt: cand.startAt,
          status: "available",
        });
        createdCount++;
      }
    }

    return { created: createdCount, preserved: preservedCount };
  }

  /**
   * Lazy expiration check: releases any temporary 5-min holds or 15-min offer holds that have expired.
   */
  static async releaseExpiredHolds(doctorId?: string | Types.ObjectId): Promise<number> {
    await connectDB();
    const now = new Date();

    const query: any = {
      status: { $in: ["held", "held_for_offer"] },
      holdExpiresAt: { $lt: now },
    };

    if (doctorId) {
      query.doctorId = doctorId;
    }

    const res = await Slot.updateMany(query, {
      $set: { status: "available" },
      $unset: { heldBy: 1, holdExpiresAt: 1, appointmentId: 1 },
    });

    return res.modifiedCount;
  }

  /**
   * Fetch slots for a doctor on a specific date (YYYY-MM-DD), with lazy expiration release.
   */
  static async getSlotsForDate(
    doctorId: string | Types.ObjectId,
    dateStr: string
  ): Promise<any[]> {
    await connectDB();
    await this.releaseExpiredHolds(doctorId);

    return Slot.find({
      doctorId,
      date: dateStr,
    })
      .sort({ startTime: 1 })
      .lean();
  }

  /**
   * Generates a 7-day availability heat strip with slot intensity indicators.
   */
  static async getHeatStrip(
    doctorId: string | Types.ObjectId,
    startDate?: Date
  ): Promise<
    Array<{
      date: string;
      dayOfWeek: string;
      availableCount: number;
      bookedCount: number;
      intensity: "none" | "low" | "medium" | "high";
    }>
  > {
    await connectDB();
    await this.releaseExpiredHolds(doctorId);

    const baseDate = startDate ? new Date(startDate) : new Date();
    baseDate.setHours(0, 0, 0, 0);

    const heatStrip = [];

    for (let i = 0; i < 7; i++) {
      const d = new Date(baseDate);
      d.setDate(baseDate.getDate() + i);
      const dateStr = d.toISOString().split("T")[0];
      const dayOfWeek = d.toLocaleDateString("en-IN", { weekday: "short" });

      const slots = await Slot.find({
        doctorId,
        date: dateStr,
      }).select("status");

      const availableCount = slots.filter((s) => s.status === "available").length;
      const bookedCount = slots.filter((s) => s.status === "booked").length;

      let intensity: "none" | "low" | "medium" | "high" = "none";
      if (availableCount >= 6) {
        intensity = "high";
      } else if (availableCount >= 3) {
        intensity = "medium";
      } else if (availableCount > 0) {
        intensity = "low";
      }

      heatStrip.push({
        date: dateStr,
        dayOfWeek,
        availableCount,
        bookedCount,
        intensity,
      });
    }

    return heatStrip;
  }
}
