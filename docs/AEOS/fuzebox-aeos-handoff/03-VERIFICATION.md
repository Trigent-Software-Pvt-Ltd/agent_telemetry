# Verification — prove it works on a fresh laptop

## Requirements

- Python 3.10 or newer.
- No pip install required for the baseline verification.

## Steps

```bash
# 1. Unpack
tar xzf fuzebox-aeos-FULL.tar.gz
cd fuzebox-aeos

# 2. End-to-end demo (must print "DEMO COMPLETE")
python3 -m apps.kengarff_demo.main

# 3. Conformance suite (must print "9/9 flows passed")
python3 -m apps.conformance_suite.run_suite

# 4. Unit tests (requires pytest)
python3 -m pip install --user pytest
python3 -m pytest tests/ -v
# Expected: 13 passed

# 5. Signed evidence bundle CLI (prints JSON to stdout)
python3 -m scripts.export_evidence \
    --tenant kengarff_south_jordan \
    --format eu_ai_act_article_12 \
    --period-start 2026-01-01 \
    --period-end 2026-12-31

# 6. SKU matrix (sales-engineer view)
python3 -m scripts.list_skus
```

## Expected outputs (abbreviated)

### Conformance suite
```
CONFORMANCE SUITE — 9/9 flows passed
```

### Unit tests
```
tests/test_dir.py::test_pii_mask_fires_on_gdpr_sensitive_skill PASSED
tests/test_dir.py::test_pii_mask_does_not_fire_on_non_sensitive_skill PASSED
tests/test_ledger_persistence.py::test_replay_from_disk_round_trip PASSED
tests/test_smoke.py::test_runtime_builds PASSED
tests/test_smoke.py::test_skills_load PASSED
tests/test_smoke.py::test_rpotential_signals PASSED
tests/test_smoke.py::test_attestation_roundtrip PASSED
tests/test_smoke.py::test_evidence_bundle PASSED
tests/test_two_party_attestation.py::test_sign_bundle_happy_path PASSED
tests/test_two_party_attestation.py::test_sign_bundle_refuses_missing_fuzebox_secret PASSED
tests/test_two_party_attestation.py::test_sign_bundle_refuses_missing_rpotential_secret PASSED
tests/test_two_party_attestation.py::test_verify_rejects_tampered_signature PASSED
tests/test_two_party_attestation.py::test_verify_rejects_empty_leg PASSED
============================== 13 passed ==============================
```

## If any of this fails

1. Confirm Python version is 3.10+.
2. Confirm you `cd`-ed into `fuzebox-aeos/` (the module path is relative).
3. Re-extract the tarball — partial extracts cause import errors.
4. Mail the traceback + output back; don't patch in place.
