"""Canonical schema for FuzeBox AEOS.

All vendor payloads normalize to these types before the UEF sees them.
Adapter isolation is the rule: UEF never sees vendor-specific types.

These dataclasses implement the "Canonical Schema" section of the
Technical Spec v1.1 §3 and the Layer 1-6 data structures described in the
reference implementation (aeos_bridge_reference.py).
"""
from __future__ import annotations

import time
import uuid
from dataclasses import dataclass, field, asdict
from enum import Enum
from typing import Any, Optional


# ---------------------------------------------------------------------------
# Enums
# ---------------------------------------------------------------------------


class TaskType(str, Enum):
    """Classification of work the control plane routes."""

    DIAGNOSTIC = "diagnostic"
    RECOMMENDATION = "recommendation"
    TRANSACTION = "transaction"
    TRIAGE = "triage"
    APPROVAL = "approval"
    CONTENT = "content"
    WORKFLOW_ACTION = "workflow_action"
    ESCALATION = "escalation"
    COACHING = "coaching"


class RiskLevel(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class ExecutionPath(str, Enum):
    """Candidate runtimes the control plane can dispatch to."""

    HUMAN = "human"
    ANTHROPIC = "anthropic_agent"
    OPENAI = "openai_agent"
    SALESFORCE = "salesforce_agent"
    UNIPHORE = "uniphore_agent"
    CLOUDFLARE = "cloudflare_agent"
    GOOGLE_VERTEX = "google_vertex_agent"
    HYBRID_ANTHROPIC_HUMAN = "hybrid_anthropic_human"
    HYBRID_OPENAI_HUMAN = "hybrid_openai_human"


# ---------------------------------------------------------------------------
# Layer 1 — Intent Capture
# ---------------------------------------------------------------------------


@dataclass
class Task:
    """Layer 1 — Intent Capture. The work to be decided."""

    task_id: str
    task_type: TaskType
    description: str
    complexity: float  # 0.0 to 1.0
    risk_level: RiskLevel
    regulatory_class: str  # "auto_safety", "general", "financial", "gambling", ...
    latency_budget_ms: int
    cost_budget_usd: float
    explainability_required: bool
    human_signoff_required: bool
    tenant_id: str
    business_unit: Optional[str] = None
    metadata: dict[str, Any] = field(default_factory=dict)


# ---------------------------------------------------------------------------
# Layer 3 — Skills Authority
# ---------------------------------------------------------------------------


@dataclass
class Skill:
    """Layer 3 — Skills Authority. An executable capability object."""

    skill_id: str
    name: str
    allowed_paths: list[ExecutionPath]
    required_tools: list[str]
    governance_tags: list[str]  # "safety_relevant", "strategic_skill", ...
    strategic_weight: float  # 0.0 to 1.0 — contributes to GSTI routing
    # Performance history keyed by ExecutionPath.value
    # Each entry: {"success_rate": float, "avg_cost": float, "avg_latency_ms": int}
    performance: dict[str, dict[str, float]] = field(default_factory=dict)
    version: str = "1.0"
    description: str = ""


# ---------------------------------------------------------------------------
# Layer 6 — Live Signal Bus
# ---------------------------------------------------------------------------


@dataclass
class Actor:
    """A human or agent that can execute work."""

    actor_id: str
    actor_type: str  # "human" or "agent"
    provider: str  # "anthropic", "openai", "salesforce", "uniphore", "cloudflare", "human"
    capabilities: list[str]  # skill_ids this actor is qualified for
    availability: float  # 0.0 to 1.0 (UOP readiness)
    fatigue: float  # 0.0 to 1.0 (UOP overload indicator)
    certifications: list[str] = field(default_factory=list)
    metadata: dict[str, Any] = field(default_factory=dict)


@dataclass
class WorkforceSignals:
    """Layer 6 — Live Signal Bus.

    The exclusive contribution from rPotential's labor graph.
    These signals are read once by the UEF and influence the score of every
    candidate path regardless of which vendor runtime would execute the work.
    """

    tenant_id: str
    gsti: dict[str, float] = field(default_factory=dict)
    # skill_id -> strategic weight (0-1). GenAI Skill Transformation Index.
    skill_drift_risk: dict[str, float] = field(default_factory=dict)
    # skill_id -> drift risk (0-1)
    uop_by_actor: dict[str, dict[str, float]] = field(default_factory=dict)
    # actor_id -> {readiness, fatigue, capacity}. Units of Potential.
    coordination_tax: dict[str, float] = field(default_factory=dict)
    # workflow_id or task_id -> coordination tax (0-1)
    as_of: float = field(default_factory=time.time)


# ---------------------------------------------------------------------------
# Layer 2 — Policy & Regulatory
# ---------------------------------------------------------------------------


@dataclass
class GovernanceRequirement:
    """Layer 2 — Policy & Regulatory. Constraints that apply to execution."""

    audit_log_required: bool = True
    trace_retention_days: int = 90
    human_override_available: bool = True
    policy_pack: str = "general"  # "eu_ai_act_high_risk", "wp29", "gdpr", "auto_safety_standard", ...
    data_residency_required: Optional[str] = None
    evidence_export_required: bool = False


# ---------------------------------------------------------------------------
# Context bundle (the full UEF input context)
# ---------------------------------------------------------------------------


@dataclass
class ContextBundle:
    """Everything the UEF needs beyond the Task itself."""

    task: Task
    skill: Skill
    actors: list[Actor]
    signals: WorkforceSignals
    governance: GovernanceRequirement
    candidate_paths: list[ExecutionPath] = field(default_factory=list)


# ---------------------------------------------------------------------------
# UEF request / response
# ---------------------------------------------------------------------------


@dataclass
class UEFRequest:
    """Request body for POST /v1/uef/decide."""

    task: Task
    skills_required: list[str]
    candidate_paths: list[ExecutionPath]
    constraints: dict[str, Any] = field(default_factory=dict)
    context: dict[str, Any] = field(default_factory=dict)


@dataclass
class SkillPlanItem:
    """One entry in the UEF skill plan."""

    skill_id: str
    executor: str  # ExecutionPath value
    model_hint: Optional[str] = None
    actor_hint: Optional[str] = None
    justification: str = ""


@dataclass
class ScoredPath:
    """A candidate execution path with its full eight-dimension breakdown.

    Layer 7 UEF scoring model:
        total = capability_fit + gsti_value + uop_value
              − coordination_tax + governance_score + runtime_fit
              + economic_value − risk_penalty
    """

    path: ExecutionPath
    capability_fit: float
    gsti_value: float
    uop_value: float
    coordination_tax: float
    governance_score: float
    runtime_fit: float
    economic_value: float
    risk_penalty: float
    total: float
    selected_actor_id: Optional[str] = None
    justification: str = ""

    def to_dict(self) -> dict[str, Any]:
        d = asdict(self)
        d["path"] = self.path.value
        return d


@dataclass
class UEFResponse:
    """Response body for POST /v1/uef/decide."""

    decision_id: str
    selected_path: ExecutionPath
    confidence: float
    skill_plan: list[SkillPlanItem]
    governance_requirements: list[str]
    expected_metrics: dict[str, float]
    writeback_requirements: list[str]
    scored_paths: list[ScoredPath] = field(default_factory=list)
    selected_actor_id: Optional[str] = None


# ---------------------------------------------------------------------------
# Layer 11 — Execution Economic Ledger
# ---------------------------------------------------------------------------


@dataclass
class EAIContribution:
    """One ledger row's contribution to the Enterprise Autonomy Index."""

    ai_task_share: float  # 1 if agent or hybrid executed, else 0
    success_weight: float
    governance_factor: float
    preservation_factor: float
    economic_return_factor: float


@dataclass
class LedgerRow:
    """Append-only ledger row — the unit of economic truth in AEOS."""

    execution_id: str
    decision_id: str
    task_id: str
    skill_id: str
    tenant_id: str
    selected_path: ExecutionPath
    provider: str
    actor_ids: list[str]
    execution_cost_usd: float
    latency_ms: int
    success: bool
    success_probability_predicted: float
    risk_penalty: float
    coordination_tax: float
    gsti_delta: float
    uop_delta: float
    coordination_delta: float
    outcome_value_usd: float
    audit_record_id: str
    eai_contribution: EAIContribution
    timestamp: float = field(default_factory=time.time)
    business_unit: Optional[str] = None
    governance_tags: list[str] = field(default_factory=list)

    def to_dict(self) -> dict[str, Any]:
        d = asdict(self)
        d["selected_path"] = self.selected_path.value
        return d


@dataclass
class WritebackEvent:
    """Layer 6 writeback event emitted to rPotential after execution."""

    target_system: str  # "rpotential" or another capability graph
    skill_id: str
    actor_id: Optional[str]
    gsti_delta: float
    uop_delta: float
    coordination_delta: float
    execution_id: str
    timestamp: float


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


def new_decision_id() -> str:
    return f"dec_{uuid.uuid4().hex[:12]}"


def new_execution_id() -> str:
    return f"exe_{uuid.uuid4().hex[:12]}"


def new_audit_id() -> str:
    return f"aud_{uuid.uuid4().hex[:12]}"
