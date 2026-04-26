# FuzeBox AEOS — Handoff Package (2026-04-18)

## What's in this folder

```
00-READ-THIS-FIRST.md          ← you are here
01-EXECUTIVE-SUMMARY.md        ← email body; what was built and why
02-CHANGES-MANIFEST.md         ← every file added/modified, one line each
03-VERIFICATION.md             ← how to prove it all works on a fresh laptop

fuzebox-aeos-FULL.tar.gz       ← entire repo, ready to run
fuzebox-aeos-CHANGES-ONLY.tar.gz  ← only new/modified files (for PR-style review)

TRIGENT-engineering/           ← the "build-out" track
    TRIGENT-brief.md
    TRIGENT-bundle.tar.gz

TRIGMA-governance/             ← the "policy + attestation" track
    TRIGMA-brief.md
    TRIGMA-bundle.tar.gz

_source_snapshot/              ← raw copy, no tarball (for inspection)
```

## Track split (assumption — rename if needed)

I split the work into two independent tracks so each partner can run without
blocking on the other:

- **TRIGENT — engineering / runtime plane.** New adapters (Google Vertex),
  9th conformance flow, L9→adapter patch threading, durable ledger replay,
  CI conformance gate, SKU catalog. These are "plumbing & platform" items.
- **TRIGMA — governance / attestation plane.** EU AI Act policy hardening,
  L9 DIR PII-mask rule, two-party attestation refusal, signed evidence
  bundle CLI, `aeos_governance_edition` policy pack. These are "trust &
  compliance" items.

Each bundle is **independently runnable** against the baseline repo — no
cross-partner merge conflicts, because the work doesn't overlap on the same
files except for a few shared files (`schema.py`, `_runtime.py`, `flows.py`)
that are included in BOTH bundles so either track can apply on its own.

If the split is wrong, the *contents* don't care — just rename the folders.

## How to send

- **Email-sized (under 25 MB):** send `fuzebox-aeos-CHANGES-ONLY.tar.gz`
  plus `01-EXECUTIVE-SUMMARY.md` as the body. Under a megabyte.
- **Full repo:** `fuzebox-aeos-FULL.tar.gz` (~300 KB). Drop on Drive / S3
  / whatever file share you use.
- **Per-partner:** send the corresponding `TRIGENT-*` or `TRIGMA-*`
  folder only.

## One-command smoke test (what the partner runs first)

```bash
tar xzf fuzebox-aeos-FULL.tar.gz
cd fuzebox-aeos
python3 -m apps.conformance_suite.run_suite   # must print "9/9 flows passed"
python3 -m apps.kengarff_demo.main            # must print "DEMO COMPLETE"
python3 -m pytest tests/ -v                   # must print "13 passed"
```

Zero pip installs required for the three commands above. Python 3.10+.
