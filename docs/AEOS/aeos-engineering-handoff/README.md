# FuzeBox AEOS — Engineering Integration Response Package

**Date**: April 20, 2026
**From**: Les Ottolenghi, CEO, FuzeBox.AI
**To**: AEOS / Ken Garff integration engineering team
**Contract version**: `dir.v1` (Dynamic Instruction Runtime) · `evb.v1` (Evidence Bundle)
**Demo tenant**: `aeos_demo_enterprise`

This package answers the six engineering questions in one pass so you
can start wiring integration wrappers immediately. Every section lives
in its own folder with a scoped README, schemas, and runnable samples.
Nothing here rewrites the reference monorepo — it points into it.

---

## The six questions → where to look

| # | Your question | Folder | Key files |
|---|---|---|---|
| 1 | GSTI & Coordination Tax code location | `01_repository_access/` | `README.md` → paths into `fuzebox-aeos/packages/uef/scoring.py` |
| 2 | Policy Pack templates (EU AI Act, GDPR, SOC2) | `02_policy_templates/` | `schema.yaml`, `eu_ai_act_high_risk.yaml`, `gdpr.yaml`, `soc2.yaml` |
| 3 | Demo seed data (40 skills, 200 actors) | `03_seed_data/` | `skills.json`, `actors.json`, `signals.json`, `index.json`, `_generate.py` |
| 4 | Dashboard design / wireframes | `04_dashboard_design/` | `design-tokens.json`, `screen-inventory.md`, `wireframes.html` |
| 5 | Instruction Runtime JSON payload format | `05_instruction_runtime_contract/` | Two JSON Schemas, 10 canonical samples, `adapter_merge_guide.md` |
| 6 | Evidence Bundle delivery destination | `06_evidence_delivery/` | `README.md`, `bundle_manifest.schema.json`, `delivery_api.md`, `sample_manifest.json` |

---

## 1. GSTI & Coordination Tax code

The existing Python logic lives in the reference monorepo under:

```
fuzebox-aeos/packages/uef/scoring.py
```

Three functions — `score_gsti_value`, `score_uop_value`,
`score_coordination_tax` — plus the rPotential adapter contract in
`fuzebox-aeos/packages/rpotential_adapter/` (base, mock, HTTP).

The full Unified Execution Fabric composes eight scoring dimensions:

```
capability_fit + gsti_value + uop_value − coordination_tax
              + governance_score + runtime_fit + economic_value
              − risk_penalty
```

See `01_repository_access/README.md` for the full file map, the
integration-wrapper checklist, and the signatures you'll want to build
against. The monorepo was shared in the previous session (zip already
delivered); integration wrappers slot in around these call sites
without modifying them.

---

## 2. Policy Pack templates

Three YAML packs, enforced by the existing Governance Service
(`fuzebox-aeos/packages/governance/policy_engine.py` — it already
accepts `.yaml` when PyYAML is present, no code change needed):

- `eu_ai_act_high_risk.yaml` — 5 rules: human-in-loop,
  audit-log 365d, explanation interface, evidence export, EU residency.
- `gdpr.yaml` — 6 rules: purpose limitation, Art. 22 override, PII
  minimisation, Art. 32 security, DPIA, EU residency.
- `soc2.yaml` — 8 rules across CC6, CC7, CC8, A1, C1, CC1.

All three validate against `schema.yaml` in the same folder. The
compliance team can hand-edit them; the engine picks up changes at the
next `PolicyEngine.load_directory()` call.

---

## 3. Demo seed data

`03_seed_data/` contains the full demo corpus, pre-validated:

- **40 skills** across 7 families: auto_diag, auto_repair, cx_triage,
  events_ops, compliance, field_service, hr_people.
- **200 actors**: 180 humans (all with `metadata.display_name`,
  `role`, `region`) + 20 shared agents.
- **signals.json** — GSTI×40, drift×40, UOP×200, coordination_tax by
  task_type.
- **index.json** — single-file index the demo loader can read.
- **`_generate.py`** — deterministic regeneration (`seed=20260420`).

Validation results (in this session):
- 40 skills, 200 actors, 0 orphan-capability actors.
- Loads cleanly through `SkillsAuthority` and
  `MockRPotentialAdapter`.
- UEF smoke test on a sample task: `hybrid_anthropic_human` /
  `h_technician_062` / confidence **0.575**.

---

## 4. Dashboard design

`04_dashboard_design/` contains:

- **`design-tokens.json`** — dark control-plane palette
  (`bg #0b1220`, `card #131c30`, accent `#8fd3ff`, ok `#6ee7b7`,
  warn `#fbbf24`, bad `#f87171`), JetBrains Mono for data, Inter for
  chrome. Spacing scale in 4-px increments.
- **`screen-inventory.md`** — 7 screens with data bindings:
  1. Decision Explorer (primary)
  2. EAI (Enterprise Autonomy Index) Board
  3. Economic Ledger
  4. Policy Packs
  5. Skills Authority
  6. Evidence Export
  7. Dynamic Instructions (rule editor + replay)
- **`wireframes.html`** — Screens 1-3 fully rendered against the
  tokens, ready to paste into Figma as reference or build straight
  into React.

Net-new backend endpoints required: only `/v1/dir/rules` (CRUD on DIR
rules) and `/v1/dir/replay` (deterministic replay against a historical
patch). Everything else binds to existing services.

