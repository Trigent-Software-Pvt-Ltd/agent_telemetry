"""Layer 3 — Skills Authority.

An executable skills layer spanning human and agent execution. Each skill
object declares allowed execution paths, required tools, governance tags,
strategic weight, and rolling performance history.
"""
from .authority import SkillsAuthority

__all__ = ["SkillsAuthority"]
