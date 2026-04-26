# 6. Evidence Bundle Delivery Contract

This section finalises the demo narrative: **where the cryptographically
signed Evidence Bundle lands**, how the client retrieves it, and what
integrity and retention guarantees apply.

## TL;DR for the engineers

For the Ken Garff demo (and every enterprise demo going forward):

- **Primary delivery**: UI download link in the AEOS control plane,
  backed by a time-limited pre-signed URL pointing at a
  tenant-scoped S3 bucket.
- **Secondary delivery**: the same bundle is retained for 7 years
  (SOC2 / audit default) in the tenant bucket; customer auditors can
  be granted scoped, read-only IAM roles for direct access.
- **Optional**: a webhook callback (`POST` to a customer-supplied URL)
  fires as soon as the bundle is signed and uploaded.
- **Integrity**: SHA-256 content hash + two-party HMAC attestation
  (FuzeBox key + rPotential key) inside the bundle manifest. Signing
  logic already lives in
  `fuzebox-aeos/packages/governance/evidence_exporter.py`.

## Files in this folder

| File | Purpose |
|---|---|
| `README.md` | This document |
| `bundle_manifest.schema.json` | JSON Schema for the bundle's `manifest.json` |
| `delivery_api.md` | HTTP contract for the delivery API (endpoints, payloads) |
| `sample_manifest.json` | One canonical signed manifest for the Ken Garff demo run |

---

## 1. Delivery destinations

The Governance Service supports four delivery modes. A tenant can
enable any subset; each mode is independent.

### Mode A — UI download link (always on)

The AEOS control plane's **Evidence Export** screen shows a "Download
Bundle" button. Clicking it calls:

```
POST /v1/governance/evidence/{bundle_id}/signed_url
→ 200 { "url": "https://evidence.aeos.fuzebox.ai/v1/bundles/{bundle_id}?sig=…&exp=…",
         "expires_at": "2026-04-27T12:41:18Z" }
```

- Default signed-URL TTL: **7 days** for interactive downloads,
  **90 days** for audit-triggered bundles (the longer TTL is
  recorded in the audit event).
- The URL is a pre-signed S3 URL fronted by the AEOS CDN so that the
  actual bucket remains private to the tenant.

### Mode B — Tenant-scoped S3 bucket (recommended for enterprise)

Each tenant has a bucket:

```
s3://aeos-evidence-{tenant_id}/YYYY/MM/DD/{bundle_id}.zip
```

- KMS-managed, **per-tenant** customer-managed key (CMK).
- `s3:GetObject` granted only to (a) the AEOS Governance Service's IAM
  role, and (b) any customer IAM role the tenant whitelists.
- Object lock: `COMPLIANCE` mode, default retention 7 years (SOC2).
  Tenants can extend; they cannot shorten below their own compliance
  contract.
- Bucket replicates cross-region (us-east-1 → eu-west-1) for tenants
  on the Enterprise Autonomy Index SKU.

### Mode C — SFTP drop (legacy audit workflows)

For customers whose internal audit pipelines consume SFTP, the
Governance Service pushes the bundle to a customer-hosted SFTP target
immediately after signing. Credentials are stored in AWS Secrets
Manager and rotated quarterly. No bundle is ever retried > 3 times —
failures page the governance on-call.

### Mode D — Webhook callback (optional)

If the tenant registers a webhook:

```
POST {tenant.webhook_url}
Content-Type: application/json
X-AEOS-Signature: sha256=<hmac of body with tenant secret>

{
  "bundle_id": "evb_01HX8KF2Q3MDE5WG3EVB",
  "tenant_id": "aeos_demo_enterprise",
  "issued_at": "2026-04-20T12:55:03.110Z",
  "signed_url": "https://evidence.aeos.fuzebox.ai/v1/bundles/evb_01HX8KF2Q3MDE5WG3EVB?sig=…&exp=…",
  "manifest_sha256": "c4d7…e9",
  "expires_at": "2026-04-27T12:55:03Z"
}
```

