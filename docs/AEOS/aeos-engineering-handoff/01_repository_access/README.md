# 1. GSTI & Coordination Tax Code — Repository Access

The working UEF decision engine — including the GSTI, UOP, and
Coordination Tax scoring logic — lives in the `fuzebox-aeos/` reference
monorepo that was delivered with the FuzeBox AEOS MVP package. A copy
of that monorepo is included inside this handoff under
`../fuzebox-aeos/` (same tree as previously sent).

## Where the three rPotential signals are computed

All three dimensions are sourced **exclusively** from the rPotential
adapter. The UEF engine never recomputes them — it only consumes.

| Signal | Source file | Function |
|---|---|---|
| **GSTI value** (strategic skill preservation + drift) | `packages/uef/scoring.py` | `score_gsti_value(skill, signals, path)` |
| **UOP value** (best human readiness − fatigue) | `packages/uef/scoring.py` | `score_uop_value(skill, actors, signals, path)` |
| **Coordination Tax** (handoff cost) | `packages/uef/scoring.py` | `score_coordination_tax(task, signals, path)` |

The signals themselves come from:

| Adapter | File | Class |
|---|---|---|
| Mock (fixture-backed) | `packages/rpotential_adapter/mock.py` | `MockRPotentialAdapter` |
| HTTP (live rPotential API) | `packages/rpotential_adapter/http.py` | `HTTPRPotentialAdapter` |
| Abstract base | `packages/rpotential_adapter/base.py` | `RPotentialAdapter` |

## Orchestration

These three functions — plus the other five scoring dimensions — are
combined inside:

```
packages/uef/engine.py  →  universal_execution_function(...)
```

which returns a `UEFResponse` containing the ordered `scored_paths`,
selected actor, skill plan, and governance requirements. The
integration wrappers the engineering team needs to build should take
the same inputs (`Task`, `Skill`, `candidate_paths`, `actors`,
`signals`, `governance`) and either:

1. **In-process**: call `universal_execution_function(...)` directly, or
2. **Over HTTP**: `POST /v1/uef/decide` against `services/uef_service.py`

Both paths are stable and already wired in the MVP.

## Canonical types the wrapper must speak

From `packages/shared/schema.py`:

```python
WorkforceSignals(
  tenant_id: str,
  gsti: dict[skill_id, float],              # strategic weight [0..1]
  skill_drift_risk: dict[skill_id, float],  # drift [0..1]
  uop_by_actor: dict[actor_id, {
      "readiness": float,   # [0..1]
      "fatigue":   float,   # [0..1]
      "capacity":  float,   # [0..1]
  }],
  coordination_tax: dict[task_type | "default", float],  # [0..1]
)
```

The HTTP adapter expects rPotential's live API to return this exact
shape on `GET /v1/signals/{tenant_id}`. If the production rPotential
API uses different field names, the engineering wrapper should adapt
them here and only here — nothing upstream in the UEF or downstream in
the ledger needs to change.

## Integration-wrapper checklist

- [ ] Clone or vendor `fuzebox-aeos/` into the product repo.
- [ ] Decide in-process vs HTTP (recommend HTTP behind a feature flag
      so the demo can toggle to mock for air-gapped preview).
- [ ] Implement a `ProductionRPotentialAdapter` that subclasses
      `RPotentialAdapter` and calls the real rPotential endpoints.
- [ ] Wire it into `apps/_runtime.py` `build_runtime()` via a
      constructor parameter, keeping the mock as the fallback when
      `RPOTENTIAL_BASE_URL` is unset.
- [ ] Run `python -m apps.conformance_suite.run_suite` against the
      production adapter — all 8 canonical flows must continue to pass.

## Contact

If the engineering team needs a specific git remote, a signed CLA-
protected repo mirror, or deploy keys, request them via the FuzeBox
engineering ticket queue. The reference monorepo ships as source, not
as a binary — read it, adapt it, don't rewrite it. The eight-dimension
scoring contract is load-bearing.
