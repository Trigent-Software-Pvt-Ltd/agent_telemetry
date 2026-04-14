# Quadrant Mock — Reshape Plan

**Branch:** `quadrant-mock` (base `b2305dd`, Apr 2 2026)
**Goal:** Reshape the VIPPlay Agent Telemetry mock into a Quadrant-flavored demo that satisfies the 5-day sprint scope (Chief of Staff telemetry + Sourcing Agent MVP).
**Duration:** 5 working days of UI work on mock data.
**Confirmed scope:** Same-pattern / narrower-scope / one net-new screen framing (per `quadrant_effort.md`).

---

## 1. Branding & Shell (Day 1 AM — ~½ day)

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

## 2. Mock Data Reshape (Day 1 PM — ~½ day)

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

## 3. Chief of Staff — Relabel + Per-User Split (Day 2 — ~1 day)

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

## 4. Prompt Registry (Day 3 AM — ~½ day)

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

## 5. Sourcing Agent — Run Trace + Manager View (Day 3 PM — ~½ day)

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

## 6. Candidate Review Dashboard (Day 4 — ~1 day) ⭐ NET-NEW

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

## 7. Data Sources + Two-Rule Eval + Ground-Truth Panels (Day 5 AM — ~½ day)

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

## 8. Day-5 Report Artifact (Day 5 PM — ~½ day)

**Route:** reuse `/dashboard/export` with Quadrant template.

Mock "Day 5 Decision Report" — renders as printable PDF with:
- Morning ritual baseline (from CoS telemetry)
- Card action rates by user
- Top 3 improvement opportunities in the prompt
- Sourcing Agent results: 21 candidates, X reviewed, Y marked good fit
- Recommendation block (mockable: "extend engagement yes/no/conditional")

Satisfies plan §12 ("decision meeting with written decision").

---

## 9. Polish + Demo Walkthrough (Day 5 PM — ~½ day)

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

## 12. Open Questions (if any surface during build)

1. Does Sam have the actual briefingEngine.js prompt text he's OK with us showing in the registry, or do we write a plausible mock?
2. Are we authorized to use real company names in the mock candidate list (e.g., real PT chains from public NPI data) or do we fabricate all 25 names?
3. Does the "Day 5 Decision Report" get FuzeBox-branded or Quadrant-branded? (Recommend FuzeBox branded, signed by Les + Sam.)

---

*Once Days 1–5 are complete, the same mock becomes the live-demo artifact used during the actual Quadrant 5-day sprint — real ingestion data simply replaces the seed values.*
