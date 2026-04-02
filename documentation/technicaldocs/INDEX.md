# VIPPlay Agent Telemetry — Technical Documentation

> Generated: March 31, 2026
> Project: Agent Quality & Process ROI Platform (Frontend Demo)
> Organization: Trigent AI / FuzeBox AI

---

## Document Index

| # | Document | Description |
|---|---|---|
| [01](01-project-overview.md) | **Project Overview** | Purpose, functionalities, tech stack, stakeholders |
| [02](02-system-architecture.md) | **System Architecture** | High-level design, component tree, data flow, Mermaid diagrams |
| [03](03-module-component-breakdown.md) | **Module & Component Breakdown** | Directory structure, component details, hooks, data modules, type definitions |
| [04](04-api-documentation.md) | **API Documentation** | Internal data contracts (mock), planned API architecture, sequence diagrams |
| [05](05-data-flow-event-processing.md) | **Data Flow & Event Processing** | Run generation pipeline, verdict logic, state management, cron jobs |
| [06](06-deployment-infrastructure.md) | **Deployment & Infrastructure** | Vercel deployment, CI/CD pipeline, environment variables, scaling strategy |
| [07](07-security-considerations.md) | **Security Considerations** | Current risks, planned auth architecture, audit trail, compliance targets |
| [08](08-development-guidelines.md) | **Development Guidelines** | Setup, code conventions, design system, Next.js 16 specifics |
| [09](09-observability-debugging.md) | **Observability & Debugging** | Current debugging tools, target monitoring stack, performance profiling |
| [10](10-technical-debt-issues.md) | **Technical Debt & Issues** | Critical issues, architecture debt, prioritized action items |
| [11](11-code-quality-refactoring.md) | **Code Quality & Refactoring** | Static analysis, code patterns, smells, refactoring recommendations |
| [12](12-dependency-management.md) | **Dependency Management** | Current/planned dependencies, version pinning, upgrade path, deprecation warnings |
| [13](13-security-audit-compliance.md) | **Security Audit & Compliance** | Security findings, EU AI Act/ISO 42001 compliance, threat model |
| [14](14-performance-analysis.md) | **Performance Analysis** | Bundle analysis, bottlenecks, optimization recommendations, Core Web Vitals |
| [15](15-migration-roadmap.md) | **Migration & Future Roadmap** | Phase 1/2 scope, route migration, open decisions, risk register |

## Source Documents

The following Word documents in `docs/` provided the product vision and technical specification used throughout this documentation:

| Document | Purpose |
|---|---|
| `AgentQuality_BrainDump_FuzeboxAI.docx` | Product vision, framework pillars, O*NET connection, April 7 demo scope, narrative arc |
| `AgentQuality_TechSpec_FuzeboxAI.docx` | Screen inventory (14 screens), role matrix, database schema, API contracts, build plan |

## Quick Reference

- **Dev server**: `npm run dev` (Turbopack on `localhost:3000`)
- **Build**: `npm run build`
- **Lint**: `npm run lint`
- **Framework**: Next.js 16.2, React 19, TypeScript
- **Deployment**: Vercel (auto-deploy on push to `main`)
- **Current state**: Frontend demo with mock data
- **Target state**: Full Agent Quality & Process ROI Platform with Langfuse + O*NET + Supabase

---

*Confidential — Trigent AI / FuzeBox AI*
