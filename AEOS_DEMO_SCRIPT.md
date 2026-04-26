# AEOS Demo Script

**Purpose:** Walk Les (or any board-level audience) through the AEOS narrative in 90 seconds, with the option to extend to a 5-minute deep-dive.

**URL:** https://vipaeos.arkos.studio (production) · `npm run dev` then http://localhost:3000 (local)

**Branch:** `aeos-mock`. Mock-only — no real LLM calls, no DB, no auth.

---

## Before you start

- Open the page on a clean tab. Default tenant is **Ken Garff Automotive** (the brake-diagnosis tenant).
- Click `Run 90-sec demo` in the sidebar to auto-play, OR drive it manually.
- A "Reset" button appears in the TopBar once the demo is running.

The orchestrator is deterministic — every run produces the same numbers, the same scored paths, the same signatures.

---

## The 90-second narrative

| Time | Beat | What's on screen | What you say |
|---|---|---|---|
| 0:00 | **Opening** | Mission Control loads. Hero EAI/HPI/HLR with two-party signature pill on EAI. Coverage Manifest shows 5 hyperscalers · 8 model labs · 6 agent platforms · 12 tool surfaces, signed. | "This is AEOS. One screen. Three load-bearing capabilities — cross-vendor observation, the predictive economic ledger, realtime injection. Every observed vendor is on the manifest. Every gap is explicit." |
| 0:12 | **Injecting** | Toast: "New high-risk task arriving · brake-diagnosis ticket from service bay." A row prepends to the live decision feed. | "A brake-squeal task just arrived from a Ken Garff service bay. Let's watch the system make the decision." |
| 0:22 | **Exploring** | Auto-navigates into the Decision Explorer for that decision. Scored Path Table animates in: 3 candidate paths × 8 dimensions. The winner — `hybrid_anthropic_human` — is highlighted. | "Eight dimensions. Three of them — GSTI, UoP, Coordination Tax — come from rPotential's workforce graph. No runtime vendor can produce these. That's the joint-IP moat. Hybrid Anthropic + Human wins because the human signal preserves strategic capability." |
| 0:36 | **Patching** | DIR Patch card lights up. `rules_fired: [dir_safety_relevant_confirmation, dir_auto_safety_tool_lockdown]`. Restricted tools shown. | "Before any vendor saw the prompt, the Layer-9 Dynamic Instruction Runtime forced citations and locked down destructive tools — clear DTC, OTA push, ADAS disable. The patch is co-signed FuzeBox + rPotential, every time." |
| 0:50 | **Policy** | Policy Evaluation card highlights `ALLOW` with required_controls: audit_log, human_in_loop, evidence_export, explanation_interface, data_residency_eu. Cross-vendor patch translation appears below — same canonical patch, three vendor surfaces side by side. | "Each of those controls is now a line in the ledger. That's the EU AI Act Article-12 trail. And here's the cross-vendor part — the same patch, translated for Anthropic, OpenAI, and Vertex. The patch propagates regardless of which vendor the agent runs on next." |
| 1:04 | **Signing** | Toast on the signing event. The Ledger Row card shows the predicted/actual/variance with FuzeBox + rPotential pill. If this row had a breach, the variance-shrinkage timeline shows attribution → patch → "Next 5 runs ↓ 73%". | "Predicted in dollars. Actual from the dealership system of record. Variance on both technical and economic dimensions. If either crosses tolerance, attribution fires. If attribution lands on the agent or the instructions, DIR ships a correction. Single-party signatures are structurally refused — not policy, code invariant." |
| 1:18 | **Zoomed** | Auto-navigates to /eai. The 30-day rolling time-series fills the screen. EAI is climbing. Three inflection markers — hover them. | "Scaled across the enterprise, this is what the board sees. Every point on this chart is signed by both parties. The three inflection points are where the system synthesized its own DIR rules from aggregated eval failures — `dir_brake_diag_hallucination_guard` after 17 TSB-citation misses, `dir_responsible_gaming_loss_streak` after 23 intervention misses, `dir_compliance_citation_density` after 11 regulatory undercitations. The agents are getting better. Signed." |
| 1:30 | **Done** | Toast: "Demo complete. Reset to replay." | (silence — let it land) |

---

## The deep-dive screens (optional, 3 minutes)

If Les wants to drill into anything, here's where.

### `/dir` — Dynamic Instructions

Show the **6 default rules** (left list) and the **synthesized rules panel** at the bottom. Three rules in different lifecycle states — *live*, *in_review*, *proposed* — each anchored to its source aggregate (e.g., "23 eval failures, last 30d"). Below: the 4-step DEODAG flywheel (Observe → Evaluate → Synthesize → Inject).

> "Every one of these synthesized rules came from a Tier-1 / Tier-2 / Tier-3 eval failure aggregate. AEOS interposes an explicit Evaluate stage between Observe and Decide — that's the DEODAG extension. Aggregated failures feed instruction synthesis. The system writes its own rules. Variance shrinks. Audit trail closes."

