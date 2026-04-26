# Seed Data Schema Contract

Three JSON fixtures drive every tenant the AEOS control plane serves.
All three MUST be internally consistent — cross-references are resolved
at load time and will raise if anything dangles.

## `skills.json`

Array of `Skill` objects.

```json
{
  "skill_id": "skill_<domain>_<variant>_v<n>",
  "name": "Human-readable skill name",
  "allowed_paths": ["human", "anthropic_agent", "openai_agent", "..."],
  "required_tools": ["tool_name_1", "tool_name_2"],
  "governance_tags": ["safety_relevant", "strategic_skill", "gdpr_sensitive"],
  "strategic_weight": 0.65,
  "version": "3.0",
  "description": "What this skill does.",
  "performance": {
    "human":                  {"success_rate": 0.92, "avg_cost": 28.0, "avg_latency_ms": 1800000},
    "anthropic_agent":        {"success_rate": 0.71, "avg_cost":  0.80, "avg_latency_ms":   12000},
    "hybrid_anthropic_human": {"success_rate": 0.94, "avg_cost": 14.0, "avg_latency_ms":  720000}
  }
}
```

**Rules:**
- `allowed_paths` values MUST come from `ExecutionPath`:
  `human`, `anthropic_agent`, `openai_agent`, `salesforce_agent`,
  `uniphore_agent`, `cloudflare_agent`, `google_vertex_agent`,
  `hybrid_anthropic_human`, `hybrid_openai_human`.
- Every path in `allowed_paths` MUST have a matching entry in `performance`.
- `strategic_weight` ∈ [0.0, 1.0].
- `governance_tags` is free-form but **must match** the tags the L9
  DIR rules expect: `safety_relevant`, `strategic_skill`,
  `gdpr_sensitive`, `customer_facing`, `financial`, `regulated_gambling`,
  `regulatory`, `brand_safety`, `people_data`, `sla_sensitive`.

## `actors.json`

Object keyed by `tenant_id`, value is an array of `Actor` objects.

```json
{
  "tenant_id_here": [
    {
      "actor_id": "unique_actor_id",
      "actor_type": "human" | "agent",
      "provider": "human" | "anthropic" | "openai" | "salesforce" | "uniphore" | "cloudflare" | "google",
      "capabilities": ["skill_id_1", "skill_id_2"],
      "availability": 0.78,
      "fatigue": 0.12,
      "certifications": ["ASE_Master"]
    }
  ]
}
```

**Rules:**
- Every `capabilities` skill_id MUST exist in `skills.json`.
- `availability` and `fatigue` ∈ [0.0, 1.0].
- At least one human actor per tenant, or the UEF cannot score human /
  hybrid paths for that tenant.

## `signals.json`

Object keyed by `tenant_id`, value is rPotential signal bundle.

```json
{
  "tenant_id_here": {
    "tenant_id": "tenant_id_here",
    "gsti":             {"skill_id": 0.65},
    "skill_drift_risk": {"skill_id": 0.18},
    "uop_by_actor": {
      "actor_id": {"readiness": 0.78, "fatigue": 0.12, "capacity": 0.80}
    },
    "coordination_tax": {
      "default": 0.12,
      "flow_id_or_task_id": 0.15
    }
  }
}
```

**Rules:**
- Every skill_id in `gsti` and `skill_drift_risk` MUST exist in `skills.json`.
- Every actor_id in `uop_by_actor` MUST exist in that tenant's `actors.json` roster.
- `coordination_tax` keys: `"default"` is always consulted; flow-specific
  keys override when the task_id matches.
- All values ∈ [0.0, 1.0].

## Cross-file validation

```python
from apps._runtime import build_runtime
runtime = build_runtime()         # raises if the three files drift apart
```

The `build_runtime()` call is the fastest smoke test that the seed data
loads cleanly across all three files.
