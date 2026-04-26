"""Pytest wrapper around the conformance suite.

    $ pytest apps/conformance_suite/test_conformance.py -v
"""
from __future__ import annotations

import pytest

from packages.shared.schema import ExecutionPath

from apps._runtime import build_runtime
from apps.conformance_suite.flows import ALL_FLOWS
from apps.conformance_suite.run_suite import _check_flow


@pytest.fixture(scope="module")
def runtime():
    return build_runtime(rng_seed=42)


@pytest.mark.parametrize("flow_factory", ALL_FLOWS, ids=lambda f: f().flow_id)
def test_conformance_flow(runtime, flow_factory):
    flow = flow_factory()
    outcome = flow.run(runtime)
    errs = _check_flow(flow, outcome)
    assert not errs, f"{flow.flow_id} failed: {errs}"
    assert outcome.selected_path in [p.value for p in ExecutionPath]
    assert outcome.decision_id.startswith("dec_")
