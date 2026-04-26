# AEOS Mock Demo · `aeos-mock` branch

> **Production URL:** https://vipaeos.arkos.studio
> **Vercel project:** `agent-telemetry-aeos` (under `trigent-ark-os` team)
> **Production branch:** `aeos-mock` (this branch)
> **Status:** Demoable. All 7 AEOS routes content-complete. UI matches the main app's light theme + dark navy sidebar.

This branch is one of three parallel mocks living on the same git repo. Each mock has its own Vercel project and its own production URL — they coexist without touching each other.

| Branch | Vercel project | Production URL | What it is |
|---|---|---|---|
| `main` | `agent_telemetry` | https://vipsigma.arkos.studio | Production telemetry app — 41 routes, full DB-mode option, real auth. The "deep observability" surface. |
| `quadrant-mock` | `agent-telemetry-quadrant` | https://vipquadrant.arkos.studio | Quadrant mock — Sourcing-Agent-live slice for Les (per Apr-15 commitment). |
| **`aeos-mock`** | **`agent-telemetry-aeos`** | **https://vipaeos.arkos.studio** | **This branch.** Mock-only AEOS demo for Les — Cross-Vendor Observation, Predictive Economic Ledger, L9 DIR, Auto-Improvement workspace. |

Each project has its own "Production Branch" setting in Vercel. Pushes to one branch only deploy that branch's project. Local `.vercel/project.json` is per-developer-machine, gitignored.

---

## What this demo proves

AEOS = **Agent Economic Observation System** — the FuzeBox + rPotential joint-IP control plane that sits *above* every runtime vendor. The narrative answers three questions Les uses in every briefing, plus one selling utility built on top.

### The three load-bearing capabilities

1. **Cross-vendor observation** — every execution from any vendor (Anthropic, OpenAI, Bedrock, Azure OpenAI, Vertex, Salesforce Agentforce, Uniphore, Cloudflare Workers AI, CrewAI, etc.) produces the same `ObservationEvent` shape. Coverage gaps are explicit on a signed Coverage Manifest.

2. **Predictive Economic Ledger (PEL)** — every decision becomes a `LedgerRow v2.3` with five substructures: Predicted, Actual, Variance (technical *and* economic), Attribution (5-bucket), Correction (DIR patch object).

3. **Realtime injection on dual triggers** — if either technical or economic variance exceeds tolerance, attribution runs; if cause is `agent_capability` or `agent_instructions`, the L9 Dynamic Instruction Runtime fires a patch. Patches propagate cross-vendor.

The structural moat: every signed asset is **two-party signed** (FuzeBox ed25519 + rPotential HMAC-SHA256). Single-party signatures are structurally refused — code invariant, not policy.

### The selling utility — Auto-Improvement

The system continuously analyses the ledger for delta-improvement opportunities. Variance breaches, drift signals, and aggregated eval failures feed a hypothesis generator. Every recommendation has a projected impact (variance reduction $/wk, EAI delta, confidence). Humans approve before deployment via L9 DIR injection. Outcomes are measured against the next ledger window — confirmed, reverted, or rolled back automatically. The agent population improves over time on signed evidence; humans stay in control of every shipped change.

---

## What's present

### 7 AEOS routes — all content-complete

| Route | Purpose |
|---|---|
| `/` | **Mission Control** — hero metrics (EAI / HPI / HLR with two-party sig pill), Coverage Manifest (33 vendors across 4 layers), Live Decision Feed, Path Mix donut, Recent Variance Breaches |
| `/decisions/[id]` | **Decision Explorer** — 8-dim ScoredPathTable with the 3 rPotential-exclusive columns highlighted; **Score Computation panel** showing the line-by-line math sum; DIR Patch card; PolicyEvaluation; Cross-Vendor Patch translation (Anthropic / OpenAI / Vertex side-by-side); Ledger Row card; Variance-Shrinkage Timeline |
| `/eai` | **EAI Board** — signed 56px hero, 6 sub-metrics (UCS/SY/SER/EROI/HPI/HLR), **EAI Computation panel** showing the three-component formula evaluated against this tenant's actual values, 30-day rolling time-series with 3 inflection points where synthesized DIR rules fired (hover for source aggregate) |
| `/ledger` | **Predictive Economic Ledger** — top-of-page **LedgerRow v2.3 explainer** naming the 5 substructures (Predicted / Actual / Variance / Attribution / Correction); 80-row table with click-through drawer showing the full structure |
| `/policy-packs` | **Policy Packs** — EU AI Act high-risk (5 rules), GDPR (6), SOC 2 (8); rule table with severity, fired/denied 7d, YAML drawer |
| `/skills` | **Skills Authority** — 35-skill grid across 7 families with strategic-weight rings, drift indicators, drawer with per-path performance |
| `/evidence` | **Evidence Export** — form (format/period) + bundle queue; export triggers a 1.8s skeleton then a modal revealing both signatures side-by-side |
| `/dir` | **Auto-Improvement** — realised-impact summary row, 4 active recommendation cards with view-diff and approve/reject UX, 6-row improvement history with click-through outcome modal showing projected vs realised side-by-side, 7-step "How Auto-Improvement works" flow, live DIR rule set summary |

