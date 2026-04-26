# Agent Telemetry — Multi-Variant Demo Repository

This repository hosts **three sibling mocks** of the agent-observability platform. Each variant lives on its own branch, has its own Vercel project, and tells a distinct story to a different audience. They share the Next.js 16 + React 19 + Tailwind 4 substrate and the same `@/types/telemetry.ts` core, but each branch can diverge freely without affecting the others.

## The three variants at a glance

| Branch | Vercel project | Production URL | Audience | What it proves |
|---|---|---|---|---|
| **`main`** | `agent_telemetry` | https://vipsigma.arkos.studio | CEO/COO/CFO/CTO of an enterprise AI buyer | Deep observability across the full agent lifecycle — verdicts, sigma, ROI, governance, workforce, planning. 41 routes, full data-source bridge, optional DB-backed mode. The *operations* surface. |
| **`quadrant-mock`** | `agent-telemetry-quadrant` | https://vipquadrant.arkos.studio | Les + the Quadrant evaluation team (per Apr-15 commitment) | Quadrant mock with the **Sourcing Agent live slice** — real Claude calls via Vercel AI Gateway, real NPI Registry data, persisted via Supabase. Rest of the surface remains seeded so the slice feels embedded. |
| **`aeos-mock`** | `agent-telemetry-aeos` | https://vipaeos.arkos.studio | Les + the FuzeBox / rPotential joint-IP narrative | The AEOS demo — Cross-Vendor Observation, Predictive Economic Ledger v2.3 (Predicted / Actual / Variance / Attribution / Correction), L9 Dynamic Instruction Runtime, two-party signed attestation, Auto-Improvement workspace where the system writes its own DIR rules from ledger telemetry and humans approve before deploy. |

Each Vercel project has its own *Production Branch* setting; pushes to one branch only deploy that branch's project. Local `.vercel/project.json` is per-developer-machine and gitignored — re-link with `vercel link --project <name>` when switching which one the CLI commands target.

## Per-branch READMEs

Each branch carries its own README on its tip describing exactly what's present in that variant, what's intentionally NOT in it, and how to redeploy. Switch branches and read:

```bash
git switch quadrant-mock && head -60 README.md
git switch aeos-mock     && head -60 README.md
```

## Companion docs (on `aeos-mock` branch only)

