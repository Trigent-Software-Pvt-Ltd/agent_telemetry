# 10. Technical Debt & Issues

## Critical Issues

### 1. `credentials.csv` in Repository
- **Severity**: CRITICAL
- **Location**: `./credentials.csv` (project root)
- **Issue**: A CSV file containing credentials is committed to the repository
- **Fix**: Add to `.gitignore`, remove from git history using `git filter-repo`, rotate any exposed credentials

### 2. No `.env*.local` in `.gitignore`
- **Severity**: HIGH (pre-production)
- **Issue**: When environment variables are added for Langfuse/Supabase/O*NET, `.env.local` files must not be committed
- **Fix**: Verify `.gitignore` includes `.env*.local` pattern

## Architecture Debt

### 3. All Pages are Client Components
- **Severity**: MEDIUM
- **Issue**: Every page uses `'use client'`, making the entire app a client-side SPA. This loses Next.js benefits: server-side rendering, streaming, code splitting per route
- **Recommendation**: Refactor data fetching to Server Components, push `'use client'` boundaries down to interactive widgets (charts, dropdowns, forms)

### 4. No Server-Side Data Layer
- **Severity**: MEDIUM (expected for demo phase)
- **Issue**: All data is generated client-side. No API routes, no database, no external integrations
- **Impact**: Must be replaced entirely before production
- **Tech Spec Reference**: See `docs/AgentQuality_TechSpec_FuzeboxAI.docx` sections 3-5 for target schema and API contracts

### 5. Hardcoded Colors in Inline Styles
- **Severity**: LOW
- **Issue**: Many components use inline `style={{}}` with hardcoded hex colors (e.g., `color: '#94A3B8'`, `background: '#1E3A5F'`) instead of CSS variables or Tailwind classes
- **Example**: `Sidebar.tsx` lines 42-50, `VerdictCard.tsx`
- **Impact**: Makes theme changes difficult; inconsistent with the CSS variable system in `globals.css`
- **Recommendation**: Convert to Tailwind utility classes using the `@theme inline` tokens defined in `globals.css`

### 6. Dashboard State Management
- **Severity**: LOW
- **Issue**: `WorkflowContext` is created at the dashboard page level, but `computeSummary()` and `generateRuns()` are called on every render without memoization
- **Impact**: Unnecessary recomputation on unrelated re-renders
- **Fix**: Wrap in `useMemo` keyed on `activeWorkflowId`

### 7. Missing Error Boundaries
- **Severity**: LOW
- **Issue**: No React Error Boundaries in the component tree. If a chart component throws, the entire page crashes
- **Recommendation**: Add `error.tsx` files in each route segment per Next.js conventions

### 8. No Loading States
- **Severity**: LOW
- **Issue**: No `loading.tsx` files for route transitions. Currently invisible since all data is synchronous, but will be needed when real API calls are added
- **Recommendation**: Add `loading.tsx` with skeleton UI for each route

## Code Quality Observations

### 9. Inconsistent Layout Approach
- **Issue**: Sidebar is rendered independently in each page instead of in a shared layout. This means sidebar re-mounts on navigation
- **Fix**: Move `Sidebar` to `app/layout.tsx` or create a `(dashboard)/layout.tsx` route group

### 10. Missing `key` Props Risk
- **Issue**: VerdictCard uses explicit `key` props for re-mount animation (`key={verdict-${workflowId}}`), which is a valid pattern but should be documented. Other components may not handle workflow switching gracefully without similar keys

### 11. No TypeScript Strict Mode Issues
- **Status**: TypeScript is configured but `strict` mode specifics not verified in `tsconfig.json`
- **Note**: The codebase uses `!` non-null assertions (e.g., `WORKFLOWS.find(w => w.id === workflowId)!`) which will throw at runtime if the ID is invalid

### 12. README is Default Template
- **Issue**: `README.md` contains the default Create Next App content with references to Geist font (not used) and generic instructions
- **Recommendation**: Replace with project-specific documentation

## Dependency Concerns

### 13. No Lock on Major Versions
- **Issue**: Several dependencies use caret ranges (`^`) which allow major version upgrades
- **Risk**: `recharts: "^3.8.1"` and other packages could introduce breaking changes on `npm install`
- **Mitigation**: `package-lock.json` provides deterministic installs, but consider pinning critical dependencies

### 14. Missing Development Dependencies
- **Issue**: No testing framework, no Prettier, no commit hooks (Husky/lint-staged)
- **Impact**: No automated quality gates before commits

## Prioritized Action Items

| Priority | Item | Effort | Impact |
|---|---|---|---|
| P0 | Remove `credentials.csv` from repo + git history | 30 min | Security |
| P0 | Verify `.gitignore` covers `.env*.local` | 5 min | Security |
| P1 | Add error boundaries (`error.tsx` per route) | 2 hrs | Reliability |
| P1 | Memoize `computeSummary`/`generateRuns` calls | 30 min | Performance |
| P2 | Move Sidebar to shared layout | 1 hr | Architecture |
| P2 | Replace inline style colors with Tailwind tokens | 3 hrs | Maintainability |
| P2 | Add loading states (`loading.tsx`) | 2 hrs | UX |
| P3 | Update README with project-specific content | 1 hr | Documentation |
| P3 | Add testing framework (Vitest + RTL) | 4 hrs | Quality |
