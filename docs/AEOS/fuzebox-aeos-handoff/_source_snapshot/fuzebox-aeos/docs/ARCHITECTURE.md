# AEOS Architecture — the 12-layer spine

AEOS is an **operating system for agentic enterprises**. Its job is to
sit above every AI runtime and the human workforce, and produce one
governed decision per task: *which runtime + which human + which policy
envelope*. This document walks the layers top to bottom.

## Layer map

| # | Layer | Package | Responsibility |
|---|---|---|---|
| L1 | Intent Capture | `packages.shared.schema.Task` | Canonical task object from UI, API, or event stream. |
| L2 | Policy & Regulatory | `packages.governance.policy_engine` | Tenant- and region-specific policy packs (EU AI Act, WP.29, GDPR, ...). |
| L3 | Skills Authority | `packages.skills_authority.authority` | Executable skill objects with allowed paths + performance history. |
| L4 | Plan Builder | *(inside UEF)* | Expands a task into a skill plan before scoring. Trivial for single-skill flows. |
| L5 | Experience Memory | *(future)* | Per-tenant outcome history. Currently folded into Skills Authority EMA. |
| L6 | Live Signal Bus | `packages.rpotential_adapter` | rPotential's labor graph: GSTI, UOP, Coordination Tax. |
| **L7** | **Universal Execution Function** | `packages.uef.engine` | **The control-plane decision.** Eight-dimension scoring over candidate paths. |
| L8 | Adapter Gateway | `packages.adapter_gateway` | Dispatches to vendor adapters. Adapter isolation rule applies. |
| L9 | Dynamic Instruction Runtime | `packages.dynamic_instruction` | Sidecar that injects instructions, tool locks, safety envelopes. |
| L10 | Telemetry Normalizer | `packages.telemetry_normalizer` | Vendor traces → canonical trace events. |
| L11 | Economic Ledger | `packages.economic_ledger` | Append-only ledger; UCS, SY, SER, EROI, SDD, HPI, HLR, **EAI**. |
| L12 | Governance | `packages.governance` | Policy evaluation, evidence export, two-party attestation. |

## Adapter isolation rule

**The UEF never sees vendor types.** Every adapter in
`packages/adapter_gateway/` takes canonical `Task`, `Skill`, and
`SkillPlanItem` and returns a canonical `AdapterResult`. If you're
writing a new adapter and you feel the urge to leak an Anthropic
`Message` or an OpenAI `AssistantResponse` upward into the UEF or the
ledger — stop. Normalize.

## Eight-dimension scoring (L7)

```
total = capability_fit                         # Skills Authority fit
      + gsti_value                             # rPotential strategic weight + drift
      + uop_value                              # best human readiness − fatigue
      − coordination_tax                       # rPotential handoff cost
      + governance_score                       # policy pack + risk + explainability
      + runtime_fit                            # latency & cost budget fit
      + economic_value                         # cost/value leverage
      − risk_penalty                           # regulatory / safety penalties
```

Three of the eight dimensions (`gsti_value`, `uop_value`,
`coordination_tax`) are sourced exclusively from rPotential's labor
graph. This is the contractual **bound-IP** surface: replacing
rPotential would require rebuilding a multi-year skills-telemetry
corpus.

## The L6 → L7 → L11 loop

```
rPotential.get_signals(tenant_id)             [L6]
        │
        ▼
universal_execution_function(task, skill,     [L7]
        candidate_paths, actors, signals,
        governance) → UEFResponse
        │
        ▼
AdapterGateway.dispatch(task, skill, plan)    [L8]
        │
        ▼
TelemetryNormalizer.normalize(result)         [L10]
        │
        ▼
ledger.append(LedgerRow(eai_contribution=...)) [L11]
        │
        ▼
Skills Authority .apply_performance_update()  [L3]
rPotential.writeback(WritebackEvent)          [L6]
```

Every execution feeds the next decision. That closes the loop: Skills
Authority performance drifts toward reality, and rPotential's labor
graph learns which routing decisions actually preserved the skill.

## L9 — Dynamic Instruction Runtime

L9 is the sidecar that runs beside every adapter invocation. It reads:

- the canonical context (task, skill, chosen path, phase),
- live telemetry (drift risk, fatigue, recent error rate),

…and returns an **InstructionPatch** — additional prompt instructions,
tool restrictions, required citations, safety envelopes. Adapters apply
the patch before sending payload to the vendor.

The repo ships five default rules:

- `dir_safety_relevant_confirmation` (fires on HIGH/CRITICAL risk)
- `dir_auto_safety_tool_lockdown` (fires on `regulatory_class=auto_safety`)
- `dir_gambling_responsible_play` (fires on `regulatory_class=gambling`)
- `dir_drift_coaching` (fires when `skill_drift_risk > 0.30`)
- `dir_fatigue_handoff` (fires when `actor_fatigue > 0.55`)

Custom rules are registered via `runtime.register_rule(InstructionRule(...))`
and they compose additively.

## L12 — two-party attestation

The `AttestationSigner` holds two HMAC-SHA256 secrets: one FuzeBox,
one rPotential. Every board-level metric (EAI, HPI, HLR) is signed with
both. Verification requires both signatures. This is the deliberate
separation-of-duty that makes the Enterprise Autonomy Index credible
to regulators and audit committees.

Production deployment: replace HMAC with ECDSA-P256, keys held in AWS
KMS per tenant. The signer interface stays the same.

## Packaging

```
packages/  ─▶ zero-dep libraries
services/  ─▶ FastAPI wrappers (optional install)
apps/      ─▶ demos + conformance suite (stdlib only)
fixtures/  ─▶ JSON seed data
policies/  ─▶ JSON policy packs
```
