"""
Vaakya FastAPI application entry point.
Lifespan manages AsyncPostgresSaver (HITL checkpointing) and the compiled graph.
"""

import asyncio
import sys

# psycopg requires SelectorEventLoop on Windows — set before any async code runs
if sys.platform == "win32":
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())

from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from langgraph.checkpoint.postgres.aio import AsyncPostgresSaver

from api.config import settings
from api.routes import document
from graph.workflow import build_graph


@asynccontextmanager
async def lifespan(app: FastAPI):
    app.state.db_ok = False
    try:
        async with AsyncPostgresSaver.from_conn_string(settings.DATABASE_URL) as checkpointer:
            await checkpointer.setup()
            app.state.checkpointer = checkpointer
            app.state.graph = build_graph(checkpointer=checkpointer)
            app.state.db_ok = True
            yield
    except Exception as exc:
        # DB unavailable — server starts without HITL persistence (dev/health-check mode)
        print(f"[WARN] DB connection failed: {exc}")
        print("[WARN] Starting without checkpointer — HITL will not persist across restarts")
        app.state.checkpointer = None
        app.state.graph = build_graph(checkpointer=None)
        yield


app = FastAPI(
    title="Vaakya API",
    description="Autonomous Legal Document Factory for Indian SMBs",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.ALLOWED_ORIGIN],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(document.router, prefix="/document", tags=["document"])


@app.get("/health", tags=["health"])
async def health(request: Request):
    return {
        "status": "ok",
        "service": "vaakya-api",
        "env": settings.APP_ENV,
        "db": "connected" if getattr(request.app.state, "db_ok", False) else "unavailable",
    }
