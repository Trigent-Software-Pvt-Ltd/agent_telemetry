"""Shared in-process runtime assembly for apps and conformance suite.

Builds an end-to-end AEOS pipeline using mock adapters so demos and tests
run with zero external dependencies. This module is the single place
where all 12 layers are wired together.
"""
from __future__ import annotations

import json
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any, Optional

from packages.shared.schema import (
    Actor,
    EAIContribution,
    ExecutionPath,
    GovernanceRequirement,
    LedgerRow,
    RiskLevel,
    Skill,
    SkillPlanItem,
    Task,
    TaskType,
    WorkforceSignals,
    WritebackEvent,
    new_audit_id,
    new_execution_id,
)
from packages.skills_authority.authority import SkillsAuthority
from packages.rpotential_adapter.mock import MockRPotentialAdapter
from packages.uef.engine import universal_execution_function
from packages.adapter_gateway.anthropic_adapter import AnthropicAdapter
from packages.adapter_gateway.openai_adapter import OpenAIAdapter
from packages.adapter_gateway.salesforce_adapter import SalesforceAdapter
from packages.adapter_gateway.uniphore_adapter import UniphoreAdapter
from packages.adapter_gateway.cloudflare_adapter import CloudflareAdapter
from packages.adapter_gateway.google_vertex_adapter import GoogleVertexAdapter
from packages.adapter_gateway.human_adapter import HumanWorkforceAdapter
from packages.adapter_gateway.gateway import AdapterGateway
from packages.adapter_gateway.base import AdapterResult
from packages.dynamic_instruction.runtime import (
    DynamicInstructionRuntime,
    RuntimeTrigger,
)
from packages.telemetry_normalizer.normalizer import TelemetryNormalizer
from packages.economic_ledger.ledger import EconomicLedger
from packages.governance.policy_engine import PolicyEngine
from packages.governance.evidence import EvidenceExporter, AttestationSigner


ROOT = Path(__file__).resolve().parent.parent


@dataclass
class AEOSRuntime:
    authority: SkillsAuthority
    rpotential: MockRPotentialAdapter
    gateway: AdapterGateway
    dir_runtime: DynamicInstructionRuntime
    normalizer: TelemetryNormalizer
    ledger: EconomicLedger
    policy_engine: PolicyEngine
    evidence_exporter: EvidenceExporter
    signer: AttestationSigner
    actors_by_tenant: dict[str, list[Actor]] = field(default_factory=dict)

    def actors_for(self, tenant_id: str) -> list[Actor]:
        return self.actors_by_tenant.get(tenant_id, [])


def build_runtime(*, rng_seed: int | None = 42) -> AEOSRuntime:
    """Construct a ready-to-use AEOS runtime with mock adapters."""
    authority = SkillsAuthority()
    authority.load_from_file(ROOT / "fixtures" / "skills.json")

    rpotential = MockRPotentialAdapter(fixture_path=ROOT / "fixtures" / "signals.json")

    # Adapters — each in mock mode, deterministic RNG when seed provided
    import random as _random

    anthropic = AnthropicAdapter(mode="mock")
    openai = OpenAIAdapter(mode="mock")
    salesforce = SalesforceAdapter()
    uniphore = UniphoreAdapter()
    cloudflare = CloudflareAdapter()
    google_vertex = GoogleVertexAdapter(mode="mock")
    human = HumanWorkforceAdapter()

    if rng_seed is not None:
        for a in (anthropic, openai, salesforce, uniphore, cloudflare, google_vertex, human):
            if hasattr(a, "_rng"):
                a._rng = _random.Random(rng_seed)

    # Register human LAST so hybrid paths resolve to the human adapter when
    # the gateway does its final-pass lookup (not strictly required because
    # _dispatch_hybrid looks up ExecutionPath.HUMAN explicitly, but keeping
    # the order consistent avoids surprises).
    gateway = AdapterGateway(
        adapters=(anthropic, openai, salesforce, uniphore, cloudflare, google_vertex, human)
    )

    dir_runtime = DynamicInstructionRuntime()
    dir_runtime.load_default_rules()

    normalizer = TelemetryNormalizer()
    ledger = EconomicLedger()
    policy_engine = PolicyEngine()
    policy_engine.load_directory(ROOT / "policies")
    exporter = EvidenceExporter()
    signer = AttestationSigner()

    # Actors from fixture
    actors_raw = json.loads((ROOT / "fixtures" / "actors.json").read_text())
    actors_by_tenant: dict[str, list[Actor]] = {}
    for tenant_id, arr in actors_raw.items():
        actors_by_tenant[tenant_id] = [Actor(**a) for a in arr]

    return AEOSRuntime(
        authority=authority,
        rpotential=rpotential,
        gateway=gateway,
        dir_runtime=dir_runtime,
        normalizer=normalizer,
        ledger=ledger,
        policy_engine=policy_engine,
        evidence_exporter=exporter,
        signer=signer,
        actors_by_tenant=actors_by_tenant,
    )


