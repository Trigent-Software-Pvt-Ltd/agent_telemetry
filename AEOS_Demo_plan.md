# AEOS Demo — Mock Branch Plan

**Doc owner:** Anand
**Audience:** Agent teams (frontend, design, mock-data) building the new branch
**Status:** DRAFT — awaiting validation. **Do NOT begin code until Anand confirms.**
**Date:** 2026-04-26
**Source material:** `docs/AEOS/` (384 files; main folder + engineering handoffs + reference Python monorepo)
**Companion files (already in repo):** `CLAUDE.md`, `lib/seed-data.ts`, `types/telemetry.ts`, `app/(app)/layout.tsx`

---

## 0. TL;DR for Les

We are building a **second, mock-only Next.js demo** that lives on its own branch and tells the **AEOS story** — Cross-Vendor Observation, the Predictive Economic Ledger, Realtime Injection, and a Self-Improving (DEODAG) flywheel. The purpose is to address the product-owner feedback that our existing telemetry product is *too complicated*. AEOS gives us a chance to lead with **one number, one decision, one ledger row, one signed attestation** — which is exactly the narrative Les writes in his briefings.

The new demo will:

- Run side-by-side with the production telemetry app (separate branch, same repo).
- Reuse the Next.js 16 shell, fonts, providers, mock-data bridge, and chart library.
- Replace the sidebar/IA with a 7-screen AEOS control plane (Decision Explorer, EAI Board, Ledger, Policy Packs, Skills Authority, Evidence Export, Dynamic Instructions).
- Add a **dark control-plane theme** (per AEOS design tokens) layered on top of the existing light theme, switchable per route group.
- Tell a **90-second narrative** end-to-end (the brake-diagnosis flow), with the option to walk a longer 8-minute version covering the four canonical demo scenarios.
- Demonstrate **self-improving agents** by visibly running the DIR rule flywheel: a variance breach → attribution → patch synthesis → re-execution → ledger row showing variance shrinkage.

No backend changes. No DB changes. No auth changes. No real LLM calls. **Pure mock**, but choreographed so it feels live.

---

## 1. The AEOS Story in One Page

This is what every screen of the new demo must support. Lifted (and compressed) from `docs/AEOS/main folder/0 READ FIRST...docx` and `docs/AEOS/Engineering_Instructions_PEL_v1.md`.

**Premise.** Every Fortune 500 enterprise runs multiple AI vendors. Anthropic in the service bay, OpenAI in the contact center, Salesforce Agentforce in workflow, humans in safety-critical loops. No vendor can govern its competitors, and none can prove dollar outcome against an external system of record. AEOS is the neutral "Switzerland" control plane that sits *above* every runtime vendor.

**Three load-bearing capabilities** (every screen must reflect at least one):

1. **Cross-vendor observation** — every execution from any vendor (Anthropic, OpenAI, Bedrock, Azure OpenAI, Vertex, Salesforce Agentforce, CrewAI, etc.) produces the same `ObservationEvent` shape. Coverage gaps are explicit on a signed Coverage Manifest.

2. **Predictive Economic Ledger (PEL).** Every decision becomes a `LedgerRow v2.3` with five substructures:
   - **Predicted** — dollar P&L at decision time, signed by FuzeBox.
   - **Actual** — outcome P&L from external SoR (CRM, ERP, betting book, ledger), co-signed FuzeBox + rPotential.
   - **Variance** — computed on **two** dimensions: technical (sigma drift, latency, error rate, hallucination) **and** economic (USD, win rate, cost per outcome).
   - **Attribution** — five-bucket classification (agent capability / agent instructions / data / policy / environment), workforce-graph-anchored, signed.
   - **Correction** — patch object emitted by the Dynamic Instruction Runtime (DIR).

3. **Realtime injection on dual triggers.** If either technical *or* economic variance exceeds tolerance, attribution runs; if cause is `agent_capability` or `agent_instructions`, the DIR fires a patch. Patch types: prompt edit, instruction add, tool restriction, tool addition, routing override, code patch. SLAs: prompt < 5s, routing < 60s, code < 5min. **Patches propagate cross-vendor** — a patch authored against Claude-on-Anthropic also applies on Claude-on-Bedrock, on GPT-4o-on-Azure, on a CrewAI flow.

**The strategic moat:** every attestation bundle is **two-party signed** (FuzeBox + rPotential). Single-vendor signatures are structurally refused. This is the core invariant of Patent Family 8.

**The 8-dimension UEF formula** (every Decision Explorer view shows this):

```
total_score = capability_fit
            + gsti_value          ← rPotential
            + uop_value           ← rPotential
            − coordination_tax    ← rPotential
            + governance_score
            + runtime_fit
            + economic_value
            − risk_penalty
```

Three of the eight dimensions come exclusively from rPotential. That is the joint-IP story.

**The board number: EAI** (Enterprise Autonomy Index). Composed from sub-metrics: UCS (unit cost of skill), SY (skill yield = success rate), SER (skill efficiency ratio), EROI (execution ROI), HPI (human preservation index), HLR (hybrid leverage rate). Both EAI and HPI are signed.

**Self-improving flywheel (Motion C / DEODAG).** AEOS interposes an explicit *Evaluate* stage between Observe and Decide:

```
Document → Observe → Evaluate → Decide → Automate → Govern
                       ▲                                │
                       └────────────────────────────────┘
                          (DIR injects corrective rules)
```

Three eval tiers: Tier 1 deterministic format, Tier 2 factual cross-reference + LLM-as-judge, Tier 3 human-routed quality judgment with evaluator selected by UoP/skills authority/coordination tax. Aggregated eval failures feed the DIR rule synthesis. **Variance trends visibly downward per agent over time, on screen.**

That paragraph is the demo. Every panel exists to support that one sentence.

---

## 2. What We Already Have — Reuse Inventory

From the existing `main` branch (verified by exploration). What we **fork** vs **rebrand** vs **build new**.

### 2.1 Reuse without modification

| Asset | Path | Why it survives |
|---|---|---|
| Next.js 16 App Router scaffold | `next.config.ts`, `tsconfig.json`, `package.json` | Already on Next 16.2 + React 19 + Tailwind 4 + Recharts. AEOS demo runs on identical stack. |
| Sora / DM Sans / JetBrains Mono fonts | `app/layout.tsx` | AEOS design tokens explicitly call out Inter/JetBrains Mono — close enough; we override Inter→DM Sans for body. JetBrains Mono is already wired. |
| Recharts library | `package.json` | Used for sparklines, donut, area, scatter, time-series. AEOS panels need exactly these. |
| `Sonner` toaster | `app/layout.tsx` | Reused for variance-breach + patch-applied notifications. |
| `clsx` + Lucide icons | — | Continue. |
| Auth (NextAuth) | `lib/auth.ts`, `app/api/auth/[...nextauth]/` | **Off** for the mock branch — `/aeos/*` routes will be public. Login screen left intact but unlinked. |
| Drizzle / Postgres | `lib/db/`, `app/api/v1/ingest/*` | **Untouched.** AEOS demo never touches the DB. |
| Cron endpoints | `app/api/cron/*` | Untouched. |
| Provider chain | `app/layout.tsx` | We add a third provider (`<AEOSDemoProvider>`) but keep `OrganisationProvider` + `LanguageModeProvider` so cross-routes work. |

### 2.2 Fork & rebrand (selective copy with edits)

| Asset | Existing path | Fork target |
|---|---|---|
| Sidebar component | `components/layout/Sidebar.tsx` | `components/aeos/AEOSSidebar.tsx` — same scaffold, new sections (see §4.2). |
| TopBar | `components/layout/TopBar.tsx` | `components/aeos/AEOSTopBar.tsx` — adds tenant switcher + signed attestation pill. |
| Card / VerdictBadge / StatusDot | `components/shared/*` | Reused as-is; we add a sibling `components/aeos/shared/*` for AEOS-only primitives (TwoPartySignaturePill, VarianceArrow, PathScoreBar). |
| Command palette | `components/shared/CommandPalette.tsx` | Reused. Re-seed with AEOS routes. |
| Recharts wrappers | `components/dashboard/*` charts | Reused; new wrappers only where AEOS needs (path mix donut, EAI sparkline). |

