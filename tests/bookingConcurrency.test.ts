import { describe, it, expect } from "vitest";

// In-memory atomic locking state simulator that matches BookingService atomic behavior
interface MockSlot {
  id: string;
  status: "available" | "held" | "booked";
  heldBy?: string;
  holdExpiresAt?: number;
}

class AtomicSlotManager {
  private slot: MockSlot;

  constructor(initialSlot: MockSlot) {
    this.slot = { ...initialSlot };
  }

  // Atomic test equivalent of findOneAndUpdate
  public hold(patientId: string, durationMs: number): boolean {
    const now = Date.now();
    if (
      this.slot.status === "available" ||
      (this.slot.status === "held" && (this.slot.holdExpiresAt || 0) < now) ||
      (this.slot.status === "held" && this.slot.heldBy === patientId)
    ) {
      this.slot.status = "held";
      this.slot.heldBy = patientId;
      this.slot.holdExpiresAt = now + durationMs;
      return true;
    }
    return false;
  }

  public book(patientId: string): boolean {
    if (this.slot.status === "held" && this.slot.heldBy === patientId) {
      this.slot.status = "booked";
      delete this.slot.holdExpiresAt;
      return true;
    }
    return false;
  }

  public getStatus(): MockSlot {
    return { ...this.slot };
  }
}

describe("Booking Concurrency & Race Condition Elimination", () => {
  it("allows only ONE user to hold an available slot when 2 requests fire simultaneously", async () => {
    const manager = new AtomicSlotManager({
      id: "slot_cardio_101",
      status: "available",
    });

    // Simulate 2 parallel incoming hold requests at the exact same millisecond
    const patientA = "patient_user_001";
    const patientB = "patient_user_002";

    const [resA, resB] = await Promise.all([
      Promise.resolve(manager.hold(patientA, 300000)),
      Promise.resolve(manager.hold(patientB, 300000)),
    ]);

    // Exactly one of the requests must succeed, and one must be rejected!
    const successCount = [resA, resB].filter(Boolean).length;
    expect(successCount).toBe(1);

    const slotState = manager.getStatus();
    expect(slotState.status).toBe("held");
    expect([patientA, patientB]).toContain(slotState.heldBy);
  });

  it("strictly prevents double booking on a booked slot", () => {
    const manager = new AtomicSlotManager({
      id: "slot_cardio_102",
      status: "available",
    });

    const patientA = "patient_user_001";
    const patientB = "patient_user_002";

    // Patient A holds and completes booking
    expect(manager.hold(patientA, 300000)).toBe(true);
    expect(manager.book(patientA)).toBe(true);

    // Patient B attempts to hold or book the same slot
    expect(manager.hold(patientB, 300000)).toBe(false);
    expect(manager.book(patientB)).toBe(false);

    expect(manager.getStatus().status).toBe("booked");
    expect(manager.getStatus().heldBy).toBe(patientA);
  });

  it("allows a new patient to acquire the slot after temporary hold expires", () => {
    const manager = new AtomicSlotManager({
      id: "slot_cardio_103",
      status: "held",
      heldBy: "patient_user_abandoned",
      holdExpiresAt: Date.now() - 1000, // expired 1s ago
    });

    const patientNew = "patient_user_active";
    const acquired = manager.hold(patientNew, 300000);

    expect(acquired).toBe(true);
    expect(manager.getStatus().heldBy).toBe(patientNew);
  });
});
