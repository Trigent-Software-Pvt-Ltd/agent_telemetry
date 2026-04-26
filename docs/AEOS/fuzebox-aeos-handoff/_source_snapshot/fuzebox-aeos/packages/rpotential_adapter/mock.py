"""Mock rPotential adapter — deterministic fixture data.

Used by:
  - The Ken Garff demo and all eight canonical conformance flows
  - Unit tests that need repeatable signal values
  - Local development when rPotential is unreachable

The data it returns is deliberately shaped the way the partnership API
contract is expected to produce, so tests written against the mock continue
to pass when the HTTP adapter is swapped in.
"""
from __future__ import annotations

import json
import threading
import time
from pathlib import Path
from typing import Any

from packages.shared.schema import WorkforceSignals, WritebackEvent

from .base import RPotentialAdapter


class MockRPotentialAdapter(RPotentialAdapter):
    def __init__(self, fixture_path: str | Path | None = None) -> None:
        self._lock = threading.Lock()
        self._writeback_log: list[dict[str, Any]] = []
        self._signals: dict[str, WorkforceSignals] = {}
        if fixture_path:
            self._load(fixture_path)

    def _load(self, path: str | Path) -> None:
        raw = json.loads(Path(path).read_text())
        for tenant_id, payload in raw.items():
            self._signals[tenant_id] = WorkforceSignals(
                tenant_id=tenant_id,
                gsti=payload.get("gsti", {}),
                skill_drift_risk=payload.get("skill_drift_risk", {}),
                uop_by_actor=payload.get("uop_by_actor", {}),
                coordination_tax=payload.get("coordination_tax", {}),
                as_of=time.time(),
            )

    # ------------------------------------------------------------------
    # Interface implementation
    # ------------------------------------------------------------------

    def get_signals(
        self,
        tenant_id: str,
        skill_ids: list[str] | None = None,
        actor_ids: list[str] | None = None,
    ) -> WorkforceSignals:
        if tenant_id not in self._signals:
            # Return an empty but well-shaped signal object rather than raising
            return WorkforceSignals(tenant_id=tenant_id)
        return self._signals[tenant_id]

    def writeback(self, event: WritebackEvent) -> None:
        with self._lock:
            self._writeback_log.append(
                {
                    "target_system": event.target_system,
                    "skill_id": event.skill_id,
                    "actor_id": event.actor_id,
                    "gsti_delta": event.gsti_delta,
                    "uop_delta": event.uop_delta,
                    "coordination_delta": event.coordination_delta,
                    "execution_id": event.execution_id,
                    "timestamp": event.timestamp,
                }
            )
            # Also reflect the update into our in-memory signals so the next
            # get_signals call observes the labor-graph effect.
            tenant_signals = self._signals.get(event.skill_id.split(":", 1)[0])
            # The mock stores signals keyed by tenant; callers that want an
            # updated view should refetch via get_signals(tenant_id).

    def healthcheck(self) -> bool:
        return True

    # ------------------------------------------------------------------
    # Test / demo helpers
    # ------------------------------------------------------------------

    def writeback_log(self) -> list[dict[str, Any]]:
        with self._lock:
            return list(self._writeback_log)

    def register_tenant(self, signals: WorkforceSignals) -> None:
        self._signals[signals.tenant_id] = signals
