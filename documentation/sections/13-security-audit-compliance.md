# 13 — Security Audit & Compliance Review

## Audit summary (current state)

| Control area | Status | Key evidence |
|---|---|---|
| Password storage | ✅ PBKDF2-SHA512 / 100k iterations / 32B salt / timing-safe compare | `lib/auth.ts` |
| Session mgmt | ✅ NextAuth JWT, 30d maxAge, `role` + `orgId` in token | `lib/auth.ts` callbacks |
| API auth | ✅ Bearer with SHA-256 hash lookup, per-use `last_used_at` | `app/api/v1/ingest/*` |
| SQL injection | ✅ Drizzle ORM parameterisation throughout | `lib/db/*`, `lib/data/*` |
| Tenant scoping (app) | ✅ `orgId` threaded through every data fn | `lib/data/*.ts` |
| Tenant scoping (DB) | ⚠️ RLS not enabled | Recommend `app.current_org` + policies |
| Input validation | ⚠️ Hand-rolled, inconsistent | Adopt Zod (see §11) |
| Rate limiting | ❌ None | Ingest + login both unprotected |
| Request signing | ❌ None | No HMAC on ingest; bearer-only |
| CORS | ⚠️ Defaults | No explicit allowlist for ingest endpoints |
| CSRF | ✅ NextAuth handles it on sign-in; same-origin on other API | Review any future form-post endpoints |
| Secret rotation | ⚠️ Manual; `.env.production` on disk | Move to Secrets Manager |
| Audit logging | ✅ `audit_log` table, human decision events | `lib/db/schema.ts` |
| Dependency scanning | ❌ Not automated | Enable Dependabot + `npm audit` in CI |
| MFA / SSO | ❌ Credentials only | Add SAML/OIDC for enterprise |

## Threat model (STRIDE-style, abbreviated)

| Threat | Surface | Mitigation today | Priority |
|---|---|---|---|
| **Spoofing** — forged ingest | `POST /api/v1/ingest/*` | Bearer required; hashed at rest | 🟠 add HMAC signing |
| **Tampering** — replay of captured request | Ingest | Idempotency prevents double-write; does not prevent first acceptance | 🟠 add `timestamp + nonce` check |
| **Repudiation** — "I didn't approve that override" | Governance screens | `audit_log` captures reviewer, timestamp, decision | 🟢 adequate |
| **Information disclosure** — cross-tenant read | Data layer | App-code `org_id` scoping | 🟠 add RLS |
| **Denial of service** — flood ingest | Ingest + login | None | 🔴 rate-limit |
| **Elevation of privilege** — user → admin | Session | `role` on JWT; no horizontal escalation path found | 🟢 adequate; add MFA for admins |

## Compliance mapping

### EU AI Act — high-risk AI system obligations (Articles 8–15)

| Article | Obligation | Current coverage |
|---|---|---|
| 9 (Risk mgmt) | Ongoing risk management across lifecycle | Partial: FMEA + governance rules; formal risk register outstanding |
| 10 (Data governance) | Training, validation, testing dataset quality | Out of scope — we observe agents, we don't train them |
| 11 (Technical documentation) | Document the system per Annex IV | This documentation set, plus API docs |
| 12 (Record-keeping) | Automatic event logs for traceability | `runs` + `audit_log` + `anomalies` — strong coverage |
| 13 (Transparency) | Instructions for deployers | Documented here; `/governance/compliance` surfaces to users |
| 14 (Human oversight) | Measures enabling oversight by natural persons | `audit_log` + `/governance/audit` review workflow |
| 15 (Accuracy, robustness, cybersecurity) | Appropriate levels across lifecycle | Partially — see gaps above (rate limit, HMAC, RLS) |

### ISO/IEC 42001 — AI Management System

| Clause | Requirement | Coverage |
|---|---|---|
| 4 (Context) | Stakeholder identification | Documented in §01 |
| 6 (Planning / risk) | AI risk / impact assessment | FMEA, governance rules — process exists |
| 7 (Support / resources) | Competence + documented info | This documentation set; training & role assignment needed |
| 8 (Operation) | Operational planning + change mgmt | Informal; formalise via CI + CAB |
| 9 (Performance) | Monitoring, measurement, analysis | Core product capability (sigma, anomalies, audits) |
| 10 (Improvement) | Continual improvement / corrective action | Improvement tracker in `/process/[id]/sigma` |

### SOC 2 — relevant TSC

| Criterion | Notes |
|---|---|
| Security (CC) | Auth hygiene solid; operational gaps (no APM, no rate-limit, no formal access review) |
| Availability (A) | Single-node EC2 — add redundancy plan before auditing |
| Confidentiality (C) | Tenant scoping in app; add RLS + secrets mgr |
| Processing integrity (PI) | Idempotent ingest + transactional writes — strong |
| Privacy (P) | No end-customer PII flows through `runs` by default — verify contractually |

### GDPR-adjacent checklist

- Personal data in the system: **user email + name** only (`users` table). No end-customer PII in `runs` unless a customer sends it in `metadata` — document that behaviour in the ingest contract.
- Data residency: single AWS region today; multi-region or EU-only tenancy is a future platform-level decision.
- Subject access / deletion: `users` can be cascade-deleted (`onDelete: 'cascade'`). Org-level purge is a manual DBA task today; expose via admin UI.

## Prioritised remediation queue

### 🔴 Must-have before first external customer

1. **Rate limit** ingest + auth (Redis token bucket).
2. **Sentry / error tracking** on server + client.
3. **Structured logs** shipped to CloudWatch.
4. **Healthcheck endpoint** + uptime monitor.
5. **Generated migrations** (not `drizzle-kit push`) with CI gate.

### 🟠 Should-have for enterprise

6. **HMAC request signing** on ingest (additive header; keep bearer).
7. **Row-Level Security** on all tenant-scoped tables.
8. **Secrets Manager** + rotation runbook.
9. **SSO (SAML/OIDC)** provider in NextAuth.
10. **MFA** for admin-role users.
11. **Zod-based validation** + OpenAPI export.

### 🟡 Hardening

12. **Dependabot + `npm audit`** in CI; fail on high severity.
13. **CodeQL** or **Semgrep** on PRs.
14. **Gitleaks** in CI + pre-commit.
15. **SBOM** generation per release (`cyclonedx-npm`).
16. **Penetration test** (third party) before the first enterprise pilot.

## Evidence register (for audit packs)

| Item | Location |
|---|---|
| Schema definition | `lib/db/schema.ts` |
| Ingest auth code | `app/api/v1/ingest/*/route.ts` |
| Password hashing | `lib/auth.ts:hashPassword` |
| Audit log writer | `lib/data/governance.ts` (review actions) |
| Governance rules | `lib/db/schema.ts::governanceRules`, `app/api/cron/check-governance/route.ts` |
| Cron authentication | All `app/api/cron/*/route.ts` headers |
| Encryption-at-rest (Langfuse key) | `organisations.langfuse_api_key_enc` + seed tooling |
| Cron execution log | `/var/log/agent-telemetry/cron.log` |
