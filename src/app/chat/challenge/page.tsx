"use client";

import { useState } from "react";
import ChatInterface from "@/components/ChatInterface";
import { getDailyChallenge } from "@/lib/challenges";

export default function ChallengePage() {
  const challenge = getDailyChallenge();
  const [started, setStarted] = useState(false);

  if (!started) {
    return (
      <main className="max-w-2xl mx-auto px-4 py-12">
        <div className="bg-bg-card rounded-2xl border border-border p-8 text-center">
          <div className="text-5xl mb-4">⚡</div>
          <div className="inline-block bg-accent-orange/10 text-accent-orange text-xs font-bold px-3 py-1 rounded-full mb-4 uppercase tracking-wide">
            {challenge.category}
          </div>
          <h1 className="text-2xl font-bold text-text mb-3">
            {challenge.title}
          </h1>
          <p className="text-text-light leading-relaxed mb-8 max-w-md mx-auto">
            {challenge.description}
          </p>
          <button
            onClick={() => setStarted(true)}
            className="bg-accent-orange hover:bg-accent-orange/90 text-white font-bold px-8 py-3 rounded-xl text-lg transition-colors"
          >
            I&apos;m Ready! Let&apos;s Do This! 🚀
          </button>
        </div>
      </main>
    );
  }

  return (
    <ChatInterface
      mode="challenge"
      initialMessage={`I'm ready to do today's challenge: "${challenge.title}" — ${challenge.description}`}
    />
  );
}
