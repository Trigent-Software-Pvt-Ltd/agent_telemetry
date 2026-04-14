# VIPPlay Agent Telemetry — Features Delivered

**Project:** VIPPlay Agent Telemetry Platform
**Stack:** Next.js 16.2 (App Router) · React 19 · TypeScript · Tailwind CSS 4 · PostgreSQL (RDS) · Drizzle ORM · NextAuth v4 · Recharts · ioredis
**Scope:** Full-stack observability platform for agentic AI workflows — 41 page routes, 22 API routes, 100+ React components, 25 DB tables.

---

## 1. Backend

### 1.1 Database Layer (PostgreSQL + Drizzle ORM)
- **25 tables** defined in `lib/db/schema.ts` covering organisations, users, processes, agents, runs, spans, ROI snapshots, sigma metrics, coverage maps, FMEA entries, governance rules, audit log, alert rules, budget caps, notification channels, scheduled reports, workforce projections, correlations, anomalies, API keys, webhooks.
- **Connection pool** via `node-postgres` → Drizzle (`lib/db/index.ts`).
- **Migration tooling** — `drizzle-kit push` / `drizzle-kit studio`.
- **Seed pipeline** — `scripts/seed.ts` hydrates DB from `lib/seed-data.ts`.

### 1.2 Data Access Layer
Nine async modules in `lib/data/` — `processes`, `agents`, `runs`, `sigma`, `governance`, `settings`, `analytics`, `monitoring`, `insights`. Switchable data source via `DATA_SOURCE` env var (mock ↔ real DB) through `lib/data-source.ts` bridge.

### 1.3 REST API (22 endpoints)
**Ingestion (Langfuse-compatible telemetry):**
- `POST /api/v1/ingest/runs` — single run, API-key auth, idempotent
- `POST /api/v1/ingest/batch` — transactional batch ingestion

**Governance:**
- `GET/POST /api/governance/rules` · `GET/PUT/DELETE /api/governance/rules/[id]`
- `GET/POST /api/governance/fmea` · `GET/PUT/DELETE /api/governance/fmea/[id]`

**Settings:**
- `GET/POST /api/settings/alerts` · `GET/PUT/DELETE /api/settings/alerts/[id]`
- `GET/PUT /api/settings/budgets`
- `GET/POST /api/settings/notifications/channels`
- `GET/POST /api/settings/notifications/rules`
- `GET/PUT /api/settings/branding`

**Processes & Orgs:**
- `GET/PUT /api/processes/[slug]/coverage`
- `GET/PUT /api/organisations/[id]`

**Monitoring:**
- `GET /api/monitoring/stream` — Server-Sent Events (SSE), polls DB every 5s

**Auth:**
- `GET/POST /api/auth/[...nextauth]` — NextAuth handler

### 1.4 Scheduled Jobs (6 cron endpoints, `x-cron-secret` header auth)
- `/api/cron/compute-metrics` — rolls up run metrics
- `/api/cron/compute-process-roi` — refreshes ROI snapshots
- `/api/cron/detect-anomalies` — statistical anomaly detection
- `/api/cron/sync-langfuse` — pulls external telemetry
- `/api/cron/check-governance` — evaluates governance rules
- `/api/cron/check-budgets` — budget threshold alerts

### 1.5 Authentication & Security
- **NextAuth v4** credentials provider with PBKDF2 password hashing, JWT sessions (`lib/auth.ts`).
- **API-key auth** for ingestion endpoints.
- **Cron secret header** gate for scheduled job endpoints.
- **Redis (ioredis)** for SSE pub/sub and session store (ElastiCache).

### 1.6 Type System
`types/telemetry.ts` — 50+ TypeScript interfaces: `Process`, `Agent`, `Run`, `Span`, `RoiSnapshot`, `AgentRoi`, `CoverageMapEntry`, `FmeaEntry`, `GovernanceRule`, `WorkforceProjection`, `Correlation`, `Anomaly`, `AlertRule`, `BudgetCap`, `NotificationChannel`, etc.