### 2.3 Build net-new

| Concept | Why net-new |
|---|---|
| Dark control-plane theme | Existing app is light luxury; AEOS spec is `bg #0b1220, card #131c30, accent #8fd3ff`. We add a `theme="aeos-dark"` data attribute applied at the `(aeos)/layout.tsx` group root. |
| Mock AEOS data layer | Existing `lib/seed-data.ts` is workflow/sigma/process oriented. AEOS needs LedgerRow / ObservationEvent / InstructionPatch / EAI breakdown / ScoredPath / EvidenceBundle / Coverage Manifest. |
| AEOS type system | `types/telemetry.ts` has 60+ interfaces — none of them match AEOS shapes. We add `types/aeos.ts`. |
| 7 AEOS screens | None of the existing 41 routes maps. We build a new route group. |
| Demo orchestrator (mock-only) | Lightweight client-side state machine that drives the 90-second narrative deterministically (script-driven, not random). |

### 2.4 Existing app surface that maps loosely (insurance against scope creep)

These exist and *could* be referenced in AEOS Q&A panels but **we do not wire them in**:

- `/dashboard/roi` — has waterfall, savings vs overhead. Concept is similar to PEL but the data shapes are different. **Don't reuse the ROI page.** Build a new Ledger view.
- `/governance/audit` and `/governance/compliance` — adjacent to AEOS Evidence Export but not the same. Build new.
- `/agents/[id]` — concept of "agent detail" is reusable in spirit. Build new for AEOS — actor-centric, includes correction history across vendors.

---

## 3. Branching Strategy

### 3.1 Branch layout

```
main                  ← production telemetry app (untouched)
mock                  ← existing mock branch (untouched)
quadrant-mock         ← existing variant (untouched)
aeos-mock             ← NEW: this plan's target branch
```

- Branch from `main` at commit `10fc398` (current HEAD).
- All AEOS work lands on `aeos-mock`.
- We do **not** merge AEOS into `main` until Les approves the demo and explicitly asks for it. Treat this as an alternative product surface, not a feature.
- Existing branches (`mock`, `quadrant-mock`) remain available for Les to compare.

### 3.2 Co-existence constraints

- **No edits to existing routes.** All AEOS pages live under `app/(aeos)/...` (new route group).
- **No edits to existing components** in `components/dashboard`, `components/symmetry`, etc. AEOS-specific components live under `components/aeos/`.
- **Existing data layer untouched.** AEOS gets its own `lib/aeos/` folder with its own seed file (`lib/aeos/seed.ts`), its own data-bridge (`lib/aeos/data.ts`), and its own type file (`types/aeos.ts`).
- **Tailwind config untouched** apart from one additive change: a `[data-theme="aeos-dark"]` selector block in `app/globals.css` providing the dark palette tokens. No existing tokens are overridden.
- **Sidebar entry point.** The existing `(app)/layout.tsx` does not need to know AEOS exists. AEOS gets its own `(aeos)/layout.tsx`. A small "AEOS Demo" link in the existing TopBar is the only crossover (gated behind a `NEXT_PUBLIC_ENABLE_AEOS_LINK` env flag, defaulting on for the mock branch and off for `main`).

### 3.3 Vercel deployment — sibling project pattern (CRUCIAL)

This repo already runs **two** parallel mocks on Vercel using the same multi-project pattern; AEOS becomes the third sibling. All three projects live under the `trigent-ark-os` Vercel team.

| Project name (Vercel) | Production branch | Production URL | Role |
|---|---|---|---|
| `agent_telemetry` | `main` | https://vipsigma.arkos.studio | Production telemetry (existing) |
| `agent-telemetry-quadrant` | `quadrant-mock` | https://vipquadrant.arkos.studio | Quadrant mock (existing) |
| **`agent-telemetry-aeos`** | **`aeos-mock`** | **https://vipaeos.arkos.studio** | **AEOS mock (this plan)** |

**How it works.** Vercel allows multiple Projects to point at the same Git repo. Each Project has its own "Production Branch" setting in the Vercel dashboard; pushes to that branch trigger a production deployment for that one Project only. Pushes to a Project's *non-production* branches still produce preview URLs for that Project. So one repo, three deployments, no cross-contamination.

**Local linkage.** The repo's `.vercel/project.json` records *one* linkage at a time (currently `agent-telemetry-quadrant`). `.vercel/` is `.gitignore`d, so the linkage is per-developer-machine, not committed. To run `vercel deploy` against AEOS specifically you re-link with `vercel link --project agent-telemetry-aeos --yes`. To switch back, re-link to whichever you need. Direct git push to `aeos-mock` triggers the AEOS Project's auto-deploy regardless of local linkage.

**Setup steps (Anand runs these once after Phase 0 lands and the branch is on GitHub):**

1. `git checkout aeos-mock && git push -u origin aeos-mock`
2. `vercel link --project agent-telemetry-aeos` (Vercel CLI is at `/c/nvm4w/nodejs/vercel`, v52.0.0). If the project doesn't exist yet, the CLI prompts to create it under the `trigent-ark-os` team — accept.
3. In Vercel dashboard → Project Settings → Git → set **Production Branch = `aeos-mock`** (default is `main`, must be changed).
4. Vercel dashboard → Domains → add `vipaeos.arkos.studio` (matches the naming pattern of vipsigma / vipquadrant).
5. Environment Variables — add `NEXT_PUBLIC_ENABLE_AEOS_LINK=true` for Production. Nothing else needed (no DB, no auth, no API keys — pure mock).
6. First deploy: `vercel --prod` from local OR push any commit to `aeos-mock`.

