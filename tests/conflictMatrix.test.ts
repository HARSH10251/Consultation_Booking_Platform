import { describe, it, expect } from "vitest";
import {
  timesOverlap,
  parseTimeToMinutes,
  validateInternalSchedule,
  validateRoomScheduleOverlap,
  DoctorScheduleConfig,
} from "../src/server/domain/conflictMatrix";

describe("Conflict Matrix & Time Overlap", () => {
  it("correctly converts HH:mm to minutes", () => {
    expect(parseTimeToMinutes("00:00")).toBe(0);
    expect(parseTimeToMinutes("09:30")).toBe(570);
    expect(parseTimeToMinutes("23:59")).toBe(1439);
  });

  it("detects overlapping time intervals", () => {
    // 09:00 - 10:00 vs 09:30 - 10:30 (overlaps)
    expect(timesOverlap("09:00", "10:00", "09:30", "10:30")).toBe(true);

    // 09:00 - 10:00 vs 10:00 - 11:00 (back-to-back, does not overlap)
    expect(timesOverlap("09:00", "10:00", "10:00", "11:00")).toBe(false);

    // 14:00 - 17:00 vs 15:00 - 16:00 (enclosed, overlaps)
    expect(timesOverlap("14:00", "17:00", "15:00", "16:00")).toBe(true);

    // disjoint intervals
    expect(timesOverlap("09:00", "10:00", "11:00", "12:00")).toBe(false);
  });

  it("flags internal doctor schedule conflicts when end <= start", () => {
    const invalidConfig: DoctorScheduleConfig = {
      doctorId: "doc_1",
      weeklySchedule: [
        {
          day: 1,
          ranges: [{ start: "14:00", end: "10:00" }],
          breaks: [],
        },
      ],
    };

    const res = validateInternalSchedule(invalidConfig);
    expect(res.hasConflict).toBe(true);
    expect(res.conflicts[0].type).toBe("INVALID_TIME_RANGE");
  });

  it("detects room double-booking across different doctors on the same day", () => {
    const doctor1: DoctorScheduleConfig = {
      doctorId: "doc_1",
      roomId: "room_cardiology_2",
      weeklySchedule: [
        {
          day: 1, // Monday
          ranges: [{ start: "09:00", end: "13:00" }],
          breaks: [],
        },
      ],
    };

    const doctor2Conflict: DoctorScheduleConfig = {
      doctorId: "doc_2",
      roomId: "room_cardiology_2", // Same room!
      weeklySchedule: [
        {
          day: 1, // Same day
          ranges: [{ start: "11:00", end: "15:00" }], // Overlaps 11:00-13:00
          breaks: [],
        },
      ],
    };

    const res = validateRoomScheduleOverlap(doctor2Conflict, [doctor1]);
    expect(res.hasConflict).toBe(true);
    expect(res.conflicts[0].type).toBe("ROOM_OVERLAP");
  });

  it("passes when different doctors use the same room at non-overlapping hours", () => {
    const doctor1: DoctorScheduleConfig = {
      doctorId: "doc_1",
      roomId: "room_cardiology_2",
      weeklySchedule: [
        {
          day: 1, // Monday morning
          ranges: [{ start: "08:00", end: "12:00" }],
          breaks: [],
        },
      ],
    };

    const doctor2Afternoon: DoctorScheduleConfig = {
      doctorId: "doc_2",
      roomId: "room_cardiology_2",
      weeklySchedule: [
        {
          day: 1, // Monday afternoon
          ranges: [{ start: "12:30", end: "17:00" }],
          breaks: [],
        },
      ],
    };

    const res = validateRoomScheduleOverlap(doctor2Afternoon, [doctor1]);
    expect(res.hasConflict).toBe(false);
    expect(res.conflicts).toHaveLength(0);
  });
});
