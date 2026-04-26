# 08 — Development Guidelines

## Local setup

```bash
# 1. Install Node 22 (match production)
nvm install 22 && nvm use 22

# 2. Deps
npm install

# 3. Database (if running with DATA_SOURCE=db)
cp .env.example .env.local        # then fill DATABASE_URL, NEXTAUTH_SECRET, CRON_SECRET
npx drizzle-kit push               # push schema to your dev Postgres
npx tsx scripts/seed.ts            # load mock data into DB (idempotent)

# 4. Run
npm run dev                        # Turbopack, localhost:3000
```

## Scripts

| Command | Effect |
|---|---|
| `npm run dev` | Next.js dev server with Turbopack |
| `npm run build` | Production build |
| `npm run start` | Serve production build |
| `npm run lint` | ESLint (core-web-vitals + typescript) |
| `npx drizzle-kit push` | Push schema changes to `DATABASE_URL` |
| `npx drizzle-kit studio` | Open Drizzle Studio DB browser |
| `npx tsx scripts/seed.ts` | Seed DB from `lib/seed-data.ts` (idempotent — safe to re-run) |

## Next.js 16 specifics that differ from older training material

- Request APIs are async: `await params`, `await searchParams`, `await cookies()`, `await headers()`.
- Use `proxy.ts` (Node.js runtime only) instead of `middleware.ts`. Place at the same level as `app/`.
- Turbopack config is top-level in `next.config.ts`, not under `experimental.turbopack`.
- `'use cache'` directive replaces PPR for mixing static + dynamic.
- `@vercel/postgres` and `@vercel/kv` are sunset — prefer `@neondatabase/serverless` or `pg`, and `@upstash/redis` or `ioredis`.

## Code conventions

### TypeScript

- `tsconfig.json` is strict (`"strict": true`).
- Path alias `@/*` → project root. Use `@/lib/...`, `@/components/...`, `@/types/...`.
- Avoid `any`. When a DB numeric needs to become a number, use `toNumber()` from `lib/data/index.ts`.

### React / Next.js

- Page components are **server components by default**. Add `'use client'` only when you need state, effects, or browser APIs.
- When a server page needs client interactivity, fetch data server-side and pass it to a small `Client*` component rather than marking the whole page client.
- Async data fetching lives in `lib/data/*.ts`; pages should not build SQL directly.
- Wrap client-only providers in `app/layout.tsx`, not every page.

### Styling

- Tailwind v4 with design tokens in `app/globals.css`. Prefer token-driven classes (`text-[var(--text-primary)]`) or the utility classes already declared (`.card`, `.row-hover`).
- Keep component-local classes terse. If a className list spans more than ~120 chars, extract a helper or a CSS rule.
- Icons from `lucide-react`. Charts from `recharts`.

### Data access

- Every read is scoped by `orgId`. Never accept an unvalidated `orgId` from a client header; resolve via session or API key.
- Writes use `onConflictDoNothing` when an operation should be idempotent (e.g. ingest).
- Prefer single-row UPSERTs over `SELECT … INSERT/UPDATE` pairs.

### File organisation

- Route files under `app/(app)/**` — the authenticated shell is automatic.
- Components scoped to one screen live under the matching `components/<domain>/` directory. Cross-screen primitives live in `components/shared/`.
- Types live in `types/telemetry.ts`. Avoid duplicating types in component files.

## Commit / branch hygiene

- Work on branches off `main` (current convention: `feat/`, `fix/`, `refactor/`, `docs/`).
- Keep commits scoped — a commit should correspond to a review-sized unit.
- Schema changes: one commit that changes `lib/db/schema.ts`, regenerates the data-access module, and updates `scripts/seed.ts`.

## Pre-commit / PR checklist

- [ ] `npm run build` succeeds.
- [ ] `npm run lint` has no new errors.
- [ ] No `console.log` leaks into committed code (except intentional `console.error` in API routes).
- [ ] Any new env var is added to `.env.example`.
- [ ] Any new API route has both happy-path and auth-failure branches.
- [ ] Any new DB query is scoped by `orgId`.

## Testing strategy (current state + target)

Today the repo has **no test suite**. Recommended stack for the build-out:

- **Unit**: Vitest for `lib/*` pure functions (sigma math, rollups, rule DSL).
- **Integration**: Vitest + `pg-mem` (or testcontainers-node for real Postgres) to exercise the data layer and cron endpoints end-to-end.
- **E2E**: Playwright against `npm run dev`, covering the core flows: login → dashboard → process → agent.

## Debugging & local inspection

- **DB browser**: `npx drizzle-kit studio` opens a UI at `https://local.drizzle.studio/`.
- **SSE stream**: `curl -N -H "Cookie: <session>" http://localhost:3000/api/monitoring/stream` streams live runs.
- **Cron endpoints**: you can call any cron manually — `curl -H "x-cron-secret: $CRON_SECRET" http://localhost:3000/api/cron/compute-metrics`.

## When you add a new page

1. Create `app/(app)/<route>/page.tsx` — default to server component.
2. If it needs data, add a function to the appropriate `lib/data/*.ts` module.
3. Add the nav entry in `components/layout/Sidebar.tsx` and the breadcrumb label in `components/layout/TopBar.tsx`.
4. Build the UI with existing primitives in `components/shared/` before introducing new ones.
5. If you need a new chart, add it to `components/<domain>/` — do not inline Recharts into `page.tsx`.

## When you add a new ingest payload field

1. Add the column to `lib/db/schema.ts` — numeric/json/text as appropriate.
2. `npx drizzle-kit push` to your dev DB.
3. Update the `RunPayload` / `SpanPayload` types in `app/api/v1/ingest/batch/route.ts` **and** `runs/route.ts`.
4. Extend `validateRunPayload()` with the new type guard.
5. Update the Drizzle `insert().values()` call in both ingest routes.
6. Backfill producer documentation in `documentation/sections/04-api-documentation.md`.
