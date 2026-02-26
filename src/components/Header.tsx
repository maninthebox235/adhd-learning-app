"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/", label: "Home", emoji: "🏠" },
  { href: "/learn", label: "Learn", emoji: "🚀" },
  { href: "/review", label: "Review", emoji: "⚡" },
  { href: "/progress", label: "Progress", emoji: "🗺️" },
  { href: "/chat/ask", label: "Buddy", emoji: "🤔" },
];

export default function Header() {
  const pathname = usePathname();
  const isParent = pathname.startsWith("/parent");

  return (
    <header className="bg-bg-card border-b border-border sticky top-0 z-50">
      <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <span className="text-xl">🧠</span>
          <span className="text-lg font-bold text-primary hidden sm:inline">
            Isaac&apos;s Math
          </span>
        </Link>

        {!isParent && (
          <nav className="flex items-center gap-1">
            {NAV_ITEMS.map((item) => {
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-text-light hover:text-primary hover:bg-primary/5"
                  }`}
                >
                  <span className="sm:hidden">{item.emoji}</span>
                  <span className="hidden sm:inline">{item.emoji} {item.label}</span>
                </Link>
              );
            })}
          </nav>
        )}

        <div className="flex items-center gap-2 shrink-0">
          {isParent ? (
            <Link
              href="/"
              className="px-4 py-2 text-sm font-medium text-text-light hover:text-primary rounded-lg hover:bg-primary/5 transition-colors"
            >
              Back to App
            </Link>
          ) : (
            <Link
              href="/parent"
              className="px-2 py-1.5 text-xs text-text-lighter hover:text-text-light rounded-lg transition-colors"
              title="Parent Dashboard"
            >
              ⚙️
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
