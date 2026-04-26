# 02 — System Architecture

## Logical view

```mermaid
flowchart TB
    subgraph Producers
        CA[Customer agents<br/>LangGraph / CrewAI / custom]
        LF[Langfuse<br/>tracing backend]
    end

    subgraph "Next.js 16 app (EC2 + PM2)"
        direction TB
        subgraph "API surface (app/api/*)"
            IG[Ingest<br/>/api/v1/ingest/*]
            CR[Cron endpoints<br/>/api/cron/*]
            SV[Settings/Governance APIs<br/>/api/settings,/governance,/processes,/organisations]
            SSE[SSE stream<br/>/api/monitoring/stream]
            AU[NextAuth<br/>/api/auth/*]
        end
        subgraph "Data access (lib/data/*)"
            DA[runs.ts · agents.ts · sigma.ts<br/>processes.ts · governance.ts · analytics.ts<br/>insights.ts · monitoring.ts · settings.ts]
        end
        subgraph "Schema (lib/db/schema.ts)"
            DB[(Drizzle ORM<br/>25 tables)]
        end
        subgraph "UI (app/(app)/...)"
            UI[41 page routes<br/>168 components]
        end
    end

    subgraph "Managed services"
        PG[(PostgreSQL<br/>AWS RDS)]
        RD[(Redis<br/>AWS ElastiCache)]
    end

    subgraph "Scheduler"
        CT[EC2 crontab<br/>deploy/crontab]
    end

    CA -->|Bearer + JSON<br/>POST| IG
    LF -->|pull via<br/>sync-langfuse| CR
    CT -->|x-cron-secret<br/>every 15m–6h| CR

    IG --> DA --> DB --> PG
    CR --> DA
    SV --> DA
    SSE --> DA

    UI -->|server components| DA
    UI -. optional .-> RD
    AU --> DB
```

## Two-tier layout

The UI tree has a deliberate split:

- `app/layout.tsx` — root layout: fonts, metadata (`r-Potential` title template), `<OrganisationProvider>` → `<LanguageModeProvider>`, Sonner toaster. Wraps everything.
- `app/(app)/layout.tsx` — **client-component** shell for authenticated surfaces: Sidebar (fixed 260 px), TopBar (breadcrumbs + ⌘K search + notifications), command palette. Any route added under `app/(app)/` inherits the shell automatically.
- `app/login/page.tsx` and the root redirect `app/page.tsx` live **outside** the `(app)` group — no sidebar/topbar.

## Module dependencies

```mermaid
flowchart LR
    pages["app/(app)/** page.tsx"] --> data["lib/data/*.ts"]
    api["app/api/**/route.ts"] --> data
    data --> schema["lib/db/schema.ts"]
    schema --> driver["pg (node-postgres)"]
    driver --> rds[(PostgreSQL)]

    pages --> ui["components/*"]
    ui --> shared["components/shared/*"]
    ui --> charts["recharts"]
    ui --> icons["lucide-react"]

    bridge["lib/data-source.ts"] --> seed["lib/seed-data.ts"]
    bridge --> data
    pages -. DATA_SOURCE=mock .-> bridge
```

`lib/data-source.ts` is the migration seam: pages that haven't been cut over yet import from it and get mock constants; pages on the DB path import from `lib/data/*` directly.

## Request lifecycle — ingestion

```mermaid
sequenceDiagram
    autonumber
    participant Client as Customer agent
    participant API as POST /api/v1/ingest/batch
    participant Keys as api_keys
    participant Tx as Drizzle transaction
    participant Runs as runs (PG)

    Client->>API: Authorization: Bearer rk_…
    API->>API: extractBearer(), sha256(token)
    API->>Keys: SELECT id, org_id WHERE key_hash = ?
    alt no match
        API-->>Client: 401 Invalid API key
    else match
        Keys-->>API: orgId
        API->>API: validateRunPayload(each of N runs)
        API->>API: resolve agent_slug → agent_id scoped to orgId
        API->>Tx: BEGIN
        loop for each run
            Tx->>Runs: INSERT ... ON CONFLICT (agent_id, run_id) DO NOTHING
        end
        API->>Tx: COMMIT
        API->>Keys: UPDATE last_used_at
        API-->>Client: 201 {inserted, skipped, total, runs[]}
    end
```

## Request lifecycle — page render

```mermaid
sequenceDiagram
    participant Browser
    participant Next as Next.js server
    participant Data as lib/data/*
    participant DB as Postgres
    Browser->>Next: GET /process/abc
    Next->>Next: await params, auth check
    par parallel data fetches
        Next->>Data: getProcessById(slug)
        Data->>DB: SELECT ... JOIN ...
    and
        Next->>Data: getAgentsForProcess(slug)
        Data->>DB: SELECT ...
    and
        Next->>Data: getRoiForProcess(slug)
        Data->>DB: SELECT ... FROM process_metrics_daily
    end
    DB-->>Data: rows
    Data-->>Next: typed DTOs
    Next->>Next: RSC render
    Next-->>Browser: streamed HTML + RSC payload
```

## Real-time stream

```mermaid
sequenceDiagram
    participant UI as /monitoring
    participant Stream as /api/monitoring/stream (SSE)
    participant Runs as runs (PG)
    UI->>Stream: GET, Accept: text/event-stream
    Stream-->>UI: : heartbeat
    loop every 5s
        Stream->>Runs: SELECT * WHERE timestamp > lastSeen LIMIT 50
        alt new rows
            Runs-->>Stream: rows
            Stream-->>UI: event: run\ndata: {...}
        else none
            Stream-->>UI: : keepalive
        end
    end
    UI-->>Stream: AbortSignal on navigation
```

## Concurrency & scaling properties

| Concern | Current design | Notes |
|---|---|---|
| Ingest writes | Single-node Postgres via `pg` pool | Pool sized by `pg` defaults; each batch wraps in one TX |
| Idempotency | `onConflictDoNothing` on `(agent_id, run_id)` unique index | Safe retry semantics out of the box |
| Cron fan-out | One EC2 node's `crontab` hits `localhost:3000` | Single-node; distributed deployment will need a single scheduler or Redis locks |
| Dashboards | Read from `*_metrics_daily` rollups, not raw `runs` | Index-backed single-row-per-day reads |
| SSE | DB polling per viewer (5 s, limit 50) | Viable for small operator teams; if we move to 100s of viewers, switch to Redis pub/sub fan-out |
| Tenant isolation | Enforced by app code (`org_id` scope in every query) | RLS on Postgres is an open recommendation |

## Notes on Next.js 16 specifics in use

- All request APIs are awaited: `await params`, `await searchParams`, `await cookies()`, `await headers()`.
- No `middleware.ts` — when middleware is introduced, use `proxy.ts` (Node.js runtime only) per Next.js 16.
- Turbopack is the default dev + build bundler; config is top-level in `next.config.ts` (not under `experimental`).
