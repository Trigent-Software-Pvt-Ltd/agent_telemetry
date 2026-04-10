# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

VIPPlay Agent Telemetry — a Next.js 16 full-stack platform for monitoring agentic AI workflow performance. 41 page routes + 22 API routes, 60+ components across 9 phases. Displays verdicts (GREEN/AMBER/RED), sigma scores, coverage maps, ROI waterfalls, FMEA risk boards, workforce planning, governance rules, and live monitoring for multi-agent workflows. Backend uses PostgreSQL (RDS) via Drizzle ORM with Langfuse integration for telemetry ingestion. Data source is switchable between mock data and real DB via `DATA_SOURCE` env var.

## Commands

- `npm run dev` — Start dev server (Turbopack)
- `npm run build` — Production build
- `npm run start` — Serve production build
- `npm run lint` — ESLint (flat config, core-web-vitals + typescript presets)
- `npx drizzle-kit push` — Push schema to database (requires `DATABASE_URL`)
- `npx drizzle-kit studio` — Open Drizzle Studio (DB browser)
- `npx tsx scripts/seed.ts` — Seed database from mock data

## Tech Stack

- **Next.js 16.2** (App Router) with React 19 and TypeScript
- **Tailwind CSS 4** via `@tailwindcss/postcss` — custom design tokens in `globals.css` (`--vip-*`, `--v-*`, `--agent-*`)
- **Fonts**: Sora (headings, `--font-sora`), DM Sans (body, `--font-dm`), JetBrains Mono (code, `--font-mono-jb`) — **not Geist**
- **Recharts** for charts (area, bar, radar, scatter, composed, waterfall)
- **Lucide React** for icons, **clsx** for conditional classes, **sonner** for toasts
- **Drizzle ORM** (`drizzle-orm` + `pg`) for database access — schema in `lib/db/schema.ts`
- **NextAuth.js v4** for authentication (credentials provider, JWT sessions)
- **ioredis** for ElastiCache Redis (SSE pub/sub, session store)
- Path alias: `@/*` maps to project root

## Next.js 16 Breaking Changes

This version has breaking changes from training data. **Read `node_modules/next/dist/docs/` before writing code.** Key differences:

- All request APIs are async: `await cookies()`, `await headers()`, `await params`, `await searchParams`
- Use `proxy.ts` instead of `middleware.ts` (Node.js runtime only). Place at same level as `app/`.
- Turbopack config is top-level in `next.config.ts`, not under `experimental.turbopack`
- `'use cache'` replaces PPR for mixing static and dynamic content
- `@vercel/postgres` and `@vercel/kv` are sunset — use `@neondatabase/serverless` and `@upstash/redis`

## Architecture

### Layout Structure

Two-tier layout using a Next.js route group:

- `app/layout.tsx` — Root layout: fonts, metadata (`r-Potential` title template), `<OrganisationProvider>` → `<LanguageModeProvider>` wrapping, Sonner toaster
- `app/(app)/layout.tsx` — **Client component** (`'use client'`): Sidebar (fixed 260px left), TopBar (breadcrumbs), CommandPalette (Ctrl/Cmd+K). All authenticated routes live here.
- `app/login/page.tsx` and `app/page.tsx` (redirect) sit **outside** the `(app)` group — no sidebar/topbar.

When adding new routes, place them under `app/(app)/` to get the shell layout automatically.

### Route Map (41 routes)

**Phase 1 — Core Demo:**
- `app/page.tsx` — Redirects to `/dashboard`
- `/dashboard` — Main dashboard with process cards, anomaly detection
- `/dashboard/roi` — ROI overview
- `/process/[id]` — C1 Symmetry Dashboard (agent/human split, SERVQUAL/OEE)
- `/process/[id]/labor` — C2 Labor Graph
- `/process/[id]/sigma` — C4 Sigma Scorecard + Improvement Tracker
- `/agents/[id]` — D1 Agent Telemetry + Cost of Inaction + Version Timeline
- `/governance/audit` — D2 Audit Log + Override Trend Analysis
- `/login` — Login page (outside `(app)` group)
- `/settings` — Settings + shared links

**Phase 2 — Complete Platform:**
- `/setup/occupation` — A2 Occupation Selector (O*NET search)
- `/setup/mapping` — A3 Agent-to-Task Mapper
- `/dashboard/export` — B3 Board Export + Scheduled Reports
- `/process/[id]/coverage` — C3 Coverage Map
- `/process/[id]/roadmap` — C5 Transformation Roadmap
- `/governance/fmea` — D3 FMEA Risk Board

**Phase 3 — Operational Maturity:**
- `/agents/[id]/manage` — Agent lifecycle (decommission, pause, swap)
- `/agents/compare` — A/B agent comparison with radar chart
- `/dashboard/costs` — Cost trend dashboard
- `/dashboard/benchmark` — Cross-process benchmark
- `/settings/alerts` — SLA config + alert rules engine
- `/governance/oversight` — Oversight gap report
- `/process/[id]/training` — Skills gap & training plan

**Phase 4 — Enterprise:**
- `/agents/[id]/staging` — Staging/canary view with traffic split
- `/monitoring` — Live monitoring (NOC screen, dark theme)
- `/settings/budgets` — Per-agent budget caps & utilization
- `/settings/notifications` — Notification channels (email, Slack, Teams)
- `/process/[id]/workforce` — Workforce planning (12-month projections)
- `/governance/rules` — Governance rules engine

