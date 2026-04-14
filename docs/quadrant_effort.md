# Quadrant Sprint — Effort Assessment Against VIPPlay Mock

**Purpose:** Before we plan the 5-day Quadrant × FuzeBox × Trigent sprint, this note confirms how much of the existing VIPPlay Agent Telemetry mock already satisfies Quadrant's ask — and what is genuinely new.

**Ask for Les:** Please confirm this framing is right before we commit the plan.

---

## TL;DR

Quadrant is **not a different project** from what we already built. It is a **narrower, domain-specific instance** of the same telemetry pattern, with **one net-new UI** (candidate review dashboard) on top.

- **Track A — Chief of Staff telemetry:** ~**75% already shipped** in the VIPPlay mock.
- **Track B — Sourcing Agent MVP:** ~**50% reusable scaffolding**; genuinely new pieces are the candidate review dashboard and the specialist-trace view.
- **Total net-new UI work:** ~2–3 days on the mock, not 5.

---

## The Core Pattern Is the Same

Both VIPPlay and Quadrant do the same thing at their core:

> **Wrap an LLM-powered agent → capture every request / call / token / latency / output / user action → show it in a dashboard with cost, audit, rules, and evidence.**

The Quadrant 5-day plan §4.1 ("The Wrapper Layer") describes a wrapper proxy in front of the existing Vercel app that logs every request, every Claude API call, every output card, every user action. That is exactly the `/api/v1/ingest/runs` ingestion contract VIPPlay already implements.

---

## Track A — Chief of Staff Telemetry

| Quadrant need | VIPPlay mock already has it? |
|---|---|
| Wrapper proxy posts telemetry to an ingestion endpoint | ✅ `/api/v1/ingest/runs` + `/batch`, API-key auth, idempotent |
| Per-agent usage dashboard (tokens, latency, output, cost) | ✅ `/agents/[id]` with `MetricsBar`, `CostOfInaction`, `AgentRoiCard` |
| User-action capture (schedule / done / push / dismiss) | ✅ audit log schema + `/governance/audit` UI |
| Morning-ritual / live feed | ✅ SSE `/api/monitoring/stream` + `LiveEventFeed` |
| Prompt version capture (the 40+ line briefing prompt) | ✅ `VersionTimeline` + run/span prompt version fields |
| Card-type breakdown (follow_up / meeting_prep / etc.) | ✅ run schema has `type` field — just needs Quadrant labels |
| Per-user view (Sam / Genevieve / Ted) | ⚠️ multi-user audit exists; **no per-user dashboard split yet** |
| Cost / budget / alerting | ✅ `/settings/budgets`, `/settings/alerts` |
| Usage report / board export | ✅ `/dashboard/export` + scheduled reports |

**Track A is ~75% shipped.** What's missing: vocabulary/labels change, card-type taxonomy labels, a per-user dashboard split, Quadrant-flavored seed data.

---

## Track B — Sourcing Agent MVP

| Quadrant need | VIPPlay mock already has it? |
|---|---|
| Two deterministic rules (3rd-party? / ≥ $5M?) | ✅ `/governance/rules` + `AddRuleForm` + `check-governance` cron |
| Evidence / source provenance on every claim | ✅ `EvidenceChain`, `ComplianceCertificate` patterns |
| Specialist run telemetry (tokens, latency, output) | ✅ same ingestion + agent-detail view as Track A |
| Candidate review dashboard with good-fit / poor-fit buttons | ❌ **net-new** |
| Manager component view (Finder → Classifier → Estimator trace) | ❌ **net-new** — agent-detail page is closest but not a match |
| Data-source inventory (CMS / NPI / state licensing status) | ❌ **net-new** |
| Ground-truth set panel (5 good + 5 poor examples) | ❌ **net-new** |

**Track B is ~50% scaffolding-reusable, but the decision-layer UI is genuinely new.** That decision-layer UI is where the sprint actually earns its keep — it is what Sam will judge the engagement on.

