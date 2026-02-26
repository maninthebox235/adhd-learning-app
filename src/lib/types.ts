// ── Chat & Companion ────────────────────────────────────────────────

export type Mode = "ask" | "creative" | "challenge";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
  mode: Mode;
}

export interface ConversationLog {
  id: string;
  mode: Mode;
  messages: ChatMessage[];
  startedAt: number;
  summary?: string;
}

export interface ParentAlert {
  id: string;
  type: "negative_self_talk" | "concerning_behavior" | "safety_flag";
  message: string;
  context: string;
  timestamp: number;
  conversationId: string;
}

export interface DailySummary {
  date: string;
  totalMessages: number;
  modeBreakdown: Record<Mode, number>;
  topicsDiscussed: string[];
  alerts: ParentAlert[];
  conversations: ConversationLog[];
}

// ── Knowledge Graph ─────────────────────────────────────────────────

export type TopicCategory =
  | "whole-numbers"
  | "fractions"
  | "decimals"
  | "percentages"
  | "ratios"
  | "geometry"
  | "algebra"
  | "data"
  | "word-problems";

export type KnowledgePointLevel = 1 | 2 | 3;

export interface KnowledgePoint {
  id: string;
  topicId: string;
  level: KnowledgePointLevel;
  title: string;
  description: string;
}

export interface PrerequisiteEdge {
  topicId: string;
  encompassingWeight: number;
}

export interface Topic {
  id: string;
  name: string;
  description: string;
  category: TopicCategory;
  emoji: string;
  knowledgePoints: [KnowledgePoint, KnowledgePoint, KnowledgePoint];
  prerequisites: PrerequisiteEdge[];
}

// ── Problems & Worked Examples ──────────────────────────────────────

export type ProblemType = "multiple-choice" | "fill-in-blank" | "true-false";

export interface ProblemChoice {
  label: string;
  value: string;
  isCorrect: boolean;
}

export interface Problem {
  id: string;
  topicId: string;
  knowledgePointId: string;
  type: ProblemType;
  question: string;
  choices?: ProblemChoice[];
  correctAnswer: string;
  hints: [string, string, string];
  explanation: string;
  xpValue: number;
}

export interface WorkedExampleStep {
  label: string;
  content: string;
}

export interface WorkedExample {
  id: string;
  topicId: string;
  knowledgePointId: string;
  title: string;
  problem: string;
  steps: WorkedExampleStep[];
  finalAnswer: string;
}

// ── Student Model ───────────────────────────────────────────────────

export type MasteryLevel = "locked" | "novice" | "developing" | "proficient" | "mastered";

export interface KnowledgePointState {
  knowledgePointId: string;
  mastery: number;
  attempts: number;
  correct: number;
  lastPracticed: number | null;
}

export interface StudentTopicState {
  topicId: string;
  knowledgePointStates: [KnowledgePointState, KnowledgePointState, KnowledgePointState];
  easeFactor: number;
  interval: number;
  nextReviewDate: string | null;
  lastReviewDate: string | null;
  masteryLevel: MasteryLevel;
}

export interface StudentState {
  topicStates: Record<string, StudentTopicState>;
  totalXp: number;
  level: number;
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string | null;
  sessionsCompleted: number;
}

// ── Sessions ────────────────────────────────────────────────────────

export type SessionTaskType = "worked-example" | "practice" | "review";

export interface SessionTask {
  id: string;
  type: SessionTaskType;
  topicId: string;
  knowledgePointId: string;
  problem?: Problem;
  workedExample?: WorkedExample;
  completed: boolean;
  correct: boolean | null;
  hintsUsed: number;
  xpEarned: number;
  timeSpentMs: number;
}

export interface LearningSession {
  id: string;
  date: string;
  startedAt: number;
  completedAt: number | null;
  tasks: SessionTask[];
  totalXpEarned: number;
  newTopicsIntroduced: string[];
  topicsReviewed: string[];
}

// ── XP & Leveling ───────────────────────────────────────────────────

export const DAILY_XP_TARGET = 100;
export const XP_PER_LEVEL = 500;

export function getLevelFromXp(xp: number): number {
  return Math.floor(xp / XP_PER_LEVEL) + 1;
}

export function getXpProgress(xp: number): number {
  return xp % XP_PER_LEVEL;
}

export function getMasteryLevel(mastery: number): MasteryLevel {
  if (mastery >= 90) return "mastered";
  if (mastery >= 70) return "proficient";
  if (mastery >= 40) return "developing";
  return "novice";
}
