# CLAUDE.md — Claude Code Prompts for FuzeBox AEOS

This file is the **paste-ready playbook** for driving Claude Code (or any
agentic IDE) against this monorepo. Each prompt is self-contained: it
tells Claude the repo layout, the design constraints, and the exact file
paths to modify. Feed prompts in sequence, or cherry-pick.

> **Working directory**: `fuzebox-aeos/` — all paths in these prompts are
> relative to the monorepo root. Python 3.10+.

## Repo invariants Claude must respect

1. **Adapter isolation.** The UEF never sees vendor types. Every adapter
   takes canonical `Task`/`Skill`/`SkillPlanItem` and returns canonical
   `AdapterResult`.
2. **Zero runtime deps for the demo path.** `python -m apps.kengarff_demo.main`
   must work without `pip install`. Live-mode adapters may use optional
   pip packages inside `try/except`.
3. **rPotential is bound IP.** GSTI, UOP, and Coordination Tax come
   exclusively from `packages.rpotential_adapter`. Do not compute them
   from elsewhere.
4. **Eight-dimension UEF scoring is the contract.** Don't collapse
   dimensions, don't rename — downstream ledger rows and evidence
   bundles depend on the exact fields.
5. **L9 is core IP, not optional.** Every adapter invocation should
   consult `DynamicInstructionRuntime.intercept(...)` before sending
   payload to the vendor.
6. **Ledger is append-only.** Never mutate existing rows. Add new rows.

---

## Prompt 0 — Orient Claude to the codebase

```
You are working inside the `fuzebox-aeos/` Python monorepo. It implements
the FuzeBox Agentic Enterprise Operating System (AEOS) as a 12-layer
control plane above AI runtimes (Anthropic, OpenAI, Salesforce, Uniphore,
Cloudflare) and human workforces.

Before changing anything, read these files:
  - README.md
  - docs/ARCHITECTURE.md
  - docs/COMPLIANCE.md
  - docs/CONFORMANCE.md
  - packages/shared/schema.py
  - packages/uef/engine.py
  - apps/_runtime.py
  - apps/conformance_suite/flows.py

Then run:
  python -m apps.kengarff_demo.main
  python -m apps.conformance_suite.run_suite

Verify both exit 0 and the suite reports 8/8 passed. Summarize the
layer-to-package mapping and list any invariants you noticed. Do not
change code in this step.
```

## Prompt 1 — Add a new execution path

```
Add a new ExecutionPath called GOOGLE_VERTEX that represents Google
Vertex AI Agents. Keep adapter isolation — Claude should create a new
adapter `packages/adapter_gateway/google_vertex_adapter.py` that mirrors
the structure of `anthropic_adapter.py`, including:

  - mock-mode via `simulate_from_skill_performance`
  - optional live-mode behind `try/except ImportError`
  - `provider = "google"`, `handled_paths = (ExecutionPath.GOOGLE_VERTEX,)`

Also:
  - Add `GOOGLE_VERTEX = "google_vertex_agent"` to ExecutionPath.
  - Register the adapter in `apps/_runtime.py` `build_runtime()`.
  - Add a model hint `"gemini-2.5-pro"` to the default map in the UEF
    engine.
  - Add a new fixture skill that allows GOOGLE_VERTEX so at least one
    flow can pick it.

Run the conformance suite and confirm all flows still pass.
```

## Prompt 2 — Add a new conformance flow

```
Add a ninth conformance flow `insurance_claim_triage` to
`apps/conformance_suite/flows.py`:

  - Tenant: `bigins_claims`
  - Skill: new `skill_claim_triage_v1` with allowed paths
    [HUMAN, OPENAI, ANTHROPIC, HYBRID_OPENAI_HUMAN]
  - Regulatory class: `general`
  - Policy pack: `gdpr`
  - Risk: MEDIUM
  - Expect policy.allow = True

Add fixture rows in `fixtures/skills.json`, `fixtures/actors.json`,
and `fixtures/signals.json` for the new tenant and skill. Append the
flow factory to `ALL_FLOWS` and run the suite. All 9 flows must pass.
```

## Prompt 3 — Extend a policy pack

