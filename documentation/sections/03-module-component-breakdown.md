# 03 — Module & Component Breakdown

## Top-level layout

```
app/
  layout.tsx                 # root shell — providers, fonts, metadata
  globals.css                # design tokens + utility classes
  page.tsx                   # redirects to /dashboard
  login/page.tsx             # outside (app) group — no sidebar
  (app)/
    layout.tsx               # auth shell: Sidebar + TopBar + ⌘K
    dashboard/...            # 9 phase-1 main dashboards
    process/[id]/...         # 7 process lenses
    agents/...               # 6 agent surfaces
    governance/...           # 5 governance screens
    settings/...             # 7 settings screens
    admin/...                # 1 multi-tenant admin
    analytics/...            # 1 correlation engine
    insights/...             # 4 what-if + maturity screens
    monitoring/...           # 1 live NOC (dark theme)
    setup/...                # 2 onboarding screens
  api/
    v1/ingest/{runs,batch}/  # telemetry ingestion
    cron/{6 endpoints}/      # scheduled rollups and checks
    monitoring/stream/       # SSE
    auth/[...nextauth]/      # NextAuth
    governance/{rules,fmea}/ # governance CRUD
    settings/{alerts,budgets,notifications,branding}/
    processes/[slug]/coverage/
    organisations/[id]/
components/                  # 168 files, 18 directories
hooks/                       # context providers + animation helpers
lib/
  db/                        # schema.ts, index.ts (connection pool)
  data/                      # 9 async DB modules
  data-source.ts             # mock ↔ db bridge
  seed-data.ts               # mock constants + sync helpers
  auth.ts                    # NextAuth config + PBKDF2 helpers
  verdict-logic.ts           # colour + copy for GREEN/AMBER/RED
types/telemetry.ts           # 50+ shared TS interfaces
scripts/seed.ts              # DB seeding from mock constants
deploy/                      # crontab + setup.sh (EC2 bootstrap)
ecosystem.config.js          # PM2 process manager
drizzle.config.ts            # schema path + dialect
```

## Components — inventory

| Directory | Count | Representative files | Purpose |
|---|---:|---|---|
| `components/dashboard/` | 19 | `HeroBanner`, `HealthSummary`, `ProcessCard`, `AttentionRequired`, `CostTrendChart`, `BenchmarkTable`, `AnomalyCard`, `CorrelationCard` | Narrative-first dashboard widgets |
| `components/telemetry/` | 20 | `AgentHeader`, `MetricsBar`, `RoiPanel`, `CostOfInaction`, `StagingView`, `VersionTimeline`, `AvailabilityHeatmap` | Agent-detail surfaces |
| `components/settings/` | 22 | `SlaConfig`, `AlertRulesEditor`, `BudgetCapsTable`, `NotificationChannels`, `BrandingPanel`, `IntegrationsPanel`, `BiTools` | All settings panels |
| `components/governance/` | 17 | `AuditTable`, `RiskHeatmap`, `ComplianceGauge`, `RulesEngine`, `OversightGapReport` | Governance + compliance screens |
| `components/labor/` | 10 | `SkillsGapTable`, `WorkforcePlanCharts`, `TrainingPlan` | Labor & workforce planning |
| `components/roi/` | 8 | `WaterfallChart`, `TcoBreakdown`, `LongRangeProjection`, `PaybackTimeline` | Financial screens |
| `components/insights/` | 7 | `MaturityRadar`, `ScenarioBuilder`, `ModelComparisonTable`, `BuildVsBuy` | What-if / strategy |
| `components/shared/` | 9 | `StatusDot`, `VerdictBadge`, `Tooltip`, `ShareButton`, `CommandPalette` | Reusable primitives |
| `components/coverage/` | 5 | `CoverageGrid`, `TaskDetailPanel` | Task coverage map |
| `components/fmea/` | 5 | `RiskMatrix`, `MitigationPanel` | FMEA risk board |
| `components/monitoring/` | 5 | `AgentStatusGrid`, `LiveEventFeed` | NOC dark console |
| `components/roadmap/` | 5 | `StageTimeline`, `RoiProjectionChart` | Transformation roadmap |
| `components/sigma/` | 5 | `AgentSigmaCard`, `DpmoTrendChart`, `ImprovementTracker` | Six Sigma scorecard |
| `components/setup/` | 5 | `OccupationSelector`, `TaskMapper` | Onboarding |
| `components/symmetry/` | 4 | `AgentColumn`, `HumanColumn`, `EquationCenter`, `RoiWaterfall` | Symmetry dashboard |
| `components/export/` | 4 | `ExportConfigForm`, `ReportPreview`, `ScheduledReports` | Board export |
| `components/layout/` | 2 | `Sidebar.tsx` (475 lines), `TopBar.tsx` (290 lines) | Shell |

