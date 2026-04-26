"""FastAPI import shim.

If FastAPI is installed we use it for real. Otherwise we expose a tiny
stub with the surface area our services use so the modules stay importable
when someone runs the conformance suite without ever installing FastAPI.
"""
from __future__ import annotations

try:
    from fastapi import FastAPI, HTTPException  # type: ignore
    from pydantic import BaseModel  # type: ignore

    HAVE_FASTAPI = True
except Exception:  # pragma: no cover - runs when FastAPI not installed
    HAVE_FASTAPI = False

    class HTTPException(Exception):  # type: ignore
        def __init__(self, status_code: int = 500, detail: str = "") -> None:
            self.status_code = status_code
            self.detail = detail
            super().__init__(detail)

    class BaseModel:  # type: ignore
        def __init__(self, **kwargs):
            for k, v in kwargs.items():
                setattr(self, k, v)

        def dict(self):
            return self.__dict__

    class _Route:
        def __init__(self, fn):
            self.fn = fn

        def __call__(self, *args, **kwargs):
            return self.fn(*args, **kwargs)

    class FastAPI:  # type: ignore
        def __init__(self, title: str = "", **_):
            self.title = title
            self._routes: dict[tuple[str, str], _Route] = {}

        def _decorator(self, method: str, path: str):
            def deco(fn):
                self._routes[(method.upper(), path)] = _Route(fn)
                return fn

            return deco

        def get(self, path: str, **_):
            return self._decorator("GET", path)

        def post(self, path: str, **_):
            return self._decorator("POST", path)

        def put(self, path: str, **_):
            return self._decorator("PUT", path)

        def delete(self, path: str, **_):
            return self._decorator("DELETE", path)
