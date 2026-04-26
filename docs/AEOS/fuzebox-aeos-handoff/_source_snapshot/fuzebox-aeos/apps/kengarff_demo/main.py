"""Ken Garff South Jordan end-to-end demo.

Runs a single brake-diagnosis task through all twelve AEOS layers and
prints a sales-ready summary. Also computes EAI + HPI + HLR across a
small handful of simulated runs so the ledger surface area is exercised.

    $ python -m apps.kengarff_demo.main

No external dependencies required; mock adapters + fixture signals only.
"""
from __future__ import annotations

import json

from packages.shared.schema import ExecutionPath, GovernanceRequirement
from packages.economic_ledger.metrics import (
    compute_eai,
    compute_eroi,
    compute_hlr,
    compute_hpi,
    compute_ser,
)

from apps._runtime import build_runtime, run_flow, task_ken_garff_brake_diagnosis


def main():
    runtime = build_runtime(rng_seed=42)

    print("=" * 72)
    print("FUZEBOX AEOS — KEN GARFF DEMO (South Jordan service bay)")
    print("=" * 72)
    print()

    task = task_ken_garff_brake_diagnosis()
    governance = GovernanceRequirement(
        audit_log_required=True,
        trace_retention_days=365,
        human_override_available=True,
        policy_pack="auto_safety_standard",
        evidence_export_required=True,
    )

    candidates = [
        ExecutionPath.HUMAN,
        ExecutionPath.ANTHROPIC,
        ExecutionPath.OPENAI,
        ExecutionPath.HYBRID_ANTHROPIC_HUMAN,
        ExecutionPath.HYBRID_OPENAI_HUMAN,
    ]

    outcome = run_flow(
        runtime,
        task=task,
        skill_id="skill_brake_diag_v3",
        candidate_paths=candidates,
        governance=governance,
        policy_pack_id="auto_safety_standard",
        outcome_value_usd=300.0,
    )

    print("── UEF Decision ──")
    print(f"  selected_path:     {outcome.selected_path}")
    print(f"  selected_actor:    {outcome.selected_actor_id}")
    print(f"  decision_id:       {outcome.decision_id}")
    print()
    print("── Scored Paths ──")
    for s in outcome.scored_paths:
        print(
            f"  {s['path']:<28} total={s['total']:.3f}  "
            f"cap={s['capability_fit']:.2f} gsti={s['gsti_value']:+.2f} "
            f"uop={s['uop_value']:+.2f} -coord={-s['coordination_tax']:+.2f} "
            f"gov={s['governance_score']:+.2f} rt={s['runtime_fit']:+.2f} "
            f"econ={s['economic_value']:+.2f} -risk={-s['risk_penalty']:+.2f}"
        )
    print()
    print("── Layer 9 Dynamic Instruction Patch ──")
    print(f"  rules_fired:       {outcome.instruction_patch.get('rules_fired')}")
    if outcome.instruction_patch.get("additional_instructions"):
        for i, line in enumerate(outcome.instruction_patch["additional_instructions"], 1):
            print(f"  instruction[{i}]:   {line[:100]}")
    print()
    print("── Layer 8 Adapter Gateway ──")
    print(f"  provider:          {outcome.adapter_result.provider}")
    print(f"  model:             {outcome.adapter_result.model}")
    print(f"  success:           {outcome.adapter_result.success}")
    print(f"  latency_ms:        {outcome.adapter_result.latency_ms:,}")
    print(f"  cost_usd:          ${outcome.adapter_result.cost_usd:.2f}")
    print()
    print("── Layer 12 Governance ──")
    print(f"  policy allow:      {outcome.policy_decision['allow']}")
    print(f"  required_controls: {outcome.policy_decision['required_controls']}")
    print()
    print("── Layer 11 Ledger Row ──")
    row = outcome.ledger_row
    print(f"  execution_id:      {row.execution_id}")
    print(f"  outcome_value_usd: ${row.outcome_value_usd:.2f}")
    print(f"  gsti_delta:        {row.gsti_delta:+.4f}")
    print(f"  uop_delta:         {row.uop_delta:+.4f}")
    print(f"  governance_factor: {row.eai_contribution.governance_factor}")
    print()

    # Run several more tasks to populate the ledger for metric computation
    print("── Populating ledger (10 additional Ken Garff tasks) ──")
    for i in range(10):
        t = task_ken_garff_brake_diagnosis()
        t.task_id = f"task_kg_{i+2:03d}"
        run_flow(
            runtime,
            task=t,
            skill_id="skill_brake_diag_v3",
            candidate_paths=candidates,
            governance=governance,
            policy_pack_id="auto_safety_standard",
            outcome_value_usd=300.0,
        )
    rows = runtime.ledger.for_tenant("kengarff_south_jordan")
    print(f"  total rows: {len(rows)}")
    print()

    print("── Layer 11 Metrics (Ken Garff South Jordan) ──")
    eai = compute_eai(rows)
    print(f"  SER  (Skill Elasticity Ratio):        {compute_ser(rows):.3f}")
    print(f"  EROI (Economic Return on Intelligence): {compute_eroi(rows):.3f}")
    print(f"  HPI  (Human Preservation Index):      {compute_hpi(rows):.3f}")
    print(f"  HLR  (Hybrid Leverage Ratio):         {compute_hlr(rows):.3f}")
    print(f"  EAI  (Enterprise Autonomy Index):     {eai.eai:.4f}")
    print()

    # Signed attestation of EAI
    att = runtime.signer.sign(
        tenant_id="kengarff_south_jordan",
        period="2026-Q2",
        metric_name="EAI",
        metric_value=eai.eai,
        details=eai.to_dict(),
    )
    verified = runtime.signer.verify(att)
    print("── Layer 12 Two-Party Attestation (FuzeBox + rPotential) ──")
    print(f"  attestation_id:    {att.attestation_id}")
    print(f"  fuzebox_signature: {att.fuzebox_signature[:24]}…")
    print(f"  rpotential_signature: {att.rpotential_signature[:24]}…")
    print(f"  verify:            {verified}")
    print()

    # Evidence export
    import time as _time
    bundle = runtime.evidence_exporter.export(
        rows=rows,
        tenant_id="kengarff_south_jordan",
        format="eu_ai_act_article_12",
        period_start=rows[0].timestamp,
        period_end=_time.time(),
    )
    print("── Layer 12 Evidence Bundle ──")
    print(f"  format:            {bundle.format}")
    print(f"  row_count:         {bundle.row_count}")
    print(f"  integrity_hash:    {bundle.integrity_hash[:32]}…")
    print(f"  summary:           {json.dumps(bundle.summary)}")
    print()
    print("=" * 72)
    print("DEMO COMPLETE — reference implementation reproduced end-to-end.")
    print("=" * 72)

    return outcome


if __name__ == "__main__":
    main()
