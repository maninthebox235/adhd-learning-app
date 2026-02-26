"use client";

import { ALL_TOPICS, TOPICS_BY_CATEGORY } from "@/lib/knowledge-graph";
import { StudentState, TopicCategory, getMasteryLevel } from "@/lib/types";
import { computeTopicMastery, isTopicUnlocked } from "@/lib/student-model";
import MasteryBadge, { MasteryBar } from "./MasteryBadge";

const CATEGORY_INFO: Record<TopicCategory, { label: string; emoji: string; color: string }> = {
  "whole-numbers": { label: "Whole Numbers", emoji: "🔢", color: "border-blue-300" },
  fractions: { label: "Fractions", emoji: "🍕", color: "border-purple-300" },
  decimals: { label: "Decimals", emoji: "📍", color: "border-teal-300" },
  percentages: { label: "Percentages", emoji: "💯", color: "border-pink-300" },
  ratios: { label: "Ratios & Proportions", emoji: "⚖️", color: "border-orange-300" },
  geometry: { label: "Geometry", emoji: "📐", color: "border-green-300" },
  algebra: { label: "Algebra", emoji: "🔤", color: "border-indigo-300" },
  data: { label: "Data & Stats", emoji: "📊", color: "border-cyan-300" },
  "word-problems": { label: "Word Problems", emoji: "🧩", color: "border-amber-300" },
};

interface KnowledgeGraphViewProps {
  studentState: StudentState;
  onTopicSelect?: (topicId: string) => void;
}

export default function KnowledgeGraphView({ studentState, onTopicSelect }: KnowledgeGraphViewProps) {
  const categories = Object.entries(TOPICS_BY_CATEGORY) as [TopicCategory, typeof ALL_TOPICS][];

  return (
    <div className="space-y-6">
      {categories.map(([category, topics]) => {
        const info = CATEGORY_INFO[category];
        return (
          <div key={category} className={`bg-bg-card rounded-xl border-2 ${info.color} overflow-hidden`}>
            <div className="px-4 py-3 border-b border-border bg-bg">
              <h3 className="font-bold text-text flex items-center gap-2">
                <span>{info.emoji}</span>
                {info.label}
              </h3>
            </div>
            <div className="p-3 grid gap-2 sm:grid-cols-2">
              {topics.map((topic) => {
                const ts = studentState.topicStates[topic.id];
                const mastery = ts ? computeTopicMastery(ts) : 0;
                const unlocked = isTopicUnlocked(topic.id, studentState);
                const level = unlocked ? getMasteryLevel(mastery) : "locked";

                return (
                  <button
                    key={topic.id}
                    onClick={() => onTopicSelect?.(topic.id)}
                    disabled={!unlocked}
                    className={`text-left rounded-xl border p-3 transition-all ${
                      unlocked
                        ? "border-border hover:border-primary/30 hover:shadow-sm cursor-pointer"
                        : "border-border/50 opacity-50 cursor-not-allowed"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-lg shrink-0">{topic.emoji}</span>
                        <span className="text-sm font-medium text-text truncate">{topic.name}</span>
                      </div>
                      <MasteryBadge level={level} size="sm" showLabel={false} />
                    </div>
                    <MasteryBar mastery={mastery} />
                    <div className="flex justify-between mt-1">
                      <span className="text-xs text-text-lighter">{Math.round(mastery)}%</span>
                      {!unlocked && (
                        <span className="text-xs text-text-lighter">
                          🔒 Complete prerequisites
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
