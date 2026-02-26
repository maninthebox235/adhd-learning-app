# AGENTS.md

## Cursor Cloud specific instructions

### Overview

Isaac's Learning Hub — a single Next.js 16 app (TypeScript, React 19, Tailwind CSS v4) with no database (uses browser localStorage). The Anthropic Claude API powers all chat features via two API routes (`/api/chat`, `/api/parent`).

### Running the app

- **Dev server:** `npm run dev` (port 3000)
- **Build:** `npm run build`
- **Lint:** `npm run lint` (pre-existing lint errors exist in the codebase — 1 error from `react-hooks/set-state-in-effect` in `src/app/parent/page.tsx`)

### Environment variables

Copy `.env.example` to `.env.local`. Required:
- `ANTHROPIC_API_KEY` — needed for all chat/AI features. Without it, the UI loads but chat returns an error.
- `PARENT_PIN` — defaults to `1234` if not set.

### Key caveats

- No automated test suite exists in this project (no jest, vitest, or playwright). Validation is manual only.
- The app has no database; all data persists in browser localStorage.
- The parent dashboard PIN verification calls `/api/parent` server-side; the default PIN is `1234`.
