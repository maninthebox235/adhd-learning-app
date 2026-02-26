"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ProgressRing from "@/components/ProgressRing";
import { MasteryBar } from "@/components/MasteryBadge";
import { getStudentState, getTodayXp } from "@/lib/storage";
import { getTopicsDueForReview, getAvailableNewTopics, updateStreak } from "@/lib/student-model";
import { saveStudentState } from "@/lib/storage";
import { StudentState, DAILY_XP_TARGET, XP_PER_LEVEL, getXpProgress, getMasteryLevel } from "@/lib/types";
import { ALL_TOPICS, TOPICS_BY_ID } from "@/lib/knowledge-graph";
import { computeTopicMastery } from "@/lib/student-model";

export default function Dashboard() {
  const [state, setState] = useState<StudentState | null>(null);
  const [todayXp, setTodayXp] = useState(0);

  useEffect(() => {
    const s = getStudentState();
    const withStreak = updateStreak(s);
    if (withStreak !== s) {
      saveStudentState(withStreak);
    }
    setState(withStreak);
    setTodayXp(getTodayXp());
  }, []);

  if (!state) return null;

  const dueReviews = getTopicsDueForReview(state);
  const newTopics = getAvailableNewTopics(state);
  const xpProgress = getXpProgress(state.totalXp);
  const xpPercent = Math.round((todayXp / DAILY_XP_TARGET) * 100);

  const masteryBreakdown = { mastered: 0, proficient: 0, developing: 0, novice: 0, locked: 0 };
  for (const topic of ALL_TOPICS) {
    const ts = state.topicStates[topic.id];
    const mastery = ts ? computeTopicMastery(ts) : 0;
    const level = getMasteryLevel(mastery);
    if (level === "locked") {
      masteryBreakdown.locked++;
    } else {
      masteryBreakdown[level]++;
    }
  }

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      {/* Welcome */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text">
          Hey Isaac! 👋
        </h1>
        <p className="text-text-light mt-1">
          {todayXp === 0
            ? "Ready to level up your math skills today?"
            : `You've earned ${todayXp} XP today — keep it up!`}
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <StatCard emoji="🔥" value={state.currentStreak} label="Day Streak" />
        <StatCard emoji="⭐" value={state.level} label={`Level (${xpProgress}/${XP_PER_LEVEL} XP)`} />
        <StatCard emoji="📚" value={dueReviews.length} label="Topics to Review" />
        <StatCard emoji="🆕" value={newTopics.length} label="New Topics Ready" />
      </div>

      {/* Daily XP */}
      <div className="bg-bg-card rounded-2xl border border-border p-6 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-text">Today&apos;s XP</h2>
          <span className="text-sm text-text-light">{todayXp} / {DAILY_XP_TARGET}</span>
        </div>
        <div className="w-full h-4 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary to-accent-purple transition-all duration-700"
            style={{ width: `${Math.min(xpPercent, 100)}%` }}
          />
        </div>
        {xpPercent >= 100 && (
          <p className="text-accent-green text-sm font-medium mt-2 text-center">
            🎉 Daily goal smashed!
          </p>
        )}
      </div>

      {/* Action buttons */}
      <div className="grid gap-4 sm:grid-cols-2 mb-8">
        <Link
          href="/learn"
          className="card-hover bg-gradient-to-br from-primary to-accent-purple rounded-2xl p-6 text-white text-center block"
        >
          <div className="text-4xl mb-3">🚀</div>
          <h3 className="text-xl font-bold mb-1">Start Learning</h3>
          <p className="text-white/80 text-sm">
            {newTopics.length > 0
              ? `${newTopics.length} new topic${newTopics.length === 1 ? "" : "s"} unlocked!`
              : "Practice and level up your skills"}
          </p>
        </Link>

        <Link
          href="/review"
          className={`card-hover rounded-2xl p-6 text-center block ${
            dueReviews.length > 0
              ? "bg-gradient-to-br from-secondary to-accent-orange text-white"
              : "bg-bg-card border border-border text-text"
          }`}
        >
          <div className="text-4xl mb-3">{dueReviews.length > 0 ? "⚡" : "✅"}</div>
          <h3 className="text-xl font-bold mb-1">
            {dueReviews.length > 0 ? "Review Time" : "All Caught Up!"}
          </h3>
          <p className={`text-sm ${dueReviews.length > 0 ? "text-white/80" : "text-text-light"}`}>
            {dueReviews.length > 0
              ? `${dueReviews.length} topic${dueReviews.length === 1 ? "" : "s"} need review`
              : "No reviews due right now"}
          </p>
        </Link>
      </div>

      {/* Mastery overview */}
      <div className="bg-bg-card rounded-2xl border border-border p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-text">Mastery Overview</h2>
          <Link href="/progress" className="text-primary text-sm font-medium hover:underline">
            See Full Map →
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <MasteryCount emoji="🏆" count={masteryBreakdown.mastered} label="Mastered" color="text-yellow-600" />
          <MasteryCount emoji="⭐" count={masteryBreakdown.proficient} label="Proficient" color="text-green-600" />
          <MasteryCount emoji="📖" count={masteryBreakdown.developing} label="Developing" color="text-amber-600" />
          <MasteryCount emoji="🌱" count={masteryBreakdown.novice} label="Novice" color="text-slate-500" />
          <MasteryCount emoji="🔒" count={masteryBreakdown.locked} label="Locked" color="text-gray-400" />
        </div>
      </div>

      {/* Quick links */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Link
          href="/chat/ask"
          className="card-hover bg-bg-card rounded-2xl border border-border p-5 flex items-center gap-4"
        >
          <span className="text-3xl">🤔</span>
          <div>
            <h3 className="font-bold text-text">Ask Your Buddy</h3>
            <p className="text-text-light text-sm">Stuck on something? Chat with your AI buddy!</p>
          </div>
        </Link>

        <Link
          href="/progress"
          className="card-hover bg-bg-card rounded-2xl border border-border p-5 flex items-center gap-4"
        >
          <span className="text-3xl">🗺️</span>
          <div>
            <h3 className="font-bold text-text">Progress Map</h3>
            <p className="text-text-light text-sm">See your full math journey</p>
          </div>
        </Link>
      </div>
    </main>
  );
}

function StatCard({ emoji, value, label }: { emoji: string; value: number; label: string }) {
  return (
    <div className="bg-bg-card rounded-xl border border-border p-4 text-center">
      <div className="text-2xl mb-1">{emoji}</div>
      <div className="text-2xl font-bold text-text">{value}</div>
      <div className="text-xs text-text-lighter">{label}</div>
    </div>
  );
}

function MasteryCount({ emoji, count, label, color }: { emoji: string; count: number; label: string; color: string }) {
  return (
    <div className="text-center">
      <span className="text-lg">{emoji}</span>
      <div className={`text-xl font-bold ${color}`}>{count}</div>
      <div className="text-xs text-text-lighter">{label}</div>
    </div>
  );
}
