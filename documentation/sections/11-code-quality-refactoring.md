# 11 — Code Quality & Refactoring Insights

## Static-analysis posture

- **ESLint** via `eslint-config-next/core-web-vitals` + `/typescript` (`eslint.config.mjs`).
- **TypeScript** `strict: true` in `tsconfig.json`.
- **No** SonarQube, CodeQL, Semgrep, or dependency vulnerability scanner wired in today.

Recommended additions:

```bash
# Zero-config security scan on PRs
# .github/workflows/security.yml
uses: github/codeql-action/analyze@v3

# Secret scanning
uses: gitleaks/gitleaks-action@v2

# Dependency vuln scan
npm audit --production
# or: Snyk, Dependabot (GitHub native)
```

## Observed quality patterns ✅

- **Strict TS**: no `any` proliferation in `lib/db/schema.ts` or `lib/data/*.ts`.
- **Drizzle ORM** removes a class of bugs (raw SQL strings, string interpolation).
- **Idempotent writes** (`onConflictDoNothing`) across all ingestion paths.
- **Timing-safe comparisons** in password verification (`crypto.timingSafeEqual`).
- **Consistent tenant scoping** — every `lib/data/*` function takes `orgId`.
- **Path aliases** (`@/*`) keep imports stable across refactors.
- **Transactional batch ingestion** — no half-written batches.

## Smells worth addressing

### 1) Hand-rolled validation
`validateRunPayload()` in `app/api/v1/ingest/batch/route.ts:46-57` is 11 lines of repeated `typeof X !== '...'` checks. Replace with Zod:

```ts
import { z } from 'zod'
const Span = z.object({
  name: z.string(),
  duration_ms: z.number().nonnegative(),
  status: z.enum(['ok', 'error']),
  cost: z.number().nonnegative(),
  tool_calls: z.number().nonnegative(),
  error: z.string().optional(),
})
const RunPayload = z.object({
  runId: z.string().min(1),
  agentSlug: z.string().min(1),
  timestamp: z.string().datetime(),
  durationMs: z.number().nonnegative(),
  outcome: z.boolean(),
  totalCost: z.number().nonnegative(),
  tokenCount: z.number().nonnegative(),
  toolCalls: z.number().nonnegative(),
  spans: z.array(Span).optional(),
})
const BatchPayload = z.object({ runs: z.array(RunPayload).min(1).max(1000) })
```

Gains: per-field errors for free, JSON-Schema export (→ OpenAPI), and a single source of truth that the (future) TypeScript SDK can import.

### 2) Duplication between `/runs` and `/batch` routes
`runs/route.ts` and `batch/route.ts` share auth, validation, agent resolution. Extract to `lib/ingest/common.ts`:

```ts
export async function authenticate(req: Request): Promise<{ orgId: string } | Response>
export async function resolveAgentSlugs(orgId: string, slugs: string[]): Promise<Map<string, string> | Response>
export const RunPayload = z.object({ ... })
```

### 3) Console error pattern
`console.error('[cron/check-budgets] Error:', err)` is repeated in every cron. Replace with a structured logger:

```ts
// lib/log.ts
export const log = {
  info:  (ctx: Record<string, unknown>) => console.log(JSON.stringify({ level: 'info',  ts: new Date().toISOString(), ...ctx })),
  error: (ctx: Record<string, unknown>) => console.error(JSON.stringify({ level: 'error', ts: new Date().toISOString(), ...ctx })),
}
```

Single import, immediate CloudWatch-friendly output.

### 4) Sidebar is a god component
`components/layout/Sidebar.tsx` at 475 lines holds: nav config, collapse state, agent status lookups, badges, keyboard handlers. Suggested split:

```
components/layout/
  Sidebar.tsx             # orchestrator
  NavSection.tsx          # each top-level group
  NavItem.tsx             # leaf link with status dot, badge
  AgentNavGroup.tsx       # process → agents nested list
  useNavState.ts          # collapsed sections, active detection
```

### 5) Numeric coercion scattered
Drizzle returns `numeric` as `string`. `lib/data/index.ts::toNumber()` is the accepted helper but it's applied per-call. Wrap queries where every row needs the same coercion, or define a branded type to make omissions loud.

### 6) Seed logic mixed with runtime fallback
`lib/seed-data.ts` serves two masters: (a) `scripts/seed.ts` source of truth, (b) runtime fallback when `DATA_SOURCE=mock`. Once the DB-path migration is complete, split:

- `lib/seed/fixtures.ts` — only used by `scripts/seed.ts`.
- Delete the runtime-fallback path.

### 7) Cron endpoints repeat auth boilerplate
Every `app/api/cron/*/route.ts` opens with:

```ts
if (request.headers.get('x-cron-secret') !== process.env.CRON_SECRET) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}
```

Extract to `lib/cron-auth.ts::withCronAuth(handler)` higher-order wrapper.

## Size / complexity hotspots

| File | Lines | Note |
|---|---:|---|
| `lib/db/schema.ts` | ~426 | Large but linear; splitting by domain (tenancy, telemetry, governance) would aid navigation |
| `lib/seed-data.ts` | ~4000+ | Fixture data; fine as-is, but split constants vs helpers |
| `components/layout/Sidebar.tsx` | 475 | Refactor per above |
| `lib/data/runs.ts` | ~700 | Many aggregation helpers; keep together — changes tend to ripple |
| `lib/data/analytics.ts` | 225 | Clean |

## TODO / FIXME inventory

A repo-wide grep for `TODO|FIXME|HACK|XXX` would be useful as a CI lint rule. As of this snapshot, the explicit markers are sparse — most deferred work is captured in §10.

## Test coverage

**Current: 0%.** No `*.test.ts`, `*.spec.ts`, Vitest config, or Playwright config in the tree.

Minimum viable test plan:

- `lib/data/runs.ts` — `getAgentRoi()` boundary cases (zero runs, max sigma, headcount=0 guard).
- `lib/verdict-logic.ts` — verdict colour + copy mapping.
- `app/api/v1/ingest/batch/route.ts` — 200 happy path, 401 invalid key, 400 missing agent slug, 400 over 1000 runs, idempotent re-post.
- `app/api/cron/compute-metrics/route.ts` — one-agent end-to-end using a seeded Postgres.
- Playwright: login → dashboard → process → agent (no assertions on data values; just rendered and not 500'd).

## Lint overrides audit

`eslint.config.mjs` extends the two Next configs and adds the ignore patterns. No `/* eslint-disable */` override is needed anywhere today that wasn't already idiomatic (e.g. `next` auto-generated types). That's a healthy sign.
