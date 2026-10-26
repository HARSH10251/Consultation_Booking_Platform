import { AppointmentStatus } from "@/server/models/Appointment";

const LEGAL_TRANSITIONS: Record<AppointmentStatus, AppointmentStatus[]> = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["checked_in", "cancelled", "no_show", "rescheduled"],
  checked_in: ["in_progress", "cancelled", "no_show"],
  in_progress: ["completed", "cancelled"],
  completed: [],
  cancelled: [],
  no_show: [],
  rescheduled: [],
};

export function canTransitionAppointment(
  currentStatus: AppointmentStatus,
  targetStatus: AppointmentStatus
): boolean {
  if (currentStatus === targetStatus) return true;
  const allowed = LEGAL_TRANSITIONS[currentStatus];
  return allowed ? allowed.includes(targetStatus) : false;
}

export function assertLegalTransition(
  currentStatus: AppointmentStatus,
  targetStatus: AppointmentStatus
): void {
  if (!canTransitionAppointment(currentStatus, targetStatus)) {
    throw new Error(
      `Illegal appointment status transition from '${currentStatus}' to '${targetStatus}'.`
    );
  }
}
