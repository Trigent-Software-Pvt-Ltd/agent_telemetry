"""The Adapter Gateway itself.

Holds a registry of runtime adapters keyed by ExecutionPath, and
dispatches a UEF skill plan item to the right adapter. This is the
fanout point where canonical skill plans become vendor-specific work.
"""
from __future__ import annotations

from typing import Any, Iterable, Optional

from packages.shared.schema import (
    ExecutionPath,
    Skill,
    SkillPlanItem,
    Task,
)

from .base import AdapterResult, RuntimeAdapter


class AdapterGateway:
    def __init__(self, adapters: Iterable[RuntimeAdapter] = ()) -> None:
        self._by_path: dict[ExecutionPath, RuntimeAdapter] = {}
        for a in adapters:
            self.register(a)

    def register(self, adapter: RuntimeAdapter) -> None:
        for p in adapter.handled_paths:
            self._by_path[p] = adapter

    def providers(self) -> list[str]:
        return sorted({a.provider for a in self._by_path.values()})

    def can_handle(self, path: ExecutionPath) -> bool:
        return path in self._by_path

    def dispatch(
        self,
        *,
        task: Task,
        skill: Skill,
        plan_item: SkillPlanItem,
        instruction_patch: Optional[dict[str, Any]] = None,
    ) -> AdapterResult:
        # The plan_item.executor IS the ExecutionPath value
        path = ExecutionPath(plan_item.executor)

        # For hybrid paths, the gateway dispatches to the AGENT adapter for
        # the agent leg. The HumanWorkforceAdapter can also claim hybrid
        # paths when it's time to run the human leg, but the primary leg is
        # the agent side. The leg split is left to the workflow engine in
        # production; for the MVP the gateway returns a single composite
        # result that covers both legs.
        if path == ExecutionPath.HYBRID_ANTHROPIC_HUMAN:
            return self._dispatch_hybrid(
                task=task,
                skill=skill,
                plan_item=plan_item,
                agent_path=ExecutionPath.ANTHROPIC,
                instruction_patch=instruction_patch,
            )
        if path == ExecutionPath.HYBRID_OPENAI_HUMAN:
            return self._dispatch_hybrid(
                task=task,
                skill=skill,
                plan_item=plan_item,
                agent_path=ExecutionPath.OPENAI,
                instruction_patch=instruction_patch,
            )

        adapter = self._by_path.get(path)
        if adapter is None:
            raise RuntimeError(f"No adapter registered for path {path.value}")
        return adapter.invoke(
            task=task, skill=skill, plan_item=plan_item, instruction_patch=instruction_patch
        )

    def _dispatch_hybrid(
        self,
        *,
        task: Task,
        skill: Skill,
        plan_item: SkillPlanItem,
        agent_path: ExecutionPath,
        instruction_patch: Optional[dict[str, Any]] = None,
    ) -> AdapterResult:
        """Invoke the agent and human adapters sequentially and merge results."""
        agent_adapter = self._by_path.get(agent_path)
        human_adapter = self._by_path.get(ExecutionPath.HUMAN)

        if agent_adapter is None or human_adapter is None:
            raise RuntimeError(
                f"Hybrid dispatch requires both {agent_path.value} and human adapters registered"
            )

        agent_res = agent_adapter.invoke(
            task=task, skill=skill, plan_item=plan_item, instruction_patch=instruction_patch
        )
        human_res = human_adapter.invoke(
            task=task, skill=skill, plan_item=plan_item, instruction_patch=instruction_patch
        )

        combined_latency = agent_res.latency_ms + int(human_res.latency_ms * 0.6)
        combined_cost = round(agent_res.cost_usd + human_res.cost_usd * 0.5, 2)
        success = agent_res.success and human_res.success
        return AdapterResult(
            success=success,
            latency_ms=combined_latency,
            cost_usd=combined_cost,
            output=f"AGENT_LEG={agent_res.output} | HUMAN_LEG={human_res.output}",
            trace={
                "provider": "hybrid",
                "agent_leg": agent_res.trace,
                "human_leg": human_res.trace,
            },
            tool_calls=agent_res.tool_calls + human_res.tool_calls,
            provider="hybrid",
            model=agent_res.model,
            actor_id=human_res.actor_id,
            applied_patch=instruction_patch,
        )