### `/skills` — Skills Authority

35 skills across 7 families. Strategic-weight ring (gold). Per-path success-rate chips. Drift indicator. Click any card → drawer with per-path performance breakdown.

> "Each skill carries its allowed paths, governance tags, strategic weight, and per-path performance. The Skills Authority is the contract between rPotential and the runtime layer. When a skill drifts, DIR coaches it. When a skill is strategic, the UEF biases hybrid."

### `/policy-packs` — Policy Packs

EU AI Act high-risk · GDPR · SOC 2. Click any pack → 5–8 rules with severity, when/require, fired-7d, denied-7d. Click a rule → drawer with the YAML excerpt.

> "Three packs at launch, fully data-driven. Compliance team hand-edits the YAML, the engine picks up the change at next load. No deploy required."

### `/ledger` — Predictive Economic Ledger

Filter by *breach only* and *has correction*. Click a row → drawer showing every section of the LedgerRow v2.3.

> "Append-only. Every row has predicted, actual, variance on both dimensions, attribution if breach, correction if attributable. This is the audit asset. Regulators take the bundle and verify offline against either party's public key."

### `/evidence` — Evidence Export

Pick a format (EU AI Act / WP.29 / GDPR / SOC 2), period, click Export. 1.8s skeleton, then the modal reveals both signatures side by side. 7-year compliance retention. Single-party verify shows ✓ for either side.

> "This is the artifact the auditor takes home. Two-party signed. Verifies offline. Single-party signatures are structurally impossible — neither FuzeBox nor rPotential can produce this asset alone. That's the moat."

---

## What if Les says "show me a different industry"?

Use the **Tenant switcher** in the sidebar:

- `kengarff_automotive` — the brake-diagnosis story (default).
- `vipsigma_sports_betting` — sportsbook + responsible gaming + venue ops. The synthesized rule `dir_responsible_gaming_loss_streak` lives here.
- `artgroup` — EU compliance shop. EU AI Act + GDPR-heavy. Shows the works-council briefing flow.
- `loop_tv` — venue ops + field service + capacity planning.

Every tenant has its own ledger (~95–145 rows), its own EAI trend, its own signed bundles. The narrative reproduces in any of them.

---

## What if Les pushes back on the self-improving claim?

Point him to **/dir** synthesized rules panel. Each card has a `source` line:

> "23 eval failures (vipsigma_sports_betting · last 30d) — Tier 3 human evaluator flagged intervention timing"

Then the DEODAG flywheel below makes the loop concrete:

1. **Observe** — every cross-vendor execution produces an ObservationEvent.
2. **Evaluate** — three-tier rubric (deterministic format → LLM-as-judge → human quality judgment) grades each output.
3. **Synthesize** — aggregated failures by skill × boundary × time window trigger a rule-generation pass.
4. **Inject** — the new rule passes governance review and ships into Layer 9; the next decision runs under the tighter rule set.

The variance-shrinkage timeline strip on any patched Decision Explorer view is the visual proof: *Original → Breach → Attribution → DIR Patch → Next 5 runs variance ↓73%.*

---

## What's mock vs what's real

**Real architecture, mock data.** The screens show the canonical data shapes from the AEOS specification: ObservationEvent (`obs.v1`), InstructionPatch (`dir.v1`), LedgerRow v2.3, evidence bundle manifest (`evb.v1`), ScoredPath with all 8 UEF dimensions, two-party SignaturePair. Every value comes from `lib/aeos/seed/*` — deterministic mulberry32 PRNG seeded with the AEOS reference seed (`20260420`). Every run produces identical output.

**Not real:**
- No LLM calls — the demo never hits Anthropic / OpenAI / Vertex.
- No database — all reads are synchronous from in-memory seed.
- No real auth — single-operator demo.
- No real vendor adapter — the cross-vendor patch translation is rendered from a canned per-vendor prefix.

**What is real today** (on the `main` branch): the production telemetry app at https://vipsigma.arkos.studio and the Quadrant mock at https://vipquadrant.arkos.studio, both on this same repo. AEOS is the third sibling. If Les approves the demo, the next step is the 6-week production build described in `docs/AEOS/Engineering_Instructions_PEL_v1.md`.

---

## Recovery — if anything misbehaves

- If a screen looks empty: tenant switcher is showing a tenant with no decisions for that screen. Switch to `kengarff_automotive`.
- If the orchestrator stalls: click **Reset** in the TopBar.
- If a route 404s: navigate to `/` and use the sidebar.
- If the build is broken: `npm install && rm -rf .next && npm run build`. The repo's package.json is shared with the production telemetry app, so keep `node_modules` in sync.

---

*Demo by Anand Padia. Branch: `aeos-mock`. Plan: `AEOS_Demo_plan.md`.*
