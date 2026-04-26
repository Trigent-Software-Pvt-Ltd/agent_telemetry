# 12 — Dependency Management & Upgrade Path

## Current dependencies (`package.json`)

### Production

| Package | Pinned | Purpose | Notes |
|---|---|---|---|
| `next` | `16.2.1` | React framework + App Router | Major: Next.js 16 (request APIs are async, `proxy.ts` replaces `middleware.ts`) |
| `react` | `19.2.4` | UI runtime | Matches Next.js 16 floor |
| `react-dom` | `19.2.4` | DOM bindings | |
| `drizzle-orm` | `^0.45.2` | Query builder + schema | Typed, compile-time-safe SQL |
| `pg` | `^8.20.0` | node-postgres driver | Standard client; pool configured in `lib/db/index.ts` |
| `@auth/drizzle-adapter` | `^1.11.1` | NextAuth ↔ Drizzle bridge | Keeps auth tables in the same schema file |
| `next-auth` | `^4.24.13` | Session + provider framework | v4; a move to v5 is non-trivial |
| `ioredis` | `^5.10.1` | Redis client | Used for future pub/sub + rate limiting |
| `recharts` | `^3.8.1` | React charting | Area, bar, radar, scatter, composed |
| `lucide-react` | `^1.6.0` | Icon set | Tree-shakeable |
| `clsx` | `^2.1.1` | Conditional className helper | |
| `sonner` | `^2.0.7` | Toast notifications | |
| `uuid` | `^13.0.0` | ID generation | UUIDv5 in `scripts/seed.ts` for deterministic fixtures |

### Dev

| Package | Pinned | Purpose |
|---|---|---|
| `typescript` | `^5` | Type checker |
| `eslint` | `^9` | Linter |
| `eslint-config-next` | `16.2.1` | Next.js preset |
| `drizzle-kit` | `^0.31.10` | Schema migrations CLI |
| `tailwindcss` | `^4` | CSS framework |
| `@tailwindcss/postcss` | `^4` | Tailwind v4 PostCSS plugin |
| `@types/node` | `^20` | Node types |
| `@types/react` | `^19` | React 19 types |
| `@types/pg` | `^8.20.0` | Postgres driver types |
| `@types/uuid` | `^10.0.0` | UUID types |

## Health of the dependency graph

- **Single source of risk — NextAuth v4.** It's maintenance-only; v5 (Auth.js) is the active line. Upgrade is non-trivial (new provider-registration shape, breaking API-route conventions). Plan for Q3/Q4.
- **Tailwind v4** is recent; keep an eye on plugin ecosystem churn.
- **Drizzle 0.45** is current as of cutoff. Schema-breaking changes between minors are uncommon but do happen — pin minor, review changelog before upgrading.
- **Node 22** in production (via `nvm` in `setup.sh`) — matches Next.js 16's expectations and should stay LTS until mid-2027.

## Known deprecations / sunset watch

| Area | Sunset | Our posture |
|---|---|---|
| `@vercel/postgres` | Sunset — replaced by `@neondatabase/serverless` (Vercel) | Not in use; we're on `pg` directly. No action. |
| `@vercel/kv` | Sunset — replaced by `@upstash/redis` | Not in use; we're on `ioredis`. No action. |
| NextAuth v4 | Maintenance-only | Plan v5 upgrade when feature surface stabilises |
| Next.js 15 `middleware.ts` | Superseded by Next.js 16's `proxy.ts` | No middleware today; adopt `proxy.ts` when we add one |

## Dependency-sanity tooling (recommended)

```bash
# Detect outdated packages
npx npm-check-updates

# Vuln scan on direct + transitive
npm audit --production --audit-level=high

# SBOM for enterprise reviews
npm install -g @cyclonedx/cyclonedx-npm
cyclonedx-npm --output-format JSON --output-file sbom.json

# GitHub Dependabot — zero-cost, configure in .github/dependabot.yml
```

## Upgrade order / sequencing

When a major upgrade cycle is due, proceed in this order:

1. **TypeScript + Node LTS** (they rarely break consumers, and they tighten the floor).
2. **ESLint + `eslint-config-next`** (tied to Next.js version; bump together).
3. **Drizzle + `@auth/drizzle-adapter`** (schema compat — regenerate & run seeds in a throwaway DB first).
4. **`pg`** (driver; check for stream API changes).
5. **`recharts`** (heavy visual surface — do a smoke pass through every chart).
6. **Next.js + React** (bundled per major; read breaking-changes carefully, especially Server Component rules).
7. **NextAuth v4 → v5** (treat as a separate project — API-route rewrites, session callback reshape).

## Pinning policy

- `next`, `react`, `react-dom`: **exact pins** (Next.js + React ship coupled majors).
- `eslint-config-next`: **exact pin** tied to Next version.
- Everything else: caret (`^`) range — Drizzle and pg have been stable here.

## License posture

All listed dependencies are MIT or Apache-2.0. Run `npx license-checker --production --summary` on a quarterly cadence; enterprise buyers may ask for an SBOM with license attestation.

## Supply-chain hygiene

Recommendations for a hardened posture:

- Enable npm **provenance** verification (`npm ci --prefer-provenance`) once CI is in place.
- Pin the npm registry (no mirror drift) in `.npmrc`.
- Introduce `npm audit signatures` in CI to catch tampered packages.
- Long-term: switch to `pnpm` with lockfile-pinning if multi-repo workspace expansion is planned (faster installs, strict `node_modules` layout).