---

## 2. Frontend — 41 Page Routes

### Phase 1 — Core Demo
| Route | Purpose |
|---|---|
| `/login` | Auth page (outside app shell) |
| `/dashboard` | Main dashboard — process cards, anomaly detection, hero banner |
| `/dashboard/roi` | ROI overview with waterfall |
| `/process/[id]` | C1 Symmetry Dashboard (agent/human split, SERVQUAL/OEE) |
| `/process/[id]/labor` | C2 Labor Graph |
| `/process/[id]/sigma` | C4 Sigma Scorecard + Improvement Tracker |
| `/agents/[id]` | D1 Agent Telemetry + Cost of Inaction + Version Timeline |
| `/governance/audit` | D2 Audit Log + Override Trend Analysis |
| `/settings` | Root settings + shared links |

### Phase 2 — Platform Setup
- `/setup/occupation` — O*NET occupation selector (A2)
- `/setup/mapping` — Agent-to-Task mapper (A3)
- `/dashboard/export` — Board export + scheduled reports (B3)
- `/process/[id]/coverage` — Coverage Map (C3)
- `/process/[id]/roadmap` — Transformation Roadmap (C5)
- `/governance/fmea` — FMEA Risk Board (D3)

### Phase 3 — Operational Maturity
- `/agents/[id]/manage` — Agent lifecycle (decommission, pause, swap)
- `/agents/compare` — A/B agent comparison with radar chart
- `/dashboard/costs` — Cost trend dashboard
- `/dashboard/benchmark` — Cross-process benchmark
- `/settings/alerts` — SLA config + alert rules engine
- `/governance/oversight` — Oversight gap report
- `/process/[id]/training` — Skills gap & training plan

### Phase 4 — Enterprise
- `/agents/[id]/staging` — Staging/canary view with traffic split
- `/monitoring` — Live NOC screen (dark theme)
- `/settings/budgets` — Per-agent budget caps & utilization
- `/settings/notifications` — Email / Slack / Teams channels
- `/process/[id]/workforce` — 12-month workforce projections
- `/governance/rules` — Governance rules engine

### Phase 5 — Platform & Integration
- `/settings/integrations` — API keys, webhooks, BI tools
- `/settings/branding` — White-label configuration
- `/admin/organisations` — Multi-tenant workspace
- `/dashboard/benchmarks` — Industry benchmark comparison
- `/analytics/correlations` — Correlation engine with scatter plots

### Phases 7–9 — Deep Observability & Financial Modeling
- `/insights/scenarios` — What-if scenario analysis
- `/insights/model-comparison` — LLM model comparison
- `/insights/maturity` — Maturity assessment
- `/insights/build-vs-buy` — Build vs. buy decision framework
- `/agents/dependencies` — Agent dependency graph
- `/governance/compliance` — Compliance requirements tracker

---

## 3. Component Library (100+ React components)

