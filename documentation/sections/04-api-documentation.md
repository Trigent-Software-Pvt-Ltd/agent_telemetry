# 04 — API Documentation

All endpoints live under `app/api/*` and are Next.js Route Handlers. Request APIs are async per Next.js 16 (`await request.json()`, `await params`).

## Endpoint inventory

| Method | Path | Auth | Purpose |
|---|---|---|---|
| `POST` | `/api/v1/ingest/runs` | Bearer (SHA-256 hashed API key) | Ingest single run |
| `POST` | `/api/v1/ingest/batch` | Bearer | Ingest up to 1000 runs in one TX |
| `GET` | `/api/cron/sync-langfuse` | `x-cron-secret` header | Pull new Langfuse traces per org |
| `GET` | `/api/cron/compute-metrics` | `x-cron-secret` | Roll daily agent KPIs |
| `GET` | `/api/cron/compute-process-roi` | `x-cron-secret` | Roll weekly process ROI |
| `GET` | `/api/cron/detect-anomalies` | `x-cron-secret` | 3σ z-score anomaly detection |
| `GET` | `/api/cron/check-governance` | `x-cron-secret` | Evaluate governance rule DSL |
| `GET` | `/api/cron/check-budgets` | `x-cron-secret` | MTD spend vs cap; emit anomalies |
| `GET` | `/api/monitoring/stream` | Session | SSE stream of new runs (5 s poll) |
| `GET`/`POST`/`PUT`/`DELETE` | `/api/governance/rules[/id]` | Session | Governance rule CRUD |
| `GET`/`POST`/`PUT`/`DELETE` | `/api/governance/fmea[/id]` | Session | FMEA entries CRUD |
| `GET`/`POST`/`PUT`/`DELETE` | `/api/settings/alerts[/id]` | Session | Alert rule CRUD |
| `GET`/`PUT` | `/api/settings/budgets` | Session | Budget caps + current spend |
| `GET`/`POST`/`PUT`/`DELETE` | `/api/settings/notifications` | Session | Channels + notification rules |
| `GET`/`PUT` | `/api/settings/branding` | Session | White-label config |
| `GET`/`PUT` | `/api/processes/[slug]/coverage` | Session | Task coverage map for a process |
| `GET`/`PUT` | `/api/organisations/[id]` | Session | Org settings (incl. Langfuse creds) |
| `*` | `/api/auth/[...nextauth]` | — | NextAuth handler (sign-in, callback, session) |

## 1) `POST /api/v1/ingest/batch`

**File:** `app/api/v1/ingest/batch/route.ts`

**Headers**

```
Authorization: Bearer <raw_api_key>
Content-Type: application/json
```

**Body**

```ts
interface BatchPayload {
  runs: Array<{
    runId:      string    // your trace/correlation id
    agentSlug:  string    // must match agents.slug within your org
    timestamp:  string    // ISO 8601
    durationMs: number    // ≥ 0
    outcome:    boolean   // business success
    totalCost:  number    // USD, ≥ 0
    tokenCount: number    // ≥ 0
    toolCalls:  number    // ≥ 0
    spans?: Array<{
      name:        string
      duration_ms: number
      status:      'ok' | 'error'
      cost:        number
      tool_calls:  number
      error?:      string
    }>
  }>
}
```

**Limits:** `1 ≤ runs.length ≤ 1000`.

**Response `201 Created`**

```ts
interface BatchResult {
  inserted: number
  skipped:  number   // runs deduped by (agent_id, run_id)
  total:    number
  runs: Array<{ id: string; runId: string }>
}
```

**Errors**

| Status | Cause |
|---:|---|
| 400 | malformed JSON, validation failure (field-level message), `agentSlug` not found in org, batch size 0 or > 1000 |
| 401 | missing/malformed `Authorization`, or key hash not found in `api_keys` |
| 500 | unhandled exception (logged, generic `{error:'Internal error'}`) |

**Idempotency.** `(agent_id, run_id)` is a unique index (`idx_runs_agent_run_id`). Insert uses `onConflictDoNothing()`, so replaying a batch is safe; duplicates land in `skipped`.

