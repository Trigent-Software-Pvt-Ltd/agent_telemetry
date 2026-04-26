# 5. Dynamic Instruction Runtime — JSON Injection Contract

This document pins down the exact JSON shape the L9 Dynamic Instruction
Runtime emits and the exact way adapters must consume it before sending
payload to a vendor runtime.

There are **three** payloads in play:

1. **Context request** — adapter → DIR.
2. **InstructionPatch** — DIR → adapter.
3. **Vendor prompt assembly** — how the adapter merges the patch into
   the outgoing request for each vendor (Anthropic, OpenAI, etc.).

All three are versioned together under `contract_version`.

Current contract version: **`dir.v1`**

## Files in this folder

| File | Purpose |
|---|---|
| `context_request.schema.json` | JSON Schema for the adapter → DIR request |
| `instruction_patch.schema.json` | JSON Schema for the DIR → adapter response |
| `samples/*.json` | Ten canonical examples covering the default rule set |
| `adapter_merge_guide.md` | Per-vendor guide: how to merge the patch into Anthropic / OpenAI / SF / Uniphore / Cloudflare prompts |

## 1. Context request (adapter → DIR)

Sent by the adapter on every invocation, at any of the four lifecycle
phases. The DIR runs the rules and returns an InstructionPatch.

```json
{
  "contract_version": "dir.v1",
  "phase": "pre_input",
  "decision_id": "dec_01HX8KF2Q3MDE5WG3ABCD",
  "execution_id": "exe_01HX8KF2Q3MDE5WG3NOPQ",
  "tenant_id": "aeos_demo_enterprise",
  "task": {
    "task_id": "task_kg_001",
    "task_type": "diagnostic",
    "risk_level": "high",
    "regulatory_class": "auto_safety",
    "complexity": 0.65,
    "latency_budget_ms": 900000,
    "cost_budget_usd": 40.0,
    "explainability_required": true,
    "human_signoff_required": true
  },
  "skill": {
    "skill_id": "skill_auto_diag_01",
    "governance_tags": ["safety_relevant", "strategic_skill"],
    "strategic_weight": 0.68
  },
  "selected_path": "hybrid_anthropic_human",
  "signals": {
    "skill_drift_risk": 0.18,
    "actor_fatigue": 0.12,
    "coordination_tax": 0.15,
    "recent_error_rate": 0.04
  }
}
```

### Lifecycle phases
- `pre_input` — before the prompt is sent to the vendor (most common)
- `mid_toolcall` — between a tool call and the tool's response
- `post_output` — after the final vendor output, before writeback
- `on_signal` — triggered asynchronously by a signal spike (e.g. fatigue)

## 2. InstructionPatch (DIR → adapter)

```json
{
  "contract_version": "dir.v1",
  "phase": "pre_input",
  "decision_id": "dec_01HX8KF2Q3MDE5WG3ABCD",
  "execution_id": "exe_01HX8KF2Q3MDE5WG3NOPQ",
  "issued_at": "2026-04-20T12:41:18.432Z",
  "rules_fired": [
    "dir_safety_relevant_confirmation",
    "dir_auto_safety_tool_lockdown"
  ],
  "additional_instructions": [
    "This task is safety-relevant. Cite manufacturer service bulletins for every recommendation and flag any action requiring human sign-off before execution."
  ],
  "restricted_tools": [
    "clear_dtc_without_root_cause",
    "ota_push_untested"
  ],
  "required_tools": [],
  "required_citations": true,
  "require_human_confirmation": true,
  "safety_envelope": "safety_relevant_v1",
  "metadata": {
    "pack_id": "auto_safety_standard",
    "ttl_seconds": 3600
  }
}
```

### Field contract

| Field | Type | Meaning | Default when absent |
|---|---|---|---|
| `contract_version` | string | Must equal `dir.v1`. Mismatches → adapter must fail closed. | — |
| `phase` | enum | One of `pre_input`, `mid_toolcall`, `post_output`, `on_signal`. | — |
| `decision_id`, `execution_id` | string | ULIDs / UUIDs; echo the context request values. | — |
| `issued_at` | RFC3339 | UTC timestamp of patch creation. | current time |
| `rules_fired` | string[] | Stable rule IDs that matched. Order is deterministic (registration order). | `[]` |
| `additional_instructions` | string[] | Plain-text instructions to prepend/append to the system prompt. Each entry is an atomic constraint — do not split mid-sentence. | `[]` |
| `restricted_tools` | string[] | Tool names the adapter MUST filter out of the tool list before calling the vendor. | `[]` |
| `required_tools` | string[] | Tool names that must be present. Adapter adds them if missing. | `[]` |
| `required_citations` | bool | If true, adapter must instruct the model to emit machine-parseable citations and must verify at least one citation in the response. | `false` |
| `require_human_confirmation` | bool | If true, the flow is agent-then-human; adapter routes to hybrid regardless of caller intent. | `false` |
| `safety_envelope` | string \| null | Named safety policy version. Used by the Evidence Exporter to record which envelope applied. | `null` |
| `metadata` | object | Free-form. Current keys: `pack_id` (governance pack that triggered the rule), `ttl_seconds` (DIR patch cache hint). | `{}` |

### Merge rules when multiple rules fire
- `additional_instructions` → concatenated in rule-firing order, deduped on exact string match.
- `restricted_tools` / `required_tools` → set-union.
- `required_citations` / `require_human_confirmation` → logical OR.
- `safety_envelope` → last non-null wins (later rules override earlier ones; registration order is therefore meaningful).

### Failure semantics
- DIR service unavailable → adapter **must fail closed**: refuse to call
  vendor until DIR responds. Do not fall back to "no patch".
- Malformed JSON → fail closed and emit a governance alert.
- `contract_version` mismatch → fail closed; roll back to a compatible
  adapter.

## 3. Adapter-side merge (how patches enter the prompt)

See `adapter_merge_guide.md` for per-vendor merge rules. In summary:

| Vendor | `additional_instructions` goes to… | Tool filtering |
|---|---|---|
| Anthropic Messages API | prepended to `system` | remove from `tools[]` before calling `messages.create` |
| OpenAI Responses / AgentKit | prepended to `instructions` | remove from `tools[]` before calling `responses.create` |
| Salesforce Agentforce | injected into the Topic's prompt template | tool allowlist on the Agent config |
| Uniphore BAC | prepended to the conversational system prompt | tool allowlist |
| Cloudflare Workers AI | prepended to the system message | tool allowlist |

`required_citations` adds a structured-output schema requirement; the
adapter must parse and verify.

`require_human_confirmation` forces the path to a hybrid route if the
caller asked for a pure-agent path. The Adapter Gateway handles the
detour transparently.

## Versioning and deprecation

- New fields are additive under `dir.v1`.
- Breaking changes bump to `dir.v2`; both versions run in parallel for
  one quarter; adapters log which version they negotiated.
- `contract_version` is the canonical negotiator; do not gate on
  deployment tags or service version numbers.