```
Tighten `policies/eu_ai_act_high_risk.json`:

  - Add a rule `explainability_required_on_high_risk` that fires on
    `task.risk_level in [high, critical]` and requires
    `governance.trace_retention_days_min: 730` (2 years).
  - Add a control `explanation_interface` to the required_controls set.

Then update `packages/governance/policy_engine.py` `_rule_satisfied` if
needed to support `governance.explainability_required`. Add an evidence
exporter field for explanation interface. Re-run the conformance suite.
```

## Prompt 4 — Add a new L9 Dynamic Instruction rule

```
Add a rule `dir_people_data_pii_mask` to
`DynamicInstructionRuntime.load_default_rules()` that fires when the
skill's governance_tags include `"gdpr_sensitive"`. The patch must:

  - Add an instruction: "Before sending any name, address, email, or
    phone number to the model, replace it with <PII_MASK_N>."
  - Restrict tool: `raw_customer_lookup`
  - Require human confirmation: True

Add a unit test under `tests/test_dir.py` that constructs an HR coaching
task (gdpr_sensitive) and asserts the rule fires.
```

## Prompt 5 — Wire L9 patches into the adapter invocation

```
Currently `apps/_runtime.py` computes the DIR patch but the adapters do
not see it. Thread the patch through:

  - Extend `AdapterResult` with an optional `applied_patch: dict | None`.
  - Add an `instruction_patch` kwarg to `RuntimeAdapter.invoke(...)`.
  - In `_invoke_mock`, incorporate patch into the output stub when
    `patch["required_citations"]` is True.
  - In the live path of the Anthropic adapter, prepend
    `patch["additional_instructions"]` to the system prompt.

Update the gateway's `dispatch` and `_dispatch_hybrid` to pass the
patch. Run the conformance suite.
```

## Prompt 6 — Economic Ledger persistence

```
Implement durable persistence for the Economic Ledger:

  - `EconomicLedger(persist_path=Path("./ledger.jsonl"))` already has
    the plumbing. Add a new method `replay_from_disk(path) -> int` that
    recomputes in-memory state from the JSONL file.
  - Add a tenant-scoped query method `rolling_window(tenant_id, days)`.
  - Write a pytest that appends 10 rows, closes the ledger, opens a new
    ledger pointed at the same file, calls `replay_from_disk`, and
    confirms `count() == 10` and `compute_eai(rows)` is identical.
```

## Prompt 7 — Add a real OpenAI AgentKit live path

```
Currently `packages/adapter_gateway/openai_adapter.py` has a stub live
path. Implement it properly:

  - Use the `openai` Python package behind `try/except ImportError`.
  - Call `client.responses.create(model=self.default_model, input=...)`
    with the skill's `required_tools` mapped to OpenAI tool definitions.
  - Parse tool_calls from the response and append to `tool_calls` list.
  - Stream-safe: if you enable `stream=True`, collect chunks before
    returning the canonical AdapterResult.

Keep the mock path as the default. Add an env-gated pytest
`tests/test_openai_live.py` that skips when `OPENAI_API_KEY` is unset.
```

## Prompt 8 — Build a real HTTP rPotential client

```
`packages/rpotential_adapter/http.py` already uses urllib. Upgrade it:

  - Add retry with exponential backoff (stdlib only, no tenacity).
  - Cache `get_signals` results for 60 seconds per (tenant_id, skill tuple).
  - Emit an OpenTelemetry-compatible span envelope in the log prefix
    (but do NOT add a dependency; just the prefix).
  - Ensure the Mock and HTTP adapters share the same abstract contract
    (both satisfy `RPotentialAdapter`). Add tests in
    `tests/test_rpotential.py` that exercise both via a parametrized
    fixture.
```

## Prompt 9 — Telemetry sink per tenant

```
Extend `packages/telemetry_normalizer/normalizer.py` with a sink
abstraction:

  - `TraceSink(ABC)` with `emit(trace: CanonicalTrace)`.
  - `StdoutTraceSink`, `FileTraceSink(path)`, `KafkaTraceSink(topic)`
    (stub). The Kafka stub logs to stderr instead.
  - `TelemetryNormalizer(sink=...)` accepts a sink and calls
    `sink.emit(trace)` inside `normalize(...)`.
  - Update `apps/_runtime.py` to wire a `FileTraceSink` to
    `./traces.jsonl` in the demo build.
```

