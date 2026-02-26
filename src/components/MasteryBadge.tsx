"use client";

import { MasteryLevel } from "@/lib/types";

const MASTERY_CONFIG: Record<MasteryLevel, { label: string; color: string; bg: string; emoji: string }> = {
  locked: { label: "Locked", color: "text-text-lighter", bg: "bg-gray-100", emoji: "🔒" },
  novice: { label: "Novice", color: "text-text-light", bg: "bg-slate-100", emoji: "🌱" },
  developing: { label: "Developing", color: "text-amber-700", bg: "bg-amber-50", emoji: "📖" },
  proficient: { label: "Proficient", color: "text-green-700", bg: "bg-green-50", emoji: "⭐" },
  mastered: { label: "Mastered", color: "text-yellow-700", bg: "bg-yellow-50", emoji: "🏆" },
};

interface MasteryBadgeProps {
  level: MasteryLevel;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

export default function MasteryBadge({ level, size = "md", showLabel = true }: MasteryBadgeProps) {
  const config = MASTERY_CONFIG[level];
  const sizeClasses = {
    sm: "text-xs px-2 py-0.5 gap-1",
    md: "text-sm px-3 py-1 gap-1.5",
    lg: "text-base px-4 py-1.5 gap-2",
  };

  return (
    <span className={`inline-flex items-center rounded-full font-medium ${config.bg} ${config.color} ${sizeClasses[size]}`}>
      <span>{config.emoji}</span>
      {showLabel && <span>{config.label}</span>}
    </span>
  );
}

export function MasteryBar({ mastery, className = "" }: { mastery: number; className?: string }) {
  const color =
    mastery >= 90 ? "bg-yellow-400" :
    mastery >= 70 ? "bg-green-400" :
    mastery >= 40 ? "bg-amber-400" :
    mastery > 0 ? "bg-slate-300" :
    "bg-gray-200";

  return (
    <div className={`w-full h-2 bg-gray-100 rounded-full overflow-hidden ${className}`}>
      <div
        className={`h-full rounded-full transition-all duration-500 ${color}`}
        style={{ width: `${Math.min(mastery, 100)}%` }}
      />
    </div>
  );
}
