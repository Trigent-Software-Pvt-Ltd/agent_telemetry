"""Evidence export + attestation signing.

EU AI Act Article-12 requires a tamper-evident record of every high-risk
AI decision. WP.29 requires the same for automotive cockpit systems.
Both are produced here. The attestation signer is a joint FuzeBox +
rPotential signature — a two-party attestation that is harder to attack
and more credible than a single-vendor signature.
"""
from __future__ import annotations

import hashlib
import hmac
import json
import time
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any

from packages.shared.schema import LedgerRow


# ---------------------------------------------------------------------------
# Evidence exporter
# ---------------------------------------------------------------------------


@dataclass
class EvidenceBundle:
    format: str  # "eu_ai_act_article_12", "wp29", "gdpr", "soc2"
    tenant_id: str
    period_start: float
    period_end: float
    row_count: int
    summary: dict[str, Any]
    records: list[dict[str, Any]]
    integrity_hash: str

    def to_dict(self) -> dict:
        return {
            "format": self.format,
            "tenant_id": self.tenant_id,
            "period_start": self.period_start,
            "period_end": self.period_end,
            "row_count": self.row_count,
            "summary": self.summary,
            "records": self.records,
            "integrity_hash": self.integrity_hash,
        }


class EvidenceExporter:
    """Exports ledger rows as regulator-ready evidence bundles."""

    def export(
        self,
        *,
        rows: list[LedgerRow],
        tenant_id: str,
        format: str,
        period_start: float,
        period_end: float,
    ) -> EvidenceBundle:
        records = [self._to_record(r, format) for r in rows]
        payload = json.dumps(records, sort_keys=True).encode("utf-8")
        integrity_hash = hashlib.sha256(payload).hexdigest()
        summary = {
            "format": format,
            "row_count": len(rows),
            "success_count": sum(1 for r in rows if r.success),
            "policy_violations": sum(
                1 for r in rows if r.eai_contribution.governance_factor <= 0
            ),
            "human_in_loop_count": sum(
                1
                for r in rows
                if r.selected_path.value == "human" or "hybrid" in r.selected_path.value
            ),
        }
        return EvidenceBundle(
            format=format,
            tenant_id=tenant_id,
            period_start=period_start,
            period_end=period_end,
            row_count=len(rows),
            summary=summary,
            records=records,
            integrity_hash=integrity_hash,
        )

    def _to_record(self, r: LedgerRow, format: str) -> dict[str, Any]:
        base = {
            "execution_id": r.execution_id,
            "decision_id": r.decision_id,
            "tenant_id": r.tenant_id,
            "task_id": r.task_id,
            "skill_id": r.skill_id,
            "selected_path": r.selected_path.value,
            "actor_ids": r.actor_ids,
            "success": r.success,
            "timestamp": r.timestamp,
            "audit_record_id": r.audit_record_id,
        }
        if format == "eu_ai_act_article_12":
            base["risk_tier"] = "high"
            base["governance_factor"] = r.eai_contribution.governance_factor
            base["human_oversight_indicator"] = "hybrid" in r.selected_path.value or r.selected_path.value == "human"
            base["explanation_interface"] = "aeos_explanation_bundle_v1"
        elif format == "wp29":
            base["cybersecurity_log"] = True
            base["software_update_controlled"] = True
        elif format == "gdpr":
            base["data_processing_lawful_basis"] = "legitimate_interest"
            base["data_subject_rights_preserved"] = True
        elif format == "soc2":
            base["control_satisfied"] = r.eai_contribution.governance_factor > 0
        return base


# ---------------------------------------------------------------------------
# Attestation signer — joint FuzeBox + rPotential signature
# ---------------------------------------------------------------------------


class SinglePartyAttestationRefused(Exception):
    """Raised when sign_bundle is asked to emit a bundle missing either
    the FuzeBox or rPotential signature leg. Two-party attestation is
    non-negotiable per the AEOS Governance Edition contract."""


@dataclass
class SignedEvidenceBundle:
    """An EvidenceBundle wrapped with joint FuzeBox + rPotential HMACs.

    Both signatures cover the canonical integrity_hash of the underlying
    bundle. Consumers verify by recomputing each signature and comparing
    via ``hmac.compare_digest``.
    """

    bundle: dict[str, Any]  # EvidenceBundle.to_dict()
    integrity_hash: str
    fuzebox_signature: str
    rpotential_signature: str
    signed_at: float

    def to_dict(self) -> dict:
        return {
            "bundle": self.bundle,
            "integrity_hash": self.integrity_hash,
            "fuzebox_signature": self.fuzebox_signature,
            "rpotential_signature": self.rpotential_signature,
            "signed_at": self.signed_at,
        }


