# Suggested Dashboard Panels

Ordered by narrative priority for a board-level demo. Each panel is
tagged with its data source so engineers know what to wire up.

## Hero row (three panels, top of screen)

1. **Enterprise Autonomy Index (EAI)** — the single headline number.
   - Source: `compute_eai(ledger.for_tenant(tenant_id))`
   - Viz: large numeric readout + 30-day sparkline
   - Signed attestation badge (two keys = verified) next to it.

2. **Human Preservation Index (HPI)** — counter-metric to EAI.
   - Source: `compute_hpi(rows)`
   - Viz: 0..1 gauge

3. **Hybrid Leverage Rate (HLR)** — the joint-IP proof point.
   - Source: `compute_hlr(rows)`
   - Viz: numeric + "above / below 1.0" color code

## Second row — the decision story

4. **Live decision feed** — streaming table of recent UEF decisions.
   - Source: `UEFResponse.to_dict()` per call
   - Columns: tenant, task_id, selected_path, confidence, selected_actor
   - Click-through to panel 8.

5. **Path mix donut** — share of executions by ExecutionPath.
   - Source: `ledger.for_tenant(tenant_id)` grouped by `selected_path`
   - Viz: donut chart; hybrids clustered together for the "we preserve humans" story.

6. **Policy evidence indicator** — count of evidence bundles signed this period.
   - Source: `EvidenceExporter.export(...)` result counts
   - Viz: "N bundles signed, all verified" badge.

## Third row — the L9 story

7. **L9 DIR rule firings** — which rules fired, how often, in what contexts.
   - Source: aggregate over `row.applied_patch.rules_fired`
   - Viz: horizontal bar chart, one bar per rule_id.
   - Narrative hook: "every safety-relevant prompt was citation-forced."

## Drill-down modal — one per decision

8. **Decision detail modal** (click-through from panel 4).
   - Eight-dimension scoring table (one row per candidate path).
   - Winning path highlighted.
   - Applied DIR patch shown as collapsible JSON.
   - Policy decision shown with required_controls list.
   - Two-party attestation signatures shown as pair of hex badges.

## Admin / observability

9. **Skills Authority heatmap** — skill_id × execution_path grid of
   success rates, drift-colored.
   - Source: `runtime.authority.get(skill_id).performance`
   - Viz: heatmap with diverging colorscale around the mean.

10. **Rolling EAI time-series** — full-width bottom strip.
    - Source: `ledger.rolling_window(tenant_id, days=30)` sliced by day,
      `compute_eai(day_subset)` per day.
    - Viz: area chart, EAI overlayed with HPI as secondary line.

## Out-of-band — two buttons always visible

- **Download signed evidence bundle** — calls `scripts/export_evidence.py`
  logic (see delivery-options.md in folder `06-evidence-delivery`).
- **Verify attestation** — paste a signature pair, call
  `AttestationSigner.verify_bundle(...)`, show ✓ or ✗.
