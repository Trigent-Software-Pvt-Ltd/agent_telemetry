# Dashboard Data Contract

Every metric the React control plane might render, with the exact
backend function that produces it and the shape of its return.

## Real-time decision stream

| What | Source | Shape |
|---|---|---|
| Selected path | `UEFResponse.selected_path` | enum string |
| Confidence | `UEFResponse.confidence` | float 0..1 |
| Scored paths (full 8-dim breakdown) | `UEFResponse.scored_paths` | array of `ScoredPath.to_dict()` |
| Selected actor | `UEFResponse.selected_actor_id` | string or null |
| Skill plan | `UEFResponse.skill_plan` | array of `SkillPlanItem` |

## Ledger (L11) metrics

Every function below lives in `packages/economic_ledger/metrics.py`.
All take `rows: list[LedgerRow]` and return a float or a breakdown.

| Metric | Function | Return |
|---|---|---|
| Unit Cost of Skill | `compute_ucs(rows)` | float |
| Skill Yield | `compute_sy(rows)` | float 0..1 |
| Skill Efficiency Ratio | `compute_ser(rows)` | float |
| Execution ROI | `compute_eroi(rows)` | float |
| Skill Drift Delta | `compute_sdd(rows, split_at=None)` | float |
| Human Preservation Index | `compute_hpi(rows)` | float 0..1 |
| Hybrid Leverage Rate | `compute_hlr(rows)` | float |
| Enterprise Autonomy Index | `compute_eai(rows)` | `EAIBreakdown` (10 fields) |

`EAIBreakdown.to_dict()` ships:
```json
{
  "eai": 1.9091,
  "ai_adjusted_task_share": 1.0,
  "success_rate": 1.0,
  "governance_factor": 1.0,
  "economic_return_factor": 0.9091,
  "hybrid_execution_share": 1.0,
  "preservation_factor": 1.0,
  "control_failures": 0,
  "risk_penalties": 0.0,
  "row_count": 11
}
```

## Per-tenant query helpers

From `packages/economic_ledger/ledger.py`:

- `ledger.for_tenant(tenant_id, since=None, until=None, business_unit=None)` → `list[LedgerRow]`
- `ledger.for_skill(tenant_id, skill_id)` → `list[LedgerRow]`
- `ledger.rolling_window(tenant_id, days)` → `list[LedgerRow]` (added P6)
- `ledger.count()` → int

## L9 DIR intercept (per-execution)

Every row also has an `applied_patch` (from P5):
```json
{
  "additional_instructions": ["...string..."],
  "restricted_tools": ["raw_customer_lookup"],
  "required_tools": [],
  "required_citations": true,
  "require_human_confirmation": true,
  "rules_fired": ["dir_safety_relevant_confirmation", "dir_auto_safety_tool_lockdown"],
  "safety_envelope": "safety_relevant_v1"
}
```

## Policy evaluation result (per-execution)

```json
{
  "allow": true,
  "reasons": [],
  "required_controls": ["audit_log", "human_in_loop", "evidence_export", "explanation_interface"],
  "evidence_required": true
}
```

## Two-party attestation

`Attestation.to_dict()`:
```json
{
  "attestation_id": "att_1776559790062",
  "tenant_id": "...",
  "period": "2026-Q2",
  "metric_name": "EAI",
  "metric_value": 0.87,
  "fuzebox_signature": "707610699133cfcef5011919...",
  "rpotential_signature": "675d70bb204dcb9dd7258170...",
  "issued_at": 1776566419.44,
  "details": {...}
}
```

`SignedEvidenceBundle.to_dict()` is the same shape but wrapping the
full evidence bundle. Integrity hash is a SHA-256 hex string.

## WebSocket / stream friendly

Every dataclass has a `.to_dict()` method that returns a JSON-safe
structure — safe to push straight over a WebSocket frame.
