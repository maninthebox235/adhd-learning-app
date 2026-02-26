"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import KnowledgeGraphView from "@/components/KnowledgeGraphView";
import MasteryBadge, { MasteryBar } from "@/components/MasteryBadge";
import { getStudentState } from "@/lib/storage";
import { computeTopicMastery, isTopicUnlocked } from "@/lib/student-model";
import { ALL_TOPICS, TOPICS_BY_ID, getPrerequisiteTopics, getDependentTopics } from "@/lib/knowledge-graph";
import { StudentState, getMasteryLevel } from "@/lib/types";

export default function ProgressPage() {
  const [state, setState] = useState<StudentState | null>(null);
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);

  useEffect(() => {
    setState(getStudentState());
  }, []);

  if (!state) return null;

  const selectedTopic = selectedTopicId ? TOPICS_BY_ID[selectedTopicId] : null;
  const selectedTs = selectedTopicId ? state.topicStates[selectedTopicId] : null;

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text">Progress Map</h1>
          <p className="text-text-light text-sm">
            Your math journey — tap any topic for details
          </p>
        </div>
        <Link href="/" className="text-primary text-sm font-medium hover:underline">
          ← Dashboard
        </Link>
      </div>

      {/* Overall stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <OverviewStat
          label="Total XP"
          value={state.totalXp.toLocaleString()}
          emoji="⭐"
        />
        <OverviewStat
          label="Level"
          value={String(state.level)}
          emoji="🏅"
        />
        <OverviewStat
          label="Sessions"
          value={String(state.sessionsCompleted)}
          emoji="📚"
        />
        <OverviewStat
          label="Streak"
          value={`${state.currentStreak} days`}
          emoji="🔥"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Knowledge graph */}
        <KnowledgeGraphView
          studentState={state}
          onTopicSelect={(id) => setSelectedTopicId(id === selectedTopicId ? null : id)}
        />

        {/* Topic detail panel */}
        {selectedTopic && selectedTs ? (
          <div className="bg-bg-card rounded-2xl border border-border p-5 self-start sticky top-4">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">{selectedTopic.emoji}</span>
              <div>
                <h3 className="font-bold text-text">{selectedTopic.name}</h3>
                <p className="text-xs text-text-lighter">{selectedTopic.description}</p>
              </div>
            </div>

            <div className="mb-4">
              <MasteryBadge level={isTopicUnlocked(selectedTopicId!, state) ? getMasteryLevel(computeTopicMastery(selectedTs)) : "locked"} />
              <div className="mt-2">
                <MasteryBar mastery={computeTopicMastery(selectedTs)} />
                <span className="text-xs text-text-lighter mt-1 block">
                  {Math.round(computeTopicMastery(selectedTs))}% mastery
                </span>
              </div>
            </div>

            {/* Knowledge points */}
            <div className="space-y-2 mb-4">
              <h4 className="text-xs font-bold text-text-lighter uppercase tracking-wide">
                Knowledge Points
              </h4>
              {selectedTopic.knowledgePoints.map((kp, i) => {
                const kpState = selectedTs.knowledgePointStates[i];
                return (
                  <div key={kp.id} className="bg-bg rounded-lg border border-border p-3">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium text-text">
                        {kp.level}. {kp.title}
                      </span>
                      <span className="text-xs text-text-lighter">
                        {kpState.correct}/{kpState.attempts}
                      </span>
                    </div>
                    <MasteryBar mastery={kpState.mastery} />
                  </div>
                );
              })}
            </div>

            {/* Prerequisites */}
            {selectedTopic.prerequisites.length > 0 && (
              <div className="mb-4">
                <h4 className="text-xs font-bold text-text-lighter uppercase tracking-wide mb-2">
                  Prerequisites
                </h4>
                <div className="space-y-1">
                  {getPrerequisiteTopics(selectedTopicId!).map((pt) => (
                    <button
                      key={pt.id}
                      onClick={() => setSelectedTopicId(pt.id)}
                      className="text-left w-full flex items-center gap-2 px-2 py-1 rounded hover:bg-bg transition-colors"
                    >
                      <span>{pt.emoji}</span>
                      <span className="text-sm text-text">{pt.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Leads to */}
            {getDependentTopics(selectedTopicId!).length > 0 && (
              <div>
                <h4 className="text-xs font-bold text-text-lighter uppercase tracking-wide mb-2">
                  Unlocks
                </h4>
                <div className="space-y-1">
                  {getDependentTopics(selectedTopicId!).map((dt) => (
                    <button
                      key={dt.id}
                      onClick={() => setSelectedTopicId(dt.id)}
                      className="text-left w-full flex items-center gap-2 px-2 py-1 rounded hover:bg-bg transition-colors"
                    >
                      <span>{dt.emoji}</span>
                      <span className="text-sm text-text">{dt.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Spaced repetition info */}
            {selectedTs.nextReviewDate && (
              <div className="mt-4 pt-4 border-t border-border">
                <p className="text-xs text-text-lighter">
                  📅 Next review: {selectedTs.nextReviewDate}
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-bg-card rounded-2xl border border-border p-8 text-center self-start sticky top-4">
            <div className="text-4xl mb-3">👆</div>
            <p className="text-text-light text-sm">
              Tap a topic to see details, knowledge points, and progress.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}

function OverviewStat({ label, value, emoji }: { label: string; value: string; emoji: string }) {
  return (
    <div className="bg-bg-card rounded-xl border border-border p-3 text-center">
      <span className="text-lg">{emoji}</span>
      <div className="text-lg font-bold text-text">{value}</div>
      <div className="text-xs text-text-lighter">{label}</div>
    </div>
  );
}
