import {
  StudentState,
  StudentTopicState,
  KnowledgePointState,
  MasteryLevel,
  getMasteryLevel,
} from "./types";
import { ALL_TOPICS, TOPICS_BY_ID, getEncompassingWeight } from "./knowledge-graph";

// ── Defaults ────────────────────────────────────────────────────────

const DEFAULT_EASE_FACTOR = 2.5;
const MIN_EASE_FACTOR = 1.3;

function defaultKnowledgePointState(kpId: string): KnowledgePointState {
  return {
    knowledgePointId: kpId,
    mastery: 0,
    attempts: 0,
    correct: 0,
    lastPracticed: null,
  };
}

function defaultTopicState(topicId: string): StudentTopicState {
  const topic = TOPICS_BY_ID[topicId];
  if (!topic) {
    throw new Error(`Unknown topic: ${topicId}`);
  }
  return {
    topicId,
    knowledgePointStates: [
      defaultKnowledgePointState(topic.knowledgePoints[0].id),
      defaultKnowledgePointState(topic.knowledgePoints[1].id),
      defaultKnowledgePointState(topic.knowledgePoints[2].id),
    ],
    easeFactor: DEFAULT_EASE_FACTOR,
    interval: 0,
    nextReviewDate: null,
    lastReviewDate: null,
    masteryLevel: "novice",
  };
}

export function createInitialStudentState(): StudentState {
  const topicStates: Record<string, StudentTopicState> = {};
  for (const topic of ALL_TOPICS) {
    topicStates[topic.id] = defaultTopicState(topic.id);
  }
  return {
    topicStates,
    totalXp: 0,
    level: 1,
    currentStreak: 0,
    longestStreak: 0,
    lastActiveDate: null,
    sessionsCompleted: 0,
  };
}

// ── Mastery Computation ─────────────────────────────────────────────

export function computeTopicMastery(state: StudentTopicState): number {
  const weights = [0.2, 0.35, 0.45];
  let total = 0;
  for (let i = 0; i < 3; i++) {
    total += state.knowledgePointStates[i].mastery * weights[i];
  }
  return Math.round(total * 100) / 100;
}

export function computeMasteryLevel(state: StudentTopicState): MasteryLevel {
  const prereqs = TOPICS_BY_ID[state.topicId]?.prerequisites ?? [];
  const hasUnmastered = prereqs.length > 0; // will be checked externally
  if (hasUnmastered && computeTopicMastery(state) === 0) {
    return "locked";
  }
  return getMasteryLevel(computeTopicMastery(state));
}

export function isTopicUnlocked(
  topicId: string,
  studentState: StudentState
): boolean {
  const topic = TOPICS_BY_ID[topicId];
  if (!topic) return false;
  if (topic.prerequisites.length === 0) return true;

  return topic.prerequisites.every((prereq) => {
    const prereqState = studentState.topicStates[prereq.topicId];
    if (!prereqState) return false;
    return computeTopicMastery(prereqState) >= 70;
  });
}

// ── SM-2 Spaced Repetition ──────────────────────────────────────────

export interface ReviewResult {
  quality: number; // 0-5 scale: 0=complete failure, 5=perfect
}

function qualityFromAccuracy(correct: boolean, hintsUsed: number): number {
  if (!correct) return 1;
  if (hintsUsed >= 3) return 2;
  if (hintsUsed >= 2) return 3;
  if (hintsUsed >= 1) return 4;
  return 5;
}

export function updateSpacedRepetition(
  topicState: StudentTopicState,
  quality: number
): StudentTopicState {
  const today = new Date().toISOString().split("T")[0];
  let { easeFactor, interval } = topicState;

  if (quality < 3) {
    interval = 1;
  } else {
    if (interval === 0) {
      interval = 1;
    } else if (interval === 1) {
      interval = 3;
    } else {
      interval = Math.round(interval * easeFactor);
    }
  }

  easeFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  if (easeFactor < MIN_EASE_FACTOR) easeFactor = MIN_EASE_FACTOR;

  const nextDate = new Date();
  nextDate.setDate(nextDate.getDate() + interval);

  return {
    ...topicState,
    easeFactor: Math.round(easeFactor * 100) / 100,
    interval,
    lastReviewDate: today,
    nextReviewDate: nextDate.toISOString().split("T")[0],
  };
}