**Transaction.** One `db.transaction()` wraps all inserts in a single request — partial success within a batch is not possible.

## 2) `POST /api/v1/ingest/runs`

**File:** `app/api/v1/ingest/runs/route.ts`

Identical auth + validation to `/batch`. Accepts a single `RunPayload` (no `runs` envelope). Returns 201 with the inserted record or an idempotent success message if skipped. Use this for low-volume single-run producers; use `/batch` for bulk.

## 3) `GET /api/monitoring/stream`

**File:** `app/api/monitoring/stream/route.ts`

Server-Sent Events. Holds a cursor `lastSeenTimestamp`, polls `runs` every **5 seconds**, emits up to 50 rows per tick.

**Events**

```
event: run
data: <JSON-serialized Run>

event: error
data: { "message": "poll failed" }

: heartbeat           # SSE comment — connection open
: keepalive           # SSE comment — nothing new
```

Client aborts via `request.signal.abort()` close the stream cleanly. No Redis pub/sub — simple DB polling.

## 4) Cron endpoints (`/api/cron/*`)

Shared auth: `x-cron-secret: <CRON_SECRET>`. Wired up by `deploy/crontab`:

```cron
*/15 * * * *  curl -H "x-cron-secret: $CRON_SECRET" http://localhost:3000/api/cron/sync-langfuse
0   * * * *   curl ... /api/cron/compute-metrics
5   * * * *   curl ... /api/cron/compute-process-roi
10  * * * *   curl ... /api/cron/check-governance
15  * * * *   curl ... /api/cron/check-budgets
0 */6 * * *   curl ... /api/cron/detect-anomalies
```

All return JSON `{ ok: true, summary: {...} }` on success, `401` on secret mismatch, `500` on error.

### `/api/cron/sync-langfuse`
For each org with `langfuse_host` set: `GET {host}/api/public/traces?fromTimestamp=<lastSync>` → map each trace to a `runs` row → `onConflictDoNothing` → update `langfuse_last_sync`.

### `/api/cron/compute-metrics`
Scans 30-day `runs` per agent, computes `total_runs, successful, failed, latency_breaches (>5000ms), cost_overruns (>$0.10), avg/p95 durations, total_cost, total_tokens, DPMO, sigma_score`. Upserts into `agent_metrics_daily`.

### `/api/cron/compute-process-roi`
Per process: gross saving (headcount × wage × hours × coverage), inference cost (sum of weekly `runs.total_cost`), oversight cost (hours band by sigma × wage × 1.5), governance cost (2% of gross × active rule count). Upserts into `process_metrics_daily`.

### `/api/cron/detect-anomalies`
3σ z-score on `agent_metrics_daily`. Critical if |today − 7-day mean| / stddev > 3, Warning if > 2. Inserts into `anomalies`.

### `/api/cron/check-governance`
Evaluates the rule DSL (`sigma < X`, `cost > X`, `failure_rate > X`, `latency_breaches > X`) against today's metrics. Violations currently logged to console — **no persistence**; this is an open item.

### `/api/cron/check-budgets`
Sums `runs.total_cost` from start-of-month per agent, compares to `agent_budgets.monthly_cap × alert_threshold / 100`, emits `anomalies` row (Critical if over cap, Warning at threshold).

## 5) Governance / Settings APIs

All session-authenticated through NextAuth (`getServerSession()` at handler top). Tenant-scoped by `orgId` from the session. Use standard REST verbs:

- `GET /api/governance/rules` → list
- `POST /api/governance/rules` → create
- `PUT /api/governance/rules/[id]` → update
- `DELETE /api/governance/rules/[id]` → remove

Same pattern for `/fmea`, `/alerts`, `/notifications`. `/budgets` and `/branding` are singleton `GET`/`PUT`.

## 6) NextAuth `/api/auth/[...nextauth]`

Credentials provider. Sign-in flow:

```
POST /api/auth/signin  → validate email + PBKDF2-SHA512(password) against users.hashed_password
                      → issue JWT with { id, email, name, role, orgId }
                      → maxAge: 30 days
```

All `app/(app)/*` pages read the session via `getServerSession()` and redirect to `/login` if missing.
