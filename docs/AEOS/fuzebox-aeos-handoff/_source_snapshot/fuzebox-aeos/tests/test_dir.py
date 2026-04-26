"""Unit tests for the Dynamic Instruction Runtime (L9) rules."""
from __future__ import annotations

from packages.dynamic_instruction.runtime import (
    DynamicInstructionRuntime,
    RuntimeTrigger,
)
from packages.shared.schema import (
    ExecutionPath,
    RiskLevel,
    Skill,
    Task,
    TaskType,
)


def _hr_coaching_task() -> Task:
    return Task(
        task_id="t_hr_001",
        task_type=TaskType.COACHING,
        description="Build Q2 coaching plan for direct report.",
        complexity=0.5,
        risk_level=RiskLevel.MEDIUM,
        regulatory_class="general",
        latency_budget_ms=600_000,
        cost_budget_usd=30.0,
        explainability_required=True,
        human_signoff_required=True,
        tenant_id="bigco_hr",
    )


def _hr_coaching_skill() -> Skill:
    return Skill(
        skill_id="skill_hr_coaching_v1",
        name="HR Workforce Coaching",
        allowed_paths=[
            ExecutionPath.HUMAN,
            ExecutionPath.ANTHROPIC,
            ExecutionPath.HYBRID_ANTHROPIC_HUMAN,
        ],
        required_tools=["performance_history", "coaching_templates"],
        governance_tags=["people_data", "gdpr_sensitive"],
        strategic_weight=0.50,
        performance={},
    )


def _non_sensitive_skill() -> Skill:
    return Skill(
        skill_id="skill_field_dispatch_v1",
        name="Field Service Dispatch",
        allowed_paths=[ExecutionPath.HUMAN, ExecutionPath.OPENAI],
        required_tools=["fleet_tracker"],
        governance_tags=["sla_sensitive"],
        strategic_weight=0.40,
        performance={},
    )


def _runtime() -> DynamicInstructionRuntime:
    r = DynamicInstructionRuntime()
    r.load_default_rules()
    return r


def test_pii_mask_fires_on_gdpr_sensitive_skill():
    r = _runtime()
    patch = r.intercept(
        task=_hr_coaching_task(),
        skill=_hr_coaching_skill(),
        path=ExecutionPath.HYBRID_ANTHROPIC_HUMAN,
        phase=RuntimeTrigger.PRE_INPUT,
        signals={},
    )
    assert "dir_people_data_pii_mask" in patch.rules_fired
    assert "raw_customer_lookup" in patch.restricted_tools
    assert patch.require_human_confirmation is True
    assert any("<PII_MASK_N>" in s for s in patch.additional_instructions)
    assert patch.safety_envelope == "gdpr_pii_mask_v1"


def test_pii_mask_does_not_fire_on_non_sensitive_skill():
    r = _runtime()
    patch = r.intercept(
        task=_hr_coaching_task(),
        skill=_non_sensitive_skill(),
        path=ExecutionPath.OPENAI,
        phase=RuntimeTrigger.PRE_INPUT,
        signals={},
    )
    assert "dir_people_data_pii_mask" not in patch.rules_fired
