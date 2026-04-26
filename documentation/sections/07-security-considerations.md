# 07 — Security Considerations

## Authentication

| Principal | Mechanism | Storage |
|---|---|---|
| **Operator user** | NextAuth v4 Credentials provider, JWT session (30-day maxAge) | `users.hashed_password` in Postgres |
| **Ingest client (customer agent)** | Bearer API key, `Authorization: Bearer <raw>` | `api_keys.key_hash` (SHA-256) + `key_prefix` for UI recognition |
| **Cron runner** | Shared secret, `x-cron-secret` header | `process.env.CRON_SECRET` |

### Password handling (`lib/auth.ts`)

```ts
function hashPassword(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex')
}

function createPasswordHash(password: string): { hash: string; salt: string } {
  const salt = crypto.randomBytes(32).toString('hex')
  const hash = hashPassword(password, salt)
  return { hash: `${salt}:${hash}`, salt }  // stored as "salt:hash"
}
```

- **Algorithm:** PBKDF2-SHA512, 100 000 iterations, 32-byte random salt, 64-byte derived key.
- **Comparison:** `crypto.timingSafeEqual()` — prevents timing side-channels.
- **Migration path:** argon2id is the modern preference; current PBKDF2 parameters are within OWASP guidance.

### JWT session

- Strategy: `'jwt'` (not database sessions).
- `maxAge`: 30 days.
- Payload: `{ id, email, name, role, orgId }` — `role` and `orgId` populated via NextAuth JWT callback so server components can tenant-scope without extra DB lookup.

### API key validation (ingest path)

```
Authorization: Bearer rk_live_xxx
     │
     ▼
extractBearer() → raw
     │
     ▼
sha256(raw) → hash
     │
     ▼
SELECT id, org_id FROM api_keys WHERE key_hash = $1
     │
     ▼
    ┌────── found ──────┐
    ▼                    ▼
scope to org_id     401 Invalid API key
```

Raw keys are never stored. `api_keys.last_used_at` is updated after a successful ingest for operator visibility.

### Cron auth

`x-cron-secret` header compared against `process.env.CRON_SECRET` — constant-time comparison. Crontab passes the secret from `/etc/cron.d/agent-telemetry`. Endpoints are bound to `localhost:3000`; not exposed publicly. Even so, the header check is defensive.

## Tenant isolation

- Every ingest request resolves to an `org_id` via its API key.
- `agent_slug` lookup joins `agents → processes WHERE processes.org_id = <caller org>` — cross-org slug collisions cannot be written by a wrong-tenant caller.
- Dashboard queries in `lib/data/*.ts` accept `orgId` and filter in every WHERE clause.
- NextAuth JWT carries `orgId`; handlers read `getServerSession().user.orgId` and pass it through to the data layer.

**Gap:** Postgres Row-Level Security (RLS) is **not** enabled. Application-layer scoping is the only enforcement. Single code path to DB keeps the risk low, but RLS is a recommended defence-in-depth addition.

## Input validation & SQL safety

- Ingest payloads validated field-by-field with hand-rolled type guards (`validateRunPayload()` in `app/api/v1/ingest/batch/route.ts:46-57`). Non-negative numerics enforced, booleans enforced, ISO strings checked for type only (not format).
- No Zod schema today — a quick wins to move to Zod or `valibot` for parse-then-use ergonomics, better error messages, and schema re-use between client and server.
- All DB access goes through Drizzle's parameter-binding query builder — no raw string-concatenated SQL.

## Secret handling

| Secret | Location | Rotation |
|---|---|---|
| Postgres URL | `.env.production` on EC2 | Manual; PM2 reload required |
| NextAuth secret | `.env.production` | Manual; invalidates all JWTs |
| Cron secret | `.env.production` + `/etc/cron.d` | Manual on both |
| API keys (customer) | `api_keys` table (hashed) | Via UI (future — today: insert row with precomputed hash) |
| Langfuse API key (per org) | `organisations.langfuse_api_key_enc` (encrypted at rest) | Via `PUT /api/organisations/[id]` |

**Gaps:**
- No KMS / AWS Secrets Manager integration — secrets live on disk in `.env.production`.
- No automated rotation cadence.
- The encryption scheme for `langfuse_api_key_enc` lives in seed tooling; promote to a well-defined, key-rotated `lib/crypto.ts` module.

## Threat-model summary

| Threat | Mitigation today | Residual risk |
|---|---|---|
| Credential stuffing on `/login` | PBKDF2 + timing-safe compare | No rate limit / lockout |
| Stolen API key | Revoke row in `api_keys` | No built-in key-scope/allowlist; any key authorises any of its org's agents |
| Replay attack on ingest | `(agent_id, run_id)` idempotency prevents duplicate DB writes | Not request-signed, so a replayed valid request still succeeds once |
| Cross-tenant read | App-layer `org_id` filters on every query | RLS absent — a missed filter would leak |
| SQL injection | Drizzle parameter binding | Low residual |
| XSS | React default escaping | Watch for `dangerouslySetInnerHTML` usage (none found today) |
| CSRF | NextAuth CSRF protection on sign-in; API mutations use same-origin + session cookie | No explicit double-submit on bespoke API routes — review if introducing form-post endpoints |
| DDoS / abusive traffic | None | **Add rate limiting** (middleware + Redis counter) |
| Secret exfiltration via logs | Console logs sparse | Verify no secrets leak via `console.log(payload)` on error paths |

## Audit trail

- `audit_log` table records human decisions on governance reviews: `org_id, process_id, task_id, agent_recommendation, human_decision, reviewer_id, decision_type, duration_ms`.
- `api_keys.last_used_at` records last-use per key.
- `anomalies` retains severity + category + ack state indefinitely.

## Compliance mapping (short)

| Framework | Current alignment |
|---|---|
| **EU AI Act — high-risk system logging** | Run-level logs + audit trail cover the required "activity records" for traceability |
| **ISO/IEC 42001 — AI management system** | Governance rule engine + FMEA + override audit partially align; formal controls not yet documented |
| **SOC 2 Type II** | Ingestion + user auth hygiene OK; formal change-management, access-review, backup-test processes not yet in place |
| **GDPR / data residency** | Single-region deploy; PII is user email only (no end-customer data in runs by default) |

See §13 for detailed gap analysis and prioritised remediation.