| File | Purpose |
|---|---|
| [`AEOS_Demo_plan.md`](https://github.com/Trigent-Software-Pvt-Ltd/agent_telemetry/blob/aeos-mock/AEOS_Demo_plan.md) | Full planning doc for the AEOS branch — what was built, how it coexists with `main` and `quadrant-mock`, deployment notes |
| [`AEOS_DEMO_SCRIPT.md`](https://github.com/Trigent-Software-Pvt-Ltd/agent_telemetry/blob/aeos-mock/AEOS_DEMO_SCRIPT.md) | Live-walkthrough talk-track for in-person briefings |
| [`AEOS_VIDEO_SCRIPT.md`](https://github.com/Trigent-Software-Pvt-Ltd/agent_telemetry/blob/aeos-mock/AEOS_VIDEO_SCRIPT.md) | Tight 6–8 min screen-recording script with per-section actions and shot list |

## Coexistence rules (so the variants don't collide)

- **No edits to `main` from a mock branch.** Each mock keeps its diff to itself.
- **All variant code is namespaced.** `app/(aeos)/*`, `components/aeos/*`, `lib/aeos/*` for AEOS; the Quadrant slice puts live code under explicit `lib/sourcing/*`. Removing a variant branch leaves zero artifacts behind on `main`.
- **Tailwind + globals.css are additive only.** Variants append scoped CSS (e.g., AEOS adds `--aeos-*` aliases); they do not override existing tokens.
- **Mock data is per-variant.** `lib/seed-data.ts` (main), `lib/mock/quadrant.ts` (quadrant-mock), `lib/aeos/seed/*` (aeos-mock).

---

## main — Agent Telemetry Platform

A comprehensive frontend platform for monitoring, managing, and optimizing agentic AI workflows. Answers 40 CEO/COO/CFO/CTO questions across agent lifecycle management, ROI tracking, quality monitoring, governance compliance, and workforce planning.

**41 routes · 60+ components · 9 phases shipped · DB-ready via `DATA_SOURCE` env**

By default, `DATA_SOURCE=mock` and all reads come from `lib/seed-data.ts`. Set `DATA_SOURCE=db` and provide a `DATABASE_URL` to swap in the Drizzle / Postgres data layer (`lib/data/*`). Cron endpoints, ingestion routes, and NextAuth are present but inert in mock mode.

### Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — redirects to the main dashboard.

### Commands

| Command | Description |
|---|---|
| `npm run dev` | Start dev server (Turbopack) |
| `npm run build` | Production build |
| `npm run start` | Serve production build |
| `npm run lint` | ESLint check |
| `npx drizzle-kit push` | Push schema to database (requires `DATABASE_URL`) |
| `npx drizzle-kit studio` | Open Drizzle Studio (DB browser) |
| `npx tsx scripts/seed.ts` | Seed database from mock data |

### Tech Stack

- **Next.js 16.2** (App Router) + React 19 + TypeScript
- **Tailwind CSS 4** with custom design tokens
- **Recharts** for data visualization
- **Drizzle ORM** + **node-postgres** (DB-mode)
- **NextAuth.js v4** (credentials, JWT)
- **ioredis** for ElastiCache (SSE pub/sub)
- **Lucide React** icons, **clsx**, **sonner**
- **Fonts**: Sora (headings), DM Sans (body), JetBrains Mono (code)

### Platform feature surface

#### Phase 1 — Core Demo
- Dashboard, Symmetry Dashboard (agent vs human split with OEE/SERVQUAL toggle), Sigma Scorecard, Agent Telemetry, Audit Log, Labor Graph

#### Phase 2 — Complete Platform
- Occupation Selector (O*NET), Agent-to-Task Mapper, Coverage Map, Transformation Roadmap, FMEA Risk Board, Board Export

#### Phase 3 — Operational Maturity
- Agent Lifecycle, A/B Comparison, Cost Trends, Cost of Inaction, SLA & Alerts, Oversight Gaps, Skills & Training, Cross-Process Benchmark

#### Phase 4 — Enterprise Features
- Agent Staging (canary), Live Monitoring (NOC dark theme), Budget Controls, Notification Channels, Workforce Planning, Governance Rules

#### Phase 5 — Platform & Integration
- API & Webhooks, BI Integration, Industry Benchmarks, White-Label, Multi-Tenant, Correlation Engine, Anomaly Detection

#### Phases 7–9 — Deep Observability & Financial Modeling
- What-If Scenarios, Model Comparison, AI Maturity, Build vs Buy, Agent Dependencies, Compliance Tracker

### Project structure

```
app/
├── (app)/                  # Main app route group (with sidebar layout)
│   ├── dashboard/          # Dashboard, costs, export, benchmark, ROI
│   ├── process/[id]/       # Process views: symmetry, labor, sigma, coverage, roadmap, training, workforce
│   ├── agents/[id]/        # Agent views: detail, manage, staging
│   ├── governance/         # Audit, FMEA, oversight, rules
│   ├── settings/           # Settings, alerts, budgets, notifications, integrations, branding
│   ├── admin/              # Multi-tenant organisation management
│   ├── analytics/          # Correlations
│   ├── monitoring/         # Live monitoring
│   ├── insights/           # Scenarios, model comparison, maturity, build-vs-buy
│   └── setup/              # Occupation selector, agent-task mapping
├── api/                    # 22 API routes — ingest, governance, settings, cron, NextAuth
├── login/                  # Login page
components/
├── layout/                 # Sidebar, TopBar
├── dashboard/              # Dashboard widgets, charts, benchmarks
├── symmetry/, sigma/, telemetry/, governance/, coverage/, roadmap/, labor/, export/, settings/, monitoring/, shared/
lib/
├── seed-data.ts            # Mock data + 50+ helper functions
├── data-source.ts          # Bridge: re-exports from seed-data.ts (mock) or lib/data/* (db)
├── data/                   # Async DB-backed data access modules
├── db/schema.ts            # Drizzle ORM schema (25 tables)
├── auth.ts                 # NextAuth config
├── verdict-logic.ts
types/
├── telemetry.ts            # 60+ TypeScript interfaces
hooks/
├── useLanguageMode, useOrganisation, useCountUp
```

### Design system
- **Theme**: Light mode, VIP/luxury aesthetic
- **Colors**: Navy sidebar (`#0f1117`), accent blue (`#378ADD`), white cards on `#F8F9FA`
- **Monitoring**: Dark NOC theme override for wall-projected displays
- **Print**: Full `@media print` support for PDF export

---

## License

Proprietary — FuzeBox AI / r-Potential
