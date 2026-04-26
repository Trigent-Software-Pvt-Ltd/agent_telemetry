"""Skills Authority — the L3 service."""
from __future__ import annotations

import json
from pathlib import Path
from typing import Optional

from packages.shared.schema import ExecutionPath, Skill


class SkillsAuthority:
    """In-memory Skills Authority with JSON-file seed load + update-in-place.

    Production replacement: Postgres-backed with rolling per-path performance
    stats updated from the Economic Ledger writeback. For this MVP we keep
    everything in-memory and seed from JSON fixtures.
    """

    def __init__(self) -> None:
        self._skills: dict[str, Skill] = {}

    # ---------- CRUD ----------

    def register(self, skill: Skill) -> None:
        self._skills[skill.skill_id] = skill

    def get(self, skill_id: str) -> Skill:
        if skill_id not in self._skills:
            raise KeyError(f"Unknown skill: {skill_id}")
        return self._skills[skill_id]

    def try_get(self, skill_id: str) -> Optional[Skill]:
        return self._skills.get(skill_id)

    def list(self) -> list[Skill]:
        return list(self._skills.values())

    def count(self) -> int:
        return len(self._skills)

    # ---------- Load ----------

    def load_from_file(self, path: str | Path) -> int:
        """Load seed skills from a JSON file. Returns count loaded."""
        data = json.loads(Path(path).read_text())
        for raw in data:
            raw = dict(raw)
            raw["allowed_paths"] = [ExecutionPath(p) for p in raw["allowed_paths"]]
            self.register(Skill(**raw))
        return len(data)

    # ---------- Writeback ----------

    def apply_performance_update(
        self,
        skill_id: str,
        path: ExecutionPath,
        success: bool,
        cost: float,
        latency_ms: int,
        ema_alpha: float = 0.1,
    ) -> None:
        """Update rolling performance stats for a skill on a given path.

        Uses exponential moving average with alpha=0.1 by default.
        This is how the Economic Ledger closes the loop back to Skills Authority.
        """
        skill = self.get(skill_id)
        key = path.value
        prior = skill.performance.get(key, {"success_rate": 0.5, "avg_cost": 10.0, "avg_latency_ms": 2000})
        new_success_rate = (1 - ema_alpha) * prior["success_rate"] + ema_alpha * (1.0 if success else 0.0)
        new_cost = (1 - ema_alpha) * prior["avg_cost"] + ema_alpha * cost
        new_latency = (1 - ema_alpha) * prior.get("avg_latency_ms", 2000) + ema_alpha * latency_ms
        skill.performance[key] = {
            "success_rate": round(new_success_rate, 4),
            "avg_cost": round(new_cost, 4),
            "avg_latency_ms": round(new_latency, 2),
        }
