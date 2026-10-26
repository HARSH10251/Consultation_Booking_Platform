import { describe, it, expect } from "vitest";
import {
  generateSlotsForDay,
  generateRollingSlots,
  formatMinutesToTime,
} from "../src/server/domain/slotGenerator";
import { DaySchedule } from "../src/server/domain/conflictMatrix";

describe("Slot Generator Engine", () => {
  it("formats minutes to HH:mm string correctly", () => {
    expect(formatMinutesToTime(540)).toBe("09:00");
    expect(formatMinutesToTime(570)).toBe("09:30");
    expect(formatMinutesToTime(810)).toBe("13:30");
  });

  it("generates correct slots for a day with 30-min duration and exclusions for breaks", () => {
    const mondaySchedule: DaySchedule = {
      day: 1,
      ranges: [{ start: "09:00", end: "12:00" }], // 3 hours = 6 slots of 30 min
      breaks: [{ start: "10:30", end: "11:00" }], // break excludes 10:30-11:00 slot
    };

    const date = new Date("2026-11-02T00:00:00Z"); // Monday
    const slots = generateSlotsForDay(date, mondaySchedule, 30, 0);

    // Expected: 09:00-09:30, 09:30-10:00, 10:00-10:30, 11:00-11:30, 11:30-12:00 (5 slots)
    expect(slots).toHaveLength(5);
    expect(slots[0].startTime).toBe("09:00");
    expect(slots[0].endTime).toBe("09:30");
    expect(slots[1].startTime).toBe("09:30");
    expect(slots[2].startTime).toBe("10:00");
    // 10:30-11:00 is omitted because of break
    expect(slots[3].startTime).toBe("11:00");
    expect(slots[4].startTime).toBe("11:30");
    expect(slots[4].endTime).toBe("12:00");
  });

  it("applies buffer time between slots correctly", () => {
    const schedule: DaySchedule = {
      day: 1,
      ranges: [{ start: "09:00", end: "11:00" }],
      breaks: [],
    };

    const date = new Date("2026-11-02T00:00:00Z");
    // 30 min slot + 10 min buffer = 40 min per step
    // 09:00-09:30 (+10m buffer -> next start 09:40)
    // 09:40-10:10 (+10m buffer -> next start 10:20)
    // 10:20-10:50 (+10m buffer -> 11:00)
    const slots = generateSlotsForDay(date, schedule, 30, 10);
    expect(slots).toHaveLength(3);
    expect(slots[0].startTime).toBe("09:00");
    expect(slots[0].endTime).toBe("09:30");
    expect(slots[1].startTime).toBe("09:40");
    expect(slots[1].endTime).toBe("10:10");
    expect(slots[2].startTime).toBe("10:20");
    expect(slots[2].endTime).toBe("10:50");
  });

  it("generates slots across a rolling window of 7 days", () => {
    const weeklySchedule: DaySchedule[] = [
      {
        day: 1, // Mon
        ranges: [{ start: "09:00", end: "11:00" }],
        breaks: [],
      },
      {
        day: 3, // Wed
        ranges: [{ start: "09:00", end: "11:00" }],
        breaks: [],
      },
    ];

    const startDate = new Date("2026-11-02T00:00:00Z"); // Monday
    const slots = generateRollingSlots(startDate, 7, weeklySchedule, 30, 0);

    // Mon has 4 slots (09:00, 09:30, 10:00, 10:30)
    // Wed has 4 slots
    // Total in 7 days = 8 slots
    expect(slots).toHaveLength(8);
  });
});
