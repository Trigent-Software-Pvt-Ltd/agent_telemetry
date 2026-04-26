"""Base interface for any rPotential adapter implementation."""
from __future__ import annotations

from abc import ABC, abstractmethod

from packages.shared.schema import WorkforceSignals, WritebackEvent


class RPotentialAdapter(ABC):
    """Abstract interface the Skills Authority + UEF depend on."""

    @abstractmethod
    def get_signals(
        self,
        tenant_id: str,
        skill_ids: list[str] | None = None,
        actor_ids: list[str] | None = None,
    ) -> WorkforceSignals:
        """Return live workforce signals for a tenant."""

    @abstractmethod
    def writeback(self, event: WritebackEvent) -> None:
        """Post-execution write back GSTI/UOP/coordination deltas."""

    @abstractmethod
    def healthcheck(self) -> bool:
        """Return True if the upstream labor graph is reachable."""
