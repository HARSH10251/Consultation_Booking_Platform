import { DaySchedule, parseTimeToMinutes, timesOverlap } from "./conflictMatrix";

export interface SlotCandidate {
  date: string;       // YYYY-MM-DD
  startTime: string;  // HH:mm
  endTime: string;    // HH:mm
  startAt: Date;
}

export function formatMinutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
}

/**
 * Pure function: generates slot time slots for a single date given a day's schedule,
 * slot duration, and buffer minutes.
 */
export function generateSlotsForDay(
  date: Date,
  daySchedule: DaySchedule,
  slotDurationMin: number,
  bufferMin: number = 0
): SlotCandidate[] {
  const slots: SlotCandidate[] = [];
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  const dateStr = `${year}-${month}-${day}`;

  for (const range of daySchedule.ranges) {
    const rangeStart = parseTimeToMinutes(range.start);
    const rangeEnd = parseTimeToMinutes(range.end);

    let currentStart = rangeStart;

    while (currentStart + slotDurationMin <= rangeEnd) {
      const currentEnd = currentStart + slotDurationMin;
      const startTimeStr = formatMinutesToTime(currentStart);
      const endTimeStr = formatMinutesToTime(currentEnd);

      // Check if overlaps with any break
      let inBreak = false;
      for (const brk of daySchedule.breaks) {
        if (timesOverlap(startTimeStr, endTimeStr, brk.start, brk.end)) {
          inBreak = true;
          break;
        }
      }

      if (!inBreak) {
        const slotDate = new Date(date);
        slotDate.setHours(Math.floor(currentStart / 60), currentStart % 60, 0, 0);

        slots.push({
          date: dateStr,
          startTime: startTimeStr,
          endTime: endTimeStr,
          startAt: slotDate,
        });
      }

      currentStart = currentEnd + bufferMin;
    }
  }

  return slots;
}

/**
 * Generates slot candidates across a rolling window of N days (default 30 days)
 */
export function generateRollingSlots(
  startDate: Date,
  daysCount: number,
  weeklySchedule: DaySchedule[],
  slotDurationMin: number,
  bufferMin: number = 0
): SlotCandidate[] {
  const allSlots: SlotCandidate[] = [];

  for (let offset = 0; offset < daysCount; offset++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + offset);

    const dayOfWeek = currentDate.getDay(); // 0 = Sunday, 1 = Monday, ...
    const daySchedule = weeklySchedule.find((s) => s.day === dayOfWeek);

    if (daySchedule && daySchedule.ranges.length > 0) {
      const daySlots = generateSlotsForDay(
        currentDate,
        daySchedule,
        slotDurationMin,
        bufferMin
      );
      allSlots.push(...daySlots);
    }
  }

  return allSlots;
}
