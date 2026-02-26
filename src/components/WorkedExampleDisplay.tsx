"use client";

import { useState } from "react";
import { WorkedExample } from "@/lib/types";

interface WorkedExampleDisplayProps {
  example: WorkedExample;
  onComplete: () => void;
}

export default function WorkedExampleDisplay({ example, onComplete }: WorkedExampleDisplayProps) {
  const [visibleSteps, setVisibleSteps] = useState(1);
  const allVisible = visibleSteps >= example.steps.length + 1;

  const showNext = () => {
    if (visibleSteps <= example.steps.length) {
      setVisibleSteps((v) => v + 1);
    }
  };

  return (
    <div className="bg-bg-card rounded-2xl border border-border p-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-2xl">📝</span>
        <h2 className="text-lg font-bold text-text">{example.title}</h2>
      </div>

      <div className="bg-primary/5 border border-primary/10 rounded-xl p-4 mb-6">
        <p className="text-text leading-relaxed">{example.problem}</p>
      </div>

      <div className="space-y-3">
        {example.steps.map((step, i) => (
          <div
            key={i}
            className={`transition-all duration-300 ${
              i < visibleSteps ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 h-0 overflow-hidden"
            }`}
          >
            <div className="bg-bg rounded-xl border border-border p-4">
              <p className="text-sm font-bold text-primary mb-1">{step.label}</p>
              <p className="text-text text-sm leading-relaxed">{step.content}</p>
            </div>
          </div>
        ))}

        {visibleSteps > example.steps.length && (
          <div className="animate-fade-in-up bg-accent-green/10 border border-accent-green/20 rounded-xl p-4">
            <p className="text-sm font-bold text-accent-green mb-1">Answer</p>
            <p className="text-text text-sm leading-relaxed">{example.finalAnswer}</p>
          </div>
        )}
      </div>

      <div className="mt-6 flex justify-center">
        {!allVisible ? (
          <button
            onClick={showNext}
            className="bg-primary hover:bg-primary-dark text-white font-medium px-6 py-3 rounded-xl transition-colors"
          >
            {visibleSteps <= example.steps.length ? "Show Next Step" : "Show Answer"} →
          </button>
        ) : (
          <button
            onClick={onComplete}
            className="bg-accent-green hover:bg-accent-green/90 text-white font-bold px-8 py-3 rounded-xl transition-colors"
          >
            Got It! Let&apos;s Practice! 💪
          </button>
        )}
      </div>
    </div>
  );
}
