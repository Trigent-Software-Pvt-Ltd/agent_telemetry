"""Layer 8 — Adapter Gateway.

Vendor-neutral adapters for every supported runtime. Each adapter translates
the canonical skill plan into the vendor's native invocation format and
normalizes telemetry back into the canonical ExecutionTrace.

Adapters ship in "mock" mode (deterministic, no real network calls) and
"live" mode (against real SDKs). Mock mode is the default for tests, the
conformance suite, and the sales demo when API keys are not configured.
"""
from .base import RuntimeAdapter, AdapterResult
from .anthropic_adapter import AnthropicAdapter
from .openai_adapter import OpenAIAdapter
from .salesforce_adapter import SalesforceAdapter
from .uniphore_adapter import UniphoreAdapter
from .cloudflare_adapter import CloudflareAdapter
from .human_adapter import HumanWorkforceAdapter
from .gateway import AdapterGateway

__all__ = [
    "RuntimeAdapter",
    "AdapterResult",
    "AnthropicAdapter",
    "OpenAIAdapter",
    "SalesforceAdapter",
    "UniphoreAdapter",
    "CloudflareAdapter",
    "HumanWorkforceAdapter",
    "AdapterGateway",
]
