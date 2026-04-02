# VIPPlay Agent Telemetry Platform

A comprehensive frontend platform for monitoring, managing, and optimizing agentic AI workflows. Built with Next.js 16, React 19, and Tailwind CSS 4.

## Overview

VIPPlay Agent Telemetry provides enterprise-grade observability for AI agent deployments. It answers 40 CEO/COO/CFO/CTO questions across agent lifecycle management, ROI tracking, quality monitoring, governance compliance, and workforce planning.

**35 routes | 60+ components | 5 completed phases**

All data is currently mock/deterministic — no backend required for demo purposes.

## Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — redirects to the main dashboard.

## Commands

| Command | Description |
|---|---|
| `npm run dev` | Start dev server (Turbopack) |
| `npm run build` | Production build |
| `npm run start` | Serve production build |
| `npm run lint` | ESLint check |

## Tech Stack

- **Next.js 16.2** (App Router) + React 19 + TypeScript
- **Tailwind CSS 4** with custom design tokens
- **Recharts** for data visualization (area, bar, radar, scatter, composed charts)
- **Lucide React** icons, **clsx** conditional classes, **sonner** toasts
- **Fonts**: Sora (headings), DM Sans (body), JetBrains Mono (code)

## Platform Features

### Phase 1 — Core Demo
- **Dashboard** — Process overview with verdict cards, stat banners, anomaly detection
- **Symmetry Dashboard** — Agent vs human task split with OEE/SERVQUAL toggle
- **Sigma Scorecard** — Six Sigma quality metrics per agent with improvement tracking
- **Agent Telemetry** — Deep-dive per agent: runs, defects, cost analysis, version history
- **Audit Log** — Governance trail with override trend analysis
- **Labor Graph** — Human workforce impact visualization

### Phase 2 — Complete Platform
- **Occupation Selector** — O*NET-based occupation search and task discovery
- **Agent-to-Task Mapper** — Click-to-assign agent ownership
- **Coverage Map** — Color-coded task coverage grid
- **Transformation Roadmap** — 4-stage automation journey with ROI projections
- **FMEA Risk Board** — Failure mode analysis with heat map and RPN scoring
- **Board Export** — Configurable PDF reports with scheduled delivery

### Phase 3 — Operational Maturity
- **Agent Lifecycle** — Decommission, pause, reassign, and swap agents with impact analysis
- **A/B Comparison** — Side-by-side agent comparison with radar charts
- **Cost Trends** — 6-month cost analysis with per-agent breakdown
- **Cost of Inaction** — 90-day risk projection for underperforming agents
- **SLA & Alerts** — Configurable SLA targets and alert rules per agent
- **Oversight Gaps** — Identify agent-owned tasks without human review
- **Skills & Training** — Gap analysis with team training progress
- **Cross-Process Benchmark** — Compare processes on quality, coverage, ROI

### Phase 4 — Enterprise Features
- **Agent Staging** — Canary deployments with traffic split control
- **Live Monitoring** — NOC-style dark dashboard with simulated real-time feeds
- **Budget Controls** — Per-agent monthly caps with utilization gauges
- **Notification Channels** — Email, Slack, Teams with rule-based routing
- **Workforce Planning** — 12-month projections with scenario modeling
- **Governance Rules** — Configurable compliance rules with violation tracking

### Phase 5 — Platform & Integration
- **API & Webhooks** — Key management, event webhooks, delivery tracking
- **BI Integration** — Power BI, Tableau, Looker connection wizards
- **Industry Benchmarks** — Compare against industry averages and top 10%
- **White-Label** — Branding customization with live preview
- **Multi-Tenant** — Organisation management with role-based access
- **Correlation Engine** — Auto-discovered correlations with scatter plots
- **Anomaly Detection** — Automated anomaly identification with severity scoring

## Design System

- **Theme**: Light mode, VIP/luxury aesthetic
- **Colors**: Navy sidebar (`#0A1628`), gold accent (`#D4AF37`), white cards on `#F7F9FC`
- **Monitoring**: Dark NOC theme override for wall-projected displays
- **Print**: Full `@media print` support for PDF export

## Project Structure

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
│   └── setup/              # Occupation selector, agent-task mapping
├── login/                  # Login page
components/
├── layout/                 # Sidebar, TopBar
├── dashboard/              # Dashboard widgets, charts, benchmarks
├── symmetry/               # Symmetry dashboard components
├── sigma/                  # Sigma scorecard components
├── telemetry/              # Agent detail components
├── governance/             # Governance components
├── coverage/               # Coverage map components
├── roadmap/                # Roadmap components
├── labor/                  # Labor, training, workforce components
├── export/                 # Export components
├── settings/               # Settings panel components
├── monitoring/             # Live monitoring components
├── shared/                 # Reusable components
lib/
├── mock-data.ts            # All mock data and 40+ helper functions
├── verdict-logic.ts        # Verdict display configuration
types/
├── telemetry.ts            # All TypeScript interfaces
hooks/
├── useLanguageMode.ts      # Operations/quality vocabulary toggle
├── useOrganisation.ts      # OEE/SERVQUAL quality framework
├── useCountUp.ts           # Number animation
```

## License

Proprietary — FuzeBox AI / r-Potential
