# TRIGENT — Engineering / Runtime Track

## Scope

You own the **runtime plane**: adapters, the conformance harness, the
ledger, CI, and the commercial SKU catalog. Everything in this bundle
either ships a new runtime capability or hardens the execution pipeline.

## What's in this bundle

| Prompt | Item | Files |
|---|---|---|
| **P1** | Google Vertex execution path | `packages/adapter_gateway/google_vertex_adapter.py`, `packages/shared/schema.py`, `packages/uef/engine.py`, `fixtures/skills.json`, `apps/_runtime.py` |
| **P2** | 9th conformance flow — insurance claim triage | `apps/conformance_suite/flows.py`, `fixtures/skills.json`, `fixtures/actors.json`, `fixtures/signals.json` |
| **P5** | L9 instruction patch threaded through every adapter | `packages/adapter_gateway/*.py`, `packages/shared/schema.py`, `apps/_runtime.py` |
| **P6** | Economic Ledger durable replay | `packages/economic_ledger/ledger.py`, `tests/test_ledger_persistence.py` |
| **P14** | CI conformance gate | `.github/workflows/conformance.yml`, `docs/CONFORMANCE.md` |
| **P15** | Commercial SKU catalog | `packages/sku/`, `fixtures/skus.json`, `scripts/list_skus.py`, `README.md` |

## What's NOT in this bundle (stays with TRIGMA)

- Policy pack edits (`policies/*.json` — except `aeos_governance_edition.json` is in TRIGMA's bundle)
- `packages/dynamic_instruction/runtime.py` new rule
- `packages/governance/evidence.py` sign_bundle changes
- `packages/governance/policy_engine.py` explainability rule
- `tests/test_two_party_attestation.py`, `tests/test_dir.py`

## How to run

```bash
tar xzf TRIGENT-bundle.tar.gz
cd fuzebox-aeos
python3 -m apps.conformance_suite.run_suite    # 9/9
python3 -m apps.kengarff_demo.main             # DEMO COMPLETE
python3 -m pytest tests/test_ledger_persistence.py tests/test_smoke.py -v
python3 -m scripts.list_skus
```

## Suggested next pickups for TRIGENT

From `CLAUDE.md` there are six open prompts that map naturally to your
track:

- **Prompt 7** — OpenAI AgentKit live path (real Responses API call +
  tool binding).
- **Prompt 8** — Real rPotential HTTP client: retries + 60s signal
  cache + OpenTelemetry-style log envelope.
- **Prompt 9** — Per-tenant telemetry sink: `StdoutTraceSink`,
  `FileTraceSink`, `KafkaTraceSink` stub.
- **Prompt 11** — Skills Authority as a service (uvicorn + remote
  client), plus docker-compose for the four FastAPI services.
- **Prompt 12** — Chaos testing the UEF (mutate performance & UOP,
  100× each flow, assert invariants).
- **Prompt 13** — Board EAI/HPI/HLR dashboard in `apps/sales_demo/`.

Each of those is self-contained — no dependency between them, so you
can parallelize.

## Invariants you must not break

1. Adapter isolation: no vendor type escapes upward.
2. Zero runtime deps for the demo path.
3. rPotential owns GSTI/UOP/Coordination Tax exclusively.
4. Eight-dimension UEF scoring contract is fixed.
5. L9 runs before every adapter invocation.
6. Ledger is append-only.

If you need to violate any of these, flag it and stop — don't route
around.