@dataclass
class Attestation:
    attestation_id: str
    tenant_id: str
    period: str  # "Q2-2026" etc.
    metric_name: str  # "EAI", "HPI", "HLR"
    metric_value: float
    fuzebox_signature: str
    rpotential_signature: str
    issued_at: float
    details: dict[str, Any] = field(default_factory=dict)

    def to_dict(self) -> dict:
        return {
            "attestation_id": self.attestation_id,
            "tenant_id": self.tenant_id,
            "period": self.period,
            "metric_name": self.metric_name,
            "metric_value": self.metric_value,
            "fuzebox_signature": self.fuzebox_signature,
            "rpotential_signature": self.rpotential_signature,
            "issued_at": self.issued_at,
            "details": self.details,
        }


class AttestationSigner:
    """Two-party HMAC signer. Production: swap to ECDSA w/ KMS-held keys.

    The key pair in a real deployment lives in AWS KMS per the Tech Spec
    §20.4 EAI SKU. Here we use HMAC-SHA256 with separate FuzeBox and
    rPotential secrets — sufficient to demonstrate the two-party
    attestation pattern without external dependencies.
    """

    def __init__(
        self,
        fuzebox_secret: str = "FUZEBOX_DEMO_KEY_REPLACE_IN_PROD",
        rpotential_secret: str = "RPOTENTIAL_DEMO_KEY_REPLACE_IN_PROD",
    ) -> None:
        self._fuzebox_secret = fuzebox_secret.encode("utf-8")
        self._rpotential_secret = rpotential_secret.encode("utf-8")

    def sign(
        self,
        *,
        tenant_id: str,
        period: str,
        metric_name: str,
        metric_value: float,
        details: dict[str, Any] | None = None,
    ) -> Attestation:
        payload = json.dumps(
            {
                "tenant_id": tenant_id,
                "period": period,
                "metric_name": metric_name,
                "metric_value": round(metric_value, 6),
                "details": details or {},
            },
            sort_keys=True,
        ).encode("utf-8")

        fuzebox_sig = hmac.new(self._fuzebox_secret, payload, hashlib.sha256).hexdigest()
        rpotential_sig = hmac.new(self._rpotential_secret, payload, hashlib.sha256).hexdigest()

        return Attestation(
            attestation_id=f"att_{int(time.time() * 1000)}",
            tenant_id=tenant_id,
            period=period,
            metric_name=metric_name,
            metric_value=metric_value,
            fuzebox_signature=fuzebox_sig,
            rpotential_signature=rpotential_sig,
            issued_at=time.time(),
            details=details or {},
        )

    def sign_bundle(self, bundle: EvidenceBundle) -> SignedEvidenceBundle:
        """Produce a two-party signature over ``bundle.integrity_hash``.

        Refuses (raises ``SinglePartyAttestationRefused``) when either
        HMAC secret is empty — single-party attestation is not acceptable
        for AEOS Governance Edition evidence.
        """
        if not self._fuzebox_secret or not self._rpotential_secret:
            raise SinglePartyAttestationRefused(
                "sign_bundle requires both FuzeBox and rPotential secrets to be set"
            )
        payload = bundle.integrity_hash.encode("utf-8")
        fuzebox_sig = hmac.new(self._fuzebox_secret, payload, hashlib.sha256).hexdigest()
        rpotential_sig = hmac.new(self._rpotential_secret, payload, hashlib.sha256).hexdigest()
        if not fuzebox_sig or not rpotential_sig:
            raise SinglePartyAttestationRefused(
                "sign_bundle refused: missing one of the two signature legs"
            )
        return SignedEvidenceBundle(
            bundle=bundle.to_dict(),
            integrity_hash=bundle.integrity_hash,
            fuzebox_signature=fuzebox_sig,
            rpotential_signature=rpotential_sig,
            signed_at=time.time(),
        )

    def verify_bundle(self, signed: SignedEvidenceBundle) -> bool:
        if not signed.fuzebox_signature or not signed.rpotential_signature:
            return False
        payload = signed.integrity_hash.encode("utf-8")
        expected_fb = hmac.new(self._fuzebox_secret, payload, hashlib.sha256).hexdigest()
        expected_rp = hmac.new(self._rpotential_secret, payload, hashlib.sha256).hexdigest()
        return hmac.compare_digest(expected_fb, signed.fuzebox_signature) and hmac.compare_digest(
            expected_rp, signed.rpotential_signature
        )

    def verify(self, attestation: Attestation) -> bool:
        payload = json.dumps(
            {
                "tenant_id": attestation.tenant_id,
                "period": attestation.period,
                "metric_name": attestation.metric_name,
                "metric_value": round(attestation.metric_value, 6),
                "details": attestation.details,
            },
            sort_keys=True,
        ).encode("utf-8")
        fuzebox_expected = hmac.new(self._fuzebox_secret, payload, hashlib.sha256).hexdigest()
        rpotential_expected = hmac.new(self._rpotential_secret, payload, hashlib.sha256).hexdigest()
        return hmac.compare_digest(fuzebox_expected, attestation.fuzebox_signature) and hmac.compare_digest(
            rpotential_expected, attestation.rpotential_signature
        )
