# FuzeBox AEOS — Build Status, 2026-04-18

## Bottom line

The reference implementation is up and green across the board:

- **Conformance suite:** 9/9 (was 8/8 at baseline — added 9th flow for
  insurance claim triage).
- **Unit tests:** 13/13 passing across ledger persistence, L9 DIR rules,
  and two-party attestation.
- **End-to-end demo:** `python3 -m apps.kengarff_demo.main` runs clean
  with zero pip installs.

Every one of the ten work items in the plan landed. Below is what each
delivered and what it unlocks commercially.

## What was built

| # | Item | What it unlocks |
|---|---|---|
| 1 | **Google Vertex execution path.** New enum value, adapter (mock + live), model hint `gemini-2.5-pro`. Field-dispatch skill now allows it. | Vendor-neutrality story now covers five AI runtimes: Anthropic, OpenAI, Salesforce, Uniphore, Cloudflare, **Google**. |
| 2 | **Ninth conformance flow — insurance claim triage.** New tenant `bigins_claims`, skill `skill_claim_triage_v1`, full fixture set. | Direct reference for any insurance / FinServ sales motion. |
| 3 | **EU AI Act policy hardening.** Explainability rule fires on high/critical risk, requires 730-day retention, adds `explanation_interface` control + evidence field. | Article-12 defense tightens from "365-day log" to "2-year explainable trace." |
| 4 | **New L9 DIR rule — `dir_people_data_pii_mask`.** Fires on `gdpr_sensitive` skills. Masks PII, restricts `raw_customer_lookup`, requires human confirmation. | Demonstrable GDPR enforcement at the instruction layer, not just policy docs. |
| 5 | **L9 instruction patch threaded through every adapter.** `AdapterResult.applied_patch`, adapters accept `instruction_patch=` kwarg, live Anthropic/OpenAI/Google prepend `[L9 DIR]` to system prompt. | L9 is now mechanically proven (not just designed) to run before every vendor call. |
| 6 | **Economic Ledger durable persistence.** `replay_from_disk(path)`, `rolling_window(tenant, days)`, round-trip test. | Ledger can survive a restart and still produce identical EAI. That's the production-readiness gate. |
| 10 | **Signed evidence bundles + CLI.** `AttestationSigner.sign_bundle()` emits a `SignedEvidenceBundle`; new `scripts/export_evidence.py` CLI. | Regulators can verify a bundle offline with two independent signatures. |
| Mid | **`two_party_attestation_required` policy + refusal.** `SinglePartyAttestationRefused` raised whenever either HMAC leg is missing, enforced by policy pack `aeos_governance_edition`. Five-test proof. | This is the contractual lever for the joint-IP story with rPotential. Single-vendor attestation is structurally blocked. |
| 14 | **CI conformance gate.** `.github/workflows/conformance.yml` runs the suite on every PR, runs attestation tests, signs a build EAI attestation, uploads it as an artifact. | Merges cannot break the 9/9 contract. Every release has a signed attestation object. |
| 15 | **Commercial SKU catalog.** `packages/sku/` with `uef_core`, `governance_edition`, `enterprise_autonomy_index`, and three vertical bundles (Automotive / Contact Center / Gaming). `scripts/list_skus.py` prints a sales-engineer-ready matrix. | Sales finally has a single source of truth for "what ships with what." |

## Invariants held

- Adapter isolation — no vendor type ever crosses into the UEF.
- Demo path stays zero-dep — stdlib only.
- rPotential owns GSTI / UOP / Coordination Tax exclusively.
- Eight-dimension UEF scoring contract is unchanged.
- L9 runs before every adapter invocation (now mechanically, not only
  as documentation).
- Ledger is append-only.

## What's next (not in this drop)

- Prompts 7, 8, 9, 11, 12, 13 from `CLAUDE.md` are still open — real
  OpenAI live path, real rPotential HTTP client with retries, per-tenant
  telemetry sink, Skills Authority as a service, chaos testing, and the
  board dashboard. These are the logical follow-on for either TRIGENT
  or TRIGMA to pick up once the handoff is acknowledged.
- Production: replace HMAC with ECDSA-P256 + AWS KMS on both signer legs.

---

Source lives under `fuzebox-aeos/`. Everything is Python 3.10+ stdlib
unless the partner chooses to enable live mode (`pip install anthropic
openai google-cloud-aiplatform`).
