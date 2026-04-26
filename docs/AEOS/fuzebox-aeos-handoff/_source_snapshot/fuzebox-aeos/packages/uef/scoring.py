"""Eight-dimension scoring for candidate execution paths.

Each scoring function reads a different slice of context. The master
formula (Tech Spec §5) is:

    ExecutionPathScore
        = capability_fit
        + gsti_value        ← rPotential signal
        + uop_value         ← rPotential signal
        − coordination_tax  ← rPotential signal
        + governance_score
        + runtime_fit
        + economic_value
        − risk_penalty

The rPotential-sourced signals (GSTI, UOP, coordination tax) appear in
three of the eight dimensions. They are read once per decision and
influence scoring for every candidate path, regardless of which vendor
would execute the work. This is the "workforce signals above the runtime"
pattern from the white paper.
"""
from __future__ import annotations

from typing import Optional

from packages.shared.schema import (
    Actor,
    ExecutionPath,
    GovernanceRequirement,
    RiskLevel,
    Skill,
    Task,
    WorkforceSignals,
)


_HYBRID_PATHS = (
    ExecutionPath.HYBRID_ANTHROPIC_HUMAN,
    ExecutionPath.HYBRID_OPENAI_HUMAN,
)

_AGENT_PATHS = (
    ExecutionPath.ANTHROPIC,
    ExecutionPath.OPENAI,
    ExecutionPath.SALESFORCE,
    ExecutionPath.UNIPHORE,
    ExecutionPath.CLOUDFLARE,
)


def score_capability_fit(path: ExecutionPath, task: Task, skill: Skill) -> float:
    """How well the path can actually perform the required skill.

    Reads rolling performance history from Skills Authority.
    Returns -1.0 when the path is not in skill.allowed_paths (hard-filter).
    """
    if path not in skill.allowed_paths:
        return -1.0
    history = skill.performance.get(path.value, {"success_rate": 0.5, "avg_cost": 10.0})
    return float(history["success_rate"])


def score_gsti_value(
    path: ExecutionPath, skill: Skill, signals: WorkforceSignals
) -> float:
    """Strategic skill preservation signal from rPotential.

    High GSTI + human/hybrid path => positive bonus (we preserve strategic skill).
    High GSTI + agent-only path   => negative penalty (we would be deskilling).
    Drift risk on hybrid path     => extra reinforcement bonus.
    """
    gsti = signals.gsti.get(skill.skill_id, skill.strategic_weight)
    drift = signals.skill_drift_risk.get(skill.skill_id, 0.0)

    strategic_bonus = 0.0
    if gsti > 0.6:
        if path == ExecutionPath.HUMAN or path in _HYBRID_PATHS:
            strategic_bonus = gsti * 0.4
        else:
            strategic_bonus = -gsti * 0.2

    drift_bonus = 0.0
    if drift > 0.3 and path in _HYBRID_PATHS:
        drift_bonus = drift * 0.3

    return strategic_bonus + drift_bonus


def score_uop_value(
    path: ExecutionPath, actors: list[Actor], signals: WorkforceSignals
) -> tuple[float, Optional[str]]:
    """Live workforce readiness signal.

    For human and hybrid paths, picks the best-fit human actor based on
    rPotential's UOP vector (readiness, fatigue, capacity). Returns both the
    score and the selected actor_id.

    For pure agent paths, returns a baseline availability score with no actor.
    """
    is_human_eligible = (
        path == ExecutionPath.HUMAN or path in _HYBRID_PATHS
    )
    if is_human_eligible:
        best_actor: Optional[str] = None
        best_score = -1.0
        for actor in actors:
            if actor.actor_type != "human":
                continue
            uop = signals.uop_by_actor.get(actor.actor_id, {})
            readiness = uop.get("readiness", actor.availability)
            fatigue = uop.get("fatigue", actor.fatigue)
            score = readiness - (fatigue * 0.5)
            if score > best_score:
                best_score = score
                best_actor = actor.actor_id
        return max(best_score, 0.0), best_actor
    return 0.3, None  # baseline agent availability


def score_coordination_tax(
    path: ExecutionPath, task: Task, signals: WorkforceSignals
) -> float:
    """Penalty for workflow friction, sourced from rPotential."""
    base_tax = signals.coordination_tax.get(task.task_id, 0.1)
    if path in _HYBRID_PATHS:
        base_tax += 0.2
    return base_tax


def score_governance(
    path: ExecutionPath, gov: GovernanceRequirement, task: Task
) -> float:
    """Does this path satisfy governance requirements?

    Strong preferences:
      - CRITICAL/HIGH risk requires human-in-loop
      - EU AI Act high-risk prefers human or hybrid
      - Explainability required prefers human or hybrid
    """
    score = 0.5
    if task.risk_level in (RiskLevel.HIGH, RiskLevel.CRITICAL):
        if path == ExecutionPath.HUMAN or path in _HYBRID_PATHS:
            score += 0.3
        else:
            score -= 0.5
    if gov.policy_pack in ("eu_ai_act_high_risk", "wp29"):
        if path == ExecutionPath.HUMAN or path in _HYBRID_PATHS:
            score += 0.2
        if path in _AGENT_PATHS and gov.human_override_available:
            score += 0.1
    if task.explainability_required:
        if path == ExecutionPath.HUMAN or path in _HYBRID_PATHS:
            score += 0.1
    return score


def score_runtime_fit(path: ExecutionPath, task: Task) -> float:
    """Classic runtime-fit component: latency, cost, reliability."""
    # Latency-sensitive tasks favor fast agent paths.
    if task.latency_budget_ms < 2000:
        if path in (ExecutionPath.ANTHROPIC, ExecutionPath.OPENAI):
            return 0.8
        if path in _HYBRID_PATHS:
            return 0.3
        if path == ExecutionPath.HUMAN:
            return 0.1
    # More forgiving latency budget
    if path == ExecutionPath.HUMAN:
        return 0.55
    if path in _HYBRID_PATHS:
        return 0.6
    return 0.7


def score_economic_value(path: ExecutionPath, task: Task, skill: Skill) -> float:
    """Expected outcome value minus execution cost."""
    history = skill.performance.get(path.value, {"avg_cost": 10.0, "success_rate": 0.5})
    expected_value = 30.0 * history["success_rate"]
    cost = history["avg_cost"]
    return (expected_value - cost) / 30.0


def score_risk_penalty(path: ExecutionPath, task: Task, skill: Skill) -> float:
    """Downside risk of the path."""
    penalty = 0.0
    if task.regulatory_class == "auto_safety" and path in (
        ExecutionPath.ANTHROPIC,
        ExecutionPath.OPENAI,
    ):
        penalty += 0.4
    if "safety_relevant" in skill.governance_tags and path == ExecutionPath.HUMAN:
        penalty -= 0.1  # human residual risk is lower for safety work
    if task.regulatory_class == "gambling" and path in _AGENT_PATHS:
        # Responsible-gaming check prefers human-in-loop for high-risk
        if task.risk_level in (RiskLevel.HIGH, RiskLevel.CRITICAL):
            penalty += 0.3
    return max(penalty, 0.0)
