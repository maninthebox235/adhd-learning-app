import { ChatMessage, ConversationLog, ParentAlert, DailySummary, Mode } from "./types";

const STORAGE_KEYS = {
  conversations: "isaac_conversations",
  alerts: "isaac_alerts",
  challengeHistory: "isaac_challenge_history",
} as const;

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

// Conversation management
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

// Alert management
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

// Daily summary generation
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

    // Extract topic keywords from user messages
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

// Challenge history
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
