# Gap Analysis — Quadrant 5-Day Sprint vs. VIPPlay Agent Telemetry

**Context:** Trigent has been asked to deliver a 5-day sprint for Quadrant covering (a) a Chief-of-Staff telemetry wrapper and (b) a Sourcing Agent MVP. This document maps what the existing **VIPPlay Agent Telemetry** codebase already provides against what the sprint requires, and lists the net-new work.

---

## 1. Executive Summary

| Track | Status | Notes |
|---|---|---|
| **A. Chief-of-Staff Telemetry Wrapper** | **~80% reusable** | VIPPlay pattern exists — ingestion, dashboards, cost tracking, version timeline, SSE monitoring all shipped. Day-1 delivery is realistic if Quadrant access arrives on time. |
| **B. Sourcing Agent MVP** | **~10% reusable** | Governance rules engine, evidence/audit patterns, and review-UI scaffolding exist. Data pipelines (NPI, CMS), specialist agents, revenue estimator, and calibration layer are net-new. |

---

## 2. Track A — Chief-of-Staff Telemetry Wrapper

### ✅ What we already have (reusable without rewrite)
- **Ingestion endpoints** — `POST /api/v1/ingest/runs` and `/batch` (API-key auth, idempotent, transactional).
- **Usage / cost dashboards** — `/dashboard/costs`, `/dashboard/benchmark`, `CostTrendChart`, `AgentCostBreakdown`, `CostMetricCards`.
- **Prompt version capture** — `components/telemetry/VersionTimeline.tsx` + run/span schema already models prompt versions.
- **Per-agent telemetry view** — `/agents/[id]` with metrics bar, ROI, defect analysis, availability.
- **Live monitoring** — SSE stream at `/api/monitoring/stream` + `/monitoring` NOC dashboard.
- **Budgets & alerts** — `/settings/budgets`, `/settings/alerts`, `check-budgets` cron.
- **Audit log** — `/governance/audit` with filters, summary, override trend.

### ❌ Gaps for Quadrant-specific delivery
1. **Vercel / HubSpot wrapper proxy** — no existing proxy to Quadrant's Vercel deployment or HubSpot API. Needs a new edge route that captures request/response metadata and forwards to ingestion.
2. **Vercel KV adapter** — project currently uses Redis (ioredis → ElastiCache). CLAUDE.md notes `@vercel/kv` is sunset; need `@upstash/redis` adapter if Quadrant stack requires it.
3. **Quadrant-specific endpoint map** — which HubSpot/Vercel endpoints to instrument is undefined; needs Day-1 discovery with Quadrant's technical contact.
4. **Access provisioning** — Vercel deployment read, Vercel KV, HubSpot API with owner scopes not yet granted (blocker for Day-1 Track A).
5. **Tenant isolation for Quadrant** — multi-tenant plumbing exists (`/admin/organisations`, `organisations` table) but no Quadrant tenant seeded.

**Effort:** 1 full-stack engineer × 1 day (wrapper + dashboard wiring) — assuming access lands by Monday 09:00.

---

## 3. Track B — Sourcing Agent MVP

### ✅ Partially reusable scaffolding
- **Governance rules engine** (`/governance/rules`, `AddRuleForm`, `GovernanceRuleCard`, `check-governance` cron) — can host the two MVP rules (3rd-party service provider? · estimated revenue ≥ $5M?).
- **Evidence chain UI** (`components/governance/EvidenceChain.tsx`, `ComplianceCertificate.tsx`) — reusable pattern for source-provenance enforcement.
- **FMEA / risk board** — could be adapted for candidate scoring, but not a direct fit.
- **Scheduled-report + export patterns** — `ExportConfigForm`, `ReportPreview`, `ScheduledReports` — reusable for the Day-5 usage report.
- **Agent dependency graph** (`/agents/dependencies`) — pattern reusable for manager → specialist orchestration view.

