import { describe, it, expect } from "vitest";
import {
  calculateWaitlistScore,
  rankWaitlistCandidates,
  WaitlistCandidate,
} from "../src/server/domain/waitlistRanker";

describe("Smart Waitlist Triage Ranker Engine", () => {
  const baseTime = new Date("2026-11-01T12:00:00Z");

  it("calculates correct base urgency scores", () => {
    const candidateUrgent: WaitlistCandidate = {
      id: "w1",
      patientId: "p1",
      urgency: "urgent",
      joinedAt: baseTime,
      isFollowUp: false,
      declinedCount: 0,
    };

    const res = calculateWaitlistScore(candidateUrgent, baseTime);
    expect(res.urgencyWeight).toBe(50);
    expect(res.waitHoursWeight).toBe(0);
    expect(res.totalScore).toBe(50);
  });

  it("adds wait time bonus of +2 points per waiting hour", () => {
    const joinedAt = new Date("2026-11-01T08:00:00Z"); // 4 hours prior
    const candidate: WaitlistCandidate = {
      id: "w2",
      patientId: "p2",
      urgency: "soon", // 25
      joinedAt,
      isFollowUp: false,
      declinedCount: 0,
    };

    const res = calculateWaitlistScore(candidate, baseTime);
    expect(res.urgencyWeight).toBe(25);
    expect(res.waitHoursWeight).toBe(8); // 4 hours * 2 = 8
    expect(res.totalScore).toBe(33);
  });

  it("applies follow-up bonus (+20) and subtracts penalties (-15 per decline)", () => {
    const candidate: WaitlistCandidate = {
      id: "w3",
      patientId: "p3",
      urgency: "routine", // 10
      joinedAt: baseTime,
      isFollowUp: true, // +20
      declinedCount: 1, // -15
    };

    const res = calculateWaitlistScore(candidate, baseTime);
    // 10 + 0 + 20 - 15 = 15
    expect(res.totalScore).toBe(15);
  });

  it("correctly ranks multiple patients in descending priority order", () => {
    const candidates: WaitlistCandidate[] = [
      {
        id: "routine_patient",
        patientId: "p_routine",
        urgency: "routine",
        joinedAt: new Date("2026-11-01T11:00:00Z"), // 1h wait -> 10 + 2 = 12
        isFollowUp: false,
        declinedCount: 0,
      },
      {
        id: "urgent_patient",
        patientId: "p_urgent",
        urgency: "urgent",
        joinedAt: new Date("2026-11-01T11:30:00Z"), // 0.5h wait -> 50 + 1 = 51
        isFollowUp: false,
        declinedCount: 0,
      },
      {
        id: "followup_patient",
        patientId: "p_followup",
        urgency: "soon",
        joinedAt: new Date("2026-11-01T10:00:00Z"), // 2h wait -> 25 + 4 + 20 = 49
        isFollowUp: true,
        declinedCount: 0,
      },
    ];

    const ranked = rankWaitlistCandidates(candidates, baseTime);
    expect(ranked[0].entry.id).toBe("urgent_patient");
    expect(ranked[0].rank).toBe(1);
    expect(ranked[1].entry.id).toBe("followup_patient");
    expect(ranked[1].rank).toBe(2);
    expect(ranked[2].entry.id).toBe("routine_patient");
    expect(ranked[2].rank).toBe(3);
  });

  it("breaks ties by earliest joined timestamp", () => {
    const candidates: WaitlistCandidate[] = [
      {
        id: "patient_later",
        patientId: "p_later",
        urgency: "urgent",
        joinedAt: new Date("2026-11-01T11:30:00Z"),
        isFollowUp: false,
        declinedCount: 0,
      },
      {
        id: "patient_earlier",
        patientId: "p_earlier",
        urgency: "urgent",
        joinedAt: new Date("2026-11-01T11:00:00Z"),
        isFollowUp: false,
        declinedCount: 0,
      },
    ];

    // Give both the exact same score by overriding
    const ranked = rankWaitlistCandidates(candidates, new Date("2026-11-01T11:30:00Z"));
    // Since patient_earlier joined at 11:00, they have 1h wait vs 0h wait, so higher score
    expect(ranked[0].entry.id).toBe("patient_earlier");
  });
});
