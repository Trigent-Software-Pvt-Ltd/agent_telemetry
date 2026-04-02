# 11. Code Quality & Refactoring Insights

## Static Analysis Results

### ESLint Configuration
- **Config**: Flat ESLint config (`eslint.config.mjs`)
- **Presets**: `next/core-web-vitals`, `next/typescript`
- **Status**: Configured and functional via `npm run lint`

### Code Complexity Analysis

#### Simple Components (Low Complexity)
These components have straightforward render logic with no branching:
- `StatusDot` — Single conditional class
- `VerdictBadge` — Lookup table pattern
- `StatTile` — Pure display component
- `ExportButton` — Simple click handler
- `Tooltip` — CSS-only hover animation

#### Moderate Complexity
- `Sidebar` — Pathname matching for active state, section iteration
- `VerdictCard` — Multiple `useCountUp` hooks, conditional styling
- `StatBanner` — Multiple `StatTile` composition

#### Higher Complexity
- `RecentRuns` — Pagination state, row expansion, span rendering
- `LatencyChart` — Recharts configuration, reference lines, custom tooltips
- `ComparisonMatrix` — Multi-workflow data computation and table rendering
- `mock-data.ts` — Deterministic generation algorithm with tier logic

## Code Patterns in Use

### Pattern: Verdict-Driven Styling
Used consistently across components. A lookup object maps `Verdict` to visual properties:

```typescript
// Consistent pattern seen in VerdictCard, verdict-logic.ts, VerdictBadge
const VERDICT_STYLES = {
  GREEN: { bg: '#ECFDF5', border: '#059669' },
  AMBER: { bg: '#FFFBEB', border: '#D97706' },
  RED:   { bg: '#FFF5F5', border: '#DC2626' },
}
```

**Assessment**: Good pattern. Centralized in `verdict-logic.ts` for labels/icons, duplicated slightly in `VerdictCard.tsx` for component-specific styles. Consider consolidating.

### Pattern: Seeded Deterministic Generation
The mock data uses integer arithmetic for reproducible "random" data:

```typescript
const seed = workflowId.length * 137
const s = (seed + i * 31337) % 1000
```

**Assessment**: Effective for demo purposes. Produces consistent data across sessions. Not suitable for production — must be replaced with real data sources.

### Pattern: CSS Variables + Tailwind @theme
Dual definition of design tokens:

```css
:root { --vip-gold: #D4AF37; }       /* For inline styles and custom CSS */
@theme inline { --color-vip-gold: #D4AF37; }  /* For Tailwind utility classes */
```

**Assessment**: This is the correct Tailwind CSS 4 pattern. Both are needed: `@theme` tokens enable `text-vip-gold` Tailwind classes, while `:root` variables support `var(--vip-gold)` in inline styles and custom CSS. However, many components use hardcoded hex values instead of either system.

### Pattern: Component Key for Animation Reset

```tsx
<VerdictCard key={`verdict-${activeWorkflowId}`} summary={summary} workflow={workflow} />
```

**Assessment**: Intentional pattern to force component unmount/remount when workflow changes, triggering entrance animations via `useCountUp` and `.animate-fade-up`. Valid React pattern for animation resets.

## Identified Code Smells

### 1. Non-Null Assertions (`!`)
```typescript
const workflow = WORKFLOWS.find(w => w.id === workflowId)!
```
- **Locations**: `mock-data.ts` (lines 51, 102), `dashboard/page.tsx` (line 19)
- **Risk**: Runtime crash if invalid `workflowId` is passed
- **Fix**: Add validation or use a Map for O(1) lookup with explicit error handling

### 2. Duplicated Color Definitions
The same hex values appear in:
- `globals.css` (`:root` and `@theme`)
- `verdict-logic.ts` (`VERDICT_CONFIG`)
- `VerdictCard.tsx` (`VERDICT_STYLES`)
- `Sidebar.tsx` (inline styles)

**Recommendation**: Use CSS variables everywhere. Components should reference `var(--vip-*)` or Tailwind classes, not hardcoded hex values.

### 3. Large Page Components
`dashboard/page.tsx` is a single 54-line component that:
- Owns state (`useState`)
- Provides context (`WorkflowContext.Provider`)
- Renders sidebar, topbar, and 7 dashboard widgets
- Computes data (`computeSummary`, `generateRuns`)

**Recommendation**: Extract data computation into a custom hook. Consider a `DashboardLayout` component.

### 4. Magic Numbers
```typescript
const splits = [[0.25, 0.45, 0.30], [0.20, 0.55, 0.25], [0.30, 0.40, 0.30]]
const s = (seed + i * 31337) % 1000
```

**Recommendation**: Add comments explaining the purpose of `31337`, `137`, and the split ratios. These are mock data internals but should be documented for maintainability.

## Refactoring Recommendations

### Priority 1: Data Layer Abstraction

Create an abstraction layer so the transition from mock to real data is seamless:

```typescript
// lib/data-source.ts
export interface DataSource {
  getWorkflows(): Promise<Workflow[]>
  getRuns(workflowId: string, count?: number): Promise<Run[]>
  getSummary(workflowId: string): Promise<WorkflowSummary>
}

// lib/mock-data-source.ts — current mock implementation
// lib/langfuse-data-source.ts — future real implementation
```

### Priority 2: Server Component Migration

Move data fetching to Server Components:

```
Before:  dashboard/page.tsx ('use client') → computeSummary() inline
After:   dashboard/page.tsx (Server) → dashboard/DashboardClient.tsx ('use client')
```

### Priority 3: Component Consolidation

- Merge `VERDICT_STYLES` in `VerdictCard.tsx` with `VERDICT_CONFIG` in `verdict-logic.ts`
- Create a `useWorkflowData(workflowId)` hook that returns `{ workflow, summary, runs }`
- Extract layout shell (Sidebar + TopBar + main content area) into a route group layout

## No TODO/FIXME Markers Found

A search of the codebase reveals no `TODO`, `FIXME`, `HACK`, or `XXX` comments in any source file. This is expected for a freshly generated demo application.