**Phase 5 — Platform & Integration:**
- `/settings/integrations` — API keys, webhooks, BI tools
- `/settings/branding` — White-label configuration
- `/admin/organisations` — Multi-tenant workspace
- `/dashboard/benchmarks` — Industry benchmark comparison
- `/analytics/correlations` — Correlation engine with scatter plots

**Phases 7–9 — Deep Observability & Financial Modeling:**
- `/insights/scenarios` — What-if scenario analysis
- `/insights/model-comparison` — LLM model comparison
- `/insights/maturity` — Maturity assessment
- `/insights/build-vs-buy` — Build vs. buy decision framework
- `/agents/dependencies` — Agent dependency graph
- `/governance/compliance` — Compliance requirements tracker

### Data Layer
- `types/telemetry.ts` — All types (50+ interfaces): Process, Agent, Run, Span, RoiSnapshot, AgentRoi, CoverageMapEntry, FmeaEntry, GovernanceRule, WorkforceProjection, Correlation, Anomaly, etc.
- `lib/db/schema.ts` — Drizzle ORM schema (25 PostgreSQL tables)
- `lib/db/index.ts` — Database connection pool (node-postgres → Drizzle)
- `lib/data/*.ts` — 9 async data access modules (processes, agents, runs, sigma, governance, settings, analytics, monitoring, insights) — reads from PostgreSQL
- `lib/data-source.ts` — Bridge file: re-exports from `lib/seed-data.ts`. To use DB, import from `lib/data/*` directly. See file header for migration guide.
- `lib/seed-data.ts` — Seed data (constants + sync functions). Used as default data source and for DB seeding.
- `lib/verdict-logic.ts` — Verdict display config (colors/icons) and recommendation text
- `lib/auth.ts` — NextAuth config (credentials provider, PBKDF2 hashing, JWT sessions)

### API Routes (22 endpoints)
- `app/api/v1/ingest/runs/` — `POST` telemetry ingestion (API key auth, idempotent)
- `app/api/v1/ingest/batch/` — `POST` batch run ingestion (transactional)
- `app/api/governance/rules/` — CRUD for governance rules
- `app/api/governance/fmea/` — CRUD for FMEA risk entries
- `app/api/settings/alerts/` — CRUD for alert rules
- `app/api/settings/budgets/` — GET/PUT budget caps with current spend
- `app/api/settings/notifications/` — channels + rules management
- `app/api/settings/branding/` — white-label config
- `app/api/processes/[slug]/coverage/` — GET/PUT task coverage map
- `app/api/organisations/[id]/` — org settings
- `app/api/monitoring/stream/` — SSE real-time event stream (polls DB every 5s)
- `app/api/auth/[...nextauth]/` — NextAuth handler
- `app/api/cron/*` — 6 cron endpoints (compute-metrics, compute-process-roi, detect-anomalies, sync-langfuse, check-governance, check-budgets). Secured via `x-cron-secret` header.

### Component Organization
- `components/layout/` — `Sidebar` (fixed left nav, 260px) and `TopBar` (breadcrumbs, notifications)
- `components/dashboard/` — Dashboard widgets, cost charts, benchmark tables, anomaly cards
- `components/symmetry/` — Symmetry Dashboard (AgentColumn, HumanColumn, EquationCenter, RoiWaterfall)
- `components/sigma/` — Sigma Scorecard (AgentSigmaCard, DpmoTrendChart, ImprovementTracker)
- `components/telemetry/` — Agent detail (AgentHeader, MetricsBar, CostOfInaction, StagingView, VersionTimeline)
- `components/governance/` — Audit, FMEA, oversight, rules (AuditTable, RiskHeatmap, ComplianceGauge)
- `components/coverage/` — Coverage map (CoverageGrid, TaskDetailPanel)
- `components/roadmap/` — Transformation roadmap (StageTimeline, RoiProjectionChart)
- `components/labor/` — Labor, training, workforce (SkillsGapTable, WorkforcePlanCharts)
- `components/export/` — Board export (ExportConfigForm, ReportPreview, ScheduledReports)
- `components/settings/` — All settings panels (SLA, alerts, budgets, notifications, branding, integrations)
- `components/monitoring/` — Live monitoring (AgentStatusGrid, LiveEventFeed)
- `components/shared/` — Reusable: StatusDot, VerdictBadge, Tooltip, ShareButton, CommandPalette

### State Management
- `hooks/useLanguageMode.ts` — Language mode context hook (operations/quality vocabulary)
- `hooks/useLanguageModeProvider.tsx` — Provider component wrapping the context
- `hooks/useOrganisation.ts` — Organisation context hook (OEE/SERVQUAL quality framework)
- `hooks/useOrganisationProvider.tsx` — Provider component wrapping the context
- `hooks/useCountUp.ts` — Animation hook for number counters

Providers are mounted in the root layout (`app/layout.tsx`). Hooks are consumed in client components throughout the app.

### Design System
- Light mode, VIP/luxury aesthetic: navy sidebar (`#0A1628`), gold accent (`#D4AF37`), white cards on `#F7F9FC` surface
- Monitoring page: dark NOC theme override
- CSS custom properties for all colors — defined in both `:root` and `@theme inline` block for Tailwind
- `@media print` styles for PDF export (hides nav, full-width content)
- Custom `.card` class, `.row-hover`, `.animate-fade-up`, status dot pulse animations
