# FuzeBox AEOS — MVP Reference Monorepo

The **Agentic Enterprise Operating System** (AEOS) is the 12-layer control
plane that sits **above** every AI runtime — Anthropic MCP, OpenAI AgentKit,
Salesforce Agentforce, Uniphore, Cloudflare, and human workforces — and
makes a single, governed, economically-measurable execution decision for
each unit of work.

This repository is the **runnable MVP** of the architecture described in
the FuzeBox AEOS Plan of Action and UEF Technical Spec v1.1. It is
intentionally zero-dependency for the end-to-end demo: the whole stack
runs on the Python standard library so the narrative works on any
reviewer's laptop without credentials or a network.

```
Task ─▶ [L1] Intent  ─▶ [L2] Policy  ─▶ [L3] Skills
                                          │
  [L6] rPotential signals ───────────────▶▼
                                        [L7] UEF ──▶ [L9] Dynamic Instruction Runtime
                                          │                    │
                                          ▼                    ▼
                                    [L8] Adapter Gateway ─▶ vendor runtime
                                          │
                                          ▼
                              [L10] Telemetry Normalizer
                                          │
                                          ▼
                              [L11] Economic Ledger (EAI)
                                          │
                                          ▼
                            [L12] Governance + 2-party attestation
```

## Why this project matters

Workforce intelligence must sit **above** the agent, not inside it.
Anthropic, OpenAI, Salesforce and Cloudflare each build the best possible
*runtime* for their stack. None of them models the cross-vendor,
cross-human, board-level question: **"given this task, which runtime
should execute it, which human should approve it, and what is the economic
and governance consequence?"** That is the AEOS control plane — and that
is what this monorepo implements.

## Layout

```
fuzebox-aeos/
├── packages/
│   ├── shared/              # canonical dataclasses (Task, Skill, Actor, ...)
│   ├── skills_authority/    # L3 Skills Authority (in-memory + JSON seed)
│   ├── rpotential_adapter/  # L6 rPotential capability graph (Mock + HTTP)
│   ├── uef/                 # L7 Universal Execution Function
│   ├── dynamic_instruction/ # L9 Dynamic Instruction Runtime (sidecar)
│   ├── adapter_gateway/     # L8 Adapter Gateway (Anthropic, OpenAI, SF, Uniphore, CF, Human)
│   ├── telemetry_normalizer/# L10 Canonical trace shape
│   ├── economic_ledger/     # L11 append-only ledger + UCS/SY/SER/EROI/SDD/HPI/HLR/EAI
│   └── governance/          # L12 policy packs + evidence export + 2-party attestation
├── services/                # FastAPI services (uef, ledger, governance, skills)
├── apps/
│   ├── _runtime.py          # shared runtime wiring
│   ├── kengarff_demo/       # Ken Garff South Jordan end-to-end demo
│   ├── conformance_suite/   # 8 canonical flows from Tech Spec v1.1 §19
│   └── sales_demo/          # stdlib HTTP dashboard
├── fixtures/                # skills.json, actors.json, signals.json
├── policies/                # eu_ai_act_high_risk, wp29, gdpr, auto_safety, gambling
├── docs/                    # ARCHITECTURE.md, COMPLIANCE.md, CONFORMANCE.md
└── CLAUDE.md                # paste-ready Claude Code prompts 0–15
```

## Quickstart

```bash
# 1. Run the Ken Garff brake-diagnosis demo end-to-end
python -m apps.kengarff_demo.main

# 2. Run the 8-flow conformance suite
python -m apps.conformance_suite.run_suite

# 3. Launch the sales-demo dashboard
python -m apps.sales_demo.server    # then open http://localhost:8080/
```

No pip installs required for the three commands above. Everything above
uses Python 3.10+ stdlib.

### Optional: enable live-mode adapters

```bash
pip install anthropic openai fastapi uvicorn pytest
export ANTHROPIC_API_KEY=sk-ant-...
export OPENAI_API_KEY=sk-...
```

The Anthropic and OpenAI adapters auto-detect their packages; every other
adapter has a mock-only path. To run the services under FastAPI:

```bash
uvicorn services.uef_service:app        --port 8007
uvicorn services.ledger_service:app     --port 8011
uvicorn services.governance_service:app --port 8012
uvicorn services.skills_service:app     --port 8003
```

## Key design decisions

- **Zero runtime deps for the demo.** `pip` is optional, not required.
  Mock adapters generate deterministic outcomes from Skills-Authority
  performance history.
- **Adapter isolation.** The UEF never sees vendor payloads — only
  canonical types. The gateway is the fanout point.
- **Eight-dimension scoring** preserved verbatim from the reference
  bridge: `capability_fit + gsti_value + uop_value − coordination_tax +
  governance_score + runtime_fit + economic_value − risk_penalty`.
- **rPotential is bound, not replaceable.** Three of the eight UEF
  dimensions (`gsti_value`, `uop_value`, `coordination_tax`) are owned
  by rPotential's labor graph. This is the joint IP moat.
- **Two-party HMAC attestation.** Every board-level metric (EAI, HPI,
  HLR) is signed with *both* a FuzeBox secret and an rPotential secret.
  Single-vendor signatures are not acceptable — regulators and boards
  demand a separation-of-duty trust model.
- **Policy packs are JSON**, not YAML, to keep the repo zero-dep.
- **L9 Dynamic Instruction Runtime** is a core design component, not a
  roadmap item (per AEOS Plan of Action Addendum 2).

## Commercial SKUs

AEOS ships as four SKUs: **UEF Core**, **Governance Edition**,
**Enterprise Autonomy Index**, and **Vertical Bundles** (Automotive,
Contact Center, Gaming). The SKU-to-package matrix lives in
[`fixtures/skus.json`](fixtures/skus.json) and can be printed with:

```bash
python -m scripts.list_skus
```

The SKU loader lives in `packages/sku/` — any sales tool that needs to
answer "which features ship with which bundle" should import from there.

## What to read next

- **`docs/ARCHITECTURE.md`** — the 12-layer spine, wired top to bottom.
- **`docs/COMPLIANCE.md`** — EU AI Act Article-12, WP.29, GDPR mapping.
- **`docs/CONFORMANCE.md`** — the eight canonical flows and what they prove.
- **`CLAUDE.md`** — paste-ready Claude Code prompts 0–15 to keep iterating
  on this codebase in Claude Code or any other agentic IDE.

---
© 2026 FuzeBox.AI — joint IP with rPotential. Reference implementation.
