"""Production-shape HTTP adapter for rPotential's API.

This adapter talks to the rPotential labor-graph service via the read/write
contract jointly defined by FuzeBox and rPotential engineering. The URL
scheme below follows the reference implementation README; the actual
production contract will be finalized during the partnership prototype.

Endpoints (per reference README + Tech Spec §9):
    GET  /v1/labor-graph/signals
         query: tenant_id, skill_ids[], actor_ids[]
         returns: WorkforceSignals JSON
    POST /v1/labor-graph/writeback
         body:  WritebackEvent JSON
         returns: 202 Accepted

Authentication: Bearer token, passed via RPOTENTIAL_API_TOKEN env var.
Timeouts default to 2s connect / 5s read.
"""
from __future__ import annotations

import os
import time
from typing import Any

import urllib.request
import urllib.error
import json

from packages.shared.schema import WorkforceSignals, WritebackEvent

from .base import RPotentialAdapter


class HTTPRPotentialAdapter(RPotentialAdapter):
    def __init__(
        self,
        base_url: str | None = None,
        token: str | None = None,
        timeout_s: float = 5.0,
    ) -> None:
        self.base_url = (base_url or os.getenv("RPOTENTIAL_BASE_URL", "https://api.rpotential.example/")).rstrip("/")
        self.token = token or os.getenv("RPOTENTIAL_API_TOKEN", "")
        self.timeout_s = timeout_s

    # ------------------------------------------------------------------
    # Interface implementation
    # ------------------------------------------------------------------

    def get_signals(
        self,
        tenant_id: str,
        skill_ids: list[str] | None = None,
        actor_ids: list[str] | None = None,
    ) -> WorkforceSignals:
        qs = [f"tenant_id={tenant_id}"]
        for s in skill_ids or []:
            qs.append(f"skill_id={s}")
        for a in actor_ids or []:
            qs.append(f"actor_id={a}")
        url = f"{self.base_url}/v1/labor-graph/signals?{'&'.join(qs)}"
        data = self._request("GET", url)
        return WorkforceSignals(
            tenant_id=tenant_id,
            gsti=data.get("gsti", {}),
            skill_drift_risk=data.get("skill_drift_risk", {}),
            uop_by_actor=data.get("uop_by_actor", {}),
            coordination_tax=data.get("coordination_tax", {}),
            as_of=data.get("as_of", time.time()),
        )

    def writeback(self, event: WritebackEvent) -> None:
        url = f"{self.base_url}/v1/labor-graph/writeback"
        payload: dict[str, Any] = {
            "target_system": event.target_system,
            "skill_id": event.skill_id,
            "actor_id": event.actor_id,
            "gsti_delta": event.gsti_delta,
            "uop_delta": event.uop_delta,
            "coordination_delta": event.coordination_delta,
            "execution_id": event.execution_id,
            "timestamp": event.timestamp,
        }
        self._request("POST", url, body=payload)

    def healthcheck(self) -> bool:
        try:
            self._request("GET", f"{self.base_url}/healthz")
            return True
        except Exception:
            return False

    # ------------------------------------------------------------------
    # HTTP plumbing (stdlib only — no external deps)
    # ------------------------------------------------------------------

    def _request(self, method: str, url: str, body: dict | None = None) -> dict:
        req = urllib.request.Request(url, method=method)
        if self.token:
            req.add_header("Authorization", f"Bearer {self.token}")
        data = None
        if body is not None:
            req.add_header("Content-Type", "application/json")
            data = json.dumps(body).encode("utf-8")
        try:
            with urllib.request.urlopen(req, data=data, timeout=self.timeout_s) as resp:
                raw = resp.read()
                if not raw:
                    return {}
                return json.loads(raw)
        except urllib.error.HTTPError as e:
            raise RuntimeError(f"rPotential HTTP error: {e.code} {e.reason}") from e
        except urllib.error.URLError as e:
            raise RuntimeError(f"rPotential unreachable: {e}") from e
