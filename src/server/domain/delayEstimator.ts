export interface QueueAppointmentItem {
  id: string;
  startAt: Date | string;
  slotDurationMin: number;
  status: "pending" | "confirmed" | "checked_in" | "in_progress" | "completed" | "cancelled" | "no_show" | "rescheduled";
  actualStartTime?: Date | string;
  actualEndTime?: Date | string;
}

export interface EstimatedQueueItem {
  id: string;
  scheduledTime: string;
  status: string;
  estimatedDelayMin: number;
  estimatedStartTime: string;
}

export function calculateLiveQueueDelays(
  items: QueueAppointmentItem[],
  currentTime: Date = new Date()
): {
  cumulativeDelayMin: number;
  currentActiveIndex: number;
  estimatedItems: EstimatedQueueItem[];
} {
  let cumulativeDelayMin = 0;
  let currentActiveIndex = -1;

  // Find if there is an in-progress consultation
  const inProgressIndex = items.findIndex((item) => item.status === "in_progress");

  if (inProgressIndex !== -1) {
    currentActiveIndex = inProgressIndex;
    const activeItem = items[inProgressIndex];
    const scheduledStart = new Date(activeItem.startAt).getTime();
    const scheduledDurationMs = (activeItem.slotDurationMin || 30) * 60 * 1000;
    const scheduledEnd = scheduledStart + scheduledDurationMs;

    const actualStart = activeItem.actualStartTime
      ? new Date(activeItem.actualStartTime).getTime()
      : scheduledStart;

    const now = currentTime.getTime();

    // Overrun based on current time exceeding scheduled end
    if (now > scheduledEnd) {
      cumulativeDelayMin = Math.round((now - scheduledEnd) / (60 * 1000));
    } else if (actualStart > scheduledStart) {
      // Started late
      cumulativeDelayMin = Math.round((actualStart - scheduledStart) / (60 * 1000));
    }
  }

  const estimatedItems: EstimatedQueueItem[] = items.map((item, idx) => {
    const scheduledDate = new Date(item.startAt);
    const scheduledTime = scheduledDate.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    let delayForThis = 0;

    if (item.status === "completed" || item.status === "cancelled" || item.status === "no_show") {
      delayForThis = 0;
    } else if (idx >= inProgressIndex) {
      delayForThis = cumulativeDelayMin;
    }

    const estimatedDate = new Date(scheduledDate.getTime() + delayForThis * 60 * 1000);
    const estimatedStartTime = estimatedDate.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    return {
      id: item.id,
      scheduledTime,
      status: item.status,
      estimatedDelayMin: delayForThis,
      estimatedStartTime,
    };
  });

  return {
    cumulativeDelayMin,
    currentActiveIndex,
    estimatedItems,
  };
}
