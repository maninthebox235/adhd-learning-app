"use client";

import ModeCard from "@/components/ModeCard";
import { getDailyChallenge } from "@/lib/challenges";

export default function Home() {
  const challenge = getDailyChallenge();

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      {/* Welcome section */}
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-text mb-2">
          Hey Isaac! 👋
        </h1>
        <p className="text-text-light text-lg">
          What do you want to do today?
        </p>
      </div>

      {/* Mode cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <ModeCard
          title="Ask Me Anything"
          description="Got a question? I've got answers! Ask about anything — science, sports, how things work, or whatever's on your mind."
          emoji="🤔"
          href="/chat/ask"
          gradient="bg-gradient-to-br from-accent-blue to-primary"
        />
        <ModeCard
          title="Creative Builder"
          description="Let's brainstorm! Video ideas, Lego builds, creative projects — tell me what you want to make and I'll help you plan it."
          emoji="🎨"
          href="/chat/creative"
          gradient="bg-gradient-to-br from-accent-purple to-accent-pink"
        />
        <ModeCard
          title="Daily Challenge"
          description={`Today's challenge: ${challenge.title}! Tap to get started.`}
          emoji="⚡"
          href="/chat/challenge"
          gradient="bg-gradient-to-br from-accent-orange to-secondary"
        />
      </div>

      {/* Quick tip */}
      <div className="mt-8 bg-bg-card rounded-xl border border-border p-5">
        <div className="flex items-start gap-3">
          <span className="text-2xl shrink-0">💡</span>
          <div>
            <h3 className="font-semibold text-text mb-1">Quick Tip</h3>
            <p className="text-text-light text-sm">
              Not sure where to start? Try the Daily Challenge — it&apos;s a
              fresh prompt every day designed to be fun and get your brain
              going!
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
