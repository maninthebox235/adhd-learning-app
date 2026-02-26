import { SessionTask, SessionTaskType } from "./types";
import { TOPICS_BY_ID } from "./knowledge-graph";
import {
  getTopicsDueForReview,
  getAvailableNewTopics,
  computeTopicMastery,
} from "./student-model";
import type { StudentState } from "./types";

const MAX_SESSION_TASKS = 12;
const REVIEW_RATIO = 0.6;

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

function pickActiveKnowledgePoint(
  topicId: string,
  state: StudentState
): { kpId: string; kpIndex: 0 | 1 | 2 } {
  const ts = state.topicStates[topicId];
  if (!ts) return { kpId: `${topicId}-kp1`, kpIndex: 0 };

  for (let i = 0; i < 3; i++) {
    if (ts.knowledgePointStates[i].mastery < 70) {
      return {
        kpId: ts.knowledgePointStates[i].knowledgePointId,
        kpIndex: i as 0 | 1 | 2,
      };
    }
  }
  return {
    kpId: ts.knowledgePointStates[2].knowledgePointId,
    kpIndex: 2,
  };
}

// Enforce non-interference: don't place two topics of the same category adjacent
function interleave(topicIds: string[]): string[] {
  if (topicIds.length <= 1) return topicIds;

  const categorized = topicIds.map((id) => ({
    id,
    category: TOPICS_BY_ID[id]?.category ?? "unknown",
  }));

  const result: typeof categorized = [];
  const remaining = [...categorized];

  while (remaining.length > 0) {
    const lastCategory = result.length > 0 ? result[result.length - 1].category : null;
    const nextIdx = remaining.findIndex((t) => t.category !== lastCategory);

    if (nextIdx >= 0) {
      result.push(remaining.splice(nextIdx, 1)[0]);
    } else {
      result.push(remaining.shift()!);
    }
  }

  return result.map((r) => r.id);
}

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export interface SessionPlan {
  tasks: SessionTask[];
  reviewTopics: string[];
  newTopics: string[];
}

export function planLearningSession(state: StudentState): SessionPlan {
  const reviewTopicIds = getTopicsDueForReview(state);
  const newTopicIds = getAvailableNewTopics(state);

  const reviewCount = Math.min(
    Math.ceil(MAX_SESSION_TASKS * REVIEW_RATIO),
    reviewTopicIds.length
  );
  const newCount = Math.min(
    MAX_SESSION_TASKS - reviewCount,
    newTopicIds.length
  );

  const selectedReview = shuffle(reviewTopicIds).slice(0, reviewCount);
  const selectedNew = newTopicIds.slice(0, newCount);

  const tasks: SessionTask[] = [];

  for (const topicId of selectedNew) {
    const { kpId } = pickActiveKnowledgePoint(topicId, state);

    tasks.push(createTask("worked-example", topicId, kpId));
    tasks.push(createTask("practice", topicId, kpId));
    tasks.push(createTask("practice", topicId, kpId));
  }

  for (const topicId of selectedReview) {
    const { kpId } = pickActiveKnowledgePoint(topicId, state);
    tasks.push(createTask("review", topicId, kpId));
  }

  const topicOrder = interleave([
    ...selectedNew,
    ...selectedReview,
  ]);

  const ordered = topicOrder.flatMap((topicId) =>
    tasks.filter((t) => t.topicId === topicId)
  );

  return {
    tasks: ordered.slice(0, MAX_SESSION_TASKS),
    reviewTopics: selectedReview,
    newTopics: selectedNew,
  };
}

export function planReviewSession(state: StudentState): SessionPlan {
  const reviewTopicIds = getTopicsDueForReview(state);
  const selected = shuffle(reviewTopicIds).slice(0, MAX_SESSION_TASKS);
  const interleaved = interleave(selected);

  const tasks = interleaved.map((topicId) => {
    const { kpId } = pickActiveKnowledgePoint(topicId, state);
    return createTask("review", topicId, kpId);
  });

  return {
    tasks,
    reviewTopics: selected,
    newTopics: [],
  };
}

function createTask(
  type: SessionTaskType,
  topicId: string,
  knowledgePointId: string
): SessionTask {
  return {
    id: generateId(),
    type,
    topicId,
    knowledgePointId,
    completed: false,
    correct: null,
    hintsUsed: 0,
    xpEarned: 0,
    timeSpentMs: 0,
  };
}

export function getNextIncompleteTask(tasks: SessionTask[]): SessionTask | null {
  return tasks.find((t) => !t.completed) ?? null;
}

export function computeSessionXp(tasks: SessionTask[]): number {
  return tasks.reduce((sum, t) => sum + t.xpEarned, 0);
}

export function getSessionProgress(tasks: SessionTask[]): {
  completed: number;
  total: number;
  percent: number;
} {
  const completed = tasks.filter((t) => t.completed).length;
  const total = tasks.length;
  return {
    completed,
    total,
    percent: total > 0 ? Math.round((completed / total) * 100) : 0,
  };
}
