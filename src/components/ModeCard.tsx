"use client";

import Link from "next/link";

interface ModeCardProps {
  title: string;
  description: string;
  emoji: string;
  href: string;
  gradient: string;
}

export default function ModeCard({
  title,
  description,
  emoji,
  href,
  gradient,
}: ModeCardProps) {
  return (
    <Link href={href} className="block">
      <div
        className={`card-hover rounded-2xl p-6 border-2 border-transparent cursor-pointer ${gradient}`}
      >
        <div className="text-4xl mb-3">{emoji}</div>
        <h2 className="text-xl font-bold text-white mb-2">{title}</h2>
        <p className="text-white/80 text-sm leading-relaxed">{description}</p>
        <div className="mt-4 inline-flex items-center gap-1 text-white/90 text-sm font-medium">
          Let&apos;s go →
        </div>
      </div>
    </Link>
  );
}
