export interface WaitlistCandidate {
  id: string;
  patientId: string;
  urgency: "routine" | "soon" | "urgent";
  joinedAt: Date | string | number;
  isFollowUp: boolean;
  declinedCount: number;
}

export interface RankScoreBreakdown {
  urgencyWeight: number;
  waitHoursWeight: number;
  followUpBonus: number;
  penalties: number;
  totalScore: number;
}

export interface RankedWaitlistEntry {
  entry: WaitlistCandidate;
  score: number;
  breakdown: RankScoreBreakdown;
  rank: number;
}

const URGENCY_WEIGHTS = {
  urgent: 50,
  soon: 25,
  routine: 10,
};

const WAIT_WEIGHT_PER_HOUR = 2;
const FOLLOW_UP_BONUS = 20;
const PENALTY_PER_DECLINE = 15;

/**
 * Pure function: calculates the priority score for a single waitlist entry.
 * Formula:
 * Score = (Urgency Weight) + (Hours Waiting * W_wait) + (Follow-up Bonus) - (Declined/Expired Penalties)
 */
export function calculateWaitlistScore(
  candidate: WaitlistCandidate,
  currentTime: Date = new Date()
): RankScoreBreakdown {
  const urgencyWeight = URGENCY_WEIGHTS[candidate.urgency] ?? 10;

  const joinedTimestamp = new Date(candidate.joinedAt).getTime();
  const currentTimestamp = currentTime.getTime();
  const diffHours = Math.max(0, (currentTimestamp - joinedTimestamp) / (1000 * 60 * 60));
  const waitHoursWeight = +(diffHours * WAIT_WEIGHT_PER_HOUR).toFixed(2);

  const followUpBonus = candidate.isFollowUp ? FOLLOW_UP_BONUS : 0;
  const penalties = (candidate.declinedCount || 0) * PENALTY_PER_DECLINE;

  const totalScore = +(urgencyWeight + waitHoursWeight + followUpBonus - penalties).toFixed(2);

  return {
    urgencyWeight,
    waitHoursWeight,
    followUpBonus,
    penalties,
    totalScore,
  };
}

/**
 * Pure function: ranks a list of waitlist candidates in descending priority order.
 * Tiebreaker: earliest joinedAt timestamp.
 */
export function rankWaitlistCandidates(
  candidates: WaitlistCandidate[],
  currentTime: Date = new Date()
): RankedWaitlistEntry[] {
  const scored = candidates.map((cand) => {
    const breakdown = calculateWaitlistScore(cand, currentTime);
    return {
      entry: cand,
      score: breakdown.totalScore,
      breakdown,
      rank: 0,
    };
  });

  // Sort descending by score, tiebreak by earliest joinedAt
  scored.sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }
    const aTime = new Date(a.entry.joinedAt).getTime();
    const bTime = new Date(b.entry.joinedAt).getTime();
    return aTime - bTime;
  });

  return scored.map((item, idx) => ({
    ...item,
    rank: idx + 1,
  }));
}
