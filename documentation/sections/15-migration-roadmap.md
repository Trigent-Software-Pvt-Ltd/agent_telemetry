# 15 — Migration & Future Roadmap

## Where we are

| Milestone | Status |
|---|---|
| Frontend platform (41 pages, 168 components) | ✅ Shipped |
| PostgreSQL schema (25 tables) | ✅ Shipped |
| 22 API routes (ingest + cron + CRUD + SSE) | ✅ Shipped |
| NextAuth v4 + credentials + API keys | ✅ Shipped |
| Langfuse pull sync (every 15 min) | ✅ Shipped |
| Cron-driven daily/weekly rollups | ✅ Shipped |
| Mock→DB migration via `lib/data-source.ts` bridge | 🟡 ~50% migrated |
| EC2 + PM2 deployment | ✅ Shipped |
| CI/CD, tests, APM, rate limiting | ❌ Pending |

## Immediate (this quarter)

| Item | Reason | Owner candidate |
|---|---|---|
| Close `lib/data-source.ts` bridge | Eliminate dual code path; reduce misread risk | Platform |
| Rate limiting + Sentry + healthcheck | Production-ready baseline | Platform |
| Structured logs + CloudWatch shipping | Operability | Platform |
| Generated `drizzle-kit` migrations | Reproducible schema changes | Data |
| Adopt Zod on ingest + publish OpenAPI | Contract clarity; SDK enablement | API |

## Mid-term (next 1–2 quarters)

| Item | Reason |
|---|---|
| OpenTelemetry tracing + DB span instrumentation | Self-observability |
| SSO (SAML / OIDC) in NextAuth + MFA for admins | Enterprise readiness |
| Postgres Row-Level Security on tenant-scoped tables | Defence-in-depth |
| Terraform / CDK IaC for EC2 + RDS + ElastiCache + crontab | Reproducible environments |
| CI pipeline (lint / build / test / schema-diff / audit) | Merge confidence |
| Customer-facing **TypeScript ingestion SDK** (`@vipplay/telemetry`) | Lower integration cost |
| `/api/healthz` + uptime monitor | Liveness |
| Secrets Manager + rotation runbook | Secret hygiene |

## Long-term (roadmap candidates)

| Item | Driver |
|---|---|
| NextAuth v4 → v5 migration | Upstream is on v5 |
| Runs partitioning + cold archive (180-day S3) | Data-volume scaling |
| Redis pub/sub for SSE fan-out | Many concurrent NOC viewers |
| Distributed scheduler (EventBridge or Vercel Cron) | Multi-node scaling |
| OLAP mirror (Snowflake / ClickHouse) via CDC | Long-window analytics (> 90 days) |
| Multi-region deploy + data residency tiers | EU customers, enterprise |
| Admin UI for org-level delete / SAR (Subject Access Request) | GDPR operational fitness |
| White-label tenant surfaces (already a `branding` table) | Platform monetisation |
| Plugin model for custom agent connectors | Beyond Langfuse (LangSmith, Traceloop, etc.) |

## Migration runbooks

### A) Mock→DB cutover (per-page)

1. Convert the page to a server component (or confirm it already is).
2. Replace imports from `@/lib/data-source` with `@/lib/data/<domain>`.
3. Await the data functions; pass results into client islands as props.
4. Ensure any filtering/pagination params are passed explicitly (no implicit closures).
5. Smoke test: `DATA_SOURCE=db npm run dev` and visit the page; verify no `ReferenceError` from unmigrated dependencies.

### B) Schema change (zero-downtime recipe)

1. Author change in `lib/db/schema.ts`.
2. `drizzle-kit generate` — commit migration file.
3. Deploy **additive** change first (nullable column, new index concurrently).
4. Backfill data migration (script under `scripts/`).
5. Deploy app code that reads/writes the new shape.
6. Drop the old shape in a follow-up deploy.

**Never:** breaking rename in one step. Always shadow-dual-write.

### C) Adopting Zod on ingest (non-breaking)

1. Add `zod` dep.
2. Define `RunPayload`, `SpanPayload`, `BatchPayload` schemas in `lib/ingest/schemas.ts`.
3. Replace `validateRunPayload(...)` with `const parsed = RunPayload.safeParse(body)`.
4. Map `parsed.error.format()` to the same error shape existing clients expect (so SDKs don't break).
5. Regenerate types for internal consumers.
6. Export JSON-schema / OpenAPI via `zod-to-openapi`.

### D) NextAuth v4 → v5

1. Separate branch; don't mix with feature work.
2. Replace `authOptions` with new provider registration shape.
3. Move `[...nextauth]` handler per v5 conventions.
4. Regenerate `@auth/drizzle-adapter` bindings.
5. Manually test: sign-in, session refresh, JWT callback shape.
6. Roll out behind a feature flag if any external SSO integrations depend on callback URLs.

## Risk register

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Single-node outage (EC2) | Medium | High | Plan redundancy: ASG + LB + RDS Multi-AZ |
| RDS failover window | Low | High | Multi-AZ already available; test failover |
| Langfuse outage blocks sync | Medium | Medium | Degrades to direct ingest; no data loss |
| Secret leak from `.env.production` | Low | High | Move to Secrets Manager; rotate quarterly |
| NextAuth v4 CVE | Low | Medium | Monitor advisories; v5 migration ready |
| Schema drift between envs | Medium | Medium | Generated migrations + CI schema-diff gate |
| Unbounded `runs` growth | High (over time) | Medium | Partition + archive policy |
| Multi-tenant data leak | Low | Very high | App scoping today; add RLS |

## Open decisions (want CTO / product alignment)

1. **Deployment target:** keep EC2 or move to Vercel? Vercel zero-configs Next.js 16, but we'd rethink crons + connection pooling.
2. **Data retention SLA for `runs`:** 30 / 90 / 180 / ∞ days?
3. **PII policy:** do we explicitly forbid PII in `runs.metadata`, or do we offer a PII-scrubbing pipeline option?
4. **Ingest contract stability:** what is our commitment to clients — semver on ingest endpoints? Deprecation notice period?
5. **Customer-held API keys vs platform-issued:** currently platform-issued; some customers will want BYO.
6. **Langfuse strategy:** parallel first-class integration, or treat Langfuse as one of many source-adapters behind a unified `connectors/` abstraction? (LangSmith, Arize, Traceloop all want a seat.)
7. **Workforce roll-out path:** how many tenants do we onboard before we need multi-region?
