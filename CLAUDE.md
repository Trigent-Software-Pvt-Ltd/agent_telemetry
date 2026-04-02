# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

VIPPlay Agent Telemetry — a Next.js 16 frontend platform for monitoring agentic AI workflow performance. 35 routes, 60+ components across 5 phases. Displays verdicts (GREEN/AMBER/RED), sigma scores, coverage maps, ROI waterfalls, FMEA risk boards, workforce planning, governance rules, and live monitoring for multi-agent workflows. All data is currently **mock/deterministic** (no backend, no API calls).

## Commands

- `npm run dev` — Start dev server (Turbopack)
- `npm run build` — Production build
- `npm run start` — Serve production build
- `npm run lint` — ESLint (flat config, core-web-vitals + typescript presets)

## Tech Stack

- **Next.js 16.2** (App Router) with React 19 and TypeScript
- **Tailwind CSS 4** via `@tailwindcss/postcss` — custom design tokens in `globals.css` (`--vip-*`, `--v-*`, `--agent-*`)
- **Fonts**: Sora (headings, `--font-sora`), DM Sans (body, `--font-dm`), JetBrains Mono (code, `--font-mono-jb`) — **not Geist**
- **Recharts** for charts (area, bar, radar, scatter, composed, waterfall)
- **Lucide React** for icons, **clsx** for conditional classes, **sonner** for toasts
- Path alias: `@/*` maps to project root

## Next.js 16 Breaking Changes

This version has breaking changes from training data. **Read `node_modules/next/dist/docs/` before writing code.** Key differences:

- All request APIs are async: `await cookies()`, `await headers()`, `await params`, `await searchParams`
- Use `proxy.ts` instead of `middleware.ts` (Node.js runtime only). Place at same level as `app/`.
- Turbopack config is top-level in `next.config.ts`, not under `experimental.turbopack`
- `'use cache'` replaces PPR for mixing static and dynamic content
- `@vercel/postgres` and `@vercel/kv` are sunset — use `@neondatabase/serverless` and `@upstash/redis`

## Architecture

### Route Map (35 routes)

**Phase 1 — Core Demo:**
- `app/page.tsx` — Redirects to `/dashboard`
- `/dashboard` — Main dashboard with process cards, anomaly detection
- `/dashboard/roi` — ROI overview
- `/process/[id]` — C1 Symmetry Dashboard (agent/human split, SERVQUAL/OEE)
- `/process/[id]/labor` — C2 Labor Graph
- `/process/[id]/sigma` — C4 Sigma Scorecard + Improvement Tracker
- `/agents/[id]` — D1 Agent Telemetry + Cost of Inaction + Version Timeline
- `/governance/audit` — D2 Audit Log + Override Trend Analysis
- `/login` — Login page
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

### Data Layer (all mock, no backend)
- `types/telemetry.ts` — All types: Process, Agent, Run, Span, RoiSnapshot, AgentRoi, CoverageMapEntry, FmeaEntry, TransformationStage, ServqualDimension, GovernanceRule, WorkforceProjection, Correlation, Anomaly, and more
- `lib/mock-data.ts` — Deterministic mock data generator with 40+ helper functions
- `lib/verdict-logic.ts` — Verdict display config (colors/icons) and recommendation text

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
- `components/shared/` — Reusable: StatusDot, VerdictBadge, Tooltip, ShareButton

### State Management
- `hooks/useLanguageMode.ts` — Language mode context (operations/quality vocabulary)
- `hooks/useOrganisation.ts` — Organisation context (OEE/SERVQUAL quality framework)
- `hooks/useCountUp.ts` — Animation hook for number counters

### Design System
- Light mode, VIP/luxury aesthetic: navy sidebar (`#0A1628`), gold accent (`#D4AF37`), white cards on `#F7F9FC` surface
- Monitoring page: dark NOC theme override
- CSS custom properties for all colors — defined in both `:root` and `@theme inline` block for Tailwind
- `@media print` styles for PDF export (hides nav, full-width content)
- Custom `.card` class, `.row-hover`, `.animate-fade-up`, status dot pulse animations
