"""Google Vertex AI Agents adapter.

In mock mode (default), returns a deterministic-ish outcome drawn from
Skills Authority performance history. In live mode, dispatches to Vertex
AI Reasoning Engine (Agents) via the ``google-cloud-aiplatform`` package.

The live path is behind a try/except so the MVP runs zero-dep. Pip
install ``google-cloud-aiplatform`` to enable live mode and set
``GOOGLE_APPLICATION_CREDENTIALS``.
"""
from __future__ import annotations

import os
import random
import time
from typing import Any, Optional

from packages.shared.schema import ExecutionPath, Skill, SkillPlanItem, Task

from .base import AdapterResult, RuntimeAdapter, simulate_from_skill_performance


class GoogleVertexAdapter(RuntimeAdapter):
    provider = "google"
    handled_paths = (ExecutionPath.GOOGLE_VERTEX,)

    def __init__(
        self,
        *,
        mode: str = "mock",
        project: str | None = None,
        location: str = "us-central1",
        model: str = "gemini-2.5-pro",
    ) -> None:
        self.mode = mode if mode in {"mock", "live"} else "mock"
        self.project = project or os.getenv("GOOGLE_CLOUD_PROJECT", "")
        self.location = location
        self.default_model = model
        self._rng = random.Random()

    def invoke(
        self,
        *,
        task: Task,
        skill: Skill,
        plan_item: SkillPlanItem,
        instruction_patch: Optional[dict[str, Any]] = None,
    ) -> AdapterResult:
        if self.mode == "live" and self.project:
            return self._invoke_live(
                task=task, skill=skill, plan_item=plan_item, instruction_patch=instruction_patch
            )
        return self._invoke_mock(
            task=task, skill=skill, plan_item=plan_item, instruction_patch=instruction_patch
        )

    # ------------------------------------------------------------------
    # Mock mode
    # ------------------------------------------------------------------

    def _invoke_mock(
        self,
        *,
        task: Task,
        skill: Skill,
        plan_item: SkillPlanItem,
        instruction_patch: Optional[dict[str, Any]] = None,
    ) -> AdapterResult:
        path_value = plan_item.executor
        success, latency_ms, cost, output = simulate_from_skill_performance(
            skill=skill, path_value=path_value, task=task, rng=self._rng
        )
        patch = instruction_patch or {}
        restricted = set(patch.get("restricted_tools", []))
        tool_names = [t for t in skill.required_tools if t not in restricted]
        if patch.get("required_citations"):
            output = f"{output} [citations: vertex_search_ref_001]"
        trace = {
            "provider": "google",
            "mode": "mock",
            "model": plan_item.model_hint or self.default_model,
            "task_id": task.task_id,
            "skill_id": skill.skill_id,
            "vertex_tools_invoked": tool_names,
            "duration_ms": latency_ms,
            "dir_rules_fired": list(patch.get("rules_fired", [])),
        }
        tool_calls = [
            {"name": t, "status": "mock_ok", "duration_ms": int(latency_ms / max(len(tool_names), 1))}
            for t in tool_names
        ]
        return AdapterResult(
            success=success,
            latency_ms=latency_ms,
            cost_usd=cost,
            output=output,
            trace=trace,
            tool_calls=tool_calls,
            provider=self.provider,
            model=plan_item.model_hint or self.default_model,
            actor_id=plan_item.actor_hint,
            applied_patch=patch or None,
        )

    # ------------------------------------------------------------------
    # Live mode (optional — requires google-cloud-aiplatform)
    # ------------------------------------------------------------------

    def _invoke_live(
        self,
        *,
        task: Task,
        skill: Skill,
        plan_item: SkillPlanItem,
        instruction_patch: Optional[dict[str, Any]] = None,
    ) -> AdapterResult:
        try:
            from google.cloud import aiplatform  # type: ignore  # noqa: F401
            import vertexai  # type: ignore
            from vertexai.generative_models import GenerativeModel  # type: ignore
        except ImportError:
            return self._invoke_mock(
                task=task, skill=skill, plan_item=plan_item, instruction_patch=instruction_patch
            )

        start = time.perf_counter()
        vertexai.init(project=self.project, location=self.location)
        model_name = plan_item.model_hint or self.default_model
        model = GenerativeModel(model_name)
        patch = instruction_patch or {}
        dir_prefix = "".join(f"[L9 DIR] {line}\n" for line in patch.get("additional_instructions", []))
        sys_prompt = (
            f"{dir_prefix}"
            f"You are an AEOS-governed agent executing skill '{skill.name}' "
            f"({skill.skill_id}) for tenant {task.tenant_id}. Operate within "
            f"governance tags: {', '.join(skill.governance_tags)}."
        )
        response = model.generate_content([sys_prompt, f"Task: {task.description}"])
        latency_ms = int((time.perf_counter() - start) * 1000)
        text_out = getattr(response, "text", "") or ""
        # Cost estimation is vendor-side — plug real pricing into production.
        usage = getattr(response, "usage_metadata", None)
        cost = 0.0
        if usage is not None:
            in_tok = getattr(usage, "prompt_token_count", 0) or 0
            out_tok = getattr(usage, "candidates_token_count", 0) or 0
            # Rough Gemini 2.5 Pro heuristic: $1.25/1M in, $10/1M out
            cost = round((in_tok * 1.25 + out_tok * 10.0) / 1_000_000.0, 4)
        return AdapterResult(
            success=True,
            latency_ms=latency_ms,
            cost_usd=cost,
            output=text_out[:1000],
            trace={"provider": "google", "mode": "live", "model": model_name},
            tool_calls=[],
            provider=self.provider,
            model=model_name,
            actor_id=plan_item.actor_hint,
            applied_patch=patch or None,
        )