### Math made prominent

Three new panels surface the AEOS calculations explicitly so the formulas aren't buried in captions:

- **Score Computation · winner** (Decision Explorer) — line-by-line walkthrough of the 8 dimensions with rPotential columns pilled in cyan, summing to the winner's `total_score`.
- **EAI Computation** (EAI Board) — three component cards (A · AI execution quality, B · Human preservation lift, C · Risk drag) with operands stacked. Bottom callout shows the equation with this tenant's actual numbers: `EAI = A + B − C = 0.NNN`.
- **LedgerRow v2.3 · five substructures** (Ledger top) — five numbered cards naming Predicted / Actual / Variance / Attribution / Correction with the AEOS-canonical definitions inline.

### Tenant switcher

Sidebar dropdown swaps between four tenants — every screen reflows:

- `kengarff_automotive` (default) — brake-diagnosis story, 145 ledger rows
- `vipsigma_sports_betting` — sportsbook + responsible gaming, 120 rows
- `artgroup` — EU compliance shop, 95 rows
- `loop_tv` — venue ops + field service, 110 rows

### Mock data spine

All under `lib/aeos/`:

- `seed/tenants.ts` — 4 tenants
- `seed/skills.ts` — 35 skills across 7 families (auto_diag, auto_repair, cx_triage, events_ops, compliance, field_service, hr_people)
- `seed/actors.ts` — ~50 actors (40 humans + 8 agents — Claude Opus 4.7, Sonnet 4.6, GPT-4o, Gemini 2.5 Pro, Agentforce, Uniphore BAC, Cloudflare Workers AI)
- `seed/coverage-manifest.ts` — 33 vendors across 4 layers (hyperscaler / model_lab / agent_platform / tool_surface) with observed / gap / planned status
- `seed/dir-rules.ts` — 6 default rules from the reference Python impl + 3 mock-synthesized rules in different lifecycle states
- `seed/improvements.ts` — 4 active + 6 historical Auto-Improvement recommendations across all 4 tenants, each with source telemetry, proposed diff, projected impact, and (for history) measured outcome
- `seed/policy-packs.ts` — EU AI Act / GDPR / SOC 2 (lifted from `docs/AEOS/aeos-engineering-handoff/02_policy_templates/`)
- `seed/signals.ts` — GSTI × 35, drift × 35, UoP per actor, coordination_tax by task type
- `seed/ledger.ts` — 470 LedgerRow v2.3 records with engineered downward-trending variance
- `eai.ts` — full computation (UCS, SY, SER, EROI, HPI, HLR, EAI) + 30-day time-series with inflection tags
- `data.ts` — sync accessor surface
- `prng.ts` — deterministic mulberry32 (seed `20260420`)

Everything is reproducible. Same seed → identical output, every run.

### Companion docs (repo root)

| File | Purpose |
|---|---|
| `AEOS_Demo_plan.md` | Full planning doc — what was built, how it coexists with `main` and `quadrant-mock`, deployment notes |
| `AEOS_DEMO_SCRIPT.md` | Live-walkthrough talk-track for in-person briefings |
| `AEOS_VIDEO_SCRIPT.md` | Tight 6–8 min screen-recording script with per-section actions and shot list |

### Source documents

`docs/AEOS/` contains the reference materials Les and the FuzeBox team shared, including:

