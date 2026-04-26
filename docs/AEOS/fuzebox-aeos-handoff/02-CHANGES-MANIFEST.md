# Changes Manifest — 2026-04-18

## New files (13)

| Path | Purpose |
|---|---|
| `packages/adapter_gateway/google_vertex_adapter.py` | Google Vertex AI Agents adapter (mock + optional live). |
| `packages/sku/__init__.py` | SKU package entry. |
| `packages/sku/catalog.py` | `SKU` dataclass + in-code default catalog. |
| `packages/sku/loader.py` | Loader for `fixtures/skus.json`. |
| `fixtures/skus.json` | Commercial SKU definitions (6 SKUs). |
| `policies/aeos_governance_edition.json` | Policy pack declaring two-party attestation as critical. |
| `scripts/__init__.py` | Marker so `scripts/` is importable as a module. |
| `scripts/export_evidence.py` | CLI — emits a signed evidence bundle to stdout. |
| `scripts/list_skus.py` | CLI — prints SKU-to-package matrix. |
| `tests/test_dir.py` | Unit tests for the new `dir_people_data_pii_mask` rule. |
| `tests/test_ledger_persistence.py` | 10-row replay round-trip + EAI stability. |
| `tests/test_two_party_attestation.py` | 5 tests proving single-party signatures are refused. |
| `.github/workflows/conformance.yml` | CI gate — conformance + attestation sign + artifact. |

## Modified files (21)

| Path | Change |
|---|---|
| `packages/shared/schema.py` | `ExecutionPath.GOOGLE_VERTEX`; `AdapterResult.applied_patch`. |
| `packages/uef/engine.py` | Default model hint `gemini-2.5-pro`. |
| `packages/adapter_gateway/base.py` | `invoke(..., instruction_patch=None)` on abstract; `applied_patch` serialized. |
| `packages/adapter_gateway/gateway.py` | Thread `instruction_patch` through `dispatch` and `_dispatch_hybrid`. |
| `packages/adapter_gateway/anthropic_adapter.py` | Mock: honor restricted_tools + citation hint. Live: prepend `[L9 DIR]` lines to system prompt. |
| `packages/adapter_gateway/openai_adapter.py` | Same pattern as Anthropic adapter. |
| `packages/adapter_gateway/google_vertex_adapter.py` | (new; includes same pattern). |
| `packages/adapter_gateway/salesforce_adapter.py` | Accept patch kwarg; record rules_fired in trace. |
| `packages/adapter_gateway/uniphore_adapter.py` | Same. |
| `packages/adapter_gateway/cloudflare_adapter.py` | Same. |
| `packages/adapter_gateway/human_adapter.py` | Same; surfaces `dir_human_confirmation_required`. |
| `packages/dynamic_instruction/runtime.py` | New rule `dir_people_data_pii_mask` (gdpr_sensitive predicate). |
| `packages/governance/policy_engine.py` | Handle `governance.explainability_required`; emit `explanation_interface` control. |
| `packages/governance/evidence.py` | `SignedEvidenceBundle`, `SinglePartyAttestationRefused`, `sign_bundle`, `verify_bundle`; evidence record `explanation_interface`. |
| `packages/economic_ledger/ledger.py` | `replay_from_disk(path) -> int`; `rolling_window(tenant, days)`. |
| `fixtures/skills.json` | New `skill_claim_triage_v1`; GOOGLE_VERTEX added to field-dispatch. |
| `fixtures/actors.json` | Added `bigins_claims` tenant roster. |
| `fixtures/signals.json` | Added `bigins_claims` rPotential signals. |
| `policies/eu_ai_act_high_risk.json` | New rule `explainability_required_on_high_risk` (730-day retention). |
| `apps/_runtime.py` | Register Google Vertex adapter; pass `instruction_patch` into `gateway.dispatch`. |
| `apps/conformance_suite/flows.py` | 9th flow `insurance_claim_triage`. |
| `docs/COMPLIANCE.md` | Signed-bundle CLI section. |
| `docs/CONFORMANCE.md` | CI gate section. |
| `README.md` | SKU catalog pointer. |

## Not modified (still vanilla)

- `packages/uef/scoring.py` — eight-dimension contract untouched.
- `packages/rpotential_adapter/*` — rPotential remains bound-IP, not modified.
- `services/*` — FastAPI services untouched.
- `apps/sales_demo/*` — dashboard untouched (Prompt 13 deferred).
