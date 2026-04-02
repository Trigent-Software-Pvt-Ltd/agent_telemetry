# 12. Dependency Management & Upgrade Path

## Current Dependencies

### Production Dependencies

| Package | Version | Purpose | License | Notes |
|---|---|---|---|---|
| `next` | 16.2.1 | Application framework | MIT | Latest stable. Breaking changes from 15.x |
| `react` | 19.2.4 | UI library | MIT | React 19 with Server Components |
| `react-dom` | 19.2.4 | React DOM renderer | MIT | Must match React version |
| `recharts` | ^3.8.1 | Chart library | MIT | Area, Bar, Line, Pie charts |
| `lucide-react` | ^1.6.0 | Icon library | ISC | Tree-shakeable SVG icons |
| `clsx` | ^2.1.1 | Conditional class utility | MIT | Lightweight alternative to classnames |
| `sonner` | ^2.0.7 | Toast notifications | MIT | Used via `<Toaster>` in layout |

### Development Dependencies

| Package | Version | Purpose | License | Notes |
|---|---|---|---|---|
| `typescript` | ^5 | Type checking | Apache-2.0 | |
| `@types/node` | ^20 | Node.js type definitions | MIT | |
| `@types/react` | ^19 | React type definitions | MIT | |
| `@types/react-dom` | ^19 | React DOM type definitions | MIT | |
| `tailwindcss` | ^4 | CSS framework | MIT | v4 — significant changes from v3 |
| `@tailwindcss/postcss` | ^4 | PostCSS plugin | MIT | v4 PostCSS integration |
| `eslint` | ^9 | Code linter | MIT | Flat config format |
| `eslint-config-next` | 16.2.1 | Next.js ESLint rules | MIT | Pinned to Next.js version |

## Dependency Graph

```mermaid
graph TD
    subgraph "Core"
        NEXT[next 16.2.1]
        REACT[react 19.2.4]
        RD[react-dom 19.2.4]
        TS[typescript ^5]
    end

    subgraph "UI"
        RC[recharts ^3.8.1]
        LR[lucide-react ^1.6.0]
        SN[sonner ^2.0.7]
        CL[clsx ^2.1.1]
    end

    subgraph "Build"
        TW[tailwindcss ^4]
        TWP[@tailwindcss/postcss ^4]
        ESL[eslint ^9]
        ESLN[eslint-config-next 16.2.1]
    end

    NEXT --> REACT
    NEXT --> RD
    RC --> REACT
    LR --> REACT
    SN --> REACT
    TWP --> TW
    ESLN --> ESL
    ESLN --> NEXT
```

## Version Pinning Analysis

| Package | Specifier | Locked Version | Risk |
|---|---|---|---|
| `next` | `16.2.1` | Exact | Low — pinned |
| `react` | `19.2.4` | Exact | Low — pinned |
| `recharts` | `^3.8.1` | Allows 3.x.x | Medium — caret allows minor/patch |
| `lucide-react` | `^1.6.0` | Allows 1.x.x | Low — icon library, additive changes |
| `tailwindcss` | `^4` | Allows 4.x.x | Medium — major version caret |
| `eslint` | `^9` | Allows 9.x.x | Low |
| `typescript` | `^5` | Allows 5.x.x | Low |

**Note**: `package-lock.json` (245KB) provides deterministic installs. The caret ranges only matter on fresh `npm install` without a lockfile.

## Planned Dependencies (Target State)

These packages are specified in the technical specification but not yet installed:

| Package | Version | Purpose | Priority |
|---|---|---|---|
| `langfuse` | ^3.x | Langfuse Node SDK for trace fetching | April 7 |
| `@supabase/ssr` | ^0.5.x | Supabase client for App Router auth | April 7 |
| `@upstash/redis` | ^1.x | Redis cache for API responses | April 7 |
| `zod` | ^3.x | Server Action input validation | April 7 |
| `date-fns` | ^3.x | Date formatting and range computation | April 7 |
| `react-beautiful-dnd` | ^13.x | Drag-and-drop for task mapping | Phase 2 |
| `react-pdf` or Puppeteer | TBD | PDF export generation | Phase 2 |

## Upgrade Recommendations

### Immediate (No urgency, for awareness)

| Current | Recommendation | Reason |
|---|---|---|
| `@types/node: ^20` | Update to `^24` | Match Node.js 24 LTS runtime |

### When Adding Backend

| Decision | Recommendation | Reason |
|---|---|---|
| Database client | `@supabase/ssr ^0.5.x` | Per tech spec, cookie-based auth with App Router |
| Validation | `zod ^3.x` | Industry standard for Server Action input validation |
| Redis | `@upstash/redis ^1.x` | HTTP-based, works in Edge runtime, Vercel native |

### Deprecation Warnings

| Package | Status | Action |
|---|---|---|
| `@vercel/postgres` | **Sunset** | Do not install. Use `@neondatabase/serverless` instead |
| `@vercel/kv` | **Sunset** | Do not install. Use `@upstash/redis` instead |
| `react-beautiful-dnd` | Maintenance mode | Consider `@dnd-kit/core` as alternative for Phase 2 |

## Security Audit

No known vulnerabilities in current dependency tree. Run periodic checks:

```bash
npm audit              # Check for known vulnerabilities
npm outdated          # Check for available updates
```
