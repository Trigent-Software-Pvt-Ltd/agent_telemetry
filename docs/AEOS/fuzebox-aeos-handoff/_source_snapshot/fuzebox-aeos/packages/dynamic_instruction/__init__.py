"""Layer 9 — Dynamic Instruction Runtime.

Per AEOS Plan of Action Addendum 2, L9 is a *core design problem*, not a
roadmap item. It is the sidecar that sits beside every adapter and:

  1. watches canonical telemetry (from L10) for trigger conditions,
  2. consults a small set of instruction policies keyed by (skill, phase,
     signal), and
  3. injects additional instructions, tool restrictions, or safety
     envelopes back into the in-flight adapter invocation.

This module provides the interface plus a reference in-process
implementation. Adapters can opt in by calling `runtime.intercept(...)`
before invoking their vendor runtime.
"""

from .runtime import (
    DynamicInstructionRuntime,
    InstructionRule,
    InstructionPatch,
    RuntimeTrigger,
)

__all__ = [
    "DynamicInstructionRuntime",
    "InstructionRule",
    "InstructionPatch",
    "RuntimeTrigger",
]
