"""FastAPI service wrappers around the AEOS packages.

Each service is a thin FastAPI app over the in-process package API so that
the monorepo can either (a) run end-to-end purely in-process (what the
conformance suite and the Ken Garff demo do) or (b) be deployed as four
separate containers for production.
"""
