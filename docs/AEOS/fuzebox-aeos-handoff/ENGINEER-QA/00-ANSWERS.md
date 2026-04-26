# FuzeBox AEOS — Answers to Engineering Questions

Six questions came back from the engineering team. This package
answers five of them with concrete artifacts; the sixth (bundle
delivery target) needs a product call from Les before we lock it.

---

## Q1 — GSTI & Coordination Tax Code

> "Since the demo will integrate your existing Python logic for the UEF
> decision engine, could you share the repository containing that code?"

**Answer:** Yes — it's already in the main handoff package.

- **File:** `../fuzebox-aeos-FULL.tar.gz` (one directory up from this one)
- **UEF entry point:** `packages/uef/engine.py` — `universal_execution_function(...)`
- **Eight-dimension scoring:** `packages/uef/scoring.py`
- **GSTI / UOP / Coordination Tax are sourced exclusively from:** `packages/rpotential_adapter/`

**Hard contract the engineers must respect:** three of the eight UEF
dimensions (`gsti_value`, `uop_value`, `coordination_tax`) are
**rPotential-owned** bound IP. Adapters and integrations must **never**
recompute them from elsewhere — always fetch from the rPotential
adapter via `get_signals(tenant_id=...)`. This is documented in the
`CLAUDE.md` repo invariants (#3) and in `docs/ARCHITECTURE.md`.

Pointer file in this folder: `01-uef-code/README.md`.

---

## Q2 — Policy Pack Templates (EU AI Act / GDPR / SOC2)

> "Could you provide the specific YAML templates for the EU AI Act,
> GDPR, and SOC2?"

**Answer:** Two clarifications, then the deliverables:

1. **We ship JSON, not YAML** — the zero-dep invariant. PyYAML would
   break `python -m apps.kengarff_demo.main` on a bare Python install.
   If the Governance Service accepts either format, we recommend JSON.
2. **We didn't have a SOC2 pack yet** — so I wrote one as part of
   answering this question. It maps to Trust Services Criteria (CC6,
   CC7, CC8 families).

**Delivered in `02-policy-templates-yaml/`:**
- `eu_ai_act_high_risk.yaml` — Annex-III high-risk systems, now with
  2-year retention + explainability rule (the P3 hardening landed).
- `gdpr.yaml` — 180-day retention, audit log, human override.
- `soc2.yaml` — **NEW**. CC-series control mapping.
- `wp29.yaml` — automotive companion (not in the ask, included because
  the demo narrative touches it).
- `aeos_governance_edition.yaml` — the two-party attestation pack.
- `gambling_responsible.yaml` — responsible-play envelope.
- `auto_safety_standard.yaml` — hybrid or human-in-loop for auto.
- `_schema.md` — the field-by-field spec the policy engine consumes.

**The authoritative JSON sources** (what the engine actually loads) are
at `policies/*.json` in the main repo; these YAML files are intended as
human-readable templates for governance authors. If the engineering
team wants to load YAML directly, `packages/governance/policy_engine.py`
has a single `_json.loads` call that can be swapped for a YAML parser
in four lines.

---

## Q3 — Demo Seed Data (40 skills, 200 actors)

> "The demo specifies 40 skills and 200 actors. If you have the specific
> JSON seed files ready for the demo tenant, please send them over..."

**Answer:** Honest status — **we currently have 11 skills across 8
tenants and ~27 actors.** The 40/200 target for the public demo has
not been authored yet; that's a Les + domain-SME exercise, not an
engineering one.

**What I'm delivering here so the engineers aren't blocked:**

- `03-seed-data/current/` — the real, validated, 9/9-passing fixtures
  (`skills.json`, `actors.json`, `signals.json`). These are what drive
  the conformance suite today.
- `03-seed-data/scaled-placeholder/` — a generator script
  (`generate_demo_fixtures.py`) that expands the current set to 40
  skills / 200 actors / 8 tenants of **structurally-valid placeholder
  data** for integration testing. Names are synthetic (`demo_skill_012`,
  `demo_actor_0177`). Les must replace them with real domain content
  before any customer-facing demo — but the engineers can wire up the
  database schema, UI list views, and performance-at-scale testing
  against the placeholder set immediately.
- `03-seed-data/schema-contract.md` — the field-level contract every
  seed file must satisfy.

**What's needed from Les before the public demo:** real skill names,
real actor role titles per tenant, real GSTI / drift values per skill.
I can't fabricate those — they're domain-specific and would misrepresent
the product.

---

## Q4 — Dashboard Design

> "Since we'll be building out the React control plane, do you have any
> existing wireframes or design assets we should follow?"

**Answer:** No wireframes or Figma files exist yet — **that's a gap I
can't fill for you.** What I can provide is the data contract the
dashboard needs to render, plus a suggested panel inventory derived
from what the ledger and UEF already compute.

**Delivered in `04-dashboard/`:**
- `data-contract.md` — every metric the dashboard can display, with
  the exact Python function that produces it and its return type.
- `suggested-panels.md` — a 10-panel inventory ordered by narrative
  importance for a board-level demo. Each panel names its data source.
- `api-endpoints.md` — the four FastAPI services (`uef_service`,
  `ledger_service`, `governance_service`, `skills_service`) and the
  endpoints the React app should hit. Some of these are stubs today
  and are noted as such.
- `narrative-flow.md` — the 90-second story the dashboard should tell
  ("one task → one decision → one ledger row → one signed attestation").

**What Les needs to decide:** brand palette, typography, whether to
use an existing design system (shadcn, Tailwind, Material) or a custom
look. Recommend: get a designer on a 2-hour call with the React lead
and sketch straight off `suggested-panels.md`.

---

## Q5 — Instruction Runtime Format

> "Could you clarify the exact JSON payload format the Instruction
> Runtime should use to inject constraints into the vendor prompts?"

**Answer:** Fully specified — this is already implemented, it just
wasn't written up as a spec doc.

**Delivered in `05-instruction-runtime-spec/`:**
- `instruction-patch-schema.json` — JSON Schema for `InstructionPatch.to_dict()`.
- `example-payloads.json` — six real examples (one per built-in DIR
  rule: safety, auto-safety, gambling, drift, fatigue, GDPR-PII-mask).
- `integration-contract.md` — exactly how adapters consume the patch,
  with the Anthropic, OpenAI, and Google Vertex wiring pattern from
  the current codebase (Prompt 5 implementation).

**Short form of the contract:** every adapter's `invoke(...)` takes a
keyword-only `instruction_patch: dict | None`. The adapter must (a)
prepend `additional_instructions` to its system prompt with a `[L9 DIR]`
tag, (b) filter `skill.required_tools` through `restricted_tools`, (c)
suffix output with a citation marker when `required_citations == true`,
(d) surface `rules_fired` in its trace, and (e) echo the patch back in
`AdapterResult.applied_patch` so the ledger can record what the vendor
actually saw. All five are unit-testable and are already exercised by
the 9/9 conformance suite.

---

## Q6 — Evidence Bundle Delivery

> "Could you confirm the exact target destination for the final
> cryptographically signed Evidence Bundle (e.g., a direct UI download
> link or a specific cloud bucket)?"

**Answer — this one needs a product decision from Les.** It's not a
technical question; it's a deployment and customer-workflow question.
I can't answer it unilaterally, but I've written up the three viable
options with the implementation work each one implies.

**Delivered in `06-evidence-delivery/`:**
- `delivery-options.md` — three options (UI download, customer S3 bucket,
  regulator-submission API) with pros / cons / effort estimates.
- `current-behavior.md` — what `scripts/export_evidence.py` does today
  (writes signed JSON to stdout).
- `recommendation.md` — my suggested approach: **ship all three, but
  default the demo to UI download.** Explanation inside.

**Les: please pick one before the demo.** If you can't decide by end
of week, the engineers should implement the UI-download path first
since it's the demo-safest and the other two can be added without
rework.

---

## Summary for the engineering reply

Short version for the email back to the team:

> Q1 ✅ — full repo in `fuzebox-aeos-FULL.tar.gz`, UEF at
> `packages/uef/engine.py`, rPotential signals at
> `packages/rpotential_adapter/`.
>
> Q2 ✅ — six YAML policy templates in `02-policy-templates-yaml/`,
> including a new SOC2 pack. Authoritative source is still the JSON
> under `policies/` — YAML is for governance authors.
>
> Q3 ⚠ — 11 skills / 27 actors today; 40/200 target not yet authored.
> Placeholder generator included so you're not blocked; real content
> coming from Les.
>
> Q4 ⚠ — no wireframes exist. Data contract, panel inventory, and API
> endpoint list provided so you can scaffold against real shapes.
> Designer needed.
>
> Q5 ✅ — full JSON Schema + six example payloads + adapter integration
> contract in `05-instruction-runtime-spec/`.
>
> Q6 ⏸ — pending product decision from Les. Three options documented.
> Default to UI download if no decision by end of week.
