# Quadrant × FuzeBox Demo Walkthrough

A 7–10 minute walkthrough for reviewing the Quadrant mock. Branch: `quadrant-mock`. Run with `npm run dev` and visit `http://localhost:3000`.

## 0 · Login (30s)
- Land on `/login`. Quadrant logo, subtitle "AI Console · Delivered by FuzeBox".
- Any email / password. Click **Sign in** — redirects to `/agents/chief-of-staff`.

## 1 · Chief of Staff — Morning ritual (2m)
Route: `/agents/chief-of-staff`

- Top header shows agent summary, Claude model tag, prompt version badge (`v1.3`) linking to registry.
- Right-side **Action rate** headline — overall % of cards acted on.
- Flip tabs: **All · Sam · Genevieve · Ted**. Everything below re-filters.
- **Morning ritual baseline** — 3 tiles, one per user. Median minutes from 09:30 briefing to first dashboard open. Sam is fast; Genevieve/Ted are slower.
- **Card-type action breakdown** — per-user stacked bars by card type (follow_up, meeting_prep, deal_action, email_draft, admin, deferred). Two things to flag:
  - `admin` has high dismissed rate — candidate for prompt change.
  - `email_draft` has the highest acted rate.
- **Outlook draft lifecycle** — drafted → sent/edited/deleted funnel. Answers "are the auto-created drafts useful?"
- **Recent briefings** table links each run to its prompt version.

## 2 · Prompt Registry (1m)
Click the **Prompt v1.3** pill in the CoS header, or sidebar → **Prompt Registry**.

Route: `/chief-of-staff/prompts`

- Timeline of v1.0 → v1.3 with author, date, summary. Green "In use" badge on v1.3.
- Click any version to load its body in the left pane.
- Right-pane diff selector — pick v1.0 to see the full history of changes: card-type addition, cap tightening, Granola fusion rule.

## 3 · Sourcing Agent (2m)
Sidebar → **Sourcing Agent**.

Route: `/agents/sourcing-agent`

> **If `DATA_SOURCE=live-sourcing`** — header shows a green **LIVE** pill, and a **Run now** button appears. Clicking it triggers a real NPI Registry → Bedrock Claude classifier → CMS estimator pipeline, with cost and tokens surfaced per specialist in the trace. The run persists to `quadrant.sourcing_runs` at arkosdb.

- Header: Claude-only, multi-specialist manager, pilot status.
- **Specialists** — 3 tiles (Finder / Classifier / Estimator) with last-run counts, success, latency, cost.
- **Manager trace** — single-column timeline of the selected run. Expand Step 2 (Classifier) to see 142 → 87 filtering; Step 3 (Estimator) applies Medicare %.
- Below trace: **Evidence validated** and **Evaluation surfaced** counts.
- **Two-rule evaluation** — Rule 1 (3rd-party) and Rule 2 (≥ $5M revenue) with pass rates.
- **Ground-truth calibration set** — 10 seeded examples (5 good, 5 poor) and running accuracy. Reviewer labeling shifts this.

Click **Review surfaced candidates →** in the header.

## 4 · Candidate Review Dashboard ⭐ (3m)
Route: `/sourcing/review`

> **In live mode** — the candidate list is the latest live run's output (not the 25 seeded mocks). Clicking **Good fit / Poor fit / Unclear** POSTs to `/api/sourcing/candidates/[id]/label`, persisting to `quadrant.sourcing_candidates`. Header counter updates across refresh.

- Top header: "Reviewed X of 25 · X good / X poor / X unclear". Updates live.
- Filter pills: all / unreviewed / good_fit / poor_fit / unclear.
- Table: 25 rows default. Sorted by confidence desc. Columns: Company, Geo, Revenue (est), Rule 1, Rule 2, Confidence, State.
- **Click any row** to open the evidence panel.

### Evidence panel talking points
- NPI + taxonomy identity block.
- Rule 1 pass/fail badge with rationale.
- **Rule 2 (Medicare % assumption)** — orange-bordered card, prominently surfaced per Quadrant plan §6.2 / source doc §10.3 false-confidence mitigation.
  - Slider from 15% → 50%, default per-candidate ~32%.
  - As you slide, extrapolated total revenue and pass/fail state recalculates live.
  - Band shows the ±7% uncertainty range.
- **Raw evidence list** — each claim has source URL (opens CMS / NPI / state site) and per-claim confidence %.
- **Three labeling buttons** — Good fit / Poor fit / Unclear. Clicking persists to ground-truth store; the header counter updates. If the candidate is one of the seeded 10, the Sourcing Agent page's accuracy metric shifts.

Label 2-3 unreviewed candidates live during the demo to show the persistence.

## 5 · Rules & Evidence + Data Sources (45s)
Sidebar → **Rules & Evidence** (`/governance/rules`). Reuse of existing governance scaffold.

Sidebar → **Data Sources** (`/settings/data-sources`).
- 7 tiles: CMS · NPI · State licensing (partial) · HubSpot · MS Graph · Granola · Vercel KV.
- Each shows last sync, records indexed, and known gaps. This is the Day-5 "data inventory" artifact.

## 6 · Day-5 Decision Report (45s)
Sidebar → **Reports**.

Route: `/reports/day5`

- Quadrant logo header.
- **Decision box** — "Extend — CONDITIONAL" (amber). Signed by Les + Sam.
- Morning ritual table, action rates, top 3 prompt opportunities, sourcing summary.
- Click **Print / Save PDF** to show the print-ready layout.

---

### Key claims to make live
1. All mock data. `DATA_SOURCE=mock`. No Postgres, no real integrations.
2. Claude-only. Every span shows `claude-sonnet-4-20250514`.
3. One genuinely new screen: Candidate Review. The rest is reused VIPPlay scaffolding relabeled to Quadrant vocabulary.
4. The demo itself *becomes* the live artifact on week 1 of a real engagement — the mock values are replaced by ingest data.
5. When `DATA_SOURCE=live-sourcing` is set, Sourcing Agent and Candidate Review are genuinely live end-to-end. Every other page stays mock. Graceful 503 fallback if any env is missing — demo never breaks.
