# 10 — Technical Debt & Known Issues

## Classification legend

| Symbol | Meaning |
|---|---|
| 🔴 | Blocker / user-visible risk |
| 🟠 | Material — fix before scaling / external customers |
| 🟡 | Nice-to-have; low blast radius |

## Tracked items

### Data layer

- 🟠 **Mock↔DB bridge (`lib/data-source.ts`)** — pages incrementally migrate from `lib/seed-data.ts` (sync mock constants) to `lib/data/*.ts` (async DB). The bridge is the migration seam; long-term the seam should disappear and `lib/seed-data.ts` should collapse into a DB seeding fixture only.
- 🟠 **Spans stored as `jsonb` inline in `runs`** — simpler writes, but span-level queries (which tool errored most often this week?) require `jsonb` scans. If span-level analytics becomes a query pattern, extract to a separate `spans` table.
- 🟡 **Numeric casts** — Drizzle returns `numeric` columns as strings; `lib/data/index.ts::toNumber()` handles conversion. Centralised, but easy to forget for a new column. A single `money`/`numeric` wrapper type in `types/telemetry.ts` would make the invariant explicit.
- 🟡 **Retention policy** — `runs` grows unboundedly today. Plan a cold-archive flow (e.g. 180-day S3 export + prune) before data volumes bite.

### Ingest + API

- 🔴 **No rate limiting.** Ingest, login, cron — all unprotected. A single noisy agent could saturate the DB. Add a Redis token-bucket per API key and per IP on `/api/auth/*`.
- 🟠 **No HMAC request signing on ingest.** A replayed valid request succeeds once (idempotency catches it), but a long-lived leaked key is the whole security perimeter.
- 🟠 **Hand-rolled validation.** `validateRunPayload()` is fine today but would benefit from Zod for better error messages, schema reuse with the client SDK (future), and OpenAPI generation.
- 🟡 **`check-governance` violations are not persisted** (only `console.log`). Create a `governance_violations` table or extend `anomalies` with a new category so rule hits are queryable.
- 🟡 **No OpenAPI spec**; API contract lives in the route file and this doc. Autogenerate from Zod schemas once adopted.

### Cron & scheduling

- 🟠 **Single-node scheduler.** `deploy/crontab` assumes one EC2 node. If we horizontally scale, crons will fire on every node — need a leader-election pattern (Redis lock) or a central scheduler (Vercel Cron / EventBridge).
- 🟡 **Fixed cadence.** Metric rollups are hourly whether or not new runs landed. On quiet tenants this wastes cycles; on very busy tenants (millions/hour) one hour is too coarse. Consider watermarking `compute-metrics` against `max(runs.timestamp)`.

### Auth

- 🟠 **No MFA / SSO.** NextAuth credentials only. For enterprise pilots, add SAML or OIDC via `next-auth/providers`.
- 🟠 **No login rate-limit / lockout.** Combined with the rate-limiting gap above.
- 🟡 **Session strategy is JWT.** Simple but means revocation is not instantaneous. Acceptable at current scale; if customer-controlled session termination becomes a requirement, switch to DB sessions.

### Observability

- 🔴 **No APM / error tracking.** See §9 — adopt Sentry + OpenTelemetry.
- 🟠 **No structured logs.** Plaintext today; hard to ship to CloudWatch or Loki cleanly.
- 🟠 **No healthcheck endpoint.** Infra-level readiness probes have nothing to call.

### Infrastructure

- 🟠 **No IaC.** EC2 provisioning is `deploy/setup.sh`, an imperative Bash script. Move to Terraform or CDK so disaster recovery + new environments are a one-command concern.
- 🟠 **`drizzle-kit push` against prod.** Migrations should be generated files (`drizzle-kit generate`), versioned, and applied with `drizzle-kit migrate` in CI.
- 🟠 **Secrets on disk.** `.env.production` lives on the instance. Move to AWS Secrets Manager or SSM Parameter Store; inject at PM2 start.
- 🟡 **No CI.** Lint/build/test are manual. GitHub Actions with a `pull_request` trigger costs effectively nothing.

### Frontend

- 🟡 **Sidebar is a large component (475 lines).** The nav tree, collapsible groups, and status dots are all inline. Extract sub-components (`NavSection`, `NavItem`, `AgentNavGroup`).
- 🟡 **Mixed data-fetching patterns.** Pages use a blend of server-component `await getX()` and client-component imports from the mock bridge. Standardise on RSC + `'use client'` leaves for interactive islands.
- 🟡 **No loading UI / Suspense boundaries.** Slow DB queries block page render today. Add `loading.tsx` siblings under `app/(app)/*` for perceived responsiveness.

## Open TODOs in-code

| File | Note |
|---|---|
| `lib/data-source.ts` | Header comment describes Step 1 / Step 2 / Step 3 migration — about halfway through Step 2. |
| `app/api/cron/check-governance/route.ts` | Rule violations logged only; needs persistence. |
| `components/layout/Sidebar.tsx` | Hard-coded list of nav groups — move to config once tenancy supports customer-defined nav (low priority). |
| `lib/seed-data.ts` | Mixed role today: both fallback data source and DB seed fixture. Separate concerns once bridge is retired. |

## Dead / legacy artefacts

| Path | Status |
|---|---|
| `documentation/technicaldocs/*` | **March 31 snapshot**, pre-backend. Kept for audit trail; do not use for current state. (This folder supersedes it.) |
| `.vercel/project.json` | Historical — active deploy is EC2. Keep only if we plan a Vercel migration. |
| `redesign.md`, `plan.md` | Early-phase working notes. Fold what's still relevant into `README.md` or retire. |

## Recommended 30/60/90 plan

**30 days**
- Rate limiting on ingest + auth (Redis token bucket).
- Sentry integration on server + client.
- `/api/healthz` endpoint.
- Structured `lib/log.ts` + CloudWatch shipping.
- Generated migration files (`drizzle-kit generate`), stop using `push` in prod.

**60 days**
- OpenTelemetry tracing (custom + DB spans).
- Adopt Zod on ingest endpoints; publish OpenAPI.
- SSO provider (SAML/OIDC) in NextAuth.
- Terraform / CDK for EC2 + RDS + ElastiCache.
- CI pipeline (GitHub Actions): lint, build, test, schema-diff.

**90 days**
- Postgres Row-Level Security enabled with `app.current_org` setting.
- Distributed scheduler (Redis lock or platform-managed).
- Tests: Vitest + Playwright — start with ingest routes and dashboard smoke flow.
- Cold-archive retention for `runs` > 180 days.
- Secrets Manager + rotation.
