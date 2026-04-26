# Compliance mapping

AEOS is a governance plane first, a decision engine second. Every layer
is designed so that a regulator asking "why did you do that?" can be
answered with a signed, cross-referenced evidence bundle. This document
maps AEOS artifacts to the regulations they satisfy.

## EU AI Act Article 12 — logging obligation

> "High-risk AI systems shall technically allow for the automatic
> recording of events ('logs') over the lifetime of the system."

**AEOS mapping:**

| Article 12 requirement | AEOS artifact |
|---|---|
| Automatic recording of events | `EconomicLedger.append(LedgerRow)` on every execution |
| Period of recording identifying circumstances | `LedgerRow.timestamp`, `task_id`, `tenant_id`, `selected_path` |
| Reference database check-against | `LedgerRow.audit_record_id` points to immutable audit row |
| Input data for the operation | `decision_id` indexes back to the captured UEF request |
| Natural persons verifying the output | `selected_actor_id` on hybrid / human paths |

The policy pack `policies/eu_ai_act_high_risk.json` declares the
corresponding rules:

- `human_in_loop_required` (severity: critical)
- `audit_log_mandatory` (severity: high, 365-day retention)
- `evidence_export_required` (severity: high)
- `human_override_available` (severity: high)

## UN ECE WP.29 — automotive cockpit

**AEOS mapping:**

- `auto_safety` regulatory class triggers `policies/wp29.json`.
- Flow `automotive_cockpit_compliance` in the conformance suite
  demonstrates that the UEF refuses to select a pure-agent path for
  `CRITICAL` risk + `auto_safety` work — it always routes through a
  hybrid or human path.
- Evidence bundle format `wp29` is supported by
  `EvidenceExporter.export(...)`.

## GDPR

- `gdpr` policy pack mandates 180-day minimum retention, audit log, and
  human override availability.
- `packages/governance/evidence.py` supports the `gdpr` export format for
  access-request responses.
- `LedgerRow.governance_tags` surfaces `"gdpr_sensitive"` skills for
  downstream access audits.

## Responsible gambling

- `gambling_responsible` policy pack + `dir_gambling_responsible_play`
  L9 rule together ensure every sportsbook recommendation includes a
  responsible-play disclaimer envelope before the vendor sees the prompt.
- Flow `sportsbook_recommendation` in the conformance suite is the
  regression test.

## Two-party attestation

Board-level metrics (EAI, HPI, HLR) are signed by both FuzeBox and
rPotential. The signature pair is verifiable offline. Tamper-evidence:

```python
att = signer.sign(tenant_id=..., period="2026-Q2", metric_name="EAI", metric_value=0.87, details=...)
assert signer.verify(att) is True
```

Production: replace the HMAC secrets with ECDSA-P256 keypairs in AWS
KMS. The interface on `AttestationSigner` remains stable.

## Evidence bundles

```python
bundle = exporter.export(
    rows=ledger.for_tenant("kengarff_south_jordan"),
    tenant_id="kengarff_south_jordan",
    format="eu_ai_act_article_12",
    period_start=t0,
    period_end=t1,
)
# bundle.integrity_hash — SHA-256 of the canonical JSON
# bundle.records        — one record per ledger row, format-specific fields
```

Supported formats: `eu_ai_act_article_12`, `wp29`, `gdpr`, `soc2`.

### Signed evidence bundles via CLI

`scripts/export_evidence.py` wraps the exporter and the two-party signer
into a single CLI:

```bash
python -m scripts.export_evidence \
    --tenant kengarff_south_jordan \
    --format eu_ai_act_article_12 \
    --period-start 2026-01-01 \
    --period-end 2026-04-01
```

The command writes a `SignedEvidenceBundle` JSON to stdout. The bundle
carries the canonical `integrity_hash` plus two HMAC-SHA256 signatures
(one FuzeBox, one rPotential). `AttestationSigner.sign_bundle` refuses
to emit a bundle missing either leg — a `SinglePartyAttestationRefused`
is raised instead, enforcing the AEOS Governance Edition two-party
attestation requirement.

## Conformance enforcement

`apps/conformance_suite/run_suite.py` executes all eight canonical
flows with strict pre/post conditions. CI exit-code is non-zero if any
flow fails. Use this in your pipeline as the AEOS gate before every
release.