## Hooks & contexts

| Hook | File | Role |
|---|---|---|
| `useLanguageMode` | `hooks/useLanguageMode.ts` + `useLanguageModeProvider.tsx` | Toggle between Operations and Quality vocabulary (SERVQUAL/OEE terminology) |
| `useOrganisation` | `hooks/useOrganisation.ts` + `useOrganisationProvider.tsx` | Quality framework context (`oee` default) + org-level defaults |
| `useCountUp` | `hooks/useCountUp.ts` | `requestAnimationFrame` ease-out 0→target counter for KPI cards |

Both context providers are mounted in `app/layout.tsx` (server file) so the whole app tree can consume them.

## Data access modules (`lib/data/*.ts`)

| Module | Responsibility |
|---|---|
| `runs.ts` | Latest runs per agent, per-agent weekly ROI, monthly cost aggregation, waste ratio, TCO breakdown |
| `agents.ts` | Agent config, version history, health status, compare payloads |
| `processes.ts` | Process with coverage breakdown, ROI roll-ups, labor graph |
| `sigma.ts` | 30/90/6m sigma and DPMO trends, latency percentile analysis |
| `governance.ts` | Rules CRUD, FMEA entries, audit log, oversight computation |
| `analytics.ts` | Correlation engine (Pearson across sigma/cost/latency/failure), anomaly feed, industry benchmarks |
| `insights.ts` | Maturity assessment, what-if scenarios, build-vs-buy calculators |
| `monitoring.ts` | Status grid aggregations for NOC |
| `settings.ts` | Per-user settings, alerts, budgets, notification rules |

## Type definitions

`types/telemetry.ts` exports 50+ interfaces — the core ones are:

- `Process`, `Agent`, `AgentVersion`, `Run`, `Span`
- `RoiSnapshot`, `AgentRoi`, `ProcessRoi`, `TcoBreakdown`
- `CoverageMapEntry`, `FmeaEntry`, `GovernanceRule`, `Anomaly`
- `TransformationStage`, `ServqualDimension`, `WorkforceProjection`, `Correlation`
- `Verdict = 'GREEN' | 'AMBER' | 'RED'` used across dashboards

## Design system tokens (`app/globals.css`)

```
--status-green: #1D9E75    --status-green-bg: #ECFDF5
--status-amber: #BA7517    --status-amber-bg: #FFF8EB
--status-red:   #E24B4A    --status-red-bg:   #FEF2F2
--accent-blue:  #378ADD    --accent-blue-bg:  #EBF3FC
--border:       #E8E6E0
--content-bg:   #FFFFFF    --surface:         #F8F9FA
--text-primary: #111827    --text-secondary:  #6B7280
--text-muted:   #9CA3AF
```

Utility classes: `.card`, `.row-hover`, `.animate-fade-up`, `.tabular-nums`, `.status-dot-{green,amber,red}` (2 s pulse). Print styles (`@media print`) collapse nav and expand content for PDF export.

The `/monitoring` NOC console overrides to a dark theme via component-local Tailwind classes.