---

## Where Quadrant and VIPPlay Genuinely Diverge

Three real differences (not vocabulary):

1. **Candidate review is a decision screen, not a telemetry screen.** It lists companies, not runs, with evidence + three-state human labels. VIPPlay has no analog.
2. **Multi-specialist manager view.** VIPPlay models agents as leaves. Sourcing has Finder → Classifier → Estimator under a manager, with evidence accumulating across the trace. The `/agents/dependencies` page is the closest pattern but doesn't show a single run's specialist-by-specialist trace.
3. **Vocabulary mismatch.** VIPPlay talks sigma / DPMO / OEE / SERVQUAL / FMEA / Symmetry / Labor / Workforce. Quadrant talks briefings / cards / candidates / evidence. The Quadrant plan §8 also explicitly forbids platform framing. **Remediation: hide unrelated nav entries, don't delete — they cost nothing if off the sidebar.**

---

## Claude-Only or Multi-Model?

Quadrant's Chief of Staff is **hardcoded to Claude today** (`claude-sonnet-4-20250514`, briefingEngine.js lines 156–196). The 5-day plan only references Claude because that is what Quadrant has deployed.

**Nothing in either plan is architecturally Claude-specific.** The wrapper logs whatever LLM passes through it; model name is a field. Sourcing Agent MVP does not mandate a model.

Three framing options for the demo:

1. **Claude-only framing** — matches Sam's mental model. Cleanest. *Recommended for Day 1 demo.*
2. **Mixed-model framing** — CoS stays Claude; specialists use different models (e.g., Haiku for classification, Sonnet for reasoning). Good follow-on conversation opener.
3. **Provider-agnostic framing** — model as a switchable parameter. Risks looking like the AEOS/platform pitch plan §8 explicitly forbids.

**Recommendation:** Ship with option 1. Hold option 2 data in reserve — only surface it if Sam asks "could we use cheaper models for specialists?" That makes it a natural answer, not a pitch.

---

## Effort Breakdown — Reshaping the Mock for Quadrant

| Task | Est. |
|---|---|
| Prune/hide out-of-scope sidebar entries (sigma/OEE/FMEA/workforce/etc.) | ~½ day |
| Reshape mock data (Quadrant-flavored: 2 agents, 3 users, cards, candidates) | ~½ day |
| Per-user Chief of Staff dashboard split (Sam / Genevieve / Ted) | ~1 day |
| Prompt registry + version diff view polish | ~½ day |
| Sourcing run + manager orchestration trace view | ~½ day |
| **Candidate review dashboard + evidence expand + good-fit/poor-fit buttons** | ~1 day |
| Data-source inventory + two-rule eval + ground-truth panel | ~½ day |
| Polish + demo walkthrough | ~½ day |
| **Total** | **~5 days mock UI work** |

The same mock then becomes the live-demo artifact for the actual 5-day sprint with Quadrant — because it already shows the architecture Trigent would deliver, just with real data replacing seed data.

---

## What We Need From Les

**Confirm:**

1. ✅ The "same pattern, narrower scope, one net-new screen" framing is right.
2. ✅ Hide-don't-delete strategy for the non-Quadrant sidebar items.
3. ✅ Claude-only framing for Day-1 demo, with multi-model held in reserve.
4. ✅ The ~5-day effort estimate for reshaping the mock (separate from the actual Quadrant sprint).

**Once confirmed**, the next artifact will be `docs/quadrant_plan.md` — a day-by-day plan mapping every existing screen to keep / relabel / hide / add.

---

*Prepared by engineering against VIPPlay Agent Telemetry mock (branch: `quadrant-mock`, base commit `b2305dd`, 02 Apr 2026).*
*Source docs: `docs/Quadrant_5Day_Sprint_Plan.md`, `docs/Quadrant_Development_Plan_full_scope.md`.*
