# Current Evidence Delivery — What Ships Today

## What the CLI does

`scripts/export_evidence.py` writes a `SignedEvidenceBundle` JSON
object to **stdout**. That's it. No persistence, no upload.

```bash
python3 -m scripts.export_evidence \
    --tenant kengarff_south_jordan \
    --format eu_ai_act_article_12 \
    --period-start 2026-01-01 \
    --period-end 2026-12-31
```

## What's in the bundle

```json
{
  "bundle": {
    "format": "eu_ai_act_article_12",
    "tenant_id": "kengarff_south_jordan",
    "period_start": 1767250800.0,
    "period_end": 1798700400.0,
    "row_count": 1,
    "summary": {...},
    "records": [{...per-row evidence entries...}],
    "integrity_hash": "9cfededa1353cb62..."
  },
  "integrity_hash": "9cfededa1353cb62...",
  "fuzebox_signature": "...64 hex chars...",
  "rpotential_signature": "...64 hex chars...",
  "signed_at": 1776584321.12
}
```

## What verification looks like

```python
from packages.governance.evidence import AttestationSigner, SignedEvidenceBundle
signer = AttestationSigner(fuzebox_secret=..., rpotential_secret=...)
signed: SignedEvidenceBundle = ...   # parsed from the JSON above
assert signer.verify_bundle(signed) is True   # both signatures verified
```

## What's intentionally NOT there

- No HTTP endpoint.
- No file-system write path (the caller redirects stdout if they want a file).
- No cloud bucket upload.
- No UI download link.
- No regulator submission.
- No WORM (write-once-read-many) storage.

The CLI was built deliberately thin so that the downstream delivery
layer could be chosen after seeing how customers want to consume it.
That decision is now in front of us — see `delivery-options.md`.
