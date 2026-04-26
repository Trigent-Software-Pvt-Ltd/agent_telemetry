# TRIGMA — Governance / Attestation Track

## Scope

You own the **trust plane**: policy packs, the L9 Dynamic Instruction
Runtime, the evidence export pipeline, and the joint FuzeBox + rPotential
two-party attestation. Everything in this bundle hardens the regulator-
facing surface of AEOS.

## What's in this bundle

| Prompt | Item | Files |
|---|---|---|
| **P3** | EU AI Act policy hardening — explainability + 2-year retention | `policies/eu_ai_act_high_risk.json`, `packages/governance/policy_engine.py`, `packages/governance/evidence.py` |
| **P4** | New L9 DIR rule — `dir_people_data_pii_mask` | `packages/dynamic_instruction/runtime.py`, `tests/test_dir.py` |
| **P10** | Signed evidence bundles + CLI | `packages/governance/evidence.py`, `scripts/export_evidence.py`, `docs/COMPLIANCE.md` |
| **Mid** | `two_party_attestation_required` policy + refusal | `policies/aeos_governance_edition.json`, `packages/governance/evidence.py`, `tests/test_two_party_attestation.py` |

## What's NOT in this bundle (stays with TRIGENT)

- New Google Vertex adapter
- L9→adapter patch *threading* plumbing (the mechanism — you own the
  rules; TRIGENT owns the wiring)
- Ledger durable replay
- CI workflow
- SKU catalog
- 9th conformance flow

## How to run

```bash
tar xzf TRIGMA-bundle.tar.gz
cd fuzebox-aeos
python3 -m apps.conformance_suite.run_suite    # 9/9
python3 -m pytest tests/test_dir.py tests/test_two_party_attestation.py tests/test_smoke.py -v

# Signed evidence bundle — this is your hero demo for regulators:
python3 -m scripts.export_evidence \
    --tenant kengarff_south_jordan \
    --format eu_ai_act_article_12 \
    --period-start 2026-01-01 \
    --period-end 2026-12-31
```

## The contractual IP in here

Three artifacts in this bundle are the **joint-IP defensibility argument**
with rPotential:

1. **`policies/aeos_governance_edition.json`** — makes two-party
   attestation a critical-severity policy requirement, not a nice-to-have.
2. **`AttestationSigner.sign_bundle()`** raising
   `SinglePartyAttestationRefused` when either HMAC leg is missing.
   Structurally blocks any attempt to emit a single-vendor signature.
3. **`tests/test_two_party_attestation.py`** — five tests that make the
   refusal behavior a regression-protected invariant. If a future change
   weakens it, CI catches the drift.

This is what makes the EAI credible to regulators and audit committees.
Without the two-party lock, the EAI is just a vendor-computed number.
With it, it's a verifiable cross-party attestation.

## Suggested next pickups for TRIGMA

- Swap HMAC-SHA256 for ECDSA-P256, keys in AWS KMS (per tenant). The
  `AttestationSigner` interface is already stable.
- Author an additional policy pack per regulated vertical (HIPAA,
  FINRA, PCI-DSS) modeled after `eu_ai_act_high_risk.json`.
- Add a third L9 rule for financial-services tasks (mirror of
  `dir_people_data_pii_mask` but tagged `financial_sensitive`).
- Expand evidence formats — NIST AI RMF, ISO 42001.
- Periodic auto-export: wire `scripts/export_evidence.py` into a cron
  with per-tenant rotation + S3 Object Lock for WORM storage.

## Invariants you must not break

1. rPotential signature leg MUST come from rPotential's secret — no
   shared keypair collapse.
2. L9 DIR rules are pure functions: same inputs → identical patch.
3. Policy packs stay JSON (zero-dep promise).
4. Every new policy rule must be referenced by at least one conformance
   flow or unit test.
