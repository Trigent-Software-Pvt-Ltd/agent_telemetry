"""Runtime adapter interface shared by every vendor-specific adapter."""
from __future__ import annotations

import random
import time
from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from typing import Any, Optional

from packages.shared.schema import (
    ExecutionPath,
    Skill,
    SkillPlanItem,
    Task,
)


@dataclass
class AdapterResult:
    """Normalized result of invoking a runtime adapter."""

    success: bool
    latency_ms: int
    cost_usd: float
    output: str
    trace: dict[str, Any] = field(default_factory=dict)
    tool_calls: list[dict[str, Any]] = field(default_factory=list)
    provider: str = ""
    model: Optional[str] = None
    actor_id: Optional[str] = None
    applied_patch: Optional[dict[str, Any]] = None

    def to_dict(self) -> dict[str, Any]:
        return {
            "success": self.success,
            "latency_ms": self.latency_ms,
            "cost_usd": self.cost_usd,
            "output": self.output,
            "trace": self.trace,
            "tool_calls": self.tool_calls,
            "provider": self.provider,
            "model": self.model,
            "actor_id": self.actor_id,
            "applied_patch": self.applied_patch,
        }


class RuntimeAdapter(ABC):
    """Every adapter implements the same narrow interface.

    The UEF doesn't call adapters directly — it produces a skill plan and
    the AdapterGateway dispatches to the right adapter based on executor.
    Adapters must translate canonical types into vendor-specific calls
    without ever returning vendor-specific types to the UEF.
    """

    provider: str = "unknown"
    handled_paths: tuple[ExecutionPath, ...] = ()

    @abstractmethod
    def invoke(
        self,
        *,
        task: Task,
        skill: Skill,
        plan_item: SkillPlanItem,
        instruction_patch: Optional[dict[str, Any]] = None,
    ) -> AdapterResult:
        """Execute the plan item on the vendor's runtime.

        ``instruction_patch`` is the L9 Dynamic Instruction Runtime output
        for this invocation. Adapters must incorporate it before sending
        payload to the vendor; see ``_invoke_live`` in the Anthropic
        adapter for the reference pattern.
        """


# ---------------------------------------------------------------------------
# Mock-mode simulation helpers shared by every adapter
# ---------------------------------------------------------------------------


def simulate_from_skill_performance(
    *,
    skill: Skill,
    path_value: str,
    task: Task,
    rng: random.Random | None = None,
) -> tuple[bool, int, float, str]:
    """Shared mock-mode simulation based on Skills Authority history.

    Returns (success, latency_ms, cost_usd, output_stub).
    """
    rng = rng or random.Random()
    history = skill.performance.get(path_value, {"success_rate": 0.5, "avg_cost": 10.0, "avg_latency_ms": 2000})
    success = rng.random() < float(history["success_rate"])
    cost = float(history["avg_cost"]) * rng.uniform(0.85, 1.15)
    latency_ref = float(history.get("avg_latency_ms", 2000))
    latency = max(150, int(rng.uniform(latency_ref * 0.7, min(task.latency_budget_ms, latency_ref * 1.3) if task.latency_budget_ms > 0 else latency_ref)))
    outcome_word = "ok" if success else "inconclusive"
    output = f"[mock:{path_value}] {skill.name} executed → {outcome_word}"
    return success, latency, round(cost, 2), output
