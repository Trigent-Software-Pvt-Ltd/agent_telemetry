"""Canonical trace shape + a small normalizer."""
from __future__ import annotations

import time
from dataclasses import dataclass, field
from typing import Any

from packages.adapter_gateway.base import AdapterResult


@dataclass
class CanonicalTraceEvent:
    phase: str  # "input" | "model" | "tool" | "output" | "human"
    timestamp: float
    provider: str
    payload: dict[str, Any] = field(default_factory=dict)

    def to_dict(self) -> dict[str, Any]:
        return {
            "phase": self.phase,
            "timestamp": self.timestamp,
            "provider": self.provider,
            "payload": self.payload,
        }


@dataclass
class CanonicalTrace:
    trace_id: str
    tenant_id: str
    task_id: str
    decision_id: str
    execution_id: str
    started_at: float
    ended_at: float
    success: bool
    provider: str
    events: list[CanonicalTraceEvent] = field(default_factory=list)
    metrics: dict[str, float] = field(default_factory=dict)

    def to_dict(self) -> dict[str, Any]:
        return {
            "trace_id": self.trace_id,
            "tenant_id": self.tenant_id,
            "task_id": self.task_id,
            "decision_id": self.decision_id,
            "execution_id": self.execution_id,
            "started_at": self.started_at,
            "ended_at": self.ended_at,
            "success": self.success,
            "provider": self.provider,
            "events": [e.to_dict() for e in self.events],
            "metrics": self.metrics,
        }


class TelemetryNormalizer:
    """Normalizes AdapterResult instances into CanonicalTrace.

    Production version is a streaming consumer of a Kafka/Redpanda topic
    per vendor; for the MVP we normalize synchronously in-process.
    """

    def normalize(
        self,
        *,
        trace_id: str,
        tenant_id: str,
        task_id: str,
        decision_id: str,
        execution_id: str,
        result: AdapterResult,
        started_at: float,
    ) -> CanonicalTrace:
        now = time.time()
        events: list[CanonicalTraceEvent] = [
            CanonicalTraceEvent(
                phase="model",
                timestamp=started_at,
                provider=result.provider,
                payload={"model": result.model, "hybrid": result.provider == "hybrid"},
            )
        ]
        for tc in result.tool_calls:
            events.append(
                CanonicalTraceEvent(
                    phase="tool",
                    timestamp=started_at,
                    provider=result.provider,
                    payload=tc,
                )
            )
        events.append(
            CanonicalTraceEvent(
                phase="output",
                timestamp=now,
                provider=result.provider,
                payload={"success": result.success, "output": result.output[:500]},
            )
        )

        return CanonicalTrace(
            trace_id=trace_id,
            tenant_id=tenant_id,
            task_id=task_id,
            decision_id=decision_id,
            execution_id=execution_id,
            started_at=started_at,
            ended_at=now,
            success=result.success,
            provider=result.provider,
            events=events,
            metrics={
                "latency_ms": float(result.latency_ms),
                "cost_usd": float(result.cost_usd),
            },
        )
