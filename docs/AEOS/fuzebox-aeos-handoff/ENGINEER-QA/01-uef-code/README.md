# UEF + GSTI + Coordination Tax — Source Pointers

The engineers asked for the Python code that implements the UEF
decision engine and the GSTI / Coordination Tax signals. All of it is
in the main handoff tarball:

**`../../fuzebox-aeos-FULL.tar.gz`**

## Files to read first

| Layer | File | Exports |
|---|---|---|
| L7 UEF entry point | `packages/uef/engine.py` | `universal_execution_function(task, skill, candidate_paths, actors, signals, governance) -> UEFResponse` |
| L7 eight-dim scoring | `packages/uef/scoring.py` | 8 pure functions: `score_capability_fit`, `score_gsti_value`, `score_uop_value`, `score_coordination_tax`, `score_governance`, `score_runtime_fit`, `score_economic_value`, `score_risk_penalty` |
| L6 rPotential signals | `packages/rpotential_adapter/mock.py` | `MockRPotentialAdapter.get_signals(tenant_id) -> WorkforceSignals` |
| L6 rPotential HTTP client | `packages/rpotential_adapter/http.py` | HTTP version (stdlib `urllib`, no `requests`) |
| Canonical types | `packages/shared/schema.py` | `Task`, `Skill`, `Actor`, `WorkforceSignals`, `ExecutionPath`, `UEFResponse`, `ScoredPath`, `LedgerRow` |

## The integration wrappers to write

The engineers asked about integration wrappers. The UEF call signature
the wrapper must target is:

```python
from packages.uef.engine import universal_execution_function
from packages.shared.schema import Task, Skill, ExecutionPath, GovernanceRequirement

response = universal_execution_function(
    task=Task(...),
    skill=Skill(...),
    candidate_paths=[ExecutionPath.HUMAN, ExecutionPath.ANTHROPIC, ...],
    actors=[Actor(...), ...],
    signals=rpotential.get_signals(tenant_id="acme_corp"),
    governance=GovernanceRequirement(...),
)
# response.selected_path is the chosen ExecutionPath
# response.scored_paths is the full eight-dimension breakdown
```

**rPotential signals are the bound-IP contract** — the integration
wrapper must fetch `signals` via the rPotential adapter interface, not
synthesize values locally. Three of the eight UEF dimensions
(`gsti_value`, `uop_value`, `coordination_tax`) depend on those
signals. If a wrapper zero-fills them, the scoring breaks in ways that
are hard to detect until the ledger shows suspicious EAI numbers.

## Scoring formula (from the Tech Spec §5)

```
total = capability_fit
      + gsti_value          ← rPotential signal
      + uop_value           ← rPotential signal
      − coordination_tax    ← rPotential signal
      + governance_score
      + runtime_fit
      + economic_value
      − risk_penalty
```

This formula **must not be collapsed, renamed, or reordered** — the
ledger and evidence bundles depend on the exact field names.

## Determinism

All scoring is a pure function of its inputs. `rng_seed=42` in
`build_runtime(...)` keeps the mock adapters and actor selection
deterministic for unit testing. Integration wrappers that inject
their own `actors` list should accept a seed parameter.
