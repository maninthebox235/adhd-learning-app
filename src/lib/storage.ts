import {
  ChatMessage,
  ConversationLog,
  ParentAlert,
  DailySummary,
  Mode,
  StudentState,
  LearningSession,
  Problem,
  WorkedExample,
} from "./types";
import { createInitialStudentState } from "./student-model";

const STORAGE_KEYS = {
  conversations: "isaac_conversations",
  alerts: "isaac_alerts",
  challengeHistory: "isaac_challenge_history",
  studentState: "isaac_student_state",
  sessions: "isaac_learning_sessions",
  problemCache: "isaac_problem_cache",
  workedExampleCache: "isaac_worked_example_cache",
} as const;

// ── Generic Helpers ─────────────────────────────────────────────────

function getFromStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  } catch {
    return fallback;
  }
}

function setInStorage(key: string, value: unknown): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage full or unavailable
  }
}

// ── Conversation Management (existing) ──────────────────────────────

export function saveConversation(conversation: ConversationLog): void {
  const conversations = getConversations();
  const existing = conversations.findIndex((c) => c.id === conversation.id);
  if (existing >= 0) {
    conversations[existing] = conversation;
  } else {
    conversations.push(conversation);
  }
  setInStorage(STORAGE_KEYS.conversations, conversations);
}

export function getConversations(): ConversationLog[] {
  return getFromStorage<ConversationLog[]>(STORAGE_KEYS.conversations, []);
}

export function getConversationsByDate(date: string): ConversationLog[] {
  const conversations = getConversations();
  return conversations.filter((c) => {
    const convDate = new Date(c.startedAt).toISOString().split("T")[0];
    return convDate === date;
  });
}

// ── Alert Management (existing) ─────────────────────────────────────

export function saveAlert(alert: ParentAlert): void {
  const alerts = getAlerts();
  alerts.push(alert);
  setInStorage(STORAGE_KEYS.alerts, alerts);
}

export function getAlerts(): ParentAlert[] {
  return getFromStorage<ParentAlert[]>(STORAGE_KEYS.alerts, []);
}

export function getAlertsByDate(date: string): ParentAlert[] {
  const alerts = getAlerts();
  return alerts.filter((a) => {
    const alertDate = new Date(a.timestamp).toISOString().split("T")[0];
    return alertDate === date;
  });
}

// ── Daily Summary (existing) ────────────────────────────────────────

export function getDailySummary(date: string): DailySummary {
  const conversations = getConversationsByDate(date);
  const alerts = getAlertsByDate(date);

  const modeBreakdown: Record<Mode, number> = { ask: 0, creative: 0, challenge: 0 };
  let totalMessages = 0;
  const topicsSet = new Set<string>();

  for (const conv of conversations) {
    const userMessages = conv.messages.filter((m) => m.role === "user");
    totalMessages += userMessages.length;
    modeBreakdown[conv.mode] += userMessages.length;

    for (const msg of userMessages) {
      const words = msg.content.toLowerCase().split(/\s+/);
      for (const word of words) {
        if (word.length > 4) topicsSet.add(word);
      }
    }
  }

  return {
    date,
    totalMessages,
    modeBreakdown,
    topicsDiscussed: Array.from(topicsSet).slice(0, 20),
    alerts,
    conversations,
  };
}

// ── Challenge History (existing) ────────────────────────────────────

export function getCompletedChallenges(): string[] {
  return getFromStorage<string[]>(STORAGE_KEYS.challengeHistory, []);
}

export function markChallengeCompleted(challengeId: string): void {
  const completed = getCompletedChallenges();
  if (!completed.includes(challengeId)) {
    completed.push(challengeId);
    setInStorage(STORAGE_KEYS.challengeHistory, completed);
  }
}

// ── Student State ───────────────────────────────────────────────────

export function getStudentState(): StudentState {
  const stored = getFromStorage<StudentState | null>(STORAGE_KEYS.studentState, null);
  if (stored) return stored;
  const initial = createInitialStudentState();
  saveStudentState(initial);
  return initial;
}

export function saveStudentState(state: StudentState): void {
  setInStorage(STORAGE_KEYS.studentState, state);
}

// ── Learning Sessions ───────────────────────────────────────────────

export function getSessions(): LearningSession[] {
  return getFromStorage<LearningSession[]>(STORAGE_KEYS.sessions, []);
}

export function getSessionsByDate(date: string): LearningSession[] {
  return getSessions().filter((s) => s.date === date);
}

export function saveSession(session: LearningSession): void {
  const sessions = getSessions();
  const idx = sessions.findIndex((s) => s.id === session.id);
  if (idx >= 0) {
    sessions[idx] = session;
  } else {
    sessions.push(session);
  }
  setInStorage(STORAGE_KEYS.sessions, sessions);
}

export function getTodayXp(): number {
  const today = new Date().toISOString().split("T")[0];
  return getSessionsByDate(today).reduce((sum, s) => sum + s.totalXpEarned, 0);
}

// ── Problem Cache ───────────────────────────────────────────────────

type ProblemCacheMap = Record<string, Problem[]>;

export function getCachedProblems(knowledgePointId: string): Problem[] {
  const cache = getFromStorage<ProblemCacheMap>(STORAGE_KEYS.problemCache, {});
  return cache[knowledgePointId] ?? [];
}

export function cacheProblems(knowledgePointId: string, problems: Problem[]): void {
  const cache = getFromStorage<ProblemCacheMap>(STORAGE_KEYS.problemCache, {});
  const existing = cache[knowledgePointId] ?? [];
  cache[knowledgePointId] = [...existing, ...problems];
  setInStorage(STORAGE_KEYS.problemCache, cache);
}

type WorkedExampleCacheMap = Record<string, WorkedExample>;

export function getCachedWorkedExample(knowledgePointId: string): WorkedExample | null {
  const cache = getFromStorage<WorkedExampleCacheMap>(STORAGE_KEYS.workedExampleCache, {});
  return cache[knowledgePointId] ?? null;
}

export function cacheWorkedExample(knowledgePointId: string, example: WorkedExample): void {
  const cache = getFromStorage<WorkedExampleCacheMap>(STORAGE_KEYS.workedExampleCache, {});
  cache[knowledgePointId] = example;
  setInStorage(STORAGE_KEYS.workedExampleCache, cache);
}

// ── Aggregate Stats (for parent dashboard) ──────────────────────────

export function getWeeklyStats(): {
  sessionsThisWeek: number;
  xpThisWeek: number;
  topicsMastered: number;
  avgAccuracy: number;
} {
  const sessions = getSessions();
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const weekStr = weekAgo.toISOString().split("T")[0];

  const recentSessions = sessions.filter((s) => s.date >= weekStr);
  const xp = recentSessions.reduce((sum, s) => sum + s.totalXpEarned, 0);

  const state = getStudentState();
  const mastered = Object.values(state.topicStates).filter(
    (ts) => ts.masteryLevel === "mastered"
  ).length;

  let totalAttempts = 0;
  let totalCorrect = 0;
  for (const ts of Object.values(state.topicStates)) {
    for (const kp of ts.knowledgePointStates) {
      totalAttempts += kp.attempts;
      totalCorrect += kp.correct;
    }
  }
  const avgAccuracy = totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 0;

  return {
    sessionsThisWeek: recentSessions.length,
    xpThisWeek: xp,
    topicsMastered: mastered,
    avgAccuracy,
  };
}
