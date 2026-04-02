# 8. Development Guidelines

## Development Setup

### Prerequisites
- Node.js 24 LTS
- npm (included with Node.js)

### Getting Started

```bash
# Install dependencies
npm install

# Start development server (Turbopack)
npm run dev

# Open in browser
# http://localhost:3000 (redirects to /dashboard)
```

### Available Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Start Turbopack dev server with HMR |
| `npm run build` | Production build |
| `npm run start` | Serve production build |
| `npm run lint` | Run ESLint (flat config) |

## Code Conventions

### File Organization

| Directory | Purpose | Convention |
|---|---|---|
| `app/` | Next.js routes | One `page.tsx` per route |
| `components/` | React components | Grouped by feature domain |
| `components/shared/` | Reusable primitives | Generic, no domain logic |
| `hooks/` | Custom React hooks | `use*.ts` naming |
| `lib/` | Business logic | Pure functions, no React |
| `types/` | TypeScript types | Domain type definitions |

### Component Conventions

- **Client Components**: Add `'use client'` directive at top
- **Exports**: Named exports (not default) for all components except pages
- **Props**: Define interface inline or co-located with component
- **Styling**: Tailwind utility classes + CSS custom properties from `globals.css`
- **Inline Styles**: Used for dynamic values (e.g., verdict colors) — acceptable pattern in this codebase

### Naming Conventions

| Type | Convention | Example |
|---|---|---|
| Components | PascalCase | `VerdictCard.tsx` |
| Hooks | camelCase with `use` prefix | `useCountUp.ts` |
| Types | PascalCase | `WorkflowSummary` |
| Constants | UPPER_SNAKE_CASE | `VERDICT_CONFIG` |
| CSS variables | kebab-case with prefix | `--vip-gold`, `--v-green` |
| Files | PascalCase (components), camelCase (lib/hooks) | `StatBanner.tsx`, `mock-data.ts` |

### Import Conventions

```typescript
// Path alias — use @/ for all project imports
import { Workflow } from '@/types/telemetry'
import { WORKFLOWS } from '@/lib/mock-data'
import { VerdictBadge } from '@/components/shared/VerdictBadge'
```

## Design System

### Color Tokens

| Token | Hex | Usage |
|---|---|---|
| `--vip-gold` | `#D4AF37` | Primary accent, active states |
| `--vip-navy` | `#0A1628` | Sidebar background, headings |
| `--vip-surface` | `#F7F9FC` | Page background |
| `--vip-border` | `#E2E8F0` | Card borders |
| `--vip-muted` | `#64748B` | Secondary text |
| `--v-green` | `#059669` | GREEN verdict |
| `--v-amber` | `#D97706` | AMBER verdict |
| `--v-red` | `#DC2626` | RED verdict |

### Typography

| Font | Variable | Usage |
|---|---|---|
| Sora | `--font-sora` | Headings, brand text |
| DM Sans | `--font-dm` | Body text (default) |
| JetBrains Mono | `--font-mono-jb` | Code, metrics, IDs |

### Card Pattern

```css
.card {
  border: 1px solid var(--vip-border);
  border-radius: 12px;
  background: #FFFFFF;
  box-shadow: 0 1px 3px rgba(10,22,40,0.06), 0 1px 2px rgba(10,22,40,0.04);
  padding: 20px 24px;
}
```

### Animation Classes

| Class | Effect |
|---|---|
| `.animate-fade-up` | Fade in + translate up (0.3s) |
| `.status-dot-green/amber/red` | Pulsing dot animation (2s loop) |
| `.span-bar` | Width fill animation (0.5s) |
| `.row-hover` | Gold tint on table row hover |

## Next.js 16 Specifics

### Breaking Changes to Remember

1. **Async Request APIs**: `await cookies()`, `await headers()`, `await params`, `await searchParams`
2. **Proxy replaces Middleware**: Use `proxy.ts` at same level as `app/` (Node.js runtime only)
3. **Turbopack config**: Top-level in `next.config.ts`, not under `experimental`
4. **Cache Components**: `'use cache'` directive replaces PPR

### ESLint Configuration

```javascript
// eslint.config.mjs — flat config format
import { dirname } from "path"
import { fileURLToPath } from "url"
import { FlatCompat } from "@eslint/eslintrc"

const compat = new FlatCompat({ baseDirectory: dirname(fileURLToPath(import.meta.url)) })
export default [...compat.extends("next/core-web-vitals", "next/typescript")]
```

### TypeScript Configuration

```json
{
  "compilerOptions": {
    "paths": { "@/*": ["./*"] }  // Path alias
  }
}
```

## Git Workflow

- **Main branch**: `main`
- **Deployment**: Auto-deploy on push to `main` via Vercel
- **Commit style**: Conventional commits recommended (`feat:`, `fix:`, `docs:`)

## Testing (Not Yet Implemented)

No test framework is currently configured. Recommended setup for future:

| Layer | Tool | Purpose |
|---|---|---|
| Unit tests | Vitest | Component and function testing |
| Component tests | React Testing Library | UI interaction testing |
| E2E tests | Playwright | Full user flow testing |
| Linting | ESLint (configured) | Code quality |
