# VIPPlay Agent Telemetry — Technical Documentation

> **Generated:** 2026-04-22
> **Branch analysed:** `main` @ `10fc398`
> **Audience:** Client CTO + technical team — telemetry engine alignment
> **Scope:** Current-state technical documentation of the platform as it stands in `main`

---

## 📌 Start here for the CTO call

| Document | Purpose |
|---|---|
| **[TELEMETRY-ENGINE.md](./TELEMETRY-ENGINE.md)** | **Telemetry engine deep-dive — ingestion contract, data model, processing pipeline, real-time stream, sync loop.** Built specifically for the alignment conversation. |
| [sections/02-system-architecture.md](./sections/02-system-architecture.md) | Block architecture with Mermaid diagrams |
| [sections/05-data-flow-event-processing.md](./sections/05-data-flow-event-processing.md) | End-to-end data flow across ingest → metrics → UI |
| [sections/04-api-documentation.md](./sections/04-api-documentation.md) | 22 API endpoints with payload schemas |

---

## Full section index (15 sections)

| # | Document | Description |
|---|---|---|
| 01 | [Project Overview](./sections/01-project-overview.md) | Purpose, functionality, tech stack, scope |
| 02 | [System Architecture](./sections/02-system-architecture.md) | High-level design + Mermaid block/sequence diagrams |
| 03 | [Module & Component Breakdown](./sections/03-module-component-breakdown.md) | 168 components across 18 directories, data modules, hooks |
| 04 | [API Documentation](./sections/04-api-documentation.md) | 22 endpoints — ingest, cron, governance, settings, monitoring stream |
| 05 | [Data Flow & Event Processing](./sections/05-data-flow-event-processing.md) | Ingest → DB → metrics → UI, Langfuse sync loop, SSE stream |
| 06 | [Deployment & Infrastructure](./sections/06-deployment-infrastructure.md) | EC2 + PM2 + Postgres (RDS) + Redis (ElastiCache) + crontab |
| 07 | [Security Considerations](./sections/07-security-considerations.md) | Auth model, API keys, cron auth, secret handling |
| 08 | [Development Guidelines](./sections/08-development-guidelines.md) | Setup, commands, Next.js 16 specifics, conventions |
| 09 | [Observability & Debugging](./sections/09-observability-debugging.md) | Current logging, audit trail, gaps in APM coverage |
| 10 | [Technical Debt & Issues](./sections/10-technical-debt-issues.md) | Known gaps, mock/DB bridge debt, TODO inventory |
| 11 | [Code Quality & Refactoring](./sections/11-code-quality-refactoring.md) | Static-analysis findings, refactor candidates |
| 12 | [Dependency Management](./sections/12-dependency-management.md) | Production + dev deps, version pinning, upgrade path |
| 13 | [Security Audit & Compliance](./sections/13-security-audit-compliance.md) | Threat model, EU AI Act / ISO 42001 mapping |
| 14 | [Performance Analysis](./sections/14-performance-analysis.md) | Query patterns, N+1 risk, caching gaps, Core Web Vitals |
| 15 | [Migration & Roadmap](./sections/15-migration-roadmap.md) | Mock→DB cutover plan, next phases, open decisions |

## Supporting artifacts

| Path | Contents |
|---|---|
| `artifacts/file_list.txt` | Recursive project file inventory (excl. `node_modules`, `.next`, `.git`) — ~5,500 files |
| `artifacts/markdown_files.txt` | Every `.md` in the repo |
| `diagrams/` | Standalone Mermaid/PlantUML sources for embedding in slides |
| `technicaldocs/` | **Historical** March 31 snapshot (pre-backend) — kept for audit trail; do not use for current state |

## Quick reference

| Item | Value |
|---|---|
| Framework | Next.js 16.2.1 (App Router) + React 19.2.4 + TypeScript 5 |
| Database | PostgreSQL (RDS) via Drizzle ORM 0.45 + `pg` 8.20 |
| Cache / pub-sub | Redis (ioredis 5.10) — ElastiCache |
| Auth | NextAuth v4 (Credentials + JWT) — PBKDF2-SHA512 passwords |
| Ingestion | `POST /api/v1/ingest/runs` and `/batch` — Bearer API key, SHA-256 hashed |
| Real-time | `GET /api/monitoring/stream` — Server-Sent Events, 5-second poll |
| Crons | EC2 crontab hits 6 internal endpoints, `x-cron-secret` header |
| Deployment | EC2 + PM2 (`ecosystem.config.js`) + systemd |
| Data-source flag | `DATA_SOURCE` env — `mock` or `db` |

---

*Confidential — prepared for client technical alignment.*
