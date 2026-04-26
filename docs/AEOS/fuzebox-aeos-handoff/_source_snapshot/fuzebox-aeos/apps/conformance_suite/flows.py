"""The eight canonical conformance flows from Tech Spec v1.1 §19.

Each flow exercises the full 12-layer pipeline with a different tenant,
skill, regulatory class and policy pack. The suite is intentionally
strict about *what* the UEF should select so regressions are caught.
"""
from __future__ import annotations

from dataclasses import dataclass
from typing import Callable

from packages.shared.schema import (
    ExecutionPath,
    GovernanceRequirement,
    RiskLevel,
    Task,
    TaskType,
)

from apps._runtime import AEOSRuntime, FlowOutcome, run_flow


@dataclass
class ConformanceFlow:
    flow_id: str
    description: str
    build_task: Callable[[], Task]
    skill_id: str
    candidate_paths: list[ExecutionPath]
    governance: GovernanceRequirement
    policy_pack_id: str
    # Assertions (all optional; set to None to skip a check)
    expect_path_in: list[ExecutionPath] | None = None
    expect_human_involved: bool | None = None
    expect_policy_allow: bool | None = None
    expect_rules_fired_any: list[str] | None = None
    outcome_value_usd: float = 300.0

    def run(self, runtime: AEOSRuntime) -> FlowOutcome:
        return run_flow(
            runtime,
            task=self.build_task(),
            skill_id=self.skill_id,
            candidate_paths=self.candidate_paths,
            governance=self.governance,
            policy_pack_id=self.policy_pack_id,
            outcome_value_usd=self.outcome_value_usd,
        )


def _gov(**overrides) -> GovernanceRequirement:
    base = dict(
        audit_log_required=True,
        trace_retention_days=365,
        human_override_available=True,
        policy_pack="general",
        evidence_export_required=False,
    )
    base.update(overrides)
    return GovernanceRequirement(**base)


# ---- Flows ---------------------------------------------------------------


def service_bay_diagnosis() -> ConformanceFlow:
    return ConformanceFlow(
        flow_id="service_bay_diagnosis",
        description="Ken Garff brake diagnosis — safety-relevant, hybrid expected.",
        build_task=lambda: Task(
            task_id="cf_service_bay_001",
            task_type=TaskType.DIAGNOSTIC,
            description="Brake squeal + low pedal, intermittent.",
            complexity=0.65,
            risk_level=RiskLevel.HIGH,
            regulatory_class="auto_safety",
            latency_budget_ms=900_000,
            cost_budget_usd=40.0,
            explainability_required=True,
            human_signoff_required=True,
            tenant_id="kengarff_south_jordan",
            business_unit="service_bay",
        ),
        skill_id="skill_brake_diag_v3",
        candidate_paths=[
            ExecutionPath.HUMAN,
            ExecutionPath.ANTHROPIC,
            ExecutionPath.OPENAI,
            ExecutionPath.HYBRID_ANTHROPIC_HUMAN,
            ExecutionPath.HYBRID_OPENAI_HUMAN,
        ],
        governance=_gov(policy_pack="auto_safety_standard", evidence_export_required=True),
        policy_pack_id="auto_safety_standard",
        expect_path_in=[ExecutionPath.HYBRID_ANTHROPIC_HUMAN, ExecutionPath.HYBRID_OPENAI_HUMAN],
        expect_human_involved=True,
        expect_policy_allow=True,
        expect_rules_fired_any=["dir_safety_relevant_confirmation", "dir_auto_safety_tool_lockdown"],
    )


def contact_center_escalation() -> ConformanceFlow:
    return ConformanceFlow(
        flow_id="contact_center_escalation",
        description="CX triage — agent or hybrid acceptable; human override mandatory.",
        build_task=lambda: Task(
            task_id="cf_cx_001",
            task_type=TaskType.TRIAGE,
            description="Angry customer escalation, high LTV.",
            complexity=0.45,
            risk_level=RiskLevel.MEDIUM,
            regulatory_class="general",
            latency_budget_ms=120_000,
            cost_budget_usd=10.0,
            explainability_required=False,
            human_signoff_required=False,
            tenant_id="global_retail_cx",
        ),
        skill_id="skill_contact_escalation_v1",
        candidate_paths=[
            ExecutionPath.HUMAN,
            ExecutionPath.ANTHROPIC,
            ExecutionPath.OPENAI,
            ExecutionPath.UNIPHORE,
            ExecutionPath.HYBRID_OPENAI_HUMAN,
        ],
        governance=_gov(policy_pack="gdpr"),
        policy_pack_id="gdpr",
        expect_policy_allow=True,
    )


