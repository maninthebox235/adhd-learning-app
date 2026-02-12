"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Header() {
  const pathname = usePathname();
  const isChat = pathname.startsWith("/chat");
  const isParent = pathname.startsWith("/parent");

  return (
    <header className="bg-bg-card border-b border-border sticky top-0 z-50">
      <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl">🚀</span>
          <span className="text-xl font-bold text-primary">
            Isaac&apos;s Learning Hub
          </span>
        </Link>

        <nav className="flex items-center gap-2">
          {isChat && (
            <Link
              href="/"
              className="px-4 py-2 text-sm font-medium text-text-light hover:text-primary rounded-lg hover:bg-primary/5 transition-colors"
            >
              Dashboard
            </Link>
          )}
          {!isParent && (
            <Link
              href="/parent"
              className="px-3 py-2 text-xs text-text-lighter hover:text-text-light rounded-lg transition-colors"
              title="Parent Dashboard"
            >
              ⚙️
            </Link>
          )}
          {isParent && (
            <Link
              href="/"
              className="px-4 py-2 text-sm font-medium text-text-light hover:text-primary rounded-lg hover:bg-primary/5 transition-colors"
            >
              Back to App
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
