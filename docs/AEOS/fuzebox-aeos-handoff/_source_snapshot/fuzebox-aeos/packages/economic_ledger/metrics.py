"""Derived metrics computed over ledger rows.

Per Tech Spec §8.2 and Claude Code Prompt 13:

    UCS = total_cost / executions
    SY  = successful / executions
    SER = SY / UCS
    EROI = outcome_value − (cost + coord_tax + risk_cost)
    SDD = current_success_rate − prior_success_rate
    HPI = human_executions_on_strategic_skills / total_strategic_skill_executions
    HLR = mean(hybrid_eroi) / max(mean(human_only_eroi), mean(agent_only_eroi))

    EAI = (AI_adjusted_task_share × success_rate
           × governance_factor × economic_return_factor)
        + (hybrid_execution_share × preservation_factor)
        − (control_failures + risk_penalties)

All functions take a list[LedgerRow] and return a float or a structured
breakdown. They are pure, deterministic, and easily unit tested against
synthetic fixtures.
"""
from __future__ import annotations

from dataclasses import dataclass
from statistics import mean
from typing import Iterable

from packages.shared.schema import ExecutionPath, LedgerRow


_HYBRID_PATHS = {
    ExecutionPath.HYBRID_ANTHROPIC_HUMAN.value,
    ExecutionPath.HYBRID_OPENAI_HUMAN.value,
}
_AGENT_ONLY_PATHS = {
    ExecutionPath.ANTHROPIC.value,
    ExecutionPath.OPENAI.value,
    ExecutionPath.SALESFORCE.value,
    ExecutionPath.UNIPHORE.value,
    ExecutionPath.CLOUDFLARE.value,
}
_HUMAN_ONLY_PATHS = {ExecutionPath.HUMAN.value}


# ---------------------------------------------------------------------------
# Low-level skill economics
# ---------------------------------------------------------------------------


def compute_ucs(rows: list[LedgerRow]) -> float:
    """Unit Cost of Skill."""
    if not rows:
        return 0.0
    return sum(r.execution_cost_usd for r in rows) / len(rows)


def compute_sy(rows: list[LedgerRow]) -> float:
    """Skill Yield (successful / total)."""
    if not rows:
        return 0.0
    successful = sum(1 for r in rows if r.success)
    return successful / len(rows)


def compute_ser(rows: list[LedgerRow]) -> float:
    """Skill Efficiency Ratio = SY / UCS."""
    ucs = compute_ucs(rows)
    if ucs <= 0:
        return 0.0
    return compute_sy(rows) / ucs


def compute_eroi(rows: list[LedgerRow]) -> float:
    """Execution ROI = mean(outcome_value − cost − coord_tax − risk_cost)."""
    if not rows:
        return 0.0
    values = []
    for r in rows:
        risk_cost = r.risk_penalty * r.execution_cost_usd
        values.append(r.outcome_value_usd - r.execution_cost_usd - (r.coordination_tax * r.execution_cost_usd) - risk_cost)
    return mean(values) if values else 0.0


def compute_sdd(rows: list[LedgerRow], *, split_at: float | None = None) -> float:
    """Skill Drift Delta = current_success_rate − prior_success_rate.

    If split_at is None, splits the ledger rows in half by timestamp.
    Otherwise split_at is a unix timestamp; rows before/after the boundary.
    """
    if len(rows) < 2:
        return 0.0
    ordered = sorted(rows, key=lambda r: r.timestamp)
    if split_at is None:
        mid = len(ordered) // 2
        prior, current = ordered[:mid], ordered[mid:]
    else:
        prior = [r for r in ordered if r.timestamp < split_at]
        current = [r for r in ordered if r.timestamp >= split_at]
    if not prior or not current:
        return 0.0
    return compute_sy(current) - compute_sy(prior)


# ---------------------------------------------------------------------------
# Joint-IP metrics (HPI, HLR)
# ---------------------------------------------------------------------------


