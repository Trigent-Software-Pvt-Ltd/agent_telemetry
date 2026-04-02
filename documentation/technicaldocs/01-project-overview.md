# 1. Project Overview

## Purpose

**VIPPlay Agent Telemetry** is a Next.js 16 web application that provides an observation and telemetry platform for monitoring agentic AI workflow performance. It is the frontend component of the larger **Agent Quality & Process ROI Platform** being built for FuzeBox AI / VIPPlay by Trigent AI.

The platform applies three established frameworks — Six Sigma (DPMO), OEE/SERVQUAL, and ISO 42001 AI Governance — to measure AI agent quality in business-friendly language.

## Core Functionalities

| Capability | Description |
|---|---|
| **Workflow Monitoring** | Track multi-agent workflow runs with per-span trace visibility |
| **Verdict System** | GREEN/AMBER/RED classification based on SLA hit rate, success rate, and ROI |
| **Latency Analysis** | P50/P90/P95 latency distributions with SLA threshold visualization |
| **Cost Tracking** | Per-agent cost breakdown, cost-per-success, and ROI calculations |
| **Workflow Comparison** | Side-by-side comparison matrix across all tracked workflows |
| **Run Trace Viewer** | Span-level visualization of individual agent execution traces |
| **Report Generation** | Exportable summary reports per workflow |

## Current State

The application is a **frontend demo** with deterministic mock data. No backend APIs, no database, no live Langfuse integration. All data is generated client-side from seeded algorithms in `lib/mock-data.ts`.

## Target State (April 7 & Beyond)

The platform will evolve into the full **Agent Quality & Process ROI Platform** with:
- Live Langfuse telemetry integration
- O*NET occupation task taxonomy integration
- BLS wage data for ROI calculations
- Six Sigma / OEE / SERVQUAL scoring
- Symmetry equation: `(Agent Coverage % x Agent Quality Score) + (Human Coverage % x Human Productivity Rate) = Total Process ROI`
- EU AI Act (Article 14) governance audit trail
- Role-based access for 6 user personas

## Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 16.2 (App Router), React 19, TypeScript |
| **Styling** | Tailwind CSS 4 via `@tailwindcss/postcss` |
| **Charts** | Recharts 3.8 |
| **Icons** | Lucide React |
| **Fonts** | Sora (headings), DM Sans (body), JetBrains Mono (code) |
| **Toasts** | Sonner |
| **Utilities** | clsx (conditional classes) |
| **Build** | Turbopack (default in Next.js 16) |

## Key Dependencies (package.json)

```json
{
  "dependencies": {
    "clsx": "^2.1.1",
    "lucide-react": "^1.6.0",
    "next": "16.2.1",
    "react": "19.2.4",
    "react-dom": "19.2.4",
    "recharts": "^3.8.1",
    "sonner": "^2.0.7"
  }
}
```

## Stakeholders

| Role | Person | Organization |
|---|---|---|
| AVP GenAI & Product Lead | Andy Padia | Trigent Software |
| Client Sponsor | Les Ottolenghi | FuzeBox AI |
| Client Technical | Mike Porter | FuzeBox AI |

---

*Prepared as part of VIPPlay Agent Telemetry technical documentation. Confidential.*
