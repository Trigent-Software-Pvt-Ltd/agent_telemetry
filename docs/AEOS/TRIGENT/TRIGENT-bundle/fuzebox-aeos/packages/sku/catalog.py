"""AEOS SKU dataclass + in-code default catalog.

The commercial catalog is the single source of truth for which FuzeBox
packages ship with which SKU. Keep this file dependency-free so sales
tooling can `import` it without pulling in service code.
"""
from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any


@dataclass
class SKU:
    """One commercial bundle."""

    id: str
    name: str
    included_packages: list[str] = field(default_factory=list)
    pricing: dict[str, Any] = field(default_factory=dict)
    description: str = ""

    def to_dict(self) -> dict[str, Any]:
        return {
            "id": self.id,
            "name": self.name,
            "included_packages": list(self.included_packages),
            "pricing": dict(self.pricing),
            "description": self.description,
        }


# The default catalog mirrors fixtures/skus.json so callers that can't
# read fixtures (e.g. embedded sales tooling) still get a usable map.
SKU_CATALOG: dict[str, SKU] = {
    "uef_core": SKU(
        id="uef_core",
        name="UEF Core",
        included_packages=[
            "packages.shared",
            "packages.skills_authority",
            "packages.rpotential_adapter",
            "packages.uef",
            "packages.adapter_gateway",
            "packages.telemetry_normalizer",
        ],
        pricing={"model": "per_decision", "usd_per_1k_decisions": 45.0},
        description="The AEOS decision plane — L1 through L8 plus L10 telemetry normalization.",
    ),
    "governance_edition": SKU(
        id="governance_edition",
        name="Governance Edition",
        included_packages=[
            "packages.shared",
            "packages.skills_authority",
            "packages.rpotential_adapter",
            "packages.uef",
            "packages.adapter_gateway",
            "packages.telemetry_normalizer",
            "packages.dynamic_instruction",
            "packages.governance",
        ],
        pricing={"model": "per_tenant_month", "usd_per_tenant_month": 25000.0},
        description="UEF Core plus L9 Dynamic Instruction Runtime, policy packs, evidence export, and two-party attestation.",
    ),
    "enterprise_autonomy_index": SKU(
        id="enterprise_autonomy_index",
        name="Enterprise Autonomy Index",
        included_packages=[
            "packages.shared",
            "packages.skills_authority",
            "packages.rpotential_adapter",
            "packages.uef",
            "packages.adapter_gateway",
            "packages.telemetry_normalizer",
            "packages.dynamic_instruction",
            "packages.governance",
            "packages.economic_ledger",
        ],
        pricing={"model": "per_board_seat_year", "usd_per_seat_year": 120000.0},
        description="Governance Edition plus L11 Economic Ledger with EAI / HPI / HLR board metrics.",
    ),
    "vertical_automotive": SKU(
        id="vertical_automotive",
        name="Vertical Bundle — Automotive",
        included_packages=[
            "packages.shared",
            "packages.skills_authority",
            "packages.rpotential_adapter",
            "packages.uef",
            "packages.adapter_gateway",
            "packages.dynamic_instruction",
            "packages.governance",
            "packages.economic_ledger",
            "policies/wp29",
            "policies/auto_safety_standard",
            "flows/service_bay_diagnosis",
            "flows/automotive_cockpit_compliance",
        ],
        pricing={"model": "per_dealership_month", "usd_per_dealership_month": 2800.0},
        description="EAI + WP.29 + auto_safety_standard policy packs + service-bay / cockpit flows.",
    ),
    "vertical_contact_center": SKU(
        id="vertical_contact_center",
        name="Vertical Bundle — Contact Center",
        included_packages=[
            "packages.shared",
            "packages.skills_authority",
            "packages.rpotential_adapter",
            "packages.uef",
            "packages.adapter_gateway",
            "packages.dynamic_instruction",
            "packages.governance",
            "packages.economic_ledger",
            "adapters.uniphore",
            "flows/contact_center_escalation",
        ],
        pricing={"model": "per_agent_seat_month", "usd_per_seat_month": 140.0},
        description="EAI + Uniphore adapter + GDPR policy + contact-center escalation flow.",
    ),
    "vertical_gaming": SKU(
        id="vertical_gaming",
        name="Vertical Bundle — Gaming",
        included_packages=[
            "packages.shared",
            "packages.skills_authority",
            "packages.rpotential_adapter",
            "packages.uef",
            "packages.adapter_gateway",
            "packages.dynamic_instruction",
            "packages.governance",
            "packages.economic_ledger",
            "policies/gambling_responsible",
            "flows/sportsbook_recommendation",
            "flows/venue_operations_incident",
        ],
        pricing={"model": "per_property_month", "usd_per_property_month": 4500.0},
        description="EAI + gambling_responsible policy + sportsbook and venue flows.",
    ),
}
