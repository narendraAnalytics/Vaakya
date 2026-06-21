"""
Run Vaakya API server.
Uses asyncio.run() with loop_factory=SelectorEventLoop — the exact fix
psycopg recommends for Windows (Python 3.12+).

Usage:  uv run python run.py
"""

import asyncio
import selectors
import sys

import uvicorn


def main():
    config = uvicorn.Config(
        "api.main:app",
        host="0.0.0.0",
        port=8000,
        reload=False,
    )
    server = uvicorn.Server(config)

    if sys.platform == "win32":
        asyncio.run(
            server.serve(),
            loop_factory=lambda: asyncio.SelectorEventLoop(selectors.SelectSelector()),
        )
    else:
        asyncio.run(server.serve())


if __name__ == "__main__":
    main()
