# Screen inventory & data bindings

Every screen maps to a stable AEOS service endpoint. No screen should
require new backend work; if engineering discovers otherwise, flag it
back to the backend team — the contract is already frozen.

## 1. Decision Explorer (primary)

**Purpose**: show the live UEF decision for a selected task.

**Data**:
- `POST /v1/uef/decide` (body = canonical UEF request) → full response
- `GET  /v1/skills/{skill_id}` → skill context card
- `POST /v1/governance/evaluate` → policy decision card

**Layout** (12-col grid):
- Row 1 (spans 12): tenant switcher + task header + "Re-run" button
- Row 2 col 1–6: UEF decision card (selected path, actor, confidence)
- Row 2 col 7–12: Adapter result card (provider, model, latency, cost)
- Row 3 col 1–12: Scored paths block (monospace; one row per path)
- Row 4 col 1–6: DIR patch card (rules fired, added instructions, tool locks)
- Row 4 col 7–12: Policy evaluation card (allow / deny / reasons / controls)
- Row 5 col 1–12: Ledger row card (execution_id, EAI contribution, attestation signature)

**Empty state**: “No task selected. Pick a task from the queue.”

## 2. EAI Board

**Purpose**: board-level autonomy metric.

**Data**:
- `GET /v1/ledger/metrics/{tenant_id}` → full metric bundle
- `POST /v1/governance/attest` → signs the EAI scalar

**Layout**:
- Hero tile: EAI number (34px mono, accent.primary). Caption: "across N executions last 30d".
- 6 sub-tiles in a 3×2 grid: UCS, SY, SER, EROI, HPI, HLR.
- Sparkline under EAI (last 30 virtual days).
- Signed attestation pill: "FuzeBox + rPotential verified ✓".

## 3. Ledger

**Purpose**: audit-friendly append-only row viewer.

**Data**:
- `GET /v1/ledger/rows/{tenant_id}` → paged rows
- `GET /v1/ledger/trace/{execution_id}` (future) → canonical trace events

**Layout**:
- Left: filter panel (tenant, skill, path, date range).
- Right: virtualized table. Columns:
  timestamp · tenant · skill · path · provider · actor · success · cost · EAI contribution
- Row click → right drawer (40% width): full LedgerRow JSON, canonical trace events, attestation block.

## 4. Policy Packs

**Purpose**: governance read-only transparency.

**Data**:
- `GET /v1/governance/packs` → packs + rule counts
- `GET /v1/governance/packs/{id}` (future) → full pack definition

**Layout**:
- Left: pack list.
- Right: rule table for selected pack (id, severity, when-summary, require-summary, fired-last-7d, denied-last-7d).
- Clicking a rule shows the raw YAML in a drawer.

## 5. Skills Authority

**Purpose**: per-skill performance + drift.

**Data**:
- `GET /v1/skills` → full list
- `GET /v1/skills/{id}` → single skill

**Layout**:
- 40-skill grid (4 cols × 10 rows). Each card: skill name, strategic weight
  ring (0..1), path chips with success-rate color coding, drift indicator.
- Click card → drawer with sparkline per path over last 30 days.

## 6. Evidence Export

**Purpose**: produce a signed bundle for regulators.

**Data**:
- `POST /v1/governance/evidence` → SignedEvidenceBundle
- `POST /v1/governance/attest` → signature pair

**Layout**:
- Left: form (tenant, format [EU AI Act / WP.29 / GDPR / SOC2], period start/end).
- Right: queue of recent bundles (integrity hash, signed-by, download link, download-expiry).
- Submit → loading skeleton → bundle lands in queue with signed URL.

## 7. Dynamic Instructions

**Purpose**: reveal the L9 control surface.

**Data**:
- `GET /v1/dir/rules` (to be added) → current rule set with fired counts
- `POST /v1/dir/replay` (to be added) → re-run a past decision with a modified rule set

**Layout**:
- Left: rule list.
- Right: rule detail (trigger, predicate, patch). Replay button re-runs the last decision and shows a side-by-side diff of patches.

**Note**: the two endpoints `/v1/dir/rules` and `/v1/dir/replay` are
the only net-new backend surface for the UI. Everything else reads
from the existing contract.
