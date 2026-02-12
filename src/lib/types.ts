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

export interface DailyChallenge {
  id: string;
  title: string;
  description: string;
  category: "hockey" | "creative" | "science" | "building" | "fun";
  date: string;
}