def sportsbook_recommendation() -> ConformanceFlow:
    return ConformanceFlow(
        flow_id="sportsbook_recommendation",
        description="Regulated gambling — responsible-play envelope must fire.",
        build_task=lambda: Task(
            task_id="cf_sports_001",
            task_type=TaskType.RECOMMENDATION,
            description="Live NFL game wager suggestion for opted-in bettor.",
            complexity=0.40,
            risk_level=RiskLevel.MEDIUM,
            regulatory_class="gambling",
            latency_budget_ms=5_000,
            cost_budget_usd=1.0,
            explainability_required=False,
            human_signoff_required=False,
            tenant_id="boyd_gaming_vegas",
        ),
        skill_id="skill_sportsbook_reco_v1",
        candidate_paths=[
            ExecutionPath.OPENAI,
            ExecutionPath.ANTHROPIC,
            ExecutionPath.HYBRID_OPENAI_HUMAN,
        ],
        governance=_gov(policy_pack="gambling_responsible"),
        policy_pack_id="gambling_responsible",
        expect_rules_fired_any=["dir_gambling_responsible_play"],
    )


def venue_operations_incident() -> ConformanceFlow:
    return ConformanceFlow(
        flow_id="venue_operations_incident",
        description="Casino floor medical incident response — human or hybrid.",
        build_task=lambda: Task(
            task_id="cf_venue_001",
            task_type=TaskType.ESCALATION,
            description="Guest medical event on gaming floor.",
            complexity=0.55,
            risk_level=RiskLevel.HIGH,
            regulatory_class="general",
            latency_budget_ms=60_000,
            cost_budget_usd=50.0,
            explainability_required=True,
            human_signoff_required=True,
            tenant_id="boyd_gaming_vegas",
        ),
        skill_id="skill_venue_incident_v1",
        candidate_paths=[
            ExecutionPath.HUMAN,
            ExecutionPath.OPENAI,
            ExecutionPath.ANTHROPIC,
            ExecutionPath.HYBRID_ANTHROPIC_HUMAN,
        ],
        governance=_gov(evidence_export_required=True, policy_pack="eu_ai_act_high_risk"),
        policy_pack_id="eu_ai_act_high_risk",
        expect_human_involved=True,
        expect_policy_allow=True,
    )


def marketing_campaign_exception() -> ConformanceFlow:
    return ConformanceFlow(
        flow_id="marketing_campaign_exception",
        description="Brand-safety exception on live campaign.",
        build_task=lambda: Task(
            task_id="cf_mkt_001",
            task_type=TaskType.WORKFLOW_ACTION,
            description="Running campaign hit brand-safety exception in EU region.",
            complexity=0.40,
            risk_level=RiskLevel.MEDIUM,
            regulatory_class="general",
            latency_budget_ms=900_000,
            cost_budget_usd=30.0,
            explainability_required=False,
            human_signoff_required=False,
            tenant_id="acme_global_marketing",
        ),
        skill_id="skill_marketing_exception_v1",
        candidate_paths=[
            ExecutionPath.HUMAN,
            ExecutionPath.OPENAI,
            ExecutionPath.SALESFORCE,
            ExecutionPath.HYBRID_OPENAI_HUMAN,
        ],
        governance=_gov(policy_pack="gdpr"),
        policy_pack_id="gdpr",
        expect_policy_allow=True,
    )


