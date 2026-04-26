# 3. Demo Seed Data

Deterministic seed for the engineering demo tenant.

## Contents

| File | Purpose |
|---|---|
| `skills.json` | **40 skills** across 7 families (automotive diagnosis, automotive repair, CX triage, venue ops, compliance, field service, HR coaching) with per-path performance histories ready for EMA updates. |
| `actors.json` | **200 actors** for tenant `aeos_demo_enterprise` — 180 humans (technicians, CX agents, venue operators, compliance leads, field techs, HR leads) + 20 shared agents (Anthropic, OpenAI, Salesforce, Uniphore, Cloudflare). |
| `signals.json` | Tenant-scoped workforce signals bundle: GSTI per skill, drift risk per skill, UOP per actor, Coordination Tax per task type. |
| `index.json` | Quick-lookup index: counts and skill-ids-by-family for UI filtering. |
| `_generate.py` | Deterministic regenerator (seed = `20260420`). Re-run to reproduce byte-for-byte. |

## Tenant

```
aeos_demo_enterprise
```

Use this as `tenant_id` everywhere in the demo. It is intentionally
generic so the engineering team can rename per customer at demo time
without touching the seed structure.

## Schemas

The JSON shapes match `packages/shared/schema.py` exactly — no adapter
layer required.

### Skill (skills.json)
```jsonc
{
  "skill_id": "skill_auto_diag_01",
  "name": "Automotive Diagnosis — Brake",
  "allowed_paths": ["human","anthropic_agent","openai_agent","hybrid_anthropic_human","hybrid_openai_human"],
  "required_tools": ["dtc_reader","oem_bulletin_lookup"],
  "governance_tags": ["safety_relevant","strategic_skill"],
  "strategic_weight": 0.68,
  "version": "1.0",
  "description": "...",
  "performance": {
    "human":                   {"success_rate": 0.90, "avg_cost": 27.0, "avg_latency_ms": 1680000},
    "anthropic_agent":         {"success_rate": 0.71, "avg_cost": 0.82, "avg_latency_ms": 11500},
    "hybrid_anthropic_human":  {"success_rate": 0.93, "avg_cost": 13.2, "avg_latency_ms": 720000}
    /* ... */
  }
}
```

### Actor (actors.json)
```jsonc
{
  "aeos_demo_enterprise": [
    {
      "actor_id": "h_technician_001",
      "actor_type": "human",
      "provider": "human",
      "capabilities": ["skill_auto_diag_03","skill_auto_diag_05","skill_auto_repair_02"],
      "availability": 0.78,
      "fatigue": 0.12,
      "certifications": ["ASE_Master","Hybrid_Safety"],
      "metadata": {"display_name":"Alex Kim","role":"technician","region":"US-West"}
    }
    /* ...199 more... */
  ]
}
```

Note: `display_name`, `role`, and `region` live under `metadata` so the
payload matches the existing `Actor` dataclass without schema changes.
Engineering can rename `metadata` fields freely; nothing inside the
UEF engine reads them.

### Signals (signals.json)
```jsonc
{
  "aeos_demo_enterprise": {
    "tenant_id": "aeos_demo_enterprise",
    "gsti":              { "skill_auto_diag_01": 0.68, /* ...40... */ },
    "skill_drift_risk":  { "skill_auto_diag_01": 0.18, /* ...40... */ },
    "uop_by_actor":      { "h_technician_001": {"readiness":0.85,"fatigue":0.12,"capacity":0.72} /* ...200... */ },
    "coordination_tax":  { "default": 0.12, "service_bay_diagnosis": 0.15, /* ... */ }
  }
}
```

## Validation

These files load cleanly through:

```python
from packages.skills_authority.authority import SkillsAuthority
from packages.rpotential_adapter.mock import MockRPotentialAdapter

auth = SkillsAuthority()
auth.load_from_file("03_seed_data/skills.json")         # → 40 skills

rp = MockRPotentialAdapter(fixture_path="03_seed_data/signals.json")
sig = rp.get_signals(tenant_id="aeos_demo_enterprise")  # → 40 gsti, 200 uop
```

Zero orphan-capability actors (every `capabilities` entry resolves to
a real skill).

## Regenerating

```bash
python _generate.py
```

Deterministic — same output every run on the same Python version. Bump
the seed constant at the top of the file if you want a new distribution.

## Loading into a database

The JSON structure maps 1:1 to a relational schema:

| JSON | Suggested table |
|---|---|
| `skills.json[*]` | `skills(skill_id PK, name, strategic_weight, ...)` + `skill_allowed_paths` + `skill_performance` |
| `actors.json[tenant][*]` | `actors(actor_id PK, tenant_id FK, actor_type, provider, availability, fatigue)` + `actor_capabilities(actor_id FK, skill_id FK)` |
| `signals.json[tenant]` | `workforce_signals(tenant_id PK, gsti JSONB, drift JSONB, uop JSONB, coord_tax JSONB)` or normalize further |

Engineering can choose Postgres JSONB for fast bring-up or fully
normalized schema for analytics. Either way the fixture loader is the
truth source.
