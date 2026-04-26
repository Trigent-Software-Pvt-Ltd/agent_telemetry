"""Cloudflare Project Think adapter — durable, sandboxed long-running agents."""
from __future__ import annotations

import random
from typing import Any, Optional

from packages.shared.schema import ExecutionPath, Skill, SkillPlanItem, Task

from .base import AdapterResult, RuntimeAdapter, simulate_from_skill_performance


class CloudflareAdapter(RuntimeAdapter):
    provider = "cloudflare"
    handled_paths = (ExecutionPath.CLOUDFLARE,)

    def __init__(self, *, mode: str = "mock") -> None:
        self.mode = "mock"
        self._rng = random.Random()

    def invoke(
        self,
        *,
        task: Task,
        skill: Skill,
        plan_item: SkillPlanItem,
        instruction_patch: Optional[dict[str, Any]] = None,
    ) -> AdapterResult:
        success, latency_ms, cost, output = simulate_from_skill_performance(
            skill=skill, path_value=plan_item.executor, task=task, rng=self._rng
        )
        patch = instruction_patch or {}
        trace = {
            "provider": "cloudflare",
            "mode": "mock",
            "durable_object_id": f"do_{skill.skill_id}_{task.task_id}",
            "region": "auto",
            "sub_agents": [],
            "dir_rules_fired": list(patch.get("rules_fired", [])),
        }
        return AdapterResult(
            success=success,
            latency_ms=latency_ms,
            cost_usd=cost,
            output=output,
            trace=trace,
            tool_calls=[],
            provider=self.provider,
            model=plan_item.model_hint or "project-think-v1",
            actor_id=plan_item.actor_hint,
            applied_patch=patch or None,
        )