Signature verification uses a shared secret per tenant. The webhook
fires at most once per bundle; failures are retried with exponential
backoff up to 24 hours, after which the bundle stays available via
Modes A and B.

---

## 2. Demo narrative (Ken Garff specifically)

The demo ends on the Evidence Export screen:

1. The operator hits "Export Evidence Bundle for this decision".
2. Governance Service assembles: decision JSON, InstructionPatch,
   skill record, actor record, every signal, every telemetry sample,
   the policy-pack version that applied, and the Ledger transactions.
3. It computes SHA-256 over a deterministic canonicalisation of the
   bundle and signs the manifest with FuzeBox's ed25519 key +
   rPotential's HMAC witness key (two-party attestation).
4. The bundle is uploaded to `s3://aeos-evidence-kengarff/...` under
   the tenant CMK.
5. A pre-signed URL is returned to the UI; the operator clicks it and
   a zip downloads.
6. The same URL is emailed to the tenant's compliance contact (if
   configured).

Total elapsed time in the reference implementation: **~1.8 s** from
click to URL.

---

## 3. Bundle contents

A bundle is a zip file whose root contains:

```
manifest.json              ← signed; see bundle_manifest.schema.json
decision.json              ← UEF decision record
instruction_patch.json     ← the DIR patch that applied
skill.json                 ← the Skills Authority snapshot
actor.json                 ← the actor record at execution time
signals/*.json             ← every signal referenced
telemetry/*.jsonl          ← normalized telemetry stream
policy_pack_used.yaml      ← exact YAML that applied (versioned)
ledger_transactions.jsonl  ← every economic ledger entry
attestations/
  fuzebox.sig              ← ed25519 signature over manifest.json
  rpotential.hmac          ← HMAC-SHA256 witness over manifest.json
```

The `manifest.json` binds every file by SHA-256. Verifying a bundle is
a single `python -m aeos.evidence.verify bundle.zip` away and is
idempotent.

---

## 4. Integrity model

- **Inside the bundle**: `manifest.json` lists every file + its
  SHA-256. Any mutation of any file invalidates the manifest.
- **Manifest signing**: two parties sign the manifest itself —
  - FuzeBox: ed25519 detached signature (`attestations/fuzebox.sig`).
  - rPotential: HMAC-SHA256 witness (`attestations/rpotential.hmac`).
- **Transport**: pre-signed URLs are TLS-only and short-lived.
- **Storage**: S3 server-side encryption with the tenant CMK; Object
  Lock in COMPLIANCE mode prevents deletion even by root until the
  retention period elapses.

Keys:

| Purpose | Key type | Location |
|---|---|---|
| FuzeBox manifest signing | ed25519 | AWS KMS, HSM-backed, rotated annually |
| rPotential witness | HMAC-SHA256 | AWS Secrets Manager, rotated quarterly |
| Tenant bucket encryption | AES-256 via KMS CMK | One CMK per tenant |
| Webhook signature | HMAC-SHA256 | Per-tenant secret |

---

## 5. Retention and deletion

- Default retention: **7 years** (SOC2 audit minimum).
- EU-residency tenants: default **5 years** + right-to-erasure
  exemption (Recital 65 GDPR — evidence needed to establish, exercise,
  or defend legal claims).
- Shorten only by contract amendment; the CMK and Object Lock both
  enforce the minimum.
- At the end of retention, the Governance Service issues a signed
  destruction certificate and writes a final ledger entry.

---

## 6. Recommendation for the demo

Enable **Mode A + Mode B** for Ken Garff:

- Mode A gives the operator the instant download moment at the end of
  the demo.
- Mode B gives the compliance team the long-lived, audit-ready
  archive with durable integrity guarantees.

Modes C and D are available when the customer asks — typically at the
Governance Edition or Enterprise Autonomy Index SKU tier.
