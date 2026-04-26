"""Two-party attestation: sign_bundle must refuse single-party signatures.

This enforces the AEOS Governance Edition invariant (policies/
aeos_governance_edition.json, rule two_party_attestation_required):
a SignedEvidenceBundle may never be emitted when either HMAC secret leg
is missing. AttestationSigner raises SinglePartyAttestationRefused
in that case.
"""
from __future__ import annotations

import time

import pytest

from packages.governance.evidence import (
    AttestationSigner,
    EvidenceBundle,
    SinglePartyAttestationRefused,
)


def _stub_bundle() -> EvidenceBundle:
    return EvidenceBundle(
        format="eu_ai_act_article_12",
        tenant_id="kengarff_south_jordan",
        period_start=time.time() - 3600,
        period_end=time.time(),
        row_count=0,
        summary={"format": "eu_ai_act_article_12", "row_count": 0},
        records=[],
        integrity_hash="a" * 64,
    )


def test_sign_bundle_happy_path():
    signer = AttestationSigner(
        fuzebox_secret="FB_TEST_KEY", rpotential_secret="RP_TEST_KEY"
    )
    signed = signer.sign_bundle(_stub_bundle())
    assert signed.fuzebox_signature
    assert signed.rpotential_signature
    assert signer.verify_bundle(signed) is True


def test_sign_bundle_refuses_missing_fuzebox_secret():
    signer = AttestationSigner(fuzebox_secret="", rpotential_secret="RP_TEST_KEY")
    with pytest.raises(SinglePartyAttestationRefused):
        signer.sign_bundle(_stub_bundle())


def test_sign_bundle_refuses_missing_rpotential_secret():
    signer = AttestationSigner(fuzebox_secret="FB_TEST_KEY", rpotential_secret="")
    with pytest.raises(SinglePartyAttestationRefused):
        signer.sign_bundle(_stub_bundle())


def test_verify_rejects_tampered_signature():
    signer = AttestationSigner(
        fuzebox_secret="FB_TEST_KEY", rpotential_secret="RP_TEST_KEY"
    )
    signed = signer.sign_bundle(_stub_bundle())
    signed.fuzebox_signature = "0" * 64
    assert signer.verify_bundle(signed) is False


def test_verify_rejects_empty_leg():
    signer = AttestationSigner(
        fuzebox_secret="FB_TEST_KEY", rpotential_secret="RP_TEST_KEY"
    )
    signed = signer.sign_bundle(_stub_bundle())
    signed.rpotential_signature = ""
    assert signer.verify_bundle(signed) is False
