"""High-level smoke tests that touch every package."""
from __future__ import annotations

import pytest

from apps._runtime import build_runtime


@pytest.fixture(scope="module")
def runtime():
    return build_runtime(rng_seed=42)


def test_runtime_builds(runtime):
    assert runtime.authority.count() >= 9
    assert runtime.policy_engine.list_packs(), "policy packs must load"
    assert runtime.gateway.providers(), "gateway must have adapters"
    assert runtime.dir_runtime.rule_count() >= 5


def test_skills_load(runtime):
    brake = runtime.authority.try_get("skill_brake_diag_v3")
    assert brake is not None
    assert brake.strategic_weight == 0.65
    assert "safety_relevant" in brake.governance_tags


def test_rpotential_signals(runtime):
    signals = runtime.rpotential.get_signals(tenant_id="kengarff_south_jordan")
    assert signals.tenant_id == "kengarff_south_jordan"
    assert signals.uop_by_actor["tech_27"]["readiness"] == 0.78


def test_attestation_roundtrip(runtime):
    att = runtime.signer.sign(
        tenant_id="kengarff_south_jordan",
        period="2026-Q2",
        metric_name="EAI",
        metric_value=0.85,
        details={"note": "unit test"},
    )
    assert runtime.signer.verify(att) is True
    # Tampering should break the signature
    att.metric_value = 0.99
    assert runtime.signer.verify(att) is False


def test_evidence_bundle(runtime):
    from apps._runtime import run_flow, task_ken_garff_brake_diagnosis
    from packages.shared.schema import ExecutionPath, GovernanceRequirement

    gov = GovernanceRequirement(policy_pack="auto_safety_standard", evidence_export_required=True)
    run_flow(
        runtime,
        task=task_ken_garff_brake_diagnosis(),
        skill_id="skill_brake_diag_v3",
        candidate_paths=[ExecutionPath.HUMAN, ExecutionPath.HYBRID_ANTHROPIC_HUMAN],
        governance=gov,
        policy_pack_id="auto_safety_standard",
    )
    rows = runtime.ledger.for_tenant("kengarff_south_jordan")
    assert rows, "at least one row after running a flow"

    import time
    bundle = runtime.evidence_exporter.export(
        rows=rows,
        tenant_id="kengarff_south_jordan",
        format="eu_ai_act_article_12",
        period_start=rows[0].timestamp - 1,
        period_end=time.time() + 1,
    )
    assert bundle.row_count == len(rows)
    assert len(bundle.integrity_hash) == 64
