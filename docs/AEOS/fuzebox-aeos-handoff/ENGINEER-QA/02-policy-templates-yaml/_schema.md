# Policy Pack Schema

Every policy pack (YAML or JSON — they're interchangeable once parsed)
has exactly four top-level fields plus a list of rules.

## Top level

| Field | Type | Required | Notes |
|---|---|---|---|
| `id` | string | yes | Must be unique; stored by `PolicyEngine` keyed on this. |
| `version` | string | yes | Calendar-versioned, e.g. `"2026.04"`. |
| `description` | string | yes | One-line human-readable summary. |
| `rules` | array | yes | Zero or more rule objects (below). |

## Rule object

| Field | Type | Required | Notes |
|---|---|---|---|
| `id` | string | yes | Unique within the pack. |
| `severity` | enum | yes | `low` \| `medium` \| `high` \| `critical`. **Only `critical` flips `decision.allow = False`** when violated. |
| `when` | object | yes | Match predicate (see below). |
| `require` | object | yes | Required assertion (see below). |

## `when` predicates

```yaml
when:
  always: true                              # fires on every evaluation
  # OR
  task.risk_level: [high, critical]         # any of these risk levels
  task.regulatory_class: [auto_safety, gambling]
```

## `require` assertions

Supported today:

| Key | Type | Effect |
|---|---|---|
| `path.human_involved` | bool | Selected path must be HUMAN or a hybrid. |
| `governance.audit_log_required` | bool | `GovernanceRequirement.audit_log_required` must be true. |
| `governance.evidence_export_required` | bool | Same field must be true. |
| `governance.human_override_available` | bool | Same field must be true. |
| `governance.trace_retention_days_min` | int | `GovernanceRequirement.trace_retention_days` must meet or exceed. |
| `governance.explainability_required` | bool | Explainability flag / high-risk policy pack must be set. (Added in P3.) |

## Required-controls mapping

When a rule matches, its `require` keys are translated into a flat
list of `required_controls` strings on the decision. Mapping:

| `require` key | Control string |
|---|---|
| `path.human_involved` | `human_in_loop` |
| `governance.audit_log_required` | `audit_log` |
| `governance.evidence_export_required` | `evidence_export` |
| `governance.human_override_available` | `human_override` |
| `governance.explainability_required` | `explanation_interface` |

Adding a new control string is a four-line change to `_required_controls`
in `packages/governance/policy_engine.py`.

## Parser note

The current policy engine uses `json.loads` to parse packs — same
shape, smaller deps. To load YAML directly, swap that single line for
`yaml.safe_load(...)` and `pip install pyyaml`. The rest of the
`PolicyEngine` is parser-agnostic.