- The PEL engineering specification (`Engineering_Instructions_PEL_v1.md`)
- Comprehensive AEOS briefing & white papers (`main folder/`)
- The full engineering handoff bundle (`aeos-engineering-handoff/` — JSON schemas, YAML policy packs, seed JSON, dashboard wireframes)
- The reference Python monorepo (`fuzebox-aeos-handoff/_source_snapshot/`)
- AEOS PRD with Motion A/B/C (Paperclip / Vast.ai / Eval Harness)

---

## What's NOT in this demo

This is a **mock-only** branch. The following are intentionally out of scope:

- **No real LLM calls.** No API keys configured. Every "vendor response" comes from the seed.
- **No database.** All reads synchronous in-memory. The production app's Drizzle/Postgres setup is untouched.
- **No authentication.** Single-operator demo. The `(app)` group's NextAuth login screen is still reachable but not used by AEOS routes.
- **No real cron / ingestion.** Cron endpoints exist at `/api/cron/*` from `main` but are not exercised by AEOS.
- **No real Coverage Manifest signing.** The signatures are mock hex strings from the deterministic PRNG.
- **No real evaluation pipeline.** The 3-tier eval harness (Motion C) is *narrated* via the synthesized DIR rules and the Auto-Improvement flywheel illustration, not actually running.
- **No actual cross-vendor patch propagation.** The "translated patch for Anthropic / OpenAI / Vertex" panel renders three pre-canned prefixed strings. The shape is right; the dispatch is mocked.
- **No actual Auto-Improvement deployment.** Approve/Reject buttons are visual only — they don't push patches to a runtime. The data shown in the active and history sections is seeded.
- **No 90-second auto-play.** The earlier orchestrator (sidebar play button + timeline scrubber) was removed because it felt mockish. The platform now reads as an operator's console; you drive the demo manually.
- **No hosted Vercel `vercel.app` URL access.** Project SSO protection is on for `*.vercel.app` aliases (default for new Vercel projects). Use the custom domain **vipaeos.arkos.studio** which is public.

If Les approves the demo, the next step is the **6-week production build** described in `docs/AEOS/Engineering_Instructions_PEL_v1.md` — real adapters, real SoR connectors, real attribution engine, real cross-vendor patch translation, real Auto-Improvement deployment pipeline. That is a separate engagement.

---

## Coexistence with the other mocks

- **No edits to `main`.** Existing telemetry app still works. Existing routes (`/dashboard`, `/process/*`, `/agents/*`, `/governance/*`) still build and render on this branch.
- **All AEOS code is namespaced.** `app/(aeos)/*`, `components/aeos/*`, `lib/aeos/*`, `types/aeos.ts`. Removing this branch leaves zero AEOS artifacts on `main`.
- **Tailwind + globals.css.** Variant adds a `:root`-level alias block (`--aeos-*` aliases pointing at the existing main tokens) — no existing tokens overridden.
- **One destructive change** vs. `main`: `app/page.tsx` was deleted on this branch (it was a redirect → /dashboard). On the AEOS domain, `/` should be Mission Control. Other branches still have the redirect.
- **UI matches the main app.** Same dark navy sidebar (`#0f1117`), same blue rP badge logo, same `.card` style on white, same accent palette. The AEOS branch does NOT introduce a new design language.

---

## Local dev

```bash
git checkout aeos-mock
npm install      # if node_modules is stale
npm run dev      # http://localhost:3000
```

The home page IS the AEOS Mission Control. Tenant switcher is in the sidebar.

## Local production-build sanity-check

```bash
rm -rf .next && npm run build
```

Should succeed without env vars. AEOS routes are all `○ static`.

## Re-deploy

Local CLI (after `vercel link --yes --project agent-telemetry-aeos` if `.vercel/` is missing):

```bash
vercel --prod
```

OR push to GitHub — production branch is set to `aeos-mock`, auto-deploys.

---

## Branch hygiene

- `.gitignore` blocks `arkosdb_credentials.md`, all `*_credentials.md`, `achievement.md`, macOS `._*` resource forks, AEOS `.tar.gz` / `.zip` archives in `docs/AEOS/`, and parked Vercel linkages (`.vercel.*.bak`).
- The full source-of-truth reading is in `AEOS_Demo_plan.md` at the repo root.

---

*Maintained by Anand Padia. Branch cut from `main` HEAD `10fc398` on 2026-04-26.*