# ---------------------------------------------------------------------------
# End-to-end run of one task through all layers.
# ---------------------------------------------------------------------------


@dataclass
class FlowOutcome:
    task_id: str
    decision_id: str
    selected_path: str
    selected_actor_id: Optional[str]
    scored_paths: list[dict[str, Any]]
    adapter_result: AdapterResult
    policy_decision: dict[str, Any]
    ledger_row: LedgerRow
    instruction_patch: dict[str, Any]
    trace: dict[str, Any]

    def to_summary(self) -> dict[str, Any]:
        return {
            "task_id": self.task_id,
            "decision_id": self.decision_id,
            "selected_path": self.selected_path,
            "selected_actor_id": self.selected_actor_id,
            "adapter_success": self.adapter_result.success,
            "adapter_latency_ms": self.adapter_result.latency_ms,
            "adapter_cost_usd": self.adapter_result.cost_usd,
            "policy_allow": self.policy_decision.get("allow"),
            "policy_controls": self.policy_decision.get("required_controls"),
            "rules_fired": self.instruction_patch.get("rules_fired", []),
            "outcome_value_usd": self.ledger_row.outcome_value_usd,
        }


def run_flow(
    runtime: AEOSRuntime,
    *,
    task: Task,
    skill_id: str,
    candidate_paths: list[ExecutionPath],
    governance: GovernanceRequirement,
    policy_pack_id: Optional[str] = None,
    outcome_value_usd: float = 300.0,
) -> FlowOutcome:
    skill = runtime.authority.get(skill_id)
    actors = runtime.actors_for(task.tenant_id)
    signals: WorkforceSignals = runtime.rpotential.get_signals(tenant_id=task.tenant_id)

    # Layer 7 — UEF decision
    uef_response = universal_execution_function(
        task=task,
        skill=skill,
        candidate_paths=candidate_paths,
        actors=actors,
        signals=signals,
        governance=governance,
    )
    plan_item: SkillPlanItem = uef_response.skill_plan[0]
    selected_path = uef_response.selected_path

    # Layer 9 — Dynamic Instruction Runtime
    dir_signals = {
        "skill_drift_risk": signals.skill_drift_risk.get(skill_id, 0.0),
        "actor_fatigue": (
            signals.uop_by_actor.get(plan_item.actor_hint or "", {}).get("fatigue", 0.0)
            if plan_item.actor_hint
            else 0.0
        ),
    }
    patch = runtime.dir_runtime.intercept(
        task=task,
        skill=skill,
        path=selected_path,
        phase=RuntimeTrigger.PRE_INPUT,
        signals=dir_signals,
    )

    # Layer 12 — Governance policy evaluation
    pack_id = policy_pack_id or governance.policy_pack
    policy_decision = runtime.policy_engine.evaluate(
        pack_id=pack_id,
        task=task,
        selected_path=selected_path,
        governance=governance,
    ).to_dict()

    # Layer 8 — Adapter Gateway dispatch (L9 patch threaded to the vendor invocation)
    adapter_result = runtime.gateway.dispatch(
        task=task,
        skill=skill,
        plan_item=plan_item,
        instruction_patch=patch.to_dict(),
    )

    # Layer 10 — Telemetry normalization
    import time as _time
    _exec_id_for_trace = new_execution_id()
    trace = runtime.normalizer.normalize(
        trace_id=f"trc_{_exec_id_for_trace[4:]}",
        tenant_id=task.tenant_id,
        task_id=task.task_id,
        decision_id=uef_response.decision_id,
        execution_id=_exec_id_for_trace,
        result=adapter_result,
        started_at=_time.time() - adapter_result.latency_ms / 1000.0,
    ).to_dict()

    # Layer 11 — Economic Ledger row
    risk_penalty_from_uef = next(
        (s.risk_penalty for s in uef_response.scored_paths if s.path == selected_path), 0.0
    )
    coord_tax_from_uef = next(
        (s.coordination_tax for s in uef_response.scored_paths if s.path == selected_path), 0.0
    )
    ai_share = 0.0 if selected_path == ExecutionPath.HUMAN else 1.0
    success_weight = 1.0 if adapter_result.success else 0.0
    governance_factor = 1.0 if policy_decision.get("allow") else 0.0
    preservation_factor = 0.0
    if selected_path in (
        ExecutionPath.HYBRID_ANTHROPIC_HUMAN,
        ExecutionPath.HYBRID_OPENAI_HUMAN,
    ):
        preservation_factor = skill.strategic_weight
    elif selected_path == ExecutionPath.HUMAN:
        preservation_factor = skill.strategic_weight * 0.85
    economic_return_factor = max(
        0.0, min(2.0, outcome_value_usd / max(1.0, adapter_result.cost_usd))
    ) / 2.0  # normalize to 0..1

    eai_contrib = EAIContribution(
        ai_task_share=ai_share,
        success_weight=success_weight,
        governance_factor=governance_factor,
        preservation_factor=preservation_factor,
        economic_return_factor=economic_return_factor,
    )

    gsti_delta = 0.01 if selected_path != ExecutionPath.HUMAN and "strategic_skill" in skill.governance_tags else 0.0
    uop_delta = 0.005 if plan_item.actor_hint else 0.0
    coord_delta = -coord_tax_from_uef * 0.05

    row = LedgerRow(
        execution_id=new_execution_id(),
        decision_id=uef_response.decision_id,
        task_id=task.task_id,
        skill_id=skill.skill_id,
        tenant_id=task.tenant_id,
        selected_path=selected_path,
        provider=adapter_result.provider,
        actor_ids=[plan_item.actor_hint] if plan_item.actor_hint else [],
        execution_cost_usd=adapter_result.cost_usd,
        latency_ms=adapter_result.latency_ms,
        success=adapter_result.success,
        success_probability_predicted=uef_response.expected_metrics.get("success_probability", 0.5),
        risk_penalty=risk_penalty_from_uef,
        coordination_tax=coord_tax_from_uef,
        gsti_delta=gsti_delta,
        uop_delta=uop_delta,
        coordination_delta=coord_delta,
        outcome_value_usd=outcome_value_usd if adapter_result.success else 0.0,
        audit_record_id=new_audit_id(),
        eai_contribution=eai_contrib,
        business_unit=task.business_unit,
        governance_tags=skill.governance_tags,
    )
    runtime.ledger.append(row)

    # Feedback loop: Skills Authority EMA update
    runtime.authority.apply_performance_update(
        skill_id=skill.skill_id,
        path=selected_path,
        success=adapter_result.success,
        cost=adapter_result.cost_usd,
        latency_ms=adapter_result.latency_ms,
    )

    # Writeback to rPotential
    runtime.rpotential.writeback(
        WritebackEvent(
            target_system="rpotential",
            skill_id=skill.skill_id,
            actor_id=plan_item.actor_hint,
            gsti_delta=gsti_delta,
            uop_delta=uop_delta,
            coordination_delta=coord_delta,
            execution_id=row.execution_id,
            timestamp=row.timestamp,
        )
    )

    return FlowOutcome(
        task_id=task.task_id,
        decision_id=uef_response.decision_id,
        selected_path=selected_path.value,
        selected_actor_id=uef_response.selected_actor_id,
        scored_paths=[s.to_dict() for s in uef_response.scored_paths],
        adapter_result=adapter_result,
        policy_decision=policy_decision,
        ledger_row=row,
        instruction_patch=patch.to_dict(),
        trace=trace,
    )


# ---------------------------------------------------------------------------
# Convenience Task builders
# ---------------------------------------------------------------------------


def task_ken_garff_brake_diagnosis() -> Task:
    return Task(
        task_id="task_kg_001",
        task_type=TaskType.DIAGNOSTIC,
        description="Brake squeal + low pedal on a 2022 sedan, intermittent.",
        complexity=0.65,
        risk_level=RiskLevel.HIGH,
        regulatory_class="auto_safety",
        latency_budget_ms=900_000,
        cost_budget_usd=40.0,
        explainability_required=True,
        human_signoff_required=True,
        tenant_id="kengarff_south_jordan",
        business_unit="service_bay",
    )