def compute_hpi(rows: list[LedgerRow]) -> float:
    """Human Preservation Index.

    Share of executions of strategically-important skills that actually
    ran on a human path (either pure human or hybrid). Skills are
    considered strategic when 'strategic_skill' is present in their
    governance_tags (carried through to ledger row).
    """
    strategic = [r for r in rows if "strategic_skill" in r.governance_tags]
    if not strategic:
        return 0.0
    preserved = [
        r
        for r in strategic
        if r.selected_path == ExecutionPath.HUMAN
        or r.selected_path.value in _HYBRID_PATHS
    ]
    return len(preserved) / len(strategic)


def compute_hlr(rows: list[LedgerRow]) -> float:
    """Hybrid Leverage Rate.

    Mean EROI of hybrid paths divided by the max mean EROI of pure human
    or pure agent paths. >1.0 means hybrid is winning on economic value.
    """
    def _mean_eroi(subset: list[LedgerRow]) -> float:
        if not subset:
            return 0.0
        return compute_eroi(subset)

    hybrid = [r for r in rows if r.selected_path.value in _HYBRID_PATHS]
    human = [r for r in rows if r.selected_path.value in _HUMAN_ONLY_PATHS]
    agent = [r for r in rows if r.selected_path.value in _AGENT_ONLY_PATHS]

    hybrid_eroi = _mean_eroi(hybrid)
    best_single = max(_mean_eroi(human), _mean_eroi(agent))
    if best_single <= 0:
        return 0.0
    return hybrid_eroi / best_single


# ---------------------------------------------------------------------------
# Enterprise Autonomy Index
# ---------------------------------------------------------------------------


@dataclass
class EAIBreakdown:
    """Component-level breakdown for the EAI SKU board-level report."""

    eai: float
    ai_adjusted_task_share: float
    success_rate: float
    governance_factor: float
    economic_return_factor: float
    hybrid_execution_share: float
    preservation_factor: float
    control_failures: int
    risk_penalties: float
    row_count: int

    def to_dict(self) -> dict:
        return {
            "eai": round(self.eai, 4),
            "ai_adjusted_task_share": round(self.ai_adjusted_task_share, 4),
            "success_rate": round(self.success_rate, 4),
            "governance_factor": round(self.governance_factor, 4),
            "economic_return_factor": round(self.economic_return_factor, 4),
            "hybrid_execution_share": round(self.hybrid_execution_share, 4),
            "preservation_factor": round(self.preservation_factor, 4),
            "control_failures": self.control_failures,
            "risk_penalties": round(self.risk_penalties, 4),
            "row_count": self.row_count,
        }


def compute_eai(rows: list[LedgerRow]) -> EAIBreakdown:
    """Enterprise Autonomy Index — the joint FuzeBox + rPotential metric."""
    if not rows:
        return EAIBreakdown(0, 0, 0, 0, 0, 0, 0, 0, 0.0, 0)

    n = len(rows)
    ai_task_share = sum(r.eai_contribution.ai_task_share for r in rows) / n
    success_rate = sum(1 for r in rows if r.success) / n

    # governance_factor = share of rows that passed governance without violations
    # (approximated by risk_penalty below a threshold + success on high-risk paths)
    governance_factor = sum(r.eai_contribution.governance_factor for r in rows) / n

    # economic_return_factor = mean of per-row economic_return_factor
    economic_return_factor = sum(r.eai_contribution.economic_return_factor for r in rows) / n

    hybrid_share = sum(
        1 for r in rows if r.selected_path.value in _HYBRID_PATHS
    ) / n

    # preservation_factor — the HPI read directly
    preservation_factor = compute_hpi(rows)

    # control_failures = count of rows where governance_factor <= 0
    control_failures = sum(
        1 for r in rows if r.eai_contribution.governance_factor <= 0
    )

    # risk_penalties = sum of risk_penalty values across all rows (scaled)
    risk_penalties = sum(r.risk_penalty for r in rows) / n

    eai = (
        ai_task_share * success_rate * governance_factor * economic_return_factor
        + hybrid_share * preservation_factor
        - (control_failures / n + risk_penalties)
    )

    return EAIBreakdown(
        eai=eai,
        ai_adjusted_task_share=ai_task_share,
        success_rate=success_rate,
        governance_factor=governance_factor,
        economic_return_factor=economic_return_factor,
        hybrid_execution_share=hybrid_share,
        preservation_factor=preservation_factor,
        control_failures=control_failures,
        risk_penalties=risk_penalties,
        row_count=n,
    )
