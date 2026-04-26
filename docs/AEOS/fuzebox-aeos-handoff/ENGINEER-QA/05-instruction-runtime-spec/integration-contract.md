# Adapter Integration Contract — How to Consume an InstructionPatch

Every runtime adapter takes the patch as a keyword-only argument and
applies it to the vendor invocation. The contract has five obligations
— all five are already exercised by the 9/9 conformance suite.

## Adapter signature

```python
def invoke(
    self,
    *,
    task: Task,
    skill: Skill,
    plan_item: SkillPlanItem,
    instruction_patch: Optional[dict[str, Any]] = None,
) -> AdapterResult:
    ...
```

The patch dict conforms to `instruction-patch-schema.json`.

## Five obligations

### 1. Prepend `additional_instructions` to the system prompt

```python
patch = instruction_patch or {}
dir_prefix = "".join(
    f"[L9 DIR] {line}\n" for line in patch.get("additional_instructions", [])
)
sys_prompt = f"{dir_prefix}You are an AEOS-governed agent executing skill ..."
```

The `[L9 DIR]` marker is **mandatory** so the vendor log can be audited
for which instructions actually reached the model.

### 2. Filter `skill.required_tools` through `restricted_tools`

```python
restricted = set(patch.get("restricted_tools", []))
tool_names = [t for t in skill.required_tools if t not in restricted]
```

The adapter MUST NOT call a restricted tool even if the vendor SDK
would accept it.

### 3. Enforce `required_citations`

Mock adapters suffix a citation marker to prove the wiring. Live
adapters must instruct the vendor to cite sources — exact mechanism is
vendor-specific (Anthropic: system prompt directive; OpenAI: tool use
for citations; Google Vertex: grounding configuration).

### 4. Surface `rules_fired` in the adapter trace

```python
trace["dir_rules_fired"] = list(patch.get("rules_fired", []))
```

This is how the ledger row audits which L9 rules applied to a given
execution.

### 5. Echo the patch back in `AdapterResult.applied_patch`

```python
return AdapterResult(
    ...,
    applied_patch=patch or None,
)
```

The ledger stores this field verbatim. Evidence bundles include it in
per-row records.

## Reference implementations

See these files in the main repo for the canonical patterns:

- **Anthropic (with live path):** `packages/adapter_gateway/anthropic_adapter.py`
- **OpenAI (with live path):** `packages/adapter_gateway/openai_adapter.py`
- **Google Vertex (with live path):** `packages/adapter_gateway/google_vertex_adapter.py`
- **Mock-only adapters:** `salesforce_adapter.py`, `uniphore_adapter.py`, `cloudflare_adapter.py`
- **Human adapter:** `human_adapter.py` — surfaces `dir_human_confirmation_required` in trace.

## Hybrid dispatch

For `HYBRID_ANTHROPIC_HUMAN` / `HYBRID_OPENAI_HUMAN`, the gateway calls
both the agent adapter and the human adapter. **Both receive the same
patch** — the human leg uses `require_human_confirmation` to gate on
an explicit approval.

See `_dispatch_hybrid(...)` in `packages/adapter_gateway/gateway.py`.

## Multiple rules merging

When more than one DIR rule fires, their patches are merged additively:

- `additional_instructions` concatenate (order preserved).
- `restricted_tools` and `required_tools` union.
- `required_citations` and `require_human_confirmation` are ORs.
- `rules_fired` concatenates (for audit traceability).
- `safety_envelope` is "last-writer-wins" — rules are evaluated in
  registration order, so register the most specific rule last.

See `InstructionPatch.merge(...)` in `packages/dynamic_instruction/runtime.py`.

## Extending with a new rule

A tenant-specific rule:

```python
from packages.dynamic_instruction.runtime import (
    DynamicInstructionRuntime, InstructionRule, InstructionPatch, RuntimeTrigger
)
from packages.shared.schema import RiskLevel

runtime = DynamicInstructionRuntime()
runtime.load_default_rules()

runtime.register_rule(InstructionRule(
    rule_id="dir_acme_export_control",
    trigger=RuntimeTrigger.PRE_INPUT,
    patch=InstructionPatch(
        additional_instructions=["Never disclose part numbers matching ACME-ITAR-*."],
        rules_fired=[],  # filled in at intercept time
    ),
    description="ACME tenant: ITAR export-control masking.",
    predicate=lambda ctx: ctx["task"].tenant_id == "acme_defense",
))
```

No other changes needed — the adapter contract is invariant across rules.