## Prompt 10 — Evidence bundle signing

```
Currently `EvidenceExporter.export(...)` returns a bundle with an
integrity hash but no signatures. Extend:

  - Add `AttestationSigner.sign_bundle(bundle) -> SignedEvidenceBundle`
    that signs the `integrity_hash` with both FuzeBox and rPotential
    secrets.
  - The CLI in `scripts/export_evidence.py` (new file) accepts
    `--tenant`, `--format`, `--period-start`, `--period-end` and writes
    a `SignedEvidenceBundle` JSON to stdout.
  - Document the CLI in `docs/COMPLIANCE.md`.
```

## Prompt 11 — Skills Authority as a service

```
Move the Skills Authority to a running service:

  - `services/skills_service.py` already exists. Add uvicorn-compatible
    startup config.
  - Add `packages/skills_authority/remote_client.py` that implements
    the same interface as `SkillsAuthority` but calls the HTTP service.
  - In `apps/_runtime.py` add a flag `skills_mode: "local" | "remote"`.
    When `remote`, build a `RemoteSkillsAuthority` instead.
  - Add a README snippet under `services/README.md` showing how to run
    all four services with docker-compose.
```

## Prompt 12 — Chaos testing the UEF

```
Add `tests/test_uef_chaos.py`:

  - Randomly mutate skill performance histories within ±20%.
  - Randomly mutate actor UOP within ±30%.
  - Run each of the 8 conformance flows 100 times and assert:
    * selected_path is always in the candidate set
    * policy.allow stays true for flows that expect allow
    * DIR rules fire when the signals cross threshold
    * ledger row always serializes and re-parses cleanly
  - Fail loudly if any invariant breaks.
```

## Prompt 13 — Board-level EAI/HPI/HLR dashboard

```
Upgrade `apps/sales_demo/server.py`:

  - Add a second panel rendering a time-series of EAI over 30 virtual
    days. Use in-memory simulation — each virtual day runs the Ken Garff
    flow 50 times and appends to the ledger.
  - Add an `/api/metrics/timeseries/{tenant_id}` endpoint that returns
    `[{day_offset, eai, hpi, hlr}]`.
  - Use only stdlib + inline SVG for the chart.
  - Add a prompt-13 screenshot under `docs/screenshots/prompt_13.png`
    (Claude can describe it; no need to actually generate).
```

## Prompt 14 — Conformance suite coverage gate

```
Make the conformance suite the CI gate:

  - Add `.github/workflows/conformance.yml` that runs
    `python -m apps.conformance_suite.run_suite` on pull requests.
  - Gate merges on 8/8 pass.
  - Add a required signed-off EAI attestation step: the workflow must
    call `signer.sign(...)` with the CI secret (fake for now, real in
    prod) and upload the attestation as a build artifact.
  - Document this in `docs/CONFORMANCE.md`.
```

## Prompt 15 — Vendor bundle SKUs

```
The AEOS has four SKUs: UEF Core, Governance Edition, Enterprise Autonomy
Index, and Vertical Bundles (Automotive, Contact Center, Gaming).
Create `packages/sku/` with:

  - `sku/catalog.py` — dataclass SKU(id, name, included_packages, pricing)
  - `sku/loader.py` — loads SKU definitions from `fixtures/skus.json`
  - A CLI `scripts/list_skus.py` that prints an SKU-to-package matrix
    so a sales engineer can show which features ship with which bundle.

Add a section in the README pointing at the matrix.
```

---

## How to use this file

1. Open Claude Code in the repo root.
2. Paste the prompt matching the task (start with Prompt 0 on a fresh
   clone).
3. Let Claude read, propose a diff, and apply. Every prompt ends with
   "run the conformance suite" — enforce it.
4. When a prompt is finished, commit the diff with message
   `prompt-N: <short description>`.

**Always** run `python -m apps.conformance_suite.run_suite` before
declaring a prompt complete. If 8/8 fails, revert.
