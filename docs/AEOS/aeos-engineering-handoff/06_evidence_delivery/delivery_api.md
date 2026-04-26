# Evidence Bundle Delivery — HTTP API

All endpoints live under the Governance Service at:

```
https://api.aeos.fuzebox.ai/v1/governance/evidence
```

Authentication: tenant-scoped bearer token (AEOS control-plane OIDC).
All responses are JSON unless noted. All timestamps are RFC 3339 UTC.

---

## `POST /v1/governance/evidence/deliver`

Trigger (or re-trigger) delivery of a bundle that has already been
assembled. Idempotent by `(bundle_id, mode)`.

### Request

```json
{
  "bundle_id": "evb_01HX8KF2Q3MDE5WG3EVB",
  "modes": ["ui", "s3", "webhook"],
  "expires_in_seconds": 604800
}
```

| Field | Type | Meaning | Default |
|---|---|---|---|
| `bundle_id` | string | Required. ULID-prefixed identifier. | — |
| `modes` | string[] | Any subset of `ui`, `s3`, `sftp`, `webhook`. | `["ui"]` |
| `expires_in_seconds` | integer | Signed-URL TTL for the `ui` mode. 604800 (7d) default; max 7776000 (90d) for `audit_requested=true`. | 604800 |

### Response

```json
{
  "bundle_id": "evb_01HX8KF2Q3MDE5WG3EVB",
  "delivered": {
    "ui": {
      "signed_url": "https://evidence.aeos.fuzebox.ai/v1/bundles/evb_01HX8KF2Q3MDE5WG3EVB?sig=…&exp=…",
      "expires_at": "2026-04-27T12:55:03Z"
    },
    "s3": {
      "s3_uri": "s3://aeos-evidence-aeos_demo_enterprise/2026/04/20/evb_01HX8KF2Q3MDE5WG3EVB.zip",
      "region": "us-east-1",
      "kms_key_id": "arn:aws:kms:us-east-1:…:key/…"
    },
    "webhook": {
      "status": "queued",
      "attempt": 1
    }
  },
  "manifest_sha256": "c4d7a93f...e9"
}
```

On failure, returns `503` with `{"code": "delivery_partial", "failed_modes": ["sftp"]}` —
the succeeded modes are still returned under `delivered`.

---

## `GET /v1/governance/evidence/{bundle_id}`

Returns bundle metadata (no content). Callers use this to poll status
or render the Evidence Export screen.

```json
{
  "bundle_id": "evb_01HX8KF2Q3MDE5WG3EVB",
  "tenant_id": "aeos_demo_enterprise",
  "decision_id": "dec_01HX8KF2Q3MDE5WG3ABCD",
  "execution_id": "exe_01HX8KF2Q3MDE5WG3NOPQ",
  "issued_at": "2026-04-20T12:55:03.110Z",
  "manifest_sha256": "c4d7a93f...e9",
  "size_bytes": 284910,
  "policy_pack": { "pack_id": "auto_safety_standard", "version": "1.2.0" },
  "safety_envelope": "auto_safety_lockdown_v1",
  "retention": { "mode": "compliance", "expires_at": "2033-04-20T12:55:03Z" },
  "available_modes": ["ui", "s3"]
}
```

---

## `POST /v1/governance/evidence/{bundle_id}/signed_url`

Mint a fresh signed URL (rotates the signature). Use this when a URL
has expired or the first URL was shared in a lossy channel.

```json
// request
{ "expires_in_seconds": 3600 }

// response
{
  "signed_url": "https://evidence.aeos.fuzebox.ai/v1/bundles/evb_01HX8KF2Q3MDE5WG3EVB?sig=…&exp=…",
  "expires_at": "2026-04-20T13:55:03Z"
}
```

Rate: 10 mints per hour per bundle per tenant.

---

## `POST /v1/governance/evidence/{bundle_id}/verify`

Server-side verification of the bundle. Returns per-file hash results
and the attestation verification status. Used by auditors who don't
want to run the CLI locally.

```json
{
  "manifest_ok": true,
  "files_ok": true,
  "fuzebox_signature_ok": true,
  "rpotential_witness_ok": true,
  "verified_at": "2026-04-20T13:02:41Z"
}
```

---

## Error codes

| HTTP | `code` | Meaning |
|---|---|---|
| 400 | `invalid_mode` | Unknown delivery mode requested |
| 401 | `unauthenticated` | Missing / invalid bearer token |
| 403 | `cross_tenant` | Bundle belongs to a different tenant |
| 404 | `bundle_not_found` | Unknown `bundle_id` |
| 409 | `retention_locked` | Attempted operation conflicts with Object Lock |
| 429 | `rate_limited` | URL-mint or delivery rate exceeded |
| 503 | `delivery_partial` | One or more modes failed; others succeeded |

---

## Webhook payload (Mode D)

When a webhook fires, the body is exactly the `delivered` object for
the `webhook` mode plus the shared envelope:

```json
{
  "event": "evidence.bundle.delivered",
  "event_id": "evt_01HX8KF2Q3MDE5WG3EVT",
  "bundle_id": "evb_01HX8KF2Q3MDE5WG3EVB",
  "tenant_id": "aeos_demo_enterprise",
  "decision_id": "dec_01HX8KF2Q3MDE5WG3ABCD",
  "execution_id": "exe_01HX8KF2Q3MDE5WG3NOPQ",
  "issued_at": "2026-04-20T12:55:03.110Z",
  "manifest_sha256": "c4d7a93f...e9",
  "signed_url": "https://evidence.aeos.fuzebox.ai/v1/bundles/evb_01HX8KF2Q3MDE5WG3EVB?sig=…&exp=…",
  "expires_at": "2026-04-27T12:55:03Z"
}
```

Header: `X-AEOS-Signature: sha256=<hmac(body, tenant_secret)>`.

Retry schedule: 1 min → 5 min → 30 min → 2 h → 8 h → 24 h, then
abandoned. The bundle remains available via Modes A and B regardless.
