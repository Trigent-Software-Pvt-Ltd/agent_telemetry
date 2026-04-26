# 4. Dashboard Design — AEOS Control Plane UI

No existing React wireframes, but the visual direction is already
established by the stdlib `apps/sales_demo/server.py` dashboard in the
reference monorepo. This folder captures the design system, layout
grammar, and screen inventory the React team should implement. Open
`wireframes.html` in a browser to see the exact look we want.

## Design principles

1. **Decision-first.** Every screen answers "what just happened and why"
   before it shows "how it's going." The live UEF scoring breakdown is
   the product.
2. **Numbers are the art.** Tabular + monospaced wherever a value
   matters. No decorative iconography in data zones.
3. **Dark canvas, bright data.** Trading-desk palette. Board members
   and auditors both expect high contrast for long sessions.
4. **Audit-ready by default.** Every view must be screenshot-able as
   evidence. No hover-only information, no animation-gated content.
5. **Signals over aesthetics.** Color is reserved for meaning: green =
   preservation/safety, amber = drift/fatigue warning, red = policy
   violation or regulatory stop.

## Visual system

### Palette
| Token | Hex | Use |
|---|---|---|
| `bg.canvas`       | `#0b1220` | Outer page background |
| `bg.card`         | `#131c30` | Card / panel |
| `bg.nested`       | `#0d1526` | Data blocks inside a card |
| `border.line`     | `#223255` | Card border |
| `border.divider`  | `#22315a` | In-card row dividers |
| `fg.primary`      | `#e8eefb` | Body text, values |
| `fg.secondary`    | `#9db2d9` | Labels |
| `fg.muted`        | `#8da0c0` | Captions |
| `accent.primary`  | `#8fd3ff` | Headings, KPI hero numbers |
| `accent.ok`       | `#6ee7b7` | Positive delta, allow, human-in-loop satisfied |
| `accent.warn`     | `#fbbf24` | Drift / fatigue / near-budget |
| `accent.bad`      | `#f87171` | Policy deny, rule violation, risk spike |
| `pill.bg`         | `#1d3a6a` | Pills, badges |
| `pill.fg`         | `#9fd8ff` | Pill text |

### Typography
- UI chrome: `Inter`, system-ui fallback. 14/16/22/28/34.
- Data and IDs: `JetBrains Mono` (fallback `Menlo`, `ui-monospace`). 12/14.
- No italics anywhere. Bold reserved for hero numbers and active tab.

### Layout grammar
- 8px base grid. Cards have 20–24px internal padding.
- 12px gap between stacked rows inside a card; 24px between cards.
- Max content width: 1440px; single fixed gutter, never full-bleed.
- Grid: 12-column CSS grid for the dashboard surface; most views use
  two 6-col cards side by side, or a 4/8 split for metric vs detail.

### Motion
- Transitions only on tab + filter changes. 150ms, cubic-bezier(.2,.8,.2,1).
- No loading spinners — skeleton rows only. Refresh is explicit (button),
  never polling-driven flicker.

### Component vocabulary
- **Card** — rounded 12, 1px border, 20-24px padding, header label in
  accent.primary, uppercase, 11-12px, letter-spacing .08em.
- **Row** — label on the left (`fg.secondary`), value on the right
  (monospace, `fg.primary`), dashed divider.
- **Pill** — inline 2×8px, rounded 999, pill colors above.
- **Scored paths block** — nested block, monospace, zebra-optional.
- **Hero metric** — 32–34px mono, accent.primary, small caption under.

## Screen inventory (v1)

1. **Decision Explorer** (primary) — live UEF breakdown for a task, with
   scored paths, DIR patch, policy evaluation, adapter result, ledger
   row. This is the screen every demo returns to.
2. **EAI Board** — executive tile with EAI hero + UCS, SY, SER, EROI,
   SDD, HPI, HLR sub-tiles. Tenant switcher in the header.
3. **Ledger** — append-only row viewer: filter by tenant, skill, path,
   date. Click row → drawer with trace events + signed attestation.
4. **Policy Packs** — read-only list of loaded packs + rules + last
   evaluation statistics (fired count, deny count, warn count).
5. **Skills Authority** — 40-skill grid with performance chart per
   path. Shows EMA drift over last 30 days.
6. **Evidence Export** — form + queue: pick tenant, pack, period,
   format → signed bundle link.
7. **Dynamic Instructions** — rules list, fired counts, a “replay” panel
   that re-runs the last decision with a modified rule set.

All seven screens use the same card grammar. Component library:
stick with shadcn/ui + Tailwind for the React build — colors above map
to a Tailwind `theme.extend.colors` block.

## What's in this folder

| File | Purpose |
|---|---|
| `wireframes.html` | Inline-rendered wireframes for screens 1, 2, 3. Open in any browser — no build step. |
| `design-tokens.json` | Machine-readable color + typography tokens for the Tailwind config. |
| `screen-inventory.md` | Per-screen wireframe notes, data-binding map, and API endpoints consumed. |

## Deliverables for engineering

- [ ] Port `design-tokens.json` into `tailwind.config.ts`.
- [ ] Build the Decision Explorer first; the other six screens are
      structural refactors of the same primitives.
- [ ] Bind every view to the stable API surface documented in
      `services/*.py` — never screen-scrape the demo's HTML.
- [ ] Treat the reference dashboard at `apps/sales_demo/server.py` as
      the acceptance target — pixel-for-pixel equivalence not required,
      but the information density and hierarchy must match.