**UX principle**: minimalist, data-dense, dark. Show the decision
first, the governance second, the vendor third — the operator should
never see the model name unless they ask.

---

## 5. Instruction Runtime JSON format

`05_instruction_runtime_contract/` pins the exact contract at version
`dir.v1`. Three payloads in play:

1. **Context request** (adapter → DIR) — `context_request.schema.json`
2. **InstructionPatch** (DIR → adapter) — `instruction_patch.schema.json`
3. **Vendor prompt assembly** — `adapter_merge_guide.md` with
   concrete snippets for Anthropic, OpenAI, Salesforce Agentforce,
   Uniphore BAC, Cloudflare Workers AI, plus a human-actor mapping.

### Patch shape (abbreviated)

```json
{
  "contract_version": "dir.v1",
  "phase": "pre_input | mid_toolcall | post_output | on_signal",
  "decision_id": "...",
  "execution_id": "...",
  "issued_at": "...",
  "rules_fired": ["..."],
  "additional_instructions": ["..."],
  "restricted_tools": ["..."],
  "required_tools": ["..."],
  "required_citations": true,
  "require_human_confirmation": true,
  "safety_envelope": "auto_safety_lockdown_v1",
  "metadata": { "pack_id": "...", "ttl_seconds": 3600 }
}
```

### Merge rules (when multiple rules fire)

- `additional_instructions` → concat in rule-firing order, dedup.
- `restricted_tools` / `required_tools` → set-union.
- `required_citations` / `require_human_confirmation` → logical OR.
- `safety_envelope` → last-non-null wins.

### Fail-closed semantics

DIR unreachable → adapter refuses to call the vendor. Malformed JSON
→ fail closed + governance alert. `contract_version` mismatch → fail
closed. **Never** fall back to "no patch."

### Samples

Ten canonical patches in `samples/`, covering: safety-relevant,
auto-safety lockdown, gambling responsible-play, drift coaching,
fatigue handoff, GDPR PII masking, multi-rule merge, empty patch,
`post_output` phase, and `on_signal` phase. All ten validate against
the schema.

---

## 6. Evidence Bundle delivery

**Recommended for the Ken Garff demo**: enable Mode A + Mode B.

- **Mode A — UI download link** (always on). Signed URL, TTL 7 days
  interactive / 90 days audit, fronted by the AEOS CDN at:
  `https://evidence.aeos.fuzebox.ai/v1/bundles/{bundle_id}?sig=...&exp=...`
- **Mode B — Tenant-scoped S3 bucket**:
  `s3://aeos-evidence-{tenant_id}/YYYY/MM/DD/{bundle_id}.zip` — KMS
  CMK per tenant, Object Lock COMPLIANCE, 7-year default retention,
  cross-region replication for Enterprise Autonomy Index SKU.
- **Mode C — SFTP drop**: legacy audit pipelines, credentials in
  Secrets Manager, 3-retry cap.
- **Mode D — Webhook callback**: HMAC-signed POST, 1m → 5m → 30m →
  2h → 8h → 24h retry schedule.

### Integrity

- Each bundle's `manifest.json` lists every file by SHA-256.
- Two-party attestation on the manifest:
  - FuzeBox: ed25519 detached signature (KMS HSM-backed key).
  - rPotential: HMAC-SHA256 witness (Secrets Manager).
- Bundle verification: `python -m aeos.evidence.verify bundle.zip`.

### Demo narrative

Click "Export Evidence Bundle" on the Evidence Export screen →
Governance Service assembles decision + patch + skill + actor +
signals + telemetry + policy pack + ledger → signs manifest →
uploads to tenant bucket → returns signed URL → UI downloads zip.
Reference implementation runs in ~1.8 s end-to-end.

HTTP surface documented in `delivery_api.md`:
- `POST /v1/governance/evidence/deliver`
- `GET /v1/governance/evidence/{bundle_id}`
- `POST /v1/governance/evidence/{bundle_id}/signed_url`
- `POST /v1/governance/evidence/{bundle_id}/verify`

---

## Cross-cutting guarantees

- **Deterministic**: same inputs → same UEF decision → same DIR
  patch → same bundle bytes (the bundle manifest is canonicalised
  before hashing).
- **Fail-closed**: every governance boundary refuses the call rather
  than falling through silently.
- **Two-party attestation**: FuzeBox + rPotential both sign anything
  that leaves the platform. The customer can verify either key
  independently.
- **Per-tenant isolation**: tenant ID is a first-class key; KMS CMK,
  S3 bucket, webhook secret, and governance policy are all tenant-
  scoped.

---

## What we need from you

To start building integration wrappers:

1. Confirm `aeos_demo_enterprise` as the demo tenant ID (we can rename
   to `kengarff` for the customer-facing run).
2. Confirm the webhook URL for Mode D (if you want one for the demo —
   optional; Mode A is sufficient for the live narrative).
3. Pick the vendor you're starting with — we recommend Anthropic
   Messages API first since the adapter merge recipe is the
   shortest and the model will honour `required_citations` cleanly.
4. Subscribe the team to the `governance.dir_unavailable` and
   `governance.citation_missing` alert channels so fail-closed events
   surface immediately in staging.

We can cut a working end-to-end slice — one skill, one actor, one
decision, one bundle — in ~3 engineering days against this contract.

— Les