// ── FIRe: Fractional Implicit Repetition ────────────────────────────

export function applyImplicitReviews(
  studentState: StudentState,
  practicedTopicId: string,
  quality: number
): StudentState {
  const topic = TOPICS_BY_ID[practicedTopicId];
  if (!topic) return studentState;

  const updated = { ...studentState, topicStates: { ...studentState.topicStates } };

  for (const prereq of topic.prerequisites) {
    const weight = prereq.encompassingWeight;
    if (weight <= 0) continue;

    const prereqState = updated.topicStates[prereq.topicId];
    if (!prereqState) continue;

    const implicitQuality = Math.round(quality * weight);
    if (implicitQuality < 3) continue;

    const currentInterval = prereqState.interval;
    if (currentInterval > 0) {
      const extendedInterval = Math.round(currentInterval * (1 + weight * 0.5));
      const nextDate = new Date();
      nextDate.setDate(nextDate.getDate() + extendedInterval);

      updated.topicStates[prereq.topicId] = {
        ...prereqState,
        interval: extendedInterval,
        nextReviewDate: nextDate.toISOString().split("T")[0],
      };
    }
  }

  return updated;
}

// ── Knowledge Point Update ──────────────────────────────────────────

export function updateKnowledgePoint(
  topicState: StudentTopicState,
  kpIndex: 0 | 1 | 2,
  correct: boolean,
  hintsUsed: number
): StudentTopicState {
  const kpStates = [...topicState.knowledgePointStates] as [
    KnowledgePointState,
    KnowledgePointState,
    KnowledgePointState,
  ];

  const kp = { ...kpStates[kpIndex] };
  kp.attempts += 1;
  if (correct) kp.correct += 1;
  kp.lastPracticed = Date.now();

  const accuracy = kp.attempts > 0 ? (kp.correct / kp.attempts) * 100 : 0;
  const recencyBonus = correct ? 5 : -3;
  kp.mastery = Math.max(0, Math.min(100, accuracy * 0.7 + kp.mastery * 0.3 + recencyBonus));
  kp.mastery = Math.round(kp.mastery * 100) / 100;

  kpStates[kpIndex] = kp;

  const quality = qualityFromAccuracy(correct, hintsUsed);
  const withSR = updateSpacedRepetition(
    { ...topicState, knowledgePointStates: kpStates },
    quality
  );

  return {
    ...withSR,
    masteryLevel: getMasteryLevel(computeTopicMastery(withSR)),
  };
}

// ── Session & Streak ────────────────────────────────────────────────

export function updateStreak(state: StudentState): StudentState {
  const today = new Date().toISOString().split("T")[0];

  if (state.lastActiveDate === today) {
    return state;
  }

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split("T")[0];

  let newStreak: number;
  if (state.lastActiveDate === yesterdayStr) {
    newStreak = state.currentStreak + 1;
  } else {
    newStreak = 1;
  }

  return {
    ...state,
    currentStreak: newStreak,
    longestStreak: Math.max(state.longestStreak, newStreak),
    lastActiveDate: today,
  };
}

export function addXp(state: StudentState, xp: number): StudentState {
  const totalXp = state.totalXp + xp;
  return {
    ...state,
    totalXp,
    level: Math.floor(totalXp / 500) + 1,
  };
}

// ── Review Scheduling ───────────────────────────────────────────────

export function getTopicsDueForReview(state: StudentState): string[] {
  const today = new Date().toISOString().split("T")[0];
  return Object.values(state.topicStates)
    .filter((ts) => {
      if (!ts.nextReviewDate) return false;
      if (computeTopicMastery(ts) < 10) return false;
      return ts.nextReviewDate <= today;
    })
    .sort((a, b) => {
      const aDate = a.nextReviewDate ?? "";
      const bDate = b.nextReviewDate ?? "";
      return aDate.localeCompare(bDate);
    })
    .map((ts) => ts.topicId);
}

export function getAvailableNewTopics(state: StudentState): string[] {
  return ALL_TOPICS.filter((topic) => {
    const ts = state.topicStates[topic.id];
    if (!ts) return false;
    if (computeTopicMastery(ts) >= 40) return false;
    return isTopicUnlocked(topic.id, state);
  }).map((t) => t.id);
}