**Why this matters before code lands.** Both prior mocks ship without backend env vars (no `DATABASE_URL`, no `NEXTAUTH_SECRET`) because they are mock-only. AEOS follows that — but it means the build must succeed without those env vars. Phase 0 includes a verification step: `npm run build` must pass on `aeos-mock` with an empty env. (The existing repo build expects the DB env vars in a way we'll need to confirm — see §12.1 R9 below.)

**Branch protection.** Treat `aeos-mock` like `quadrant-mock` — direct pushes from Anand or designated agent operators only. No PR flow into `main`. The branch is the demo.

### 3.4 Naming convention for net-new files

- All AEOS components: `components/aeos/<area>/<Component>.tsx` (e.g., `components/aeos/decision-explorer/ScoredPathTable.tsx`).
- All AEOS pages: `app/(aeos)/<route>/page.tsx`.
- All AEOS data: `lib/aeos/seed/<domain>.ts` (e.g., `lib/aeos/seed/ledger.ts`, `lib/aeos/seed/skills.ts`).
- Each file header includes a one-line attribution comment: `// AEOS demo — sourced from docs/AEOS/<file>` so reviewers can trace.

---

## 4. Information Architecture

Resolves the product-owner feedback that the current telemetry product is *too complicated*. The AEOS sidebar is **deliberately shallow** — 7 destinations, no nested groups, no per-agent drill-downs from nav. Drill-downs happen in-page through modals/drawers (matching `narrative-flow.md`).

### 4.1 Compared to the current shell

| Current `(app)` sidebar | AEOS sidebar |
|---|---|
| Home / My AI Agents (nested) / Insights (nested) / Governance (nested) / Planning (nested) / Configure (nested) / Admin (nested) — 41 routes total | 7 top-level destinations, flat, no nesting. Total routes: 7 + 1 landing = 8. |
| Workflow → Agent two-level taxonomy | Tenant switcher + decision feed are the entry points. |
| 260px wide, expandable groups | Same width but no expand/collapse — every link visible. |

### 4.2 Final AEOS sidebar (top → bottom)

```
┌──────────────────────────┐
│  AEOS                    │   ← logo block (FuzeBox + rPotential paired marks)
│  Tenant: vipsigma ▾      │   ← tenant switcher (vipsigma_sports_betting / kengarff_automotive / artgroup / loop_tv)
├──────────────────────────┤
│  ◎  Decision Explorer    │   primary
│  📊 EAI Board            │   board metric
│  🧾 Ledger               │   audit table
├──────────────────────────┤
│  📜 Policy Packs         │
│  🧠 Skills Authority     │
│  📦 Evidence Export      │
│  ⚡ Dynamic Instructions │   L9 / DIR rules
├──────────────────────────┤
│  ▶  Run 90-sec Demo      │   ← orchestrator launcher (button, not a route)
│  Coverage Manifest ✓     │   ← signed-pill mini-widget at footer
│  Two-party verified ✓    │
└──────────────────────────┘
```

Icons are Lucide names (no emoji in code — just for the spec).

### 4.3 TopBar

- Breadcrumb on the left (`Tenant › Screen`).
- Center: **demo timeline scrubber** when a scenario is playing — a thin progress bar with the seven narrative beats from `narrative-flow.md` (0:00 hero, 0:15 inject, 0:25 click, 0:40 patch, 0:55 policy, 1:10 sign, 1:25 zoom-out).
- Right: tenant signed-attestation pill, "Reset demo" button, "Switch theme" (only for engineering review, not the live demo).

### 4.4 No login. No multi-tenant auth. No notifications drawer.

The demo is a single-operator screen. All friction removed.

---

## 5. Route & Screen Map

Eight routes (1 landing + 7 screens). All under `app/(aeos)/`. Every screen binds to the mock data layer in §6 and supports a specific beat of the narrative in §10.

### 5.1 `/aeos` — Landing / Mission Control

**Purpose:** Cold-start entry. Shows the Coverage Manifest, current EAI/HPI/HLR hero row, and the live decision feed of the most recent N executions.

**Components:**
- `<HeroMetricsRow />` — three big tiles: EAI (34px mono, accent.primary), HPI (gauge), HLR (numeric + above/below 1.0 color).
- `<CoverageManifestCard />` — tabular: "5 hyperscalers · 8 model labs · 6 agent platforms · 12 tool surfaces · ✓ signed by both parties." Click expands the full vendor list (sourced from §1's table).
- `<LiveDecisionFeed limit={20} />` — virtualized list of recent UEFResponse rows; click → opens `/aeos/decisions/[id]` modal.
- `<PathMixDonut />` — share of executions by `selected_path`.
- `<RecentVarianceBreaches />` — small list, "3 breaches in last hour, 3 patches applied, variance trending ↓".

**Narrative beat:** 0:00 (the dashboard opens).

### 5.2 `/aeos/decisions` — Decision Explorer (primary)

**Purpose:** Live UEF decision detail for a selected task. This is the AEOS equivalent of the current `/process/[id]` page but compressed into one screen.

**Components:**
- `<TaskHeaderCard />` — task definition, regulatory class, jurisdiction, risk level, "Re-run" button.
- `<UEFDecisionCard />` — selected_path, confidence (0..1), selected_actor_id.
- `<AdapterResultCard />` — provider, model, latency, tokens_in/out, cost (live mock numbers updating during the playthrough).
- `<ScoredPathTable />` — monospace, one row per candidate path, columns for all 8 dimensions + total. Winning row highlighted. **Three columns (gsti_value, uop_value, coordination_tax) labeled "from rPotential"** — this is the joint-IP visual.
- `<DIRPatchCard />` — rules_fired[], additional_instructions[], restricted_tools[], required_citations bool, require_human_confirmation bool, safety_envelope. Collapsible JSON view at the bottom. Shows the **before vs after prompt** side by side when a patch is mid-flight.
- `<PolicyEvaluationCard />` — allow / deny, required_controls (audit_log, human_in_loop, evidence_export, explanation_interface), evidence_required.
- `<LedgerRowCard />` — execution_id, EAI contribution, two-party signature pair (FuzeBox green ed25519 / rPotential blue HMAC).
- `<CrossVendorPatchPreview />` — when a patch is applied, shows it translated for Anthropic, OpenAI, and Vertex side-by-side.

**Narrative beats:** 0:25 (click into decision), 0:40 (patch), 0:55 (policy), 1:10 (sign).

### 5.3 `/aeos/eai` — EAI Board

**Purpose:** The board-level autonomy metric, signed.

**Components:**
- `<EAIHero />` — single number, 30-day sparkline, signed attestation pill ("FuzeBox + rPotential verified ✓").
- `<EAISubMetrics />` — 6 tiles in a 3×2 grid: UCS, SY, SER, EROI, HPI, HLR. Each with a 7-day sparkline.
- `<EAIFormula />` — collapsible "How is this calculated?" panel showing the formula (lifted from §2 of the data-contract.md).
- `<RollingTimeSeries />` — full-width area chart, EAI overlayed with HPI as secondary line, last 30 days.

**Narrative beat:** 1:25 (zoom out).

### 5.4 `/aeos/ledger` — Predictive Economic Ledger

**Purpose:** Audit-friendly, append-only viewer. The PEL itself.

**Components:**
- `<LedgerFilterPanel />` — left rail. Filters: tenant, skill, path, vendor, date range, variance status (within tolerance / breach), correction status (none / patch applied).
- `<LedgerTable />` — virtualized. Columns: timestamp, skill, vendor, path, **predicted $**, **actual $**, **variance $**, variance %, attribution bucket, correction (icon if patch applied), EAI contribution, success.
- Row click → `<LedgerRowDrawer />` opens at 40% width with the full LedgerRow JSON, the canonical trace events, the attestation block, and a "Download evidence bundle" button.
- `<VarianceTrendChart />` at top: aggregate variance $ over time, with patch-applied markers as dots showing variance shrinkage after each.

**Narrative beat:** alternate beat 1:10 (sign / download).

### 5.5 `/aeos/policy-packs` — Policy Packs

**Purpose:** Governance read-only transparency. Fed by `02_policy_templates/`.

**Components:**
- Left: pack list. Three packs at launch: EU AI Act high-risk, GDPR, SOC2. (Optional 4th: WP.29 if time allows.)
- Right: rule table for selected pack. Columns: rule_id, severity (critical/high/medium), description, when-summary, require-summary, fired-last-7d, denied-last-7d.
- Click rule → drawer with raw YAML.

### 5.6 `/aeos/skills` — Skills Authority

**Purpose:** Per-skill performance + drift. The 40-skill grid.

**Components:**
- 40-skill grid (5 cols × 8 rows). Each card: skill name, family chip (auto_diag, cx_triage, etc.), strategic_weight ring (0..1, gold), allowed paths as colored chips with success-rate color coding, drift indicator (↑ if drift_risk > 0.30).
- Click card → drawer with sparkline per path over last 30 days, GSTI/UOP overlay, recent eval failures.

### 5.7 `/aeos/evidence` — Evidence Export

**Purpose:** Produce a signed bundle for regulators.

**Components:**
- Left: form (tenant, format = EU AI Act Article 12 / WP.29 / GDPR / SOC2, period start / period end).
- Right: queue of recent bundles. Columns: bundle_id, tenant, format, integrity hash (truncated), signed-by ("FuzeBox + rPotential ✓"), download link, download-expiry.
- Submit → optimistic skeleton → bundle lands in queue (with a 1.8s artificial delay to feel real) → a modal pops with the two-party signature pair shown side-by-side.
- "Verify" button next to each bundle: pastes a known signature pair, shows ✓.

**Narrative beat:** 1:10 (sign).

### 5.8 `/aeos/dir` — Dynamic Instructions

**Purpose:** Reveal the L9 control surface.

**Components:**
- Left: rule list with the 6 default rules from `dynamic_instruction/runtime.py` (see §6.3).
- Right: rule detail (trigger predicate, patch shape preview).
- "Replay" button on a rule: re-runs a recent decision with a modified rule set, shows side-by-side patch diff.
- Bottom: **"Self-improving flywheel" panel** — bar chart of `rules_fired` aggregated by skill × time-window, plus a "Rules synthesized in the last 30 days" count showing 3 net-new rule_ids that the system auto-proposed (mock — but presented as an emerging capability).

---

## 6. Mock Data Layer

This is the largest single deliverable. It is **the spine of the demo**. Without it, every screen is hollow. With it, every screen feels live.

### 6.1 Type system — `types/aeos.ts`

Add a new file (do **not** modify `types/telemetry.ts`). Mirror the canonical AEOS schemas verbatim. Refer to:

- `docs/AEOS/aeos-engineering-handoff/05_instruction_runtime_contract/instruction_patch.schema.json`
- `docs/AEOS/aeos-engineering-handoff/05_instruction_runtime_contract/context_request.schema.json`
- `docs/AEOS/aeos-engineering-handoff/06_evidence_delivery/bundle_manifest.schema.json`
- Reference Python: `docs/AEOS/fuzebox-aeos-handoff/_source_snapshot/fuzebox-aeos/packages/`

Required types (full list — every one is on screen somewhere):

```ts
// Tenants & coverage
export type AEOSTenantId = 'vipsigma_sports_betting' | 'kengarff_automotive' | 'artgroup' | 'loop_tv';
export interface CoverageManifest { tenant_id; observed_vendors[]; gaps[]; signed_at; signature_pair; }

// Skills & actors (from 03_seed_data/skills.json + actors.json)
export interface AEOSSkill { skill_id; name; family; allowed_paths; required_tools; governance_tags; strategic_weight; performance: Record<ExecutionPath, { success_rate; avg_cost_usd; avg_latency_ms; }>; }
export interface AEOSActor { actor_id; type: 'human'|'agent'; display_name; role; region; readiness; fatigue; capacity; gsti_by_skill; drift_by_skill; }

// Execution
export type ExecutionPath = 'human' | 'anthropic_agent' | 'openai_agent' | 'salesforce_agent' | 'uniphore_agent' | 'cloudflare_agent' | 'google_vertex_agent' | 'hybrid_anthropic_human' | 'hybrid_openai_human';
export interface ScoredPath { path; capability_fit; gsti_value; uop_value; coordination_tax; governance_score; runtime_fit; economic_value; risk_penalty; total; selected_actor_id?; justification; }
export interface UEFResponse { decision_id; selected_path; confidence; scored_paths: ScoredPath[]; selected_actor_id?; skill_plan; governance_requirements; expected_metrics; }

// DIR (instruction patches)
export interface InstructionPatch { contract_version: 'dir.v1'; phase: 'pre_input'|'mid_toolcall'|'post_output'|'on_signal'; decision_id; execution_id; issued_at; rules_fired: string[]; additional_instructions; restricted_tools; required_tools; required_citations; require_human_confirmation; safety_envelope?; metadata: { pack_id?; ttl_seconds?; }; }

// Observation (cross-vendor, the obs.v1 contract)
export interface ObservationEvent { contract_version: 'obs.v1'; execution_id; tenant_id; agent_id; skill_id; vendor_layer: { hyperscaler?; model_lab?; model_id; agent_platform?; framework_version?; }; tool_surface[]; technical_metrics: { latency_ms_total; tokens_in; tokens_out; tool_calls; tool_failures; error_class; hallucination_score; groundedness; policy_violations; }; economic_metrics: { inference_cost_usd; tool_cost_usd; human_oversight_cost_usd; total_cost_usd; }; decision_inputs_hash; observed_at; observer_signature; }

// PEL — LedgerRow v2.3
export interface LedgerRow {
  execution_id; decision_id; tenant_id; skill_id; selected_path; provider; actor_ids[];
  predicted: { value_usd; signed_by_fuzebox; signed_at; };
  actual:    { value_usd; sourced_from; signed_by_fuzebox; signed_by_rpotential; signed_at; };
  variance: {
    technical: { sigma_delta; latency_delta_ms; error_rate_delta; hallucination_delta; exceeds_tolerance; };
    economic:  { variance_usd; variance_percentile; win_rate_delta; cost_per_outcome_delta_usd; exceeds_tolerance; };
  };
  attribution: { cause: 'agent_capability'|'agent_instructions'|'data'|'policy'|'environment'; reasoning; signed; };
  correction: { applied_patch_id?; parent_execution_id?; patch_type; patch_summary; co_signed; };
  applied_patch?: InstructionPatch;
  eai_contribution: { ai_task_share; success_weight; governance_factor; preservation_factor; economic_return_factor; };
  timestamp;
}

// EAI breakdown
export interface EAIBreakdown { eai; ai_adjusted_task_share; success_rate; governance_factor; economic_return_factor; hybrid_execution_share; preservation_factor; control_failures; risk_penalties; row_count; }

// Evidence bundle
export interface EvidenceBundle { bundle_id; tenant_id; format: 'eu_ai_act_article_12'|'wp29'|'gdpr'|'soc2'; period_start; period_end; row_count; integrity_hash; files[]; attestations: { fuzebox: { algorithm: 'ed25519'; key_id; signature; }; rpotential: { algorithm: 'hmac-sha256'; key_id; witness; }; }; signed_url; }

// Adapter result (per-vendor execution outcome)
export interface AdapterResult { success; latency_ms; cost_usd; output; trace; tool_calls; provider; model?; actor_id?; applied_patch?; }
```

Every field above appears in at least one screen. Nothing speculative.

### 6.2 Seed data — `lib/aeos/seed/`

Match the volumes in `03_seed_data/index.json`: **40 skills, 200 actors, 4 jurisdictions, 4 tenants**.

Files:

- `lib/aeos/seed/tenants.ts` — 4 tenants:
  - `vipsigma_sports_betting` (the existing reference tenant from `Engineering_Instructions_PEL_v1.md`)
  - `kengarff_automotive`
  - `artgroup`
  - `loop_tv`
- `lib/aeos/seed/skills.ts` — 40 skills across 7 families:
  - `auto_diag` ×14 (with 4 regional variants), `auto_repair` ×5, `cx_triage` ×5, `events_ops` ×4, `compliance` ×4, `field_service` ×4, `hr_people` ×4
  - Copy directly from `docs/AEOS/aeos-engineering-handoff/03_seed_data/skills.json` (it's already a JSON file — convert to TS const).
- `lib/aeos/seed/actors.ts` — 200 actors. 180 humans (h_technician_001..070, h_cx_agent_071..110, h_venue_operator_111..130, h_compliance_lead_131..145, h_field_tech_146..170, h_hr_lead_171..180) + 20 shared agents.
- `lib/aeos/seed/signals.ts` — GSTI×40, drift×40, UOP×200, coordination_tax by task_type.
- `lib/aeos/seed/policy-packs.ts` — three packs (EU AI Act, GDPR, SOC2). Convert YAML at `02_policy_templates/*.yaml` to TS const.
- `lib/aeos/seed/dir-rules.ts` — six default rules (see §6.3).
- `lib/aeos/seed/coverage-manifest.ts` — vendor list per tenant, with explicit gaps.
- `lib/aeos/seed/ledger.ts` — **the most important file.** Pre-baked ~120 historical LedgerRows per tenant (~480 total) covering the 9 conformance flows in distribution. Each row has predicted, actual, variance, attribution, correction. About 8% breach tolerance and have a correction; about 60% are hybrid path; about 40% are pure agent; preservation factor mostly above 0.5. Variance trends downward over time (engineered, not random) so the time-series tells the self-improving story.
- `lib/aeos/seed/decisions.ts` — 9 reference decisions (one per conformance flow) plus 12 generic ones. Each contains the full ScoredPath array (8 dimensions × ~10 candidate paths).
- `lib/aeos/seed/evidence-bundles.ts` — 5 bundles per tenant, signed.
- `lib/aeos/seed/observation-events.ts` — 200 ObservationEvents covering all 6 vendors.

**Determinism rule:** all randomness is seeded (use a `mulberry32(20260420)` PRNG so the demo is reproducible — same seed = identical outputs every run).

### 6.3 The 6 default DIR rules (verbatim from the reference impl)

| Rule ID | Trigger predicate | Patch effect |
|---|---|---|
| `dir_safety_relevant_confirmation` | risk_level ∈ {HIGH, CRITICAL} | required_citations=true; require_human_confirmation=true; safety_envelope="safety_relevant_v1" |
| `dir_auto_safety_tool_lockdown` | regulatory_class == "auto_safety" | restricted_tools += [clear_dtc_without_root_cause, ota_push_untested, disable_adas_module] |
| `dir_gambling_responsible_play` | regulatory_class == "gambling" | additional_instructions += responsible-play disclaimer |
| `dir_drift_coaching` | signals.skill_drift_risk > 0.30 | additional_instructions += chain-of-checks |
| `dir_people_data_pii_mask` | "gdpr_sensitive" ∈ governance_tags | restricted_tools += raw_customer_lookup; required_tools += pii_redactor; require_human_confirmation=true |
| `dir_fatigue_handoff` | signals.actor_fatigue > 0.55 | additional_instructions += checklist-style output |

A **7th synthesized rule** is shown as net-new on the DIR page to demonstrate the self-improving flywheel — a proposed `dir_responsible_gaming_loss_streak` derived from aggregated eval failures. (Pure mock, but presented as an emerging capability.)

### 6.4 Data-bridge — `lib/aeos/data.ts`

Single import surface for pages (mirrors the existing `lib/data-source.ts` pattern). Every accessor is **synchronous** (mock-only):

```ts
export const getTenant = (id) => ...;
export const listTenants = () => ...;
export const getSkill = (skill_id) => ...;
export const listSkills = (tenant_id) => ...;
export const getDecision = (decision_id) => ...;
export const listRecentDecisions = (tenant_id, limit=20) => ...;
export const listLedgerRows = (tenant_id, filters) => ...;
export const getLedgerRow = (execution_id) => ...;
export const computeEAI = (tenant_id, window_days=30) => EAIBreakdown;
export const computeEAITimeSeries = (tenant_id, window_days=30) => Array<{day; eai; hpi}>;
export const listPolicyPacks = () => ...;
export const getPolicyPack = (pack_id) => ...;
export const listEvidenceBundles = (tenant_id) => ...;
export const exportEvidenceBundle = (input) => Promise<EvidenceBundle>;  // 1.8s artificial latency
export const listDIRRules = () => ...;
export const replayDecisionWithModifiedRules = (decision_id, modified_rules) => InstructionPatch;
export const getCoverageManifest = (tenant_id) => CoverageManifest;
```

All functions are pure reads against the seed data + a small in-memory mutation log so "Submit task" / "Apply patch" / "Re-run" can append rows during a demo session and persist for the rest of the session (cleared on `Reset demo`).

---

## 7. Design System for the Dark Control Plane

### 7.1 Tokens (additive, in `app/globals.css`)

Add a new block — does not override the existing tokens:

```css
[data-theme="aeos-dark"] {
  --aeos-bg-canvas: #0b1220;
  --aeos-bg-card:   #131c30;
  --aeos-bg-nested: #0d1526;
  --aeos-border-line:    #223255;
  --aeos-border-divider: #22315a;
  --aeos-fg-primary:   #e8eefb;
  --aeos-fg-secondary: #9db2d9;
  --aeos-fg-muted:     #8da0c0;
  --aeos-accent-primary: #8fd3ff;
  --aeos-accent-ok:      #6ee7b7;
  --aeos-accent-warn:    #fbbf24;
  --aeos-accent-bad:     #f87171;
  --aeos-pill-bg: #1d3a6a;
  --aeos-pill-fg: #9fd8ff;
  --aeos-radius-sm: 8px;
  --aeos-radius-md: 12px;
  --aeos-space-xs: 4px;
  --aeos-space-s:  8px;
  --aeos-space-m:  12px;
  --aeos-space-l:  20px;
  --aeos-space-xl: 24px;
  --aeos-motion: 150ms cubic-bezier(.2,.8,.2,1);
  --aeos-font-ui: var(--font-dm), Inter, system-ui, sans-serif;
  --aeos-font-mono: var(--font-mono-jb), 'JetBrains Mono', Menlo, monospace;
  --aeos-fs-caption: 12px;
  --aeos-fs-body:    14px;
  --aeos-fs-label:   11px;
  --aeos-fs-title:   22px;
  --aeos-fs-hero:    34px;
}
```

These come verbatim from `04_dashboard_design/design-tokens.json` (with `--aeos-` prefix to avoid collision). Fonts mapped to existing repo fonts — DM Sans for UI, JetBrains Mono for data.

### 7.2 Theme application

`app/(aeos)/layout.tsx` wraps its children in:

```tsx
<div data-theme="aeos-dark" className="min-h-screen bg-[var(--aeos-bg-canvas)] text-[var(--aeos-fg-primary)]">
  ...
</div>
```

Every AEOS component reads from `var(--aeos-*)`. **Do not use the existing light tokens inside AEOS components** — they will conflict.

### 7.3 Visual identity

- Tight, minimalist, data-dense. Lots of whitespace around dense data tables. **Operators should never see a model name unless they ask** (per `aeos-engineering-handoff/README.md` UX principle). On Decision Explorer, model name is in a small caption under the provider chip, not in the headline.
- Two-party signature pill is a recurring motif: a thin horizontal pill split into a green left half ("FuzeBox") and a blue right half ("rPotential") with a ✓ on the right. Always immutable. Always visible at the top of any screen showing signed data.
- Variance arrows: ↓ green (variance shrinking), ↑ red (breach). Used aggressively — anywhere a metric is improving over time.
- "Coverage Manifest" badge: a small horizontal strip with vendor count chips (5 hyperscalers · 8 model labs · 6 agent platforms). Always present on the landing page.

### 7.4 Charts

Recharts. All charts use `--aeos-accent-primary` for primary series, `--aeos-accent-ok` for the secondary (HPI) line, `--aeos-fg-muted` for axes/grid.

### 7.5 Print styles

Out of scope for the demo. AEOS users will export a signed bundle, not print a screen.

---

## 8. The Self-Improving Agent Flavor

The user's brief explicitly calls for "self-improving Agents." This corresponds to **Motion C** in the AEOS PRD (`8_AEOS_PRD_MotionA_MotionB_MotionC.docx`) and to the closing paragraph of `Engineering_Instructions_PEL_v1.md`: "variance trends visibly downward per agent over time, on screen."

We surface this in three places:

### 8.1 On `/aeos/decisions/[id]` — the moment of correction

When a decision shows a variance breach, the page renders a **timeline strip** at the bottom:

```
[Original execution]  ──→  [Variance breach detected]  ──→  [Attribution: agent_instructions]
                                                                         │
                                                                         ▼
                                              [DIR fires patch: dir_drift_coaching]
                                                                         │
                                                                         ▼
                                                          [Patch applied to this agent]
                                                                         │
                                                                         ▼
                          [Next 5 executions: variance shrinks 73%]  ←──┘
```

Implemented as a horizontal stepper component using the seeded ledger rows. Click on the last node → drawer showing the 5 follow-up executions with their variance values.

### 8.2 On `/aeos/dir` — the rule synthesis flywheel

Bottom panel: "Rules synthesized in the last 30 days." Three mock entries:

| Synthesized rule_id | Trigger | Source aggregate | Status |
|---|---|---|---|
| `dir_responsible_gaming_loss_streak` | actor.recent_loss_streak > 5 | 23 eval failures across vipsigma | Proposed → in review |
| `dir_brake_diag_hallucination_guard` | hallucination_score > 0.15 on auto_diag skills | 17 failures across kengarff | Proposed → approved |
| `dir_compliance_citation_density` | citation_count < 3 on compliance skills | 11 failures across artgroup | Proposed → live |

The "in review" → "approved" → "live" status is hand-curated to feel like the system is genuinely growing.

### 8.3 On `/aeos/eai` — the macro story

The 30-day rolling EAI time-series shows a deliberately upward trend: starts at ~0.42, ends at ~0.61, with three visible inflection points where DIR rule synthesis kicked in. Click an inflection → tooltip explains which rule fired.

This is the visual answer to "are agents getting better?" — yes, signed, and you can audit which rule did it.

---

## 9. The 90-Second Demo Orchestrator (Mock Choreography)

The orchestrator is a **client-side state machine** (`lib/aeos/orchestrator.ts`) that drives a deterministic sequence of mock-data mutations and route navigations, timed to match `narrative-flow.md`.

### 9.1 Architecture

- React context provider `<AEOSDemoProvider>` mounted at the `(aeos)` layout.
- Single source of truth: `useAEOSDemo()` hook returns `{ phase, beat, isPlaying, start(), pause(), reset() }`.
- Phases match the 7 narrative beats: `idle → opening → injecting → exploring → patching → policy → signing → zoomed → done`.
- The orchestrator owns timers (setTimeout chained), navigation (Next.js `router.push`), and mutations to a session-scoped mock store.
- **No real API calls. No latency simulation beyond `setTimeout`. No Suspense boundaries spinning.**

### 9.2 The 90-second timeline

| Beat | Time | Action |
|---|---|---|
| 0:00 | `opening` | Land on `/aeos`. Hero metrics fade in. Coverage manifest pill animates ✓. |
| 0:15 | `injecting` | A new row prepends to the live decision feed: brake diagnosis from service bay. Toast: "New high-risk task arriving." |
| 0:25 | `exploring` | Auto-navigate to `/aeos/decisions/dec_kg_brake_001`. ScoredPathTable animates in row-by-row. Winning row (`hybrid_anthropic_human`) highlighted last. |
| 0:40 | `patching` | DIR patch card expands. `rules_fired = [dir_safety_relevant_confirmation, dir_auto_safety_tool_lockdown]`. Cross-vendor patch preview shows Anthropic / OpenAI / Vertex translations side-by-side. |
| 0:55 | `policy` | Policy evaluation card highlights required_controls list. Toast: "EU AI Act Article-12 trail recorded." |
| 1:10 | `signing` | "Download evidence bundle" button pulses. Click triggers a 1.8s skeleton, then a modal with the two-party signature pair. |
| 1:25 | `zoomed` | Auto-navigate to `/aeos/eai`. Rolling time-series fills the screen. |
| 1:30 | `done` | Toast: "Every point on this chart is signed by two parties." Demo ends. Reset button visible. |

### 9.3 Manual mode

The orchestrator also supports **operator-driven mode** — every screen works without playing the 90-sec script. Les or any operator can navigate to any screen at any time and the seeded data is sufficient. The script is the demo *highlight*, not the only path.

### 9.4 Four-scenario extended mode (optional, ~8 minutes)

For longer briefings, an "Extended Demo" button runs the four scenarios from `4 FuzeBox_OneWeek_Demo_Spec.docx`:

1. Enterprise workforce transformation task (45s).
2. High-throughput low-risk task (90s — pure-agent path; demonstrates non-bias).
3. Cross-jurisdictional simultaneous execution (3 different routings, one signed cross-jurisdictional attestation; 2m).
4. Adversarial governance — DIR fires mid-execution, prompt revision visible (3m).

Each scenario reuses the same screens; only the orchestrator script differs. **Build only Scenario 1 (the brake diagnosis) for v1.** Scenarios 2-4 are post-validation enhancements. Defer.

---

## 10. Build Phases & Sequencing

Each phase ends in a **demoable checkpoint**. No phase rolls forward without Anand seeing the checkpoint working.

### Phase 0 — Branch & scaffolding (½ day)

- Cut `aeos-mock` from `main` at HEAD.
- Create `app/(aeos)/layout.tsx`, `app/(aeos)/page.tsx`, `components/aeos/`, `lib/aeos/`, `types/aeos.ts`.
- Add the `[data-theme="aeos-dark"]` block to `globals.css`.
- Add the `NEXT_PUBLIC_ENABLE_AEOS_LINK` env flag.
- **Checkpoint:** `/aeos` returns a dark-themed empty page with a "Hello AEOS" header in the right fonts and palette.

### Phase 1 — Data layer (1.5 days)

- Build all `types/aeos.ts` interfaces.
- Convert seed JSON/YAML to TS consts under `lib/aeos/seed/`.
- Build the 480 LedgerRows generator (deterministic, seeded, with the engineered downward-trending variance).
- Build `lib/aeos/data.ts` accessors.
- Unit-smoke (no test runner — just a `lib/aeos/__smoke.ts` that imports everything and prints counts to the console at dev-time).
- **Checkpoint:** `console.log(computeEAI('vipsigma_sports_betting'))` returns a sensible EAIBreakdown; `listLedgerRows('kengarff_automotive', {})` returns ~120 rows; the engineered downward variance trend is visible in `computeEAITimeSeries`.

### Phase 2 — Layout shell (1 day)

- `AEOSSidebar` (7 destinations + tenant switcher).
- `AEOSTopBar` (breadcrumb, demo timeline scrubber, signed-attestation pill).
- `app/(aeos)/layout.tsx` mounts both, wraps in `<AEOSDemoProvider>`.
- Wire CommandPalette with AEOS routes.
- **Checkpoint:** All 8 routes navigable with empty `<h1>` placeholders. Sidebar visually correct in dark theme. Tenant switcher cycles through 4 mock tenants.

### Phase 3 — Landing + EAI Board + Ledger (2 days)

- Landing (`/aeos`): HeroMetricsRow, CoverageManifestCard, LiveDecisionFeed, PathMixDonut, RecentVarianceBreaches.
- EAI Board (`/aeos/eai`): EAIHero, EAISubMetrics (6 tiles), EAIFormula collapsible, RollingTimeSeries.
- Ledger (`/aeos/ledger`): LedgerFilterPanel, LedgerTable (virtualized), LedgerRowDrawer, VarianceTrendChart.
- **Checkpoint:** Three primary screens render real data. Tenant switcher updates all three. EAI hero number changes per tenant.

### Phase 4 — Decision Explorer (2 days)

- The most complex screen.
- TaskHeaderCard, UEFDecisionCard, AdapterResultCard, ScoredPathTable (8 dimensions × 10 paths), DIRPatchCard, PolicyEvaluationCard, LedgerRowCard, CrossVendorPatchPreview.
- **Checkpoint:** Click any row in the LiveDecisionFeed → opens Decision Explorer with the full breakdown. ScoredPathTable shows three "from rPotential" labeled columns. DIR patch card collapses/expands; restricted_tools listed correctly.

### Phase 5 — Policy Packs / Skills / Evidence / DIR (2 days)

- All four secondary screens. Mostly tabular + drawer patterns.
- Evidence Export modal with the two-party signature reveal.
- DIR self-improving flywheel panel with the 3 synthesized rules.
- **Checkpoint:** All 7 screens are content-complete. No empty states except where intentional ("No task selected").

### Phase 6 — The 90-sec orchestrator (1 day)

- `lib/aeos/orchestrator.ts` state machine.
- Wire timeline scrubber in TopBar.
- Wire "Run 90-sec Demo" button in sidebar.
- Test full timeline reproducibly.
- **Checkpoint:** Click "Run 90-sec Demo" → the entire narrative plays end-to-end without operator input. Timeline scrubber shows the active beat. Reset button returns the system to clean state.

### Phase 7 — Polish & rehearsal (1 day)

- Microinteractions: signature pill ✓ animation, variance arrow transitions, score table row highlights.
- Empty states & loading skeletons (kept minimal — the operator should never see a spinner during demo).
- A short `AEOS_DEMO_SCRIPT.md` (10 min walkthrough) for Les to rehearse from.
- Lighthouse / a11y pass on the seven primary screens.
- **Checkpoint:** Anand can run the 90-sec demo cold three times in a row without a single visual glitch.

**Total estimate: 10–11 working days for two engineers** (one frontend + one mock-data/types). Compresses to ~6 days with three engineers if we run Phases 3 + 4 + 5 in parallel after Phase 2.

---

## 11. Acceptance Criteria

The demo is "done" when **every** statement below is true and demonstrable.

### 11.1 Narrative

1. The 90-second narrative runs end-to-end on `aeos-mock` without operator input from `Run 90-sec Demo` button to "Demo complete" toast.
2. Each of the seven beats from `narrative-flow.md` is visually distinct and recognizable.
3. The four-scenario extended demo (or at minimum scenario 1) runs cleanly.

### 11.2 The three load-bearing capabilities are visible

4. **Cross-vendor observation:** Coverage Manifest is visible on the landing page with at least 5 hyperscalers / 8 model labs / 6 agent platforms / 12 tool surfaces and is "signed by both parties."
5. **PEL:** every row in `/aeos/ledger` shows predicted $, actual $, variance $ on both technical and economic dimensions, attribution bucket, and correction status.
6. **Realtime injection:** at least one decision in the Decision Explorer shows a DIR patch card with `rules_fired` from the 6 default rules, with the cross-vendor patch translation visible.

### 11.3 The two-party attestation invariant

7. Every signed surface — EAI hero, evidence bundle modal, ledger row drawer — shows the FuzeBox + rPotential pill side-by-side.
8. The "Verify" action on an evidence bundle returns ✓ for every seeded bundle.

### 11.4 The self-improving flavor

9. `/aeos/eai` 30-day rolling time-series shows an upward EAI trend with at least 3 visible inflection points tied to DIR rule synthesis.
10. `/aeos/dir` has a "Rules synthesized in the last 30 days" panel with at least 3 entries in different statuses.
11. At least one Decision Explorer view shows the variance-shrinkage timeline strip.

### 11.5 Data fidelity

12. The 6 default DIR rules from the reference impl are the rules the demo uses.
13. All 9 conformance-flow scenarios are represented in the seeded ledger.
14. The 8-dimension UEF formula is both visible (formula text on EAI screen) and computed correctly (sum of dimensions = `total_score` shown in the score table).

### 11.6 Co-existence

15. `npm run build` succeeds on `aeos-mock`. The existing `/dashboard`, `/process/*`, `/agents/*`, `/governance/*` routes still work.
16. Cutting from `aeos-mock` back to `main` shows zero AEOS UI artifacts on `main`.

### 11.7 Quality

17. Lighthouse score ≥ 90 on the 7 AEOS routes.
18. Keyboard navigation works on all interactive elements; sidebar and command palette are reachable via Tab.
19. No TypeScript errors. No console errors during the 90-sec demo run.

---

## 12. Risks & Open Questions for Anand

### 12.1 Risks

| # | Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|---|
| R1 | Dark theme tokens collide with existing light tokens via Tailwind cascade | Med | Med | Scope all AEOS tokens behind `[data-theme="aeos-dark"]` selector. Don't reuse `--surface`, `--text-primary`, etc. inside AEOS components. |
| R2 | The 480-row LedgerRow seed makes the bundle bloat at build time | Low | Low | If size concerns, lazy-load per-tenant slices with dynamic `import()`; ledger data is ~50KB JSON-equivalent — should be fine inline. |
| R3 | Les or product owner asks for a real DB-backed AEOS — scope explosion | Med | High | Plan explicitly says **mock-only**. If Les approves the demo and asks for a real backend, that becomes a separate project (mirrors the FuzeBox 6-week production build in `Engineering_Instructions_PEL_v1.md`). |
| R4 | Existing telemetry app users get confused by a second product surface in the same repo | Low | Low | AEOS lives on its own branch; the cross-link is env-flagged off on `main`. |
| R5 | The "self-improving" claim (mock-only) is read as overpromising | Med | Med | Every flywheel artifact is labeled "Demo data — pattern shown, not real synthesis." Anand reviews copy before live demo. |
| R6 | Cross-vendor patch translation visualization is harder than it looks (we'd need to fake what a translated prompt looks like) | Med | Low | Pre-bake three translated patch examples per scenario in the seed. Keep the diff visual minimal — show the prepended `[L9 DIR]` instruction block, not full prompt rewrite. |
| R7 | Demo plays too fast for Les to narrate over | Low | Med | Orchestrator supports a `playbackSpeed` setting (0.5x, 1x, 2x). Default to 1x; Les can scale to 0.5x for rehearsal. |
| R8 | Recharts can't render a 30-day signed time-series with attestation badges | Low | Low | Use a Recharts `<ComposedChart>` with custom `<Dot>` for inflection markers; signed badge is rendered outside the chart. |
| R9 | Existing repo build needs DB env vars on Vercel (Drizzle, NextAuth) — fails without | Med | High | Phase 0 includes a build-verification step on `aeos-mock` with empty env. If `lib/db/index.ts` or `lib/auth.ts` evaluate at import time and crash without `DATABASE_URL` / `NEXTAUTH_SECRET`, we wrap them in lazy guards or set placeholder env vars in the Vercel Project. We do **not** modify `main` to fix this. |
| R10 | Local `.vercel/project.json` is currently linked to `agent-telemetry-quadrant`; accidental `vercel deploy` from this directory pushes to the wrong project | Low | Med | Document re-link command in §3.3. Default working assumption: deploys happen via git push (auto-deploy on branch update), not via local CLI. |

### 12.2 Open questions for Anand to confirm

**Q1.** Branch name — `aeos-mock` proposed. Or do you prefer `aeos-demo`, `mock-aeos`, something else?

**Q2.** Tenant set — proposed 4 (vipsigma_sports_betting, kengarff_automotive, artgroup, loop_tv). All are referenced across the AEOS docs. Do we want all four shipped, or just vipsigma + kengarff for v1?

**Q3.** Default landing tenant — `vipsigma_sports_betting` (matches the PEL engineering instructions) or `kengarff_automotive` (matches the 90-sec narrative which uses brake diagnosis)? Recommendation: **kengarff_automotive** — the 90-sec story reads better there. vipsigma stays available in the switcher.

**Q4.** Self-improving flavor depth — three places (§8.1, §8.2, §8.3) feel right. Any one of them you want emphasized more?

**Q5.** Existing app side-link — should `/dashboard` get an "AEOS Demo →" link in the TopBar when on `aeos-mock`, so Les can A/B compare in the same session? Recommendation: **yes**, env-flagged on for the mock branch.

**Q6.** Production hardening — out of scope. Confirm we are NOT wiring any real LLM, real database, real auth, real cron, real ingestion. Mock-only. (This is the largest scoping decision; it's why the timeline is 10 days and not 10 weeks.)

**Q7.** Brand marks — `0 READ FIRST...docx` references "FuzeBox + rPotential" as the two attesting parties. Existing app shows "r-Potential / Powered by FuzeBox." Is the AEOS demo signed visibly as **FuzeBox + rPotential** (which is how Les frames the joint-IP), or do we keep the existing "r-Potential / Powered by FuzeBox" hierarchy? Recommendation: **FuzeBox + rPotential** for AEOS branch — matches every Les briefing doc. Existing app branding unchanged.

**Q8.** Extended scenarios — build only the brake-diagnosis (Scenario 1) for v1, defer 2/3/4 to a v1.1? Recommendation: **yes, defer**. Get v1 in front of Les; if he wants more, add them after validation.

**Q9.** Where does the existing telemetry app fit if Les approves AEOS? Are we replacing it, supplementing it, or running both as separate products? (This is a strategic question, not a build question — but the answer informs how we frame the demo. Recommendation: AEOS is the new "executive narrative" surface; existing telemetry stays as the deep-operations product. They are complementary tiers, not competitors.)

---

## 13. Files-to-Create Checklist (for Agent Teams)

This is the literal list. ~50 files. Every one is referenced somewhere in this plan.

### Types (1 file)

- [ ] `types/aeos.ts`

### Mock data (12 files)

- [ ] `lib/aeos/seed/tenants.ts`
- [ ] `lib/aeos/seed/skills.ts`
- [ ] `lib/aeos/seed/actors.ts`
- [ ] `lib/aeos/seed/signals.ts`
- [ ] `lib/aeos/seed/policy-packs.ts`
- [ ] `lib/aeos/seed/dir-rules.ts`
- [ ] `lib/aeos/seed/coverage-manifest.ts`
- [ ] `lib/aeos/seed/ledger.ts`
- [ ] `lib/aeos/seed/decisions.ts`
- [ ] `lib/aeos/seed/evidence-bundles.ts`
- [ ] `lib/aeos/seed/observation-events.ts`
- [ ] `lib/aeos/seed/__index.ts` — barrel

### Data bridge & utilities (4 files)

- [ ] `lib/aeos/data.ts` — accessor surface
- [ ] `lib/aeos/eai.ts` — EAI computation
- [ ] `lib/aeos/orchestrator.ts` — 90-sec state machine
- [ ] `lib/aeos/prng.ts` — seeded mulberry32

### Routes (8 files)

- [ ] `app/(aeos)/layout.tsx`
- [ ] `app/(aeos)/page.tsx` — landing
- [ ] `app/(aeos)/decisions/page.tsx` — Decision Explorer (auto-redirect to most recent)
- [ ] `app/(aeos)/decisions/[id]/page.tsx` — single decision
- [ ] `app/(aeos)/eai/page.tsx`
- [ ] `app/(aeos)/ledger/page.tsx`
- [ ] `app/(aeos)/policy-packs/page.tsx`
- [ ] `app/(aeos)/skills/page.tsx`
- [ ] `app/(aeos)/evidence/page.tsx`
- [ ] `app/(aeos)/dir/page.tsx`

### Layout shell (3 files)

- [ ] `components/aeos/layout/AEOSSidebar.tsx`
- [ ] `components/aeos/layout/AEOSTopBar.tsx`
- [ ] `components/aeos/layout/AEOSDemoProvider.tsx`

### Shared AEOS primitives (6 files)

- [ ] `components/aeos/shared/TwoPartySignaturePill.tsx`
- [ ] `components/aeos/shared/VarianceArrow.tsx`
- [ ] `components/aeos/shared/CoverageManifestStrip.tsx`
- [ ] `components/aeos/shared/SignedAttestationBadge.tsx`
- [ ] `components/aeos/shared/PathScoreBar.tsx`
- [ ] `components/aeos/shared/TenantSwitcher.tsx`

### Landing (5 files)

- [ ] `components/aeos/landing/HeroMetricsRow.tsx`
- [ ] `components/aeos/landing/CoverageManifestCard.tsx`
- [ ] `components/aeos/landing/LiveDecisionFeed.tsx`
- [ ] `components/aeos/landing/PathMixDonut.tsx`
- [ ] `components/aeos/landing/RecentVarianceBreaches.tsx`

### EAI Board (4 files)

- [ ] `components/aeos/eai/EAIHero.tsx`
- [ ] `components/aeos/eai/EAISubMetrics.tsx`
- [ ] `components/aeos/eai/EAIFormula.tsx`
- [ ] `components/aeos/eai/RollingTimeSeries.tsx`

### Ledger (4 files)

- [ ] `components/aeos/ledger/LedgerFilterPanel.tsx`
- [ ] `components/aeos/ledger/LedgerTable.tsx`
- [ ] `components/aeos/ledger/LedgerRowDrawer.tsx`
- [ ] `components/aeos/ledger/VarianceTrendChart.tsx`

### Decision Explorer (8 files)

- [ ] `components/aeos/decision-explorer/TaskHeaderCard.tsx`
- [ ] `components/aeos/decision-explorer/UEFDecisionCard.tsx`
- [ ] `components/aeos/decision-explorer/AdapterResultCard.tsx`
- [ ] `components/aeos/decision-explorer/ScoredPathTable.tsx`
- [ ] `components/aeos/decision-explorer/DIRPatchCard.tsx`
- [ ] `components/aeos/decision-explorer/PolicyEvaluationCard.tsx`
- [ ] `components/aeos/decision-explorer/LedgerRowCard.tsx`
- [ ] `components/aeos/decision-explorer/CrossVendorPatchPreview.tsx`
- [ ] `components/aeos/decision-explorer/VarianceShrinkageTimeline.tsx`

### Policy Packs / Skills / Evidence / DIR (8 files)

- [ ] `components/aeos/policy-packs/PolicyPackList.tsx`
- [ ] `components/aeos/policy-packs/PolicyRuleTable.tsx`
- [ ] `components/aeos/skills/SkillGrid.tsx`
- [ ] `components/aeos/skills/SkillCard.tsx`
- [ ] `components/aeos/skills/SkillDrawer.tsx`
- [ ] `components/aeos/evidence/EvidenceExportForm.tsx`
- [ ] `components/aeos/evidence/EvidenceBundleQueue.tsx`
- [ ] `components/aeos/evidence/SignatureRevealModal.tsx`
- [ ] `components/aeos/dir/DIRRuleList.tsx`
- [ ] `components/aeos/dir/DIRRuleDetail.tsx`
- [ ] `components/aeos/dir/SynthesizedRulesPanel.tsx`

### CSS (1 edit)

- [ ] `app/globals.css` — append the `[data-theme="aeos-dark"]` block

### Demo script (1 file)

- [ ] `AEOS_DEMO_SCRIPT.md` — repo-root narrative for Les to rehearse from

### Optional / nice-to-have (post-validation)

- [ ] Extended scenarios 2–4 in the orchestrator
- [ ] Scenario picker UI in the sidebar
- [ ] CSV export of any ledger view
- [ ] Replay-with-modified-rules diff view on `/aeos/dir`

**Total: 49 net-new files + 1 edit.**

---

## 14. What This Plan Does Not Do (and Why)

- **No real LLM calls.** The point is to show the *narrative*, not pay for tokens. Real adapter integration is in the Engineering_Instructions_PEL_v1 6-week plan and is outside this scope.
- **No real database.** Mock-only, session-scoped mutations.
- **No real auth.** Single-operator demo.
- **No production deployment.** Runs on `npm run dev`; if Les wants a hosted preview, Vercel deploy of the `aeos-mock` branch takes 5 minutes after validation.
- **No tests.** The demo is operator-driven and visually validated. A test suite would cost more than it returns at this stage.
- **No data migration from existing telemetry.** AEOS data is its own world; the existing telemetry data is unrelated (different concepts: process/sigma/DPMO vs. decision/ledger/EAI).
- **No production hardening.** Lighthouse 90+ is the bar, not enterprise SRE.

This is the smallest demo that tells the AEOS story convincingly. Anything more is post-validation work.

---

## 15. Validation Gate

**Anand reviews this plan and confirms before any code is written.**

Specifically, please respond with:

1. ✅ / ✗ on each of the 9 open questions in §12.2.
2. Branch name confirmation (or alternative).
3. Phase-cut approval (build all 7 phases, or stop at a particular phase for a mid-review?).
4. Any additional AEOS doc references I should pull into the plan that I've missed.

Once confirmed, I'll cut `aeos-mock` from `main`, brief the agent teams against §13's checklist, and start at Phase 0.

---

*End of plan. No code written until validated.*