### ❌ Net-new work (not in this repo)
| Area | Description | Est. Effort |
|---|---|---|
| **NPI Registry integration** | `nppes.cms.hhs.gov` API client, taxonomy-based filtering, caching layer. | 0.5 day — data engineer |
| **CMS Medicare Utilization pipeline** | Multi-GB file download, preprocessing, queryable store (Postgres table + index). Must start Day-1 morning. | 1 day — data engineer |
| **State licensing data sources** | Wildcard — some states have APIs, many don't. Day-1 inventory decides coverage. | 0.5 day discovery |
| **Company Finder specialist** | NPI taxonomy + geography filtering → candidate list. | 0.5 day |
| **Business Type Classifier specialist** | Deterministic classifier using NPI ownership structure (captive practice vs. independent 3rd-party). | 0.5 day |
| **Revenue Estimator specialist** | Back-calculates total revenue from Medicare revenue using an industry % assumption (30–40%). Must surface the assumption as a **confidence factor**, not bury it. | 1 day |
| **Manager / orchestrator component** | Trigger → assign specialists → consolidate results → evidence assembly. | 0.5 day |
| **Evidence / provenance layer** | Every field traceable to a source URL + timestamp. Reuses EvidenceChain UI but needs server-side enforcement. | 0.5 day |
| **Evaluation layer** | Two-rule scoring (3rd-party provider? · ≥ $5M revenue?) with automated pass/fail + confidence score. | 0.5 day |
| **Calibration set** | Sam's 5 good-fit + 5 poor-fit examples needed before Day 4 to calibrate the evaluator. **Missing input.** | External dependency |
| **Review dashboard** | Production-quality UI with expandable evidence per candidate. Tight for an afternoon build; plan has this as the drop-to-follow-on if behind. | 1 day |
| **Ground-truth capture UI** | Day-5 capture of reviewer decisions to feed back into evaluation. | 0.25 day |
| **Written data authorization** | Les/Sam to confirm in writing that CMS + NPI are acceptable sources. **Missing input.** | Legal/approval |

### Sequencing risks
- **Day-1 data inventory must precede code.** Without it, Day-2 specialists build on unverified data availability.
- **Calibration set is the silent blocker.** If the 5+5 examples slip past Day 3, Day-4 evaluation calibrates blind and Day-5 output quality drops.
- **Revenue Estimator assumption surfacing.** If the Medicare % assumption is hidden, Sam gets false confidence. Non-negotiable that this becomes a visible confidence factor in the UI.

---

## 4. Cross-Cutting Gaps

### Team & operational
- **4 dedicated people × 5 days** required (tech lead + 2 full-stack + 1 data engineer). Not currently locked.
- **Start date collides with Money20/20 Bangkok** — team coverage must be confirmed.
- **Commercial terms** (sprint rate, flow through FuzeBox vs. direct, payment terms) not yet agreed.

### Inputs missing from Quadrant
1. Vercel + Vercel KV + HubSpot access tokens (Monday 09:00 IST deadline).
2. Written data-source authorization (CMS, NPI).
3. 5 good-fit + 5 poor-fit example companies from Sam.
4. List of HubSpot / Vercel endpoints to instrument for Track A.

### Technical/platform
- **Next.js 16 request-API async migration** — CLAUDE.md flags that all request APIs (`cookies`, `headers`, `params`, `searchParams`) are now async and `middleware.ts` is replaced by `proxy.ts`. Any new Quadrant wrapper must follow this.
- **Vercel Fluid Compute vs. Edge Functions** — Vercel knowledge update (2026-02-27) says prefer Fluid Compute; Edge Functions deprecated. Wrapper design should default to Fluid Compute.
- **Database** — current project assumes self-hosted RDS Postgres. If Quadrant requires Vercel Marketplace (Neon), needs `@neondatabase/serverless` adapter swap.

---

## 5. Recommended Sprint Plan (summary)

| Day | Track A (CoS Wrapper) | Track B (Sourcing MVP) |
|---|---|---|
| **Mon** | Wrapper + ingestion wiring + dashboard tenant | Data inventory (NPI + CMS + state licensing) |
| **Tue** | Prompt-version capture for Quadrant endpoints | Build 3 specialists (Company Finder, Classifier, Revenue Estimator) in parallel |
| **Wed** | Usage dashboard polish + SSE feed for Quadrant tenant | Manager component + evidence/provenance layer |
| **Thu** | Cost / budget alerts tuned for Quadrant | Evaluation layer + review dashboard |
| **Fri** | Live-run telemetry + report generation | Live run on 50+ candidates + decision-meeting report |

---

## 6. Go / No-Go Checklist for Monday Start

- [ ] Quadrant Vercel + Vercel KV + HubSpot access granted (≤ Mon 09:00)
- [ ] Written authorization for CMS + NPI data sources
- [ ] Sam's 5 good-fit + 5 poor-fit examples received
- [ ] 4 dedicated Trigent engineers locked (tech lead + 2 FS + 1 data)
- [ ] Commercial terms agreed (rate, flow, payment)
- [ ] Money20/20 coverage confirmed
- [ ] Quadrant endpoint inventory (HubSpot/Vercel) shared

If ≥ 2 of these are open on Thursday, recommend delaying the Monday start by one week.
