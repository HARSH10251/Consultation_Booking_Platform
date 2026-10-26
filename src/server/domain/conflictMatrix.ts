export interface ScheduleRange {
  start: string; // "HH:mm"
  end: string;   // "HH:mm"
}

export interface DaySchedule {
  day: number; // 0 = Sunday, 1 = Monday, ...
  ranges: ScheduleRange[];
  breaks: ScheduleRange[];
}

export interface DoctorScheduleConfig {
  doctorId: string;
  doctorName?: string;
  roomId?: string;
  roomName?: string;
  weeklySchedule: DaySchedule[];
}

export interface ConflictResult {
  hasConflict: boolean;
  conflicts: Array<{
    type: "DOCTOR_OVERLAP" | "ROOM_OVERLAP" | "INVALID_TIME_RANGE";
    day: number;
    description: string;
    details: {
      first?: { doctorId: string; start: string; end: string; roomId?: string };
      second?: { doctorId: string; start: string; end: string; roomId?: string };
    };
  }>;
}

export function parseTimeToMinutes(timeStr: string): number {
  const [hours, minutes] = timeStr.split(":").map(Number);
  if (isNaN(hours) || isNaN(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
    throw new Error(`Invalid time format: ${timeStr}`);
  }
  return hours * 60 + minutes;
}

export function timesOverlap(
  startA: string,
  endA: string,
  startB: string,
  endB: string
): boolean {
  const aStart = parseTimeToMinutes(startA);
  const aEnd = parseTimeToMinutes(endA);
  const bStart = parseTimeToMinutes(startB);
  const bEnd = parseTimeToMinutes(endB);

  return aStart < bEnd && aEnd > bStart;
}

/**
 * Validates a doctor's own internal schedule for consistency (e.g., end > start, no overlapping ranges)
 */
export function validateInternalSchedule(config: DoctorScheduleConfig): ConflictResult {
  const conflicts: ConflictResult["conflicts"] = [];

  for (const daySched of config.weeklySchedule) {
    // Check range validities
    for (const r of daySched.ranges) {
      const sMin = parseTimeToMinutes(r.start);
      const eMin = parseTimeToMinutes(r.end);
      if (eMin <= sMin) {
        conflicts.push({
          type: "INVALID_TIME_RANGE",
          day: daySched.day,
          description: `End time ${r.end} must be after start time ${r.start}`,
          details: { first: { doctorId: config.doctorId, start: r.start, end: r.end } },
        });
      }
    }

    // Check overlaps within same doctor's working ranges
    for (let i = 0; i < daySched.ranges.length; i++) {
      for (let j = i + 1; j < daySched.ranges.length; j++) {
        const r1 = daySched.ranges[i];
        const r2 = daySched.ranges[j];
        if (timesOverlap(r1.start, r1.end, r2.start, r2.end)) {
          conflicts.push({
            type: "DOCTOR_OVERLAP",
            day: daySched.day,
            description: `Doctor's working ranges ${r1.start}-${r1.end} and ${r2.start}-${r2.end} overlap`,
            details: {
              first: { doctorId: config.doctorId, start: r1.start, end: r1.end },
              second: { doctorId: config.doctorId, start: r2.start, end: r2.end },
            },
          });
        }
      }
    }
  }

  return {
    hasConflict: conflicts.length > 0,
    conflicts,
  };
}

/**
 * Validates that an updated doctor schedule does not conflict with any other doctor's schedule
 * for shared facility rooms on the same weekday.
 */
export function validateRoomScheduleOverlap(
  incoming: DoctorScheduleConfig,
  existingList: DoctorScheduleConfig[]
): ConflictResult {
  const conflicts: ConflictResult["conflicts"] = [];

  if (!incoming.roomId) {
    return { hasConflict: false, conflicts: [] };
  }

  for (const existing of existingList) {
    // Skip checking self
    if (existing.doctorId === incoming.doctorId) continue;
    // Only check if assigned the same room
    if (existing.roomId !== incoming.roomId) continue;

    for (const incDay of incoming.weeklySchedule) {
      const existDay = existing.weeklySchedule.find((d) => d.day === incDay.day);
      if (!existDay) continue;

      for (const incRange of incDay.ranges) {
        for (const existRange of existDay.ranges) {
          if (timesOverlap(incRange.start, incRange.end, existRange.start, existRange.end)) {
            conflicts.push({
              type: "ROOM_OVERLAP",
              day: incDay.day,
              description: `Room collision: Doctor ${incoming.doctorId} and Doctor ${existing.doctorId} both scheduled for Room ${incoming.roomId} on weekday ${incDay.day} between ${incRange.start}-${incRange.end} and ${existRange.start}-${existRange.end}`,
              details: {
                first: {
                  doctorId: incoming.doctorId,
                  start: incRange.start,
                  end: incRange.end,
                  roomId: incoming.roomId,
                },
                second: {
                  doctorId: existing.doctorId,
                  start: existRange.start,
                  end: existRange.end,
                  roomId: existing.roomId,
                },
              },
            });
          }
        }
      }
    }
  }

  return {
    hasConflict: conflicts.length > 0,
    conflicts,
  };
}
