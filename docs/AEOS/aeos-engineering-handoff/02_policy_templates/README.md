# 2. Policy Pack Templates (YAML)

These are the **authoritative YAML templates** for the three packs
required for the demo. The reference monorepo ships the JSON variants
for zero-dependency testing; production should use YAML because it
allows inline comments and is what the compliance team will hand-edit.

## Files in this folder

| File | Pack ID | Regulations covered |
|---|---|---|
| `eu_ai_act_high_risk.yaml` | `eu_ai_act_high_risk` | EU AI Act Annex III, Article 12 logging, Article 14 human oversight |
| `gdpr.yaml` | `gdpr` | GDPR Arts. 5, 6, 22, 25, 30, 32, 35 |
| `soc2.yaml` | `soc2_type2` | SOC 2 Type II — Security, Availability, Confidentiality Trust Service Criteria |
| `schema.yaml` | *(meta)* | JSON Schema for the policy pack format |

## Conceptual structure

Every pack is a list of **rules**. A rule has:

```yaml
id:          <string>                   # unique within the pack
severity:    critical | high | medium   # governance service enforcement tier
description: <string>
when:        <match predicate>          # the trigger
require:     <control map>              # what must be true
references:  [<citation strings>]       # human-readable regulation refs
```

The `when` predicate keys are:

- `always: true` — always fires
- `task.risk_level: [low|medium|high|critical]` — any-of match
- `task.regulatory_class: [<string>, ...]` — any-of match
- `task.tenant_region: [<string>, ...]` — region filter
- `skill.governance_tags: [<string>, ...]` — any-of match

The `require` keys are the control contract enforced by
`services/governance_service.py`:

- `path.human_involved: true` — selected path must include a human leg
- `governance.audit_log_required: true`
- `governance.trace_retention_days_min: <int>` — minimum retention
- `governance.evidence_export_required: true`
- `governance.human_override_available: true`
- `governance.explanation_interface: true` — Article 13/14 compliance
- `governance.dpia_required: true` — GDPR Article 35
- `governance.data_residency_required: [<region>, ...]` — EU-only, etc.
- `controls.encryption_at_rest: true`
- `controls.encryption_in_transit: true`
- `controls.access_review_cadence_days_max: <int>`

## How to validate a pack

```python
from packages.governance.policy_engine import PolicyEngine
from pathlib import Path

engine = PolicyEngine()
engine.load_directory(Path("./02_policy_templates"))  # supports both .json and .yaml
engine.validate("eu_ai_act_high_risk")                # raises on schema errors
```

The engine already accepts `.yaml` files when PyYAML is installed (the
code falls back to JSON when it isn't). Add `pyyaml>=6.0` to
`requirements.txt` for production.

## Versioning

Packs are versioned by calendar period (`2026.04`). Any rule change
bumps the pack version, and the **Evidence Bundle** records the pack
version active at decision time so audit trails are reproducible.
