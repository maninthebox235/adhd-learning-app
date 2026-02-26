"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getDailySummary,
  getAlerts,
  getStudentState,
  getWeeklyStats,
  getSessions,
} from "@/lib/storage";
import { computeTopicMastery } from "@/lib/student-model";
import { ALL_TOPICS } from "@/lib/knowledge-graph";
import {
  DailySummary,
  ParentAlert,
  ConversationLog,
  StudentState,
  getMasteryLevel,
} from "@/lib/types";

function formatDate(date: Date): string {
  return date.toISOString().split("T")[0];
}

function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

const MODE_LABELS = {
  ask: "Ask Me Anything",
  creative: "Creative Builder",
  challenge: "Daily Challenge",
};

const ALERT_COLORS = {
  negative_self_talk: "bg-yellow-100 text-yellow-800 border-yellow-300",
  concerning_behavior: "bg-orange-100 text-orange-800 border-orange-300",
  safety_flag: "bg-red-100 text-red-800 border-red-300",
};

const ALERT_ICONS = {
  negative_self_talk: "💬",
  concerning_behavior: "⚠️",
  safety_flag: "🚨",
};

export default function ParentDashboard() {
  const [authenticated, setAuthenticated] = useState(false);
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState("");
  const [selectedDate, setSelectedDate] = useState(formatDate(new Date()));
  const [summary, setSummary] = useState<DailySummary | null>(null);
  const [allAlerts, setAllAlerts] = useState<ParentAlert[]>([]);
  const [expandedConversation, setExpandedConversation] = useState<string | null>(null);
  const [studentState, setStudentState] = useState<StudentState | null>(null);
  const [weeklyStats, setWeeklyStats] = useState<ReturnType<typeof getWeeklyStats> | null>(null);

  const loadData = useCallback(() => {
    const daySummary = getDailySummary(selectedDate);
    setSummary(daySummary);
    setAllAlerts(getAlerts());
    setStudentState(getStudentState());
    setWeeklyStats(getWeeklyStats());
  }, [selectedDate]);

  useEffect(() => {
    if (authenticated) {
      loadData();
    }
  }, [authenticated, selectedDate, loadData]);

  const handlePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPinError("");

    try {
      const response = await fetch("/api/parent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin }),
      });

      const data = await response.json();
      if (data.authenticated) {
        setAuthenticated(true);
      } else {
        setPinError("Incorrect PIN. Try again.");
        setPin("");
      }
    } catch {
      setPinError("Something went wrong. Try again.");
    }
  };

  if (!authenticated) {
    return (
      <main className="max-w-md mx-auto px-4 py-16">
        <div className="bg-bg-card rounded-2xl border border-border p-8 text-center">
          <div className="text-4xl mb-4">🔒</div>
          <h1 className="text-xl font-bold text-text mb-2">
            Parent Dashboard
          </h1>
          <p className="text-text-light text-sm mb-6">
            Enter your PIN to access the monitoring dashboard.
          </p>
          <form onSubmit={handlePinSubmit} className="space-y-4">
            <input
              type="password"
              inputMode="numeric"
              maxLength={8}
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="Enter PIN"
              className="w-full text-center text-2xl tracking-[0.5em] rounded-xl border border-border bg-bg px-4 py-3 text-text placeholder:text-text-lighter focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            {pinError && (
              <p className="text-accent-red text-sm">{pinError}</p>
            )}
            <button
              type="submit"
              disabled={!pin}
              className="w-full bg-primary hover:bg-primary-dark text-white font-medium py-3 rounded-xl disabled:opacity-40 transition-colors"
            >
              Access Dashboard
            </button>
          </form>
        </div>
      </main>
    );
  }

  const recentAlerts = allAlerts
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 10);

  const masteryBreakdown = { mastered: 0, proficient: 0, developing: 0, novice: 0, locked: 0 };
  if (studentState) {
    for (const topic of ALL_TOPICS) {
      const ts = studentState.topicStates[topic.id];
      const mastery = ts ? computeTopicMastery(ts) : 0;
      const level = getMasteryLevel(mastery);
      if (level === "locked") {
        masteryBreakdown.locked++;
      } else {
        masteryBreakdown[level]++;
      }
    }
  }

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-text">Parent Dashboard</h1>
          <p className="text-text-light text-sm">
            Monitor Isaac&apos;s learning and wellbeing
          </p>
        </div>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="rounded-lg border border-border bg-bg-card px-3 py-2 text-sm text-text"
        />
      </div>

      {/* Alert banner */}
      {recentAlerts.length > 0 && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4">
          <h2 className="text-sm font-bold text-red-800 flex items-center gap-2 mb-3">
            🚨 Recent Alerts ({recentAlerts.length})
          </h2>
          <div className="space-y-2">
            {recentAlerts.map((alert) => (
              <div
                key={alert.id}
                className={`rounded-lg border p-3 ${ALERT_COLORS[alert.type]}`}
              >
                <div className="flex items-start gap-2">
                  <span>{ALERT_ICONS[alert.type]}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{alert.message}</p>
                    <p className="text-xs mt-1 opacity-75 truncate">
                      &ldquo;{alert.context}&rdquo;
                    </p>
                    <p className="text-xs mt-1 opacity-60">
                      {formatTime(alert.timestamp)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Learning Analytics */}
      {studentState && weeklyStats && (
        <div className="mb-6">
          <h2 className="font-bold text-text mb-3">📊 Learning Analytics</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
            <AnalyticCard
              label="Weekly Sessions"
              value={weeklyStats.sessionsThisWeek}
              emoji="📚"
            />
            <AnalyticCard
              label="Weekly XP"
              value={weeklyStats.xpThisWeek}
              emoji="⭐"
            />
            <AnalyticCard
              label="Accuracy"
              value={`${weeklyStats.avgAccuracy}%`}
              emoji="🎯"
            />
            <AnalyticCard
              label="Topics Mastered"
              value={weeklyStats.topicsMastered}
              emoji="🏆"
            />
          </div>

          {/* Mastery breakdown */}
          <div className="bg-bg-card rounded-xl border border-border p-4">
            <h3 className="text-sm font-bold text-text mb-3">Topic Mastery Breakdown</h3>
            <div className="flex items-center gap-4 flex-wrap">
              <MiniStat label="Mastered" count={masteryBreakdown.mastered} color="text-yellow-600" />
              <MiniStat label="Proficient" count={masteryBreakdown.proficient} color="text-green-600" />
              <MiniStat label="Developing" count={masteryBreakdown.developing} color="text-amber-600" />
              <MiniStat label="Novice" count={masteryBreakdown.novice} color="text-slate-500" />
              <MiniStat label="Locked" count={masteryBreakdown.locked} color="text-gray-400" />
            </div>
            <div className="mt-3 w-full h-3 bg-gray-100 rounded-full overflow-hidden flex">
              {masteryBreakdown.mastered > 0 && (
                <div
                  className="h-full bg-yellow-400"
                  style={{ width: `${(masteryBreakdown.mastered / ALL_TOPICS.length) * 100}%` }}
                />
              )}
              {masteryBreakdown.proficient > 0 && (
                <div
                  className="h-full bg-green-400"
                  style={{ width: `${(masteryBreakdown.proficient / ALL_TOPICS.length) * 100}%` }}
                />
              )}
              {masteryBreakdown.developing > 0 && (
                <div
                  className="h-full bg-amber-400"
                  style={{ width: `${(masteryBreakdown.developing / ALL_TOPICS.length) * 100}%` }}
                />
              )}
              {masteryBreakdown.novice > 0 && (
                <div
                  className="h-full bg-slate-300"
                  style={{ width: `${(masteryBreakdown.novice / ALL_TOPICS.length) * 100}%` }}
                />
              )}
            </div>
            <p className="text-xs text-text-lighter mt-2">
              {ALL_TOPICS.length} total topics in curriculum
            </p>
          </div>

          {/* Streak & Level */}
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="bg-bg-card rounded-xl border border-border p-4">
              <div className="text-2xl mb-1">🔥</div>
              <div className="text-xl font-bold text-text">{studentState.currentStreak} day{studentState.currentStreak !== 1 ? "s" : ""}</div>
              <div className="text-xs text-text-lighter">Current Streak (Best: {studentState.longestStreak})</div>
            </div>
            <div className="bg-bg-card rounded-xl border border-border p-4">
              <div className="text-2xl mb-1">🏅</div>
              <div className="text-xl font-bold text-text">Level {studentState.level}</div>
              <div className="text-xs text-text-lighter">{studentState.totalXp.toLocaleString()} total XP</div>
            </div>
          </div>
        </div>
      )}

      {/* Chat activity stats */}
      {summary && (
        <>
          <h2 className="font-bold text-text mb-3">💬 Chat Activity</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            <StatCard
              label="Messages"
              value={summary.totalMessages}
              emoji="💬"
            />
            <StatCard
              label="Ask Me Anything"
              value={summary.modeBreakdown.ask}
              emoji="🤔"
            />
            <StatCard
              label="Creative Builder"
              value={summary.modeBreakdown.creative}
              emoji="🎨"
            />
            <StatCard
              label="Daily Challenge"
              value={summary.modeBreakdown.challenge}
              emoji="⚡"
            />
          </div>

          {/* Conversations */}
          <div className="bg-bg-card rounded-xl border border-border overflow-hidden">
            <div className="px-4 py-3 border-b border-border">
              <h2 className="font-bold text-text">
                Conversations ({summary.conversations.length})
              </h2>
            </div>

            {summary.conversations.length === 0 ? (
              <div className="px-4 py-8 text-center text-text-lighter text-sm">
                No conversations on this date.
              </div>
            ) : (
              <div className="divide-y divide-border">
                {summary.conversations.map((conv) => (
                  <ConversationItem
                    key={conv.id}
                    conversation={conv}
                    isExpanded={expandedConversation === conv.id}
                    onToggle={() =>
                      setExpandedConversation(
                        expandedConversation === conv.id ? null : conv.id
                      )
                    }
                  />
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </main>
  );
}

function StatCard({ label, value, emoji }: { label: string; value: number; emoji: string }) {
  return (
    <div className="bg-bg-card rounded-xl border border-border p-4">
      <div className="text-2xl mb-1">{emoji}</div>
      <div className="text-2xl font-bold text-text">{value}</div>
      <div className="text-xs text-text-lighter">{label}</div>
    </div>
  );
}

function AnalyticCard({ label, value, emoji }: { label: string; value: number | string; emoji: string }) {
  return (
    <div className="bg-bg-card rounded-xl border border-border p-4 text-center">
      <div className="text-2xl mb-1">{emoji}</div>
      <div className="text-xl font-bold text-text">{value}</div>
      <div className="text-xs text-text-lighter">{label}</div>
    </div>
  );
}

function MiniStat({ label, count, color }: { label: string; count: number; color: string }) {
  return (
    <span className="text-xs">
      <span className={`font-bold ${color}`}>{count}</span>{" "}
      <span className="text-text-lighter">{label}</span>
    </span>
  );
}

function ConversationItem({
  conversation,
  isExpanded,
  onToggle,
}: {
  conversation: ConversationLog;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const userMessages = conversation.messages.filter((m) => m.role === "user");
  const preview = userMessages[0]?.content.substring(0, 100) || "No messages";

  return (
    <div>
      <button
        onClick={onToggle}
        className="w-full px-4 py-3 text-left hover:bg-bg transition-colors"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-sm shrink-0">
              {MODE_LABELS[conversation.mode]}
            </span>
            <span className="text-text-lighter">·</span>
            <span className="text-xs text-text-lighter truncate">
              {preview}
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0 ml-2">
            <span className="text-xs text-text-lighter">
              {userMessages.length} msgs
            </span>
            <span className="text-text-lighter text-xs">
              {isExpanded ? "▼" : "▶"}
            </span>
          </div>
        </div>
      </button>

      {isExpanded && (
        <div className="px-4 pb-4 space-y-2">
          {conversation.messages.map((msg) => (
            <div
              key={msg.id}
              className={`rounded-lg p-3 text-xs ${
                msg.role === "user"
                  ? "bg-primary/5 border border-primary/10"
                  : "bg-bg border border-border"
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="font-bold text-text">
                  {msg.role === "user" ? "Isaac" : "AI"}
                </span>
                <span className="text-text-lighter">
                  {formatTime(msg.timestamp)}
                </span>
              </div>
              <p className="text-text-light whitespace-pre-wrap leading-relaxed">
                {msg.content}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
