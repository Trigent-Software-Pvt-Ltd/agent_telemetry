# 01 — Project Overview

## Purpose

VIPPlay Agent Telemetry is a **multi-tenant observability and ROI platform for agentic AI workflows**. It answers three questions for an organisation running many AI agents across business processes:

1. **Is the agent working?** — Sigma score, success rate, latency breaches, cost overruns, anomaly events.
2. **Is it worth it?** — Per-agent and per-process ROI: gross saving (labor displaced) minus inference, oversight, and governance costs.
3. **Is it under control?** — Governance rule engine, FMEA risk board, audit trail of human overrides, budget caps, SLA alerts.

The system treats every agent invocation as a **Run**. Runs roll up into daily agent KPIs and weekly process ROI envelopes. Those rollups feed 41 dashboard pages spanning operator NOC, executive dashboards, governance review, workforce planning, and platform settings.

## Core capabilities

| Capability | Surface |
|---|---|
| Run ingestion (pull + push) | `POST /api/v1/ingest/runs`, `/batch`, `/api/cron/sync-langfuse` |
| Agent observability | `/agents/[id]`, `/agents/[id]/staging`, `/agents/[id]/manage`, `/agents/compare`, `/agents/dependencies` |
| Process lens | `/process/[id]` + `/labor`, `/sigma`, `/coverage`, `/roadmap`, `/training`, `/workforce` |
| ROI & costs | `/dashboard/roi`, `/dashboard/costs`, `/dashboard/benchmark`, `/insights/scenarios`, `/insights/build-vs-buy` |
| Governance | `/governance/audit`, `/governance/fmea`, `/governance/rules`, `/governance/oversight`, `/governance/compliance` |
| Live NOC | `/monitoring` — SSE stream, dark theme |
| Platform admin | `/settings/*`, `/admin/organisations`, `/setup/occupation`, `/setup/mapping` |

## Tech stack

| Layer | Technology | Version |
|---|---|---|
| Framework | Next.js (App Router) | 16.2.1 |
| UI | React | 19.2.4 |
| Language | TypeScript | 5.x (strict) |
| Styling | Tailwind CSS v4 (via `@tailwindcss/postcss`) | 4.x |
| Charts | Recharts | 3.8.1 |
| Icons | Lucide React | 1.6.0 |
| DB | PostgreSQL (AWS RDS) + Drizzle ORM | 0.45.2 / `pg` 8.20 |
| Cache/pub-sub | Redis (AWS ElastiCache) via `ioredis` | 5.10.1 |
| Auth | NextAuth v4 + `@auth/drizzle-adapter` | 4.24.13 / 1.11.1 |
| Deployment | EC2 + PM2 + systemd | — |

Fonts are **Sora / DM Sans / JetBrains Mono** (custom CSS variables `--font-sora`, `--font-dm`, `--font-mono-jb`) — deliberately not Geist.

## Scale (current state)

- **41 page routes** across 9 phases (`app/(app)/...`).
- **22 API routes** (`app/api/*`).
- **168 components** across 18 directories under `components/`.
- **25 PostgreSQL tables** (`lib/db/schema.ts`).
- **9 data-access modules** (`lib/data/*.ts`).
- **6 cron jobs** driving rollups, anomaly detection, Langfuse sync.
- **~5,500 tracked files** (excl. `node_modules`, `.next`, `.git`).

## Data-source switch

A single env flag, `DATA_SOURCE`, determines whether the app reads from:

- **`mock`** — `lib/seed-data.ts` constants (deterministic fixtures, used for demos / local dev without DB).
- **`db`** — live PostgreSQL via `lib/data/*.ts` modules.

The bridge file `lib/data-source.ts` re-exports the appropriate path and is the layer pages import from during the migration.

## Non-goals (explicit)

- Not a log aggregator for non-AI systems (scope is agent runs / traces).
- Not a tracing backend — it **consumes** Langfuse traces but is not a replacement for a trace collector.
- Not a prompt-management product.
- No customer-facing chat surface; operator/executive tooling only.

## Stakeholders

| Role | Primary screens |
|---|---|
| AI platform engineer | `/monitoring`, `/agents/[id]`, `/agents/[id]/staging`, `/analytics/correlations` |
| Business ops lead | `/dashboard`, `/process/[id]`, `/dashboard/roi` |
| Quality / Six Sigma | `/process/[id]/sigma`, `/governance/fmea`, `/insights/maturity` |
| Governance / risk | `/governance/*`, `/settings/budgets`, `/settings/alerts` |
| Workforce planner | `/process/[id]/workforce`, `/process/[id]/training`, `/insights/scenarios` |
| Executive | `/dashboard/roi`, `/dashboard/benchmarks`, `/insights/build-vs-buy` |