def automotive_cockpit_compliance() -> ConformanceFlow:
    return ConformanceFlow(
        flow_id="automotive_cockpit_compliance",
        description="WP.29 in-cockpit AI compliance review — human sign-off critical.",
        build_task=lambda: Task(
            task_id="cf_cockpit_001",
            task_type=TaskType.APPROVAL,
            description="Review voice-assistant dialog for WP.29 conformance.",
            complexity=0.80,
            risk_level=RiskLevel.CRITICAL,
            regulatory_class="auto_safety",
            latency_budget_ms=3_600_000,
            cost_budget_usd=200.0,
            explainability_required=True,
            human_signoff_required=True,
            tenant_id="global_oem_cockpit",
        ),
        skill_id="skill_cockpit_compliance_v1",
        candidate_paths=[
            ExecutionPath.HUMAN,
            ExecutionPath.ANTHROPIC,
            ExecutionPath.HYBRID_ANTHROPIC_HUMAN,
        ],
        governance=_gov(evidence_export_required=True, policy_pack="wp29"),
        policy_pack_id="wp29",
        expect_human_involved=True,
        expect_policy_allow=True,
    )


def field_service_dispatch() -> ConformanceFlow:
    return ConformanceFlow(
        flow_id="field_service_dispatch",
        description="SLA-sensitive field dispatch — agent-first acceptable.",
        build_task=lambda: Task(
            task_id="cf_field_001",
            task_type=TaskType.WORKFLOW_ACTION,
            description="Downed line reported, dispatch nearest qualified tech.",
            complexity=0.35,
            risk_level=RiskLevel.MEDIUM,
            regulatory_class="general",
            latency_budget_ms=30_000,
            cost_budget_usd=3.0,
            explainability_required=False,
            human_signoff_required=False,
            tenant_id="utility_field_ops",
        ),
        skill_id="skill_field_dispatch_v1",
        candidate_paths=[
            ExecutionPath.HUMAN,
            ExecutionPath.OPENAI,
            ExecutionPath.CLOUDFLARE,
            ExecutionPath.HYBRID_OPENAI_HUMAN,
        ],
        governance=_gov(),
        policy_pack_id="general",
        expect_policy_allow=True,
    )


def hr_workforce_coaching() -> ConformanceFlow:
    return ConformanceFlow(
        flow_id="hr_workforce_coaching",
        description="Personal-data coaching plan — GDPR + human override required.",
        build_task=lambda: Task(
            task_id="cf_hr_001",
            task_type=TaskType.COACHING,
            description="Generate Q2 coaching plan for underperforming direct report.",
            complexity=0.55,
            risk_level=RiskLevel.MEDIUM,
            regulatory_class="general",
            latency_budget_ms=600_000,
            cost_budget_usd=30.0,
            explainability_required=True,
            human_signoff_required=True,
            tenant_id="bigco_hr",
        ),
        skill_id="skill_hr_coaching_v1",
        candidate_paths=[
            ExecutionPath.HUMAN,
            ExecutionPath.ANTHROPIC,
            ExecutionPath.HYBRID_ANTHROPIC_HUMAN,
        ],
        governance=_gov(policy_pack="gdpr"),
        policy_pack_id="gdpr",
        expect_policy_allow=True,
    )


def insurance_claim_triage() -> ConformanceFlow:
    return ConformanceFlow(
        flow_id="insurance_claim_triage",
        description="First-notice-of-loss triage — hybrid-or-agent acceptable, GDPR policy pack.",
        build_task=lambda: Task(
            task_id="cf_claim_001",
            task_type=TaskType.TRIAGE,
            description="Inbound auto FNOL claim with soft-fraud signals on policy.",
            complexity=0.50,
            risk_level=RiskLevel.MEDIUM,
            regulatory_class="general",
            latency_budget_ms=300_000,
            cost_budget_usd=15.0,
            explainability_required=True,
            human_signoff_required=False,
            tenant_id="bigins_claims",
        ),
        skill_id="skill_claim_triage_v1",
        candidate_paths=[
            ExecutionPath.HUMAN,
            ExecutionPath.OPENAI,
            ExecutionPath.ANTHROPIC,
            ExecutionPath.HYBRID_OPENAI_HUMAN,
        ],
        governance=_gov(policy_pack="gdpr"),
        policy_pack_id="gdpr",
        expect_policy_allow=True,
    )


ALL_FLOWS: list[Callable[[], ConformanceFlow]] = [
    service_bay_diagnosis,
    contact_center_escalation,
    sportsbook_recommendation,
    venue_operations_incident,
    marketing_campaign_exception,
    automotive_cockpit_compliance,
    field_service_dispatch,
    hr_workforce_coaching,
    insurance_claim_triage,
]
