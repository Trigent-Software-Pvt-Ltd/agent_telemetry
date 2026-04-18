# Quadrant Mock — Reshape Plan

**Branch:** `quadrant-mock` (base `b2305dd`, Apr 2 2026)
**Goal:** Reshape the VIPPlay Agent Telemetry mock into a Quadrant-flavored demo that satisfies the 5-day sprint scope (Chief of Staff telemetry + Sourcing Agent MVP).
**Duration:** 5 working days of UI work on mock data.
**Confirmed scope:** Same-pattern / narrower-scope / one net-new screen framing (per `quadrant_effort.md`).

**Status (2026-04-15):** ✅ Days 1–5 complete and committed. Landing redirect to `/agents/chief-of-staff` in place. Residual sigma/OEE/SERVQUAL references exist only in hidden routes (acceptable per §1.2 "hide, don't delete"). Remaining: §12 open questions pending Sam's input.

---

## 1. Branding & Shell (Day 1 AM — ~½ day) ✅ DONE (`2f86772`)

### 1.1 Replace "r-Potential" with Quadrant logo
Logo source: `https://quadrantcapital.com/wp-content/themes/quadrant/images/capital-logo.png`
Download locally → `public/quadrant-logo.png` (don't hotlink — offline-safe demo).

| File | Line | Change |
|---|---|---|
| `app/layout.tsx` | 28–29 | `template: '%s — Quadrant × FuzeBox'` / `default: 'Quadrant AI Console'` |
| `components/layout/Sidebar.tsx` | 258 | Replace text `r-Potential` with `<Image src="/quadrant-logo.png" alt="Quadrant" width={140} height={32} />` |
| `app/login/page.tsx` | 41 | Same swap |
| `components/export/ReportPreview.tsx` | 74, 218 | `Quadrant × FuzeBox.AI — Delivered by Trigent` footer |
| `components/governance/ComplianceCertificate.tsx` | 72 | `Quadrant Two Capital Partners (via FuzeBox.AI)` |
| `components/settings/BrandingForm.tsx` | 16 | `companyName: 'Quadrant Two Capital Partners'` |

Also: favicon swap to Quadrant mark.

### 1.2 Sidebar restructure (hide, don't delete)
Top-level nav becomes:

- **Chief of Staff** → routes to `/agents/chief-of-staff`
- **Sourcing Agent** → routes to `/agents/sourcing-agent`
- **Candidate Review** → new route `/sourcing/review`
- **Rules & Evidence** → reuses `/governance/rules` + `/governance/audit`
- **Prompt Registry** → new route `/chief-of-staff/prompts`
- **Data Sources** → new route `/settings/data-sources`
- **Reports** → `/dashboard/export`
- **Settings** → trimmed `/settings`

**Hide from sidebar (keep files in repo):** symmetry, labor, sigma, coverage, roadmap, training, workforce, FMEA, oversight, compliance, benchmarks, scenarios, model-comparison, maturity, build-vs-buy, correlations, A/B compare, staging, dependencies, organisations, branding.

---

## 2. Mock Data Reshape (Day 1 PM — ~½ day) ✅ DONE (`2f86772`)

File: `lib/mock-data.ts` — replace the `AGENTS`, `PROCESSES`, `ORGANISATION` constants with Quadrant-flavored equivalents.

### 2.1 Organisation
```
ORGANISATION = {
  name: 'Quadrant Two Capital Partners',
  framework: 'deal-flow',          // replaces 'OEE'/'SERVQUAL'
  industry: 'Private Equity — Healthcare Services',
  tenants: ['quadrant'],           // single tenant
}
```

### 2.2 Agents (2 only)
| ID | Name | Type | Model | Status |
|---|---|---|---|---|
| `chief-of-staff` | Chief of Staff | Briefing synthesis | `claude-sonnet-4-20250514` | live |
| `sourcing-agent` | Sourcing Agent | Manager + 3 specialists | `claude-sonnet-4-20250514` | pilot |

Sourcing Agent has nested specialist runs:
- `finder` — Company Finder (NPI taxonomy + geography)
- `classifier` — Business Type Classifier (3rd-party vs captive)
- `estimator` — Revenue Estimator (Medicare → total revenue extrapolation)

### 2.3 Users (3 only)
Sam Stillman (Principal), Genevieve Castelline (Team Member), Ted Deinard (Team Member). HubSpot owner IDs from source doc §2.1.

### 2.4 Briefing runs (~30 days of mock data)
Each run:
- cron-triggered weekday 09:30 UTC + ad-hoc
- produces 6–12 cards per user
- card types: `follow_up`, `meeting_prep`, `deal_action`, `email_draft`, `admin`, `deferred`
- each card has: priority, user action (`scheduled` / `done` / `pushed` / `dismissed`), time-to-action, optional `draft_email` → Outlook lifecycle (`drafted` / `sent` / `edited` / `deleted`)

### 2.5 Sourcing candidates (~25 companies)
Realistic-ish healthcare service provider names. Fields:
- NPI, taxonomy code, service category (Outpatient PT Tier 1 default)
- geography (state + metro)
- Medicare revenue (from "CMS data"), Medicare % assumption (30–40%), extrapolated total revenue
- evidence array — each claim gets a source URL + confidence %
- rule outcomes: `isThirdParty: true/false`, `revenueOver5M: true/false`
- Sam-labeled state: `good_fit` / `poor_fit` / `unclear` / `unreviewed`

### 2.6 Ground-truth set
5 "good fit" + 5 "poor fit" seeded companies, pre-labeled, for the evaluation-layer calibration view.

---

## 3. Chief of Staff — Relabel + Per-User Split (Day 2 — ~1 day) ✅ DONE (`ea0e075`)

**Route:** `/agents/chief-of-staff`
**Reuses:** `AgentHeader`, `MetricsBar`, `CostOfInaction`, `VersionTimeline`, `AgentRoiCard`
**Vocabulary swap:**
- "Run" → "Briefing"
- "Span" → "Claude API call"
- "Sigma score" → hide
- "Agent quality" → "Action rate"

### 3.1 Morning-Ritual panel (new, small)
- First-open time per user per day (heatmap or per-user bar) — answers plan §5.1 "morning ritual baseline"
- Dashboard-open count over last 14 days
- Source: instrumented dashboard-open events in mock data

### 3.2 Card-Type Breakdown widget (new)
Stacked bar per user (Sam / Genevieve / Ted): cards generated vs acted-on vs dismissed, split by card type. Answers plan §5.2 "which card types produce the highest action rate."

### 3.3 Outlook Draft Lifecycle card (new)
Funnel: drafted → sent / edited / deleted. Per user + total. Answers plan §5.2 "are auto-created Outlook drafts being sent, edited, or deleted."

### 3.4 Per-user sub-tabs
Tabs on the CoS page: **All · Sam · Genevieve · Ted**. Each tab filters the same widgets.

---

## 4. Prompt Registry (Day 3 AM — ~½ day) ✅ DONE (`ea0e075`)

**Route:** `/chief-of-staff/prompts` (new)
**Reuses:** `VersionTimeline` component + syntax-highlighted code viewer

### 4.1 Prompt viewer
- Displays the current 40+ line system prompt (mock version written in plausible format matching briefingEngine.js lines 156–196)
- Version history (v1.0 → v1.3) with date + author
- Side-by-side diff between two selected versions
- "In use since" badge

### 4.2 Prompt-version → briefing link
Each briefing on the CoS page shows which prompt version it ran under.

---

## 5. Sourcing Agent — Run Trace + Manager View (Day 3 PM — ~½ day) ✅ DONE (`2c718f3`)

**Route:** `/agents/sourcing-agent`
**Reuses:** `AgentHeader`, `MetricsBar`, `AgentRoiCard`

### 5.1 Manager Trace view (new)
Single-column timeline of one Sourcing run:
```
[Manual trigger — Sam, 14:02]
  └─ Manager plan created (3 steps)
      ├─ Step 1: Company Finder        → 142 candidates     [2.4s, 8k tok]
      ├─ Step 2: Business Type         → 87 pass, 55 reject [4.1s, 12k tok]
      └─ Step 3: Revenue Estimator     → 23 pass ≥ $5M      [3.2s, 9k tok]
  └─ Evidence layer validated          → 21 candidates with full provenance
  └─ Evaluation layer scored           → 21 surfaced to review queue
```

Each step expandable to show the specialist's input/output and token/latency.

### 5.2 Specialist cards
Three tiles (Finder / Classifier / Estimator) with last-run metrics, success rate, avg latency, avg cost per candidate.

---

## 6. Candidate Review Dashboard (Day 4 — ~1 day) ⭐ NET-NEW ✅ DONE (`db84255`)

**Route:** `/sourcing/review`
**This is the one genuinely new screen.** It is the Day-5 working session artifact.

### 6.1 Layout
- Top bar: run selector (last 3 runs), filter by state (`all` / `unreviewed` / `good_fit` / `poor_fit` / `unclear`), sort (confidence desc default)
- Main: candidate table (21 rows typical)
  - Columns: Company · Service Category · Geography · Total Revenue (est) · Rule 1 ✓/✗ · Rule 2 ✓/✗ · Confidence · State
  - Row click → side panel

### 6.2 Evidence side panel
- Company header: name, NPI, taxonomy code
- **Rule 1 outcome** (3rd-party provider?) with evidence chain — reuses `EvidenceChain` component
- **Rule 2 outcome** (≥ $5M revenue?) with:
  - Medicare revenue (from CMS) with source URL
  - **Medicare % assumption** prominently surfaced (32% default, adjustable) — plan §10.3 false-confidence mitigation
  - Extrapolated total revenue with confidence band
- Raw evidence: source URL list, confidence % per claim
- **Three buttons:** `Good fit` / `Poor fit` / `Unclear` — captures ground truth

### 6.3 Good-fit/Poor-fit state
Persist to mock ground-truth store. Top of page shows: "Reviewed X of 21 · X good / X poor / X unclear."

---

## 7. Data Sources + Two-Rule Eval + Ground-Truth Panels (Day 5 AM — ~½ day) ✅ DONE (`2c718f3`)

### 7.1 Data Sources page (new, `/settings/data-sources`)
Status tiles for CMS Medicare Utilization / NPI Registry / state licensing:
- Source · Access status · Last sync · Records indexed · Known gaps
- Satisfies plan §5.1 Track B morning ("data inventory complete with any gaps documented")

### 7.2 Two-Rule Evaluation panel (on Sourcing Agent page)
- Rule 1: "is 3rd-party service provider"  · pass rate · filtered count
- Rule 2: "estimated revenue ≥ $5M"        · pass rate · filtered count
- Reuses `/governance/rules` scaffolding with Quadrant-specific rule cards

### 7.3 Ground-Truth Set panel (on Sourcing Agent page)
- 5 good-fit examples + 5 poor-fit examples
- Calibration status: "Evaluator last tuned against 10 examples · Accuracy 7/10"
- "Add example" action

---

## 8. Day-5 Report Artifact (Day 5 PM — ~½ day) ✅ DONE (`2cf5e7b`)

**Route:** reuse `/dashboard/export` with Quadrant template.

Mock "Day 5 Decision Report" — renders as printable PDF with:
- Morning ritual baseline (from CoS telemetry)
- Card action rates by user
- Top 3 improvement opportunities in the prompt
- Sourcing Agent results: 21 candidates, X reviewed, Y marked good fit
- Recommendation block (mockable: "extend engagement yes/no/conditional")

Satisfies plan §12 ("decision meeting with written decision").

---

## 9. Polish + Demo Walkthrough (Day 5 PM — ~½ day) ✅ DONE (`2cf5e7b`)

- Breadcrumbs + TopBar labels consistent with Quadrant vocabulary
- Landing page (`/`) redirects to `/agents/chief-of-staff` (Sam's morning ritual)
- Demo script: `docs/quadrant-demo-script.md` — walks a reviewer through CoS → Prompt Registry → Sourcing run → Review dashboard → Day-5 report
- Remove the remaining sigma/OEE/SERVQUAL badges and tooltips visible anywhere in-flow

---

## 10. Day-by-Day Summary

| Day | Morning | Afternoon | Deliverable |
|---|---|---|---|
| **1** | Branding swap, sidebar restructure | Mock data reshape (orgs, agents, users, briefings) | Shell looks Quadrant |
| **2** | CoS page relabel + per-user tabs | Card-type breakdown + Outlook lifecycle + morning ritual | CoS story complete |
| **3** | Prompt registry + version diff | Sourcing manager-trace + specialist cards | Sourcing story bones |
| **4** | Candidate review table | Evidence side panel + good/poor-fit buttons + ground truth write | ⭐ Net-new screen live |
| **5** | Data sources + two-rule eval + ground-truth set | Day-5 report artifact + polish + demo script | Demo-ready |

---

## 11. Explicit Non-Goals

- No real CMS / NPI / HubSpot / Granola integration — all mock data.
- No backend DB wiring — `DATA_SOURCE=mock`, no Postgres.
- No multi-provider model routing UI — Claude-only framing per `quadrant_effort.md` §"Claude-Only or Multi-Model?".
- No productization language — no "platform", no "AEOS", no "12-agent framework".
- No rewrite of existing VIPPlay components that still apply — reuse everywhere possible.
- No deletion of hidden screens — hide from sidebar only; they stay in the repo for potential follow-on scope.

---

## 12. Open Questions (if any surface during build) ⏳ PENDING SAM

1. Does Sam have the actual briefingEngine.js prompt text he's OK with us showing in the registry, or do we write a plausible mock?
2. Are we authorized to use real company names in the mock candidate list (e.g., real PT chains from public NPI data) or do we fabricate all 25 names?
3. Does the "Day 5 Decision Report" get FuzeBox-branded or Quadrant-branded? (Recommend FuzeBox branded, signed by Les + Sam.)

---

*Once Days 1–5 are complete, the same mock becomes the live-demo artifact used during the actual Quadrant 5-day sprint — real ingestion data simply replaces the seed values.*

---

# Part B — Demo-Winning Extensions (Day 6 — ~1.5 days)

**Status:** PLANNED (2026-04-15)
**Goal:** Tighten the story for the Quadrant win. Not full scope. Two targeted additions that answer the two questions Sam will ask in the demo: *"why did the agent surface this candidate?"* and *"is this enterprise-ready?"* Plus three small polish items drawn from `Quadrant_Development_Plan_full_scope.md` that make the demo feel like the 12-week plan, not a 5-day hack.

---

## B1. Thesis Fit Scorecard — inside Candidate Review side panel (~½ day)

**Route:** reuses existing `/sourcing/review` side panel — no new route.
**Why it wins:** Directly answers "why this candidate?" — the first question in every demo. Elevates the current two-rule eval into the full thesis story without building 6 specialist pages.

### B1.1 Thesis Fit Score block (new section in side panel)
- Headline: **Thesis Fit: XX / 100** (weighted composite)
- 6 weighted dimensions, each with score + short evidence hint:
  - Financial Fit (EBITDA $1–5M band)
  - Service Category Fit (Tier 1 vs Tier 2 CPT alignment)
  - Commercial Mix (≥ 40% commercial volume)
  - Rate Arbitrage Opportunity (current vs MSO-target rate delta)
  - MSO Geographic Overlap (150–175% Medicare MSO presence in metro)
  - Staff & Referral Health (≥ 2 non-founder staff, ≥ 3 independent refs, no single ref ≥ 50%)
- Each dimension shown as a mini horizontal bar with numeric score and pass/warn/fail colour

### B1.2 Disqualifier Row (new pill strip above the thesis score)
5 pills, each red or green, corresponding to §2.3 disqualifiers:
- Founder concentration
- MSO absence in geography
- Rate ceiling (> 140% Medicare)
- Prior-auth burden
- Single-referral-practice concentration (≥ 50%)

### B1.3 Mock data additions
- Extend each candidate in `lib/mock-data.ts` with `thesisFit: { financial, serviceCategory, commercialMix, rateArbitrage, msoOverlap, staffReferrals, total }` plus `disqualifiers: { founderConcentration, msoAbsent, rateCeiling, priorAuthBurden, referralConcentration }` — all booleans/numbers, deterministic.

---

## B2. Production Readiness preview screen (~½ day)

**Route:** new `/governance/production-readiness` (single screen).
**Sidebar:** add under "Governance" parent (see B4).
**Why it wins:** Answers "is this enterprise-ready?" in one screen. Maps to full-scope §8 Phase 4 hardening deliverables without building four separate screens.

### B2.1 Four tiles on one page
| Tile | Content |
|---|---|
| **Access Control** | Three role pills: Principal (Sam, full access), Team Member (Genevieve / Ted, own briefing + review), Observer (read-only). Last role-change event shown. |
| **GSTI Score Threshold** | Current GSTI (mock 87), baseline 82, alert threshold 75. Sparkline of last 14 days. "Alert on breach" toggle. |
| **Audit Trail Preview** | Last 10 events — each with timestamp, actor, action, trace ID. Events: prompt change, candidate approval, feedback capture, deployment. |
| **Retry / Circuit Breaker Health** | Per-data-source tile: CMS Utilization (healthy), Transparency in Coverage (degraded — 2 retries), NPI Registry (healthy), HubSpot (healthy). Shows graceful-degradation state. |

### B2.2 Reuse
- Audit Trail Preview reuses `AuditTable` component
- Role pills reuse existing pill/badge components
- GSTI sparkline reuses existing trend chart component

---

## B3. Sidebar restructure — Governance parent with children (~15 min)

Turn "Rules & Evidence" into a Governance parent with two/three children (plan §1.2 originally said rules + audit; audit was unreachable):
- **Governance**
  - Rules — `/governance/rules`
  - Audit Trail — `/governance/audit`
  - Production Readiness — `/governance/production-readiness` (added in B2)

Implementation: collapsible nav group in `components/layout/Sidebar.tsx`.

---

## B4. Data Sources expansion — 5 tiles (~¼ day)

Expand `/settings/data-sources` from 3 to 5 tiles to match full-scope §7.1 data inventory deliverable:
1. **CMS Medicare Utilization** — access: live, last sync: today, records: 1.2M NPIs, known gaps: 2023 Q4 late filings
2. **CMS Transparency in Coverage** — access: live, last sync: today, records: 340M rate rows, known gaps: 12% MRF parse failures
3. **NPI Registry** — access: live, last sync: today, records: 7.2M NPIs, known gaps: none
4. **State Licensing Databases** — access: partial (28/50 states automated), last sync: varies, known gaps: 22 states manual
5. **MSO / IPA Directory** — access: paid subscription required, last sync: pending, known gaps: no unified source — composite from 4 paid feeds

Adds honesty-about-gaps to the narrative (full-scope §10.1 Data Availability Risk mitigation).

---

## B5. Day 6 Summary

| Item | Effort | Delivers |
|---|---|---|
| B1 Thesis Fit Scorecard | ½ day | Single-screen answer to "why this candidate?" |
| B2 Production Readiness screen | ½ day | Single-screen answer to "is this enterprise-ready?" |
| B3 Sidebar Governance parent | 15 min | Clean nav; surfaces Audit Trail |
| B4 Data Sources 5-tile expansion | ¼ day | Honesty-about-gaps story |
| **Total** | **~1.5 days** | |

---

## B6. Explicit Non-Goals for Part B

- **NOT building 6 specialist pages** (CMS Analyst, Payer Analyst, MSO Overlap, Disqualifier Screener standalone, Thesis Fit Scorer standalone). Three specialists in manager trace stay as-is.
- **NOT building a Criteria Engine dedicated screen.** Rule pass/fail is shown inline via the Thesis Fit Scorecard.
- **NOT building a 12-week timeline screen.** That belongs in the proposal deck, not the mock.
- **NOT renaming "Sourcing Agent" to "Sourcing System".** Quadrant's own source doc uses "Sourcing Agent."
- **NOT building separate RBAC / GSTI / audit / retry screens.** All four consolidated into the single Production Readiness page.

---

# Part C — Live Sourcing Slice (3-day commitment)

**Status:** Delivered 2026-04-18
**Summary:** Les approved 3-day path on 2026-04-15; delivery 2026-04-20. Scope: Sourcing Agent goes genuinely live (real NPI + Bedrock + persistence); everything else stays mock.

---

## C1. Architecture

Behind a `DATA_SOURCE=live-sourcing` feature flag, the Sourcing Agent runs a real end-to-end pipeline. The **Finder** hits the public NPI Registry API (taxonomy + geography search). The **Classifier** is rule-first (NPI-1 individual records and hospital-keyword matches are classified deterministically); only ambiguous cases fall through to an LLM call via AWS Bedrock using `us.anthropic.claude-haiku-4-5-20251001-v1:0`. The **Estimator** reads a bundled `data/cms-pt-utilization.json` (400 rows of CMS Physical Therapy utilization data) and extrapolates total revenue using a default 32% Medicare-share assumption. Persistence is direct `postgres.js` writes to a dedicated `quadrant` schema accessed via a dedicated `quadrant_app` role at `arkosdb.trigent.com` — **no shared auth** with any existing Supabase service_role / anon / authenticated / supabase / postgres role, no Supabase JS client, no service_role JWT. Per-run cost is capped by `MAX_RUN_COST_USD=2.00` (default).

---

## C2. Key design decisions

- **Rules in code, LLM only for ambiguous** — per plan §3.2. Deterministic cases never hit Bedrock.
- **Graceful degradation** — 503 on missing env falls back to mock automatically; demo never breaks.
- **Dedicated role + schema** — no reuse of `service_role` / `anon` / `authenticated` / `supabase` / `postgres` roles; isolated `quadrant_app` + `quadrant` schema.
- **Claude-only framing preserved** — Haiku 4.5 for speed; Sonnet/Opus configurable via `BEDROCK_MODEL_ID`.

---

## C3. Files of record

| Area | Location |
|---|---|
| Backend | `lib/live-sourcing/{config,db,telemetry,npi-client,cms-data,finder,classifier,estimator,evidence,manager,types}.ts` |
| API routes | `app/api/sourcing/{runs,runs/[id],candidates/[id]/label}/route.ts` |
| UI | `components/quadrant/{LiveBadge,RunNowButton}.tsx` + edits to `SourcingAgentView`, `CandidateReviewView` |
| Adapter | `lib/sourcing-data.ts` |
| Migration | `supabase/migrations/20260418_quadrant_schema.sql` |
| Bundled data | `data/cms-pt-utilization.json` |
| Runbook | `docs/sourcing_live_runbook.md` |
| Smoke test | `scripts/smoke-live.ts` + `npm run smoke-live` |

---

## C4. Prerequisites for live mode

See `docs/sourcing_live_runbook.md` for full setup. Three bullets:

- Apply `supabase/migrations/20260418_quadrant_schema.sql` at arkosdb.
- Open network path app → `arkosdb.trigent.com:5432` (VPC-locked; see runbook §3).
- Flip `DATA_SOURCE=live-sourcing`.

---

## C5. Explicit non-goals

- No Chief of Staff / Prompt Registry / Data Sources / Reports going live — all stay mock.
- No multi-tenant / RLS / auth integration — single-app demo scope.
- No real-time updates / SSE / streaming — synchronous POST is fine (~10–20s run).
- No rate limiting beyond per-run cost cap.