- **Layout** — `Sidebar` (fixed 260px navy nav), `TopBar` (breadcrumbs, notifications)
- **Dashboard** — `ProcessCard`, `HeroBanner`, `HealthSummary`, `MetricCards`, `AnomalyDetection`, `CostTrendChart`, `AgentCostBreakdown`, `BenchmarkTable`, `BenchmarkRadar`, `CorrelationCard`, `IndustryBenchmarkTable/Charts`, `AttentionRequired`, `InsightCards`, `QuickActions`
- **Symmetry** — `AgentColumn`, `HumanColumn`, `EquationCenter`, `RoiWaterfall`
- **Sigma** — `AgentSigmaCard`, `DpmoTrendChart`, `ImprovementTracker`
- **Telemetry** — `AgentHeader`, `MetricsBar`, `CostOfInaction`, `StagingView`, `TrafficSplitBar`, `VersionTimeline`, `DefectAnalysis`, `AvailabilityCard`, `MaintenanceScheduler`, `AgentActions`, `DecommissionPanel`, `SwapPanel`, `AgentRoiCard`, `SigmaContext`
- **Governance** — `AuditTable`, `AuditFilters`, `AuditSummary`, `AuditAlert`, `RiskHeatmap`, `FmeaDetailPanel`, `ComplianceGauge`, `ComplianceChecklist`, `ComplianceCertificate`, `EvidenceChain`, `ViolationsList`, `GovernanceRuleCard`, `AddRuleForm`
- **Coverage** — `CoverageGrid`, `CoverageSummaryBar`, `TaskDetailPanel`, `TaskOwnershipPage`, `TaskPerformanceOverlay`, `HumanVsAgentComparison`
- **Roadmap** — `StageTimeline`, `StageDetail`, `RoadmapClient`, `RoiProjectionChart`, `SigmaGapAnalysis`
- **Labor** — `CoverageBar`, `TaskBoard`, `SkillsPanel`, `SkillsGapTable`, `TrainingProgress`, `TrainingRecommendations`, `ScenarioToggle`, `WorkforceSummary`, `WorkforcePlanCharts`, `TeamImpactCards`
- **Export** — `ExportConfigForm`, `ReportPreview`, `ReportHistory`, `ScheduledReports`
- **Settings** — `ApiKeysPanel`, `WebhooksPanel`, `BiToolsPanel`, `IntegrationWizard`, `BrandingForm`, `BrandingPreview`, `OrganisationTable`, `OrganisationDetail`, `CreateOrgForm`
- **Monitoring** — `AgentStatusGrid`, `LiveEventFeed`, `SystemHealthBanner`, `MonitoringMetrics`
- **Insights** — `ScenarioCard`, `ScenarioResults`, `MaturityRadar`
- **ROI** — `CostSlider`, `HonestNote`, `RoiSummaryCards`
- **Setup** — `WizardProgress`, `SelectedProcesses`, `TaskMappingList`, `MappingSummary`
- **Shared** — `StatusDot`, `VerdictBadge`, `Tooltip`, `ShareButton`, `ExportButton`, `StatTile`, `EmptyState`, `CommandPalette` (Ctrl/Cmd+K)

---

## 4. Design System
- Light-mode VIP/luxury aesthetic — navy sidebar `#0A1628`, gold accent `#D4AF37`, white cards on `#F7F9FC`.
- Dark NOC override on `/monitoring`.
- Custom CSS tokens (`--vip-*`, `--v-*`, `--agent-*`) in `:root` and `@theme inline`.
- Print styles (`@media print`) for PDF export — hides nav, full-width content.
- Fonts: **Sora** (headings), **DM Sans** (body), **JetBrains Mono** (code).
- Animations: `.animate-fade-up`, status-dot pulse, count-up hooks.

---

## 5. State Management (React Context)
- `useLanguageMode` / `useLanguageModeProvider` — operations ↔ quality vocabulary switch
- `useOrganisation` / `useOrganisationProvider` — OEE/SERVQUAL framework selection
- `useCountUp` — animated number counters

Providers mounted in `app/layout.tsx`; consumed across client components.

---

## 6. Key Platform Capabilities
- Verdict engine (GREEN / AMBER / RED) with tooltip-level recommendations
- Sigma / DPMO quality scoring per agent and per process
- ROI waterfall + cost-of-inaction modeling
- FMEA risk board (Severity × Occurrence × Detection → RPN)
- Coverage maps (task-level agent vs. human ownership)
- Workforce projections (12-month planning horizon)
- A/B agent comparison (radar) and staging canary with traffic split
- Live SSE monitoring feed
- Multi-tenant orgs + white-label branding
- Board-ready PDF export + scheduled report distribution
- Langfuse telemetry sync
- Scheduled governance & budget enforcement
