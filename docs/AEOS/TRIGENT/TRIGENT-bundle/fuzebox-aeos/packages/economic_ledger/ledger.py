"""Append-only ledger. In-memory for the MVP; swap to ClickHouse in production."""
from __future__ import annotations

import json
import threading
import time
from pathlib import Path
from typing import Iterable, Optional

from packages.shared.schema import ExecutionPath, LedgerRow


class EconomicLedger:
    """Append-only ledger with thread-safe writes and query helpers.

    Production: ClickHouse, partitioned by tenant and day, 7-year retention
    for compliance tenants. MVP: a plain list + optional JSON-lines persistence.
    """

    def __init__(self, persist_path: str | Path | None = None) -> None:
        self._lock = threading.Lock()
        self._rows: list[LedgerRow] = []
        self._persist_path = Path(persist_path) if persist_path else None
        if self._persist_path and self._persist_path.exists():
            self._load()

    # ------------------------------------------------------------------
    # Write
    # ------------------------------------------------------------------

    def append(self, row: LedgerRow) -> None:
        with self._lock:
            self._rows.append(row)
            if self._persist_path:
                with self._persist_path.open("a") as f:
                    f.write(json.dumps(row.to_dict()) + "\n")

    def extend(self, rows: Iterable[LedgerRow]) -> None:
        for r in rows:
            self.append(r)

    # ------------------------------------------------------------------
    # Read
    # ------------------------------------------------------------------

    def count(self) -> int:
        with self._lock:
            return len(self._rows)

    def all(self) -> list[LedgerRow]:
        with self._lock:
            return list(self._rows)

    def for_tenant(
        self,
        tenant_id: str,
        since: Optional[float] = None,
        until: Optional[float] = None,
        business_unit: Optional[str] = None,
    ) -> list[LedgerRow]:
        since = since or 0.0
        until = until or time.time() + 1
        with self._lock:
            return [
                r
                for r in self._rows
                if r.tenant_id == tenant_id
                and since <= r.timestamp <= until
                and (business_unit is None or r.business_unit == business_unit)
            ]

    def for_skill(self, tenant_id: str, skill_id: str) -> list[LedgerRow]:
        with self._lock:
            return [
                r
                for r in self._rows
                if r.tenant_id == tenant_id and r.skill_id == skill_id
            ]

    def rolling_window(self, tenant_id: str, days: int) -> list[LedgerRow]:
        """Tenant-scoped rows within the last ``days`` calendar days."""
        if days <= 0:
            return []
        cutoff = time.time() - (days * 86400.0)
        with self._lock:
            return [
                r for r in self._rows
                if r.tenant_id == tenant_id and r.timestamp >= cutoff
            ]

    # ------------------------------------------------------------------
    # Persistence helpers
    # ------------------------------------------------------------------

    def _load(self) -> None:
        assert self._persist_path
        self._rehydrate(self._persist_path)

    def replay_from_disk(self, path: str | Path) -> int:
        """Recompute in-memory state from the JSONL file at ``path``.

        Replaces existing in-memory rows. Returns the count replayed.
        """
        target = Path(path)
        with self._lock:
            self._rows = []
            if not target.exists():
                return 0
            self._rehydrate(target)
            return len(self._rows)

    def _rehydrate(self, path: Path) -> None:
        """Internal: populate self._rows from a JSONL file. Caller holds lock."""
        from packages.shared.schema import EAIContribution  # local import to avoid cycle
        with path.open("r") as f:
            for line in f:
                line = line.strip()
                if not line:
                    continue
                raw = json.loads(line)
                raw["selected_path"] = ExecutionPath(raw["selected_path"])
                raw["eai_contribution"] = EAIContribution(**raw["eai_contribution"])
                self._rows.append(LedgerRow(**raw))
