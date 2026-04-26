"""Durable persistence and replay for the Economic Ledger."""
from __future__ import annotations

import tempfile
from pathlib import Path

from packages.economic_ledger.ledger import EconomicLedger
from packages.economic_ledger.metrics import compute_eai
from packages.shared.schema import (
    EAIContribution,
    ExecutionPath,
    LedgerRow,
    new_audit_id,
    new_execution_id,
)


def _row(i: int) -> LedgerRow:
    return LedgerRow(
        execution_id=new_execution_id(),
        decision_id=f"dec_replay_{i}",
        task_id=f"task_replay_{i}",
        skill_id="skill_brake_diag_v3",
        tenant_id="kengarff_south_jordan",
        selected_path=ExecutionPath.HYBRID_ANTHROPIC_HUMAN,
        provider="hybrid",
        actor_ids=["tech_27"],
        execution_cost_usd=12.5,
        latency_ms=600_000,
        success=True,
        success_probability_predicted=0.9,
        risk_penalty=0.1,
        coordination_tax=0.15,
        gsti_delta=0.01,
        uop_delta=0.005,
        coordination_delta=-0.01,
        outcome_value_usd=300.0,
        audit_record_id=new_audit_id(),
        eai_contribution=EAIContribution(
            ai_task_share=1.0,
            success_weight=1.0,
            governance_factor=1.0,
            preservation_factor=0.65,
            economic_return_factor=0.8,
        ),
        governance_tags=["safety_relevant", "strategic_skill"],
    )


def test_replay_from_disk_round_trip():
    with tempfile.TemporaryDirectory() as tmp:
        path = Path(tmp) / "ledger.jsonl"

        original = EconomicLedger(persist_path=path)
        for i in range(10):
            original.append(_row(i))
        assert original.count() == 10
        original_eai = compute_eai(original.all())

        # Fresh ledger replays the same file
        replayed = EconomicLedger(persist_path=path)
        count = replayed.replay_from_disk(path)

        assert count == 10
        assert replayed.count() == 10
        replayed_eai = compute_eai(replayed.all())
        assert replayed_eai.to_dict() == original_eai.to_dict()
