# CLAUDE.md — Backend

> Project-wide context: see `../CLAUDE.md`
> Full workflow spec: see `../projectworkflow.txt`

---

## Runtime

- Python **3.12.10** — managed by **uv** (never pip)
- `.python-version` is pinned — always use `uv run` or activate `.venv`
- `uv add <package>` to add dependencies, `uv sync` to install

```powershell
# Run dev server
uv run uvicorn api.main:app --reload --port 8000

# Run tests
uv run pytest

# Add a package
uv add <package-name>
```

---

## Dependencies (pyproject.toml — already added)

| Package | Purpose |
|---|---|
| `fastapi` + `uvicorn` | API server |
| `langgraph` | Multi-agent graph orchestration |
| `langchain` + `langchain-core` + `langchain-groq` | LLM chains + Groq client |
| `groq` | Groq SDK (direct use where needed) |
| `supabase` | Auth verification + DB + Storage client |
| `pydantic` | Request/response validation, state schemas |
| `pymupdf` | PDF text extraction (fitz) |
| `pypdf` | Fallback PDF parsing |
| `python-docx` | Intermediate DOCX generation |
| `reportlab` | Final PDF generation |
| `sentence-transformers` + `numpy` | BGE embeddings for pgvector |
| `pgvector` | pgvector Python type support |
| `psycopg` + `asyncpg` | Async PostgreSQL drivers |
| `sqlalchemy` + `alembic` | ORM + migrations |
| `python-dotenv` | Load .env |
| `python-multipart` | Multipart PDF uploads in FastAPI |

---

## Directory Layout

```
backend/
├── agents/
│   ├── arambha.py          # Intake + classify (llama-3.1-8b-instant)
│   ├── rachana.py          # Drafting (llama-3.3-70b-versatile)
│   ├── parisheelanam.py    # Review + reflexion loop (llama-3.3-70b-versatile)
│   ├── jokhim.py           # Risk flags — Phase 2 (llama-3.3-70b-versatile)
│   ├── samjoota.py         # Negotiation — Phase 3 (llama-3.3-70b-versatile)
│   ├── sahee.py            # Sign & deliver — Phase 2 (tool-based)
│   ├── sruthi.py           # Obligation tracker — Phase 2 (llama-3.1-8b-instant)
│   └── vivada.py           # Dispute — Phase 3 (llama-3.3-70b-versatile)
├── graph/
│   ├── state.py            # VaakyaState TypedDict
│   ├── workflow.py         # Main LangGraph graph + sub-graph routing
│   └── subgraphs/
│       ├── new_doc.py      # A: text/pdf → draft → review → HITL → sign
│       ├── redline.py      # B: counter-party PDF → diff → HITL — Phase 3
│       └── dispute.py      # C: dispute → clause extract → notice — Phase 3
├── api/
│   ├── main.py             # FastAPI app, routers, CORS, lifespan
│   ├── routes/
│   │   ├── document.py     # POST /document/new, /document/upload, HITL approve
│   │   ├── vault.py        # GET /vault, /vault/{id}
│   │   ├── dispute.py      # POST /dispute — Phase 3
│   │   └── webhook.py      # POST /webhook/digio — Phase 2
│   └── middleware/
│       └── auth.py         # Supabase JWT → request.state.user_id
├── services/
│   ├── supabase_client.py  # Singleton Supabase client (anon + service role)
│   ├── storage.py          # Upload/download from Supabase Storage
│   ├── pdf_extractor.py    # PyMuPDF text extraction with page labels
│   ├── doc_generator.py    # ReportLab PDF + python-docx generation
│   └── embeddings.py       # BGE model load + embed + pgvector search
├── clause_library/
│   ├── nda.json
│   └── vendor_agreement.json
├── tests/
│   └── test_nda_pipeline.py
├── .env                    # gitignored
├── .env.example
├── .python-version         # 3.12.10
└── pyproject.toml
```

---

## Environment Variables

Copy `.env.example` → `.env` and fill in:

```
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
GROQ_API_KEY=gsk_...
LANGSMITH_API_KEY=ls__...       # optional for tracing
LANGSMITH_PROJECT=vaakya
```

---

## Agent Pattern (follow for every agent)

```python
# agents/arambha.py
from langchain_groq import ChatGroq
from langchain_core.messages import SystemMessage, HumanMessage
from pydantic import BaseModel
from graph.state import VaakyaState

SYSTEM_PROMPT = "..."

class ArambhaOutput(BaseModel):
    document_type: str
    parties: list[dict]
    jurisdiction: str
    key_terms: dict
    sub_graph: str  # "new_doc" | "redline" | "dispute"

_llm = ChatGroq(model="llama-3.1-8b-instant", temperature=0)

async def run_arambha(state: VaakyaState) -> dict:
    result: ArambhaOutput = await _llm.with_structured_output(
        ArambhaOutput
    ).ainvoke([
        SystemMessage(content=SYSTEM_PROMPT),
        HumanMessage(content=state["raw_input"]),
    ])
    return {
        "document_type": result.document_type,
        "parties": result.parties,
        "jurisdiction": result.jurisdiction,
        "key_terms": result.key_terms,
        "sub_graph": result.sub_graph,
    }
```

Rules:
- Agent functions return a **partial dict** (only the keys they update)
- LangGraph merges partial dicts into state automatically
- `_llm` is module-level (created once, reused)
- All agents are `async def`
- Use `with_structured_output(PydanticModel)` — never parse raw text

---

## VaakyaState (graph/state.py)

```python
from typing import TypedDict, Literal, Annotated
import operator

class VaakyaState(TypedDict):
    # Input
    user_id: str
    input_mode: Literal["text", "pdf"]
    raw_input: str

    # Arambha extracts
    document_type: str
    parties: list[dict]
    jurisdiction: str
    key_terms: dict
    sub_graph: Literal["new_doc", "redline", "dispute"]

    # Rachana writes
    draft: str

    # Parisheelanam writes
    review_score: int
    review_issues: list[str]
    loop_count: int

    # Parallel fan-out (append-safe)
    risk_flags: Annotated[list[dict], operator.add]
    negotiation_redlines: Annotated[list[dict], operator.add]

    # HITL
    hitl_approved: bool

    # Post-sign
    obligations: list[dict]
    dispute_summary: str

    # Output
    final_pdf_url: str
    vault_id: str
    esign_status: str
    errors: Annotated[list[str], operator.add]
```

---

## Reflexion Loop Rule

In `graph/subgraphs/new_doc.py`:

```python
def should_redraft(state: VaakyaState) -> str:
    if state["review_score"] < 75 and state["loop_count"] < 3:
        return "rachana"   # loop back
    return "parallel"      # proceed to fan-out
```

Max 3 loops is a graph-level rule — not inside any agent.

---

## Auth Middleware Pattern

```python
# api/middleware/auth.py
from supabase import create_client
from fastapi import Request, HTTPException

async def get_current_user(request: Request) -> str:
    token = request.headers.get("Authorization", "").removeprefix("Bearer ")
    if not token:
        raise HTTPException(status_code=401)
    # verify via Supabase admin client
    user = supabase_admin.auth.get_user(token)
    return user.user.id  # returns user_id (uuid)
```

All route handlers receive `user_id: str = Depends(get_current_user)`.

---

## Supabase Storage Pattern

```python
# services/storage.py
# Upload:  storage.upload(bucket, path, bytes)
# URL:     storage.create_signed_url(bucket, path, expires_in=3600)
# Path convention: {user_id}/drafts/{document_id}.pdf
```

Bucket name: `vaakya-contracts` (private, RLS-enabled).

---

## Phase 1 Build Order

1. `graph/state.py` — VaakyaState
2. `services/supabase_client.py` — singleton client
3. `services/embeddings.py` — load BGE model
4. `agents/arambha.py` — classify + extract
5. `agents/rachana.py` — draft generation
6. `agents/parisheelanam.py` — review loop
7. `graph/subgraphs/new_doc.py` — wire the graph
8. `graph/workflow.py` — main graph entry
9. `api/middleware/auth.py` — JWT guard
10. `api/routes/document.py` — POST /document/new
11. `services/pdf_extractor.py` — PyMuPDF
12. Add PDF upload to document route
13. `services/storage.py` — Supabase Storage
14. `clause_library/nda.json` — seed data
15. `tests/test_nda_pipeline.py` — 10 scenarios

---

## Do Not

- Never use `pip` — always `uv add`
- Never hardcode API keys — always from `.env`
- Never create sync agent functions — always `async def`
- Never parse LLM output as raw string — use `with_structured_output`
- Never skip HITL — `interrupt()` is mandatory before Sahee
- Never query Supabase without RLS — every table has `user_id` FK

---

## LLM Factory (app/llm_factory.py)

```python
# api/constants.py
GROQ_MODEL_PRO   = "llama-3.3-70b-versatile"   # Rachana, Parisheelanam, Jokhim, Samjoota, Vivada
GROQ_MODEL_FLASH = "llama-3.1-8b-instant"       # Arambha, Sruthi

# api/llm_factory.py
from langchain_groq import ChatGroq
from api.config import settings
from api.constants import GROQ_MODEL_PRO, GROQ_MODEL_FLASH

def get_llms() -> tuple[ChatGroq, ChatGroq]:
    llm_pro   = ChatGroq(model=GROQ_MODEL_PRO,   api_key=settings.GROQ_API_KEY, temperature=0)
    llm_flash = ChatGroq(model=GROQ_MODEL_FLASH, api_key=settings.GROQ_API_KEY, temperature=0)
    return llm_pro, llm_flash
```

Each agent module imports from `llm_factory` — never instantiate `ChatGroq` inline per-call.

---

## Config via pydantic-settings (api/config.py)

```python
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    SUPABASE_URL: str = ""
    SUPABASE_ANON_KEY: str = ""
    SUPABASE_SERVICE_ROLE_KEY: str = ""
    GROQ_API_KEY: str = ""
    LANGSMITH_API_KEY: str = ""
    LANGSMITH_PROJECT: str = "vaakya"
    APP_ENV: str = "development"
    LOG_LEVEL: str = "INFO"
    ALLOWED_ORIGIN: str = "http://localhost:3000"

settings = Settings()
```

Add `pydantic-settings` via `uv add pydantic-settings`.

---

## FastAPI Lifespan — CRITICAL PATTERN

```python
# api/main.py
from contextlib import asynccontextmanager
from langgraph.checkpoint.postgres.aio import AsyncPostgresSaver
from langgraph.store.postgres import AsyncPostgresStore
from graph.workflow import build_graph

@asynccontextmanager
async def lifespan(app: FastAPI):
    async with AsyncPostgresSaver.from_conn_string(settings.SUPABASE_DB_URL) as checkpointer:
        await checkpointer.setup()
        async with AsyncPostgresStore.from_conn_string(settings.SUPABASE_DB_URL) as store:
            await store.setup()
            app.state.graph = build_graph(checkpointer=checkpointer, store=store)
            yield   # app runs — connections stay alive

app = FastAPI(title="Vaakya API", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.ALLOWED_ORIGIN],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(document.router)
app.include_router(vault.router)

@app.get("/health")
async def health():
    return {"status": "ok", "env": settings.APP_ENV}
```

**NEVER return early from inside `async with AsyncPostgresSaver` — closes the connection immediately.**
**Always use `graph.ainvoke()` — never `graph.invoke()` (async nodes will silently fail).**
**All routers access the graph via `request.app.state.graph` — not a global variable.**

Add `SUPABASE_DB_URL` to `.env` — get it from Supabase dashboard → Settings → Database → Connection string (use the `psycopg` direct URL, not pooled).

---

## Graph Wiring Pattern (graph/workflow.py)

```python
from langgraph.graph import StateGraph, START, END
from graph.state import VaakyaState

def build_graph(checkpointer=None, store=None):
    builder = StateGraph(VaakyaState)

    # Register nodes
    builder.add_node("arambha",         run_arambha)
    builder.add_node("rachana",         run_rachana)
    builder.add_node("parisheelanam",   run_parisheelanam)
    builder.add_node("jokhim",          run_jokhim)
    builder.add_node("hitl",            run_hitl)          # uses interrupt()
    builder.add_node("sahee",           run_sahee)
    builder.add_node("sruthi",          run_sruthi)

    # Entry
    builder.add_edge(START, "arambha")

    # Sequential: arambha → rachana → parisheelanam
    builder.add_edge("arambha",       "rachana")
    builder.add_edge("rachana",       "parisheelanam")

    # Reflexion loop or proceed
    builder.add_conditional_edges(
        "parisheelanam",
        should_redraft,          # returns "rachana" | "jokhim"
        {"rachana": "rachana", "jokhim": "jokhim"},
    )

    # Parallel fan-out: jokhim runs, then fan-in to hitl
    builder.add_edge("jokhim", "hitl")

    # Sequential post-HITL
    builder.add_edge("hitl",   "sahee")
    builder.add_edge("sahee",  "sruthi")
    builder.add_edge("sruthi", END)

    return builder.compile(checkpointer=checkpointer, store=store)
```

---

## Background Task + 202 Pattern

Long-running graph execution must NOT block the HTTP response.

```python
# api/routes/document.py
from fastapi import BackgroundTasks, Depends, Request
from uuid import uuid4

@router.post("/document/new", status_code=202)
async def new_document(
    body: DocumentRequest,
    background_tasks: BackgroundTasks,
    request: Request,
    user_id: str = Depends(get_current_user),
):
    document_id = str(uuid4())
    # Save initial record to Supabase
    await save_document_record(document_id, user_id, body.request)
    # Kick off graph in background
    initial_state = {
        "user_id": user_id,
        "input_mode": "text",
        "raw_input": body.request,
        "document_id": document_id,
        "loop_count": 0,
        "risk_flags": [],
        "errors": [],
    }
    background_tasks.add_task(_run_graph, request.app.state.graph, document_id, initial_state)
    return {"document_id": document_id, "status": "processing"}

async def _run_graph(graph, document_id: str, state: dict):
    config = {"configurable": {"thread_id": document_id}}
    async for event in graph.astream(state, config=config, stream_mode="updates"):
        for node_name, node_output in event.items():
            if node_name == "__end__":
                continue
            await log_agent_step(document_id, node_name, node_output)
    # Read final state after stream completes
    final = await graph.aget_state(config)
    await save_document_result(document_id, final.values)

# Polling endpoint
@router.get("/document/{document_id}/status")
async def get_document_status(document_id: str, user_id: str = Depends(get_current_user)):
    row = await fetch_document(document_id, user_id)
    if not row:
        raise HTTPException(404)
    return row
```

**Use `graph.astream()` not `graph.ainvoke()` for background tasks** — `astream` lets you log per-node progress in real time. After stream ends, call `graph.aget_state()` to read the final result.

---

## Graph Streaming (per-node logging)

```python
async for event in graph.astream(state, config=config, stream_mode="updates"):
    for node_name, node_output in event.items():
        if node_name == "__end__":
            continue
        # Log each agent step to Supabase
        await log_agent_step(document_id, node_name, node_output)
```

`stream_mode="updates"` yields `{node_name: output_dict}` after each node completes. Do NOT revert to `ainvoke` once streaming is in place.

---

## asyncpg Date/Time Encoding Pitfall

asyncpg cannot encode Python `str` as PostgreSQL `date` or `timestamptz`. Always cast:

```python
from datetime import date as date_type, datetime

due_date = date_type.fromisoformat(due_date) if isinstance(due_date, str) else due_date
```

Symptom: `asyncpg.exceptions.DataError: invalid input for query argument $N: '2026-06-09' ('str' object has no attribute 'toordinal')`. The SQL `::date` cast does NOT help — asyncpg encodes before the query reaches Postgres.

---

## Parallel Fan-Out State Rule

**Any field written by multiple parallel agents MUST use `Annotated[List[..], operator.add]`** — otherwise the last writer wins and data is lost.

```python
# CORRECT — safe for parallel writes
risk_flags: Annotated[list[dict], operator.add]
errors:     Annotated[list[str],  operator.add]

# WRONG — last agent to write wins, earlier results lost
risk_flags: list[dict]
```

This is already applied in `VaakyaState` above. Never remove the `Annotated` wrapper from parallel-written fields.

---

## Common Pitfalls

1. **`graph.invoke()` on async nodes** — always use `graph.ainvoke()` or `graph.astream()`. `invoke()` silently fails on async nodes.

2. **`request.app.state.graph` vs global** — always access graph via `request.app.state.graph` in route handlers. A module-level global closes when the lifespan context exits.

3. **Early return inside lifespan `async with`** — closes the checkpointer connection immediately. The `yield` must be inside both context managers (checkpointer AND store).

4. **Parallel agent overwrites** — parallel agents writing to the same state key without `operator.add` = silent data loss. See Parallel Fan-Out State Rule above.

5. **AsyncPostgresStore namespace keys** — namespace labels forbid `.` and `@`. Sanitize any email or domain-based keys:
   ```python
   namespace = ("user", user_id.replace(".", "_").replace("@", "_AT_"))
   ```

6. **Supabase connection string** — use the **direct** (non-pooled) Postgres URL for asyncpg/LangGraph checkpointer. The pooled URL (port 6543) does not support `AsyncPostgresSaver`.

7. **`with_structured_output` + JSON fences** — Groq sometimes wraps JSON in ` ```json ``` ` fences. If you use raw `.invoke()` instead of `with_structured_output`, strip fences before `json.loads()`:
   ```python
   content = response.content.strip()
   if content.startswith("```"):
       content = content.split("```")[1].lstrip("json").strip()
   ```

8. **HITL `interrupt()` requires checkpointer** — `graph.compile(checkpointer=None)` will raise at runtime when a node calls `interrupt()`. Always pass the checkpointer from lifespan.

9. **uv venv Python mismatch** — if `.venv` was created with wrong Python (check `.venv/pyvenv.cfg`), delete and recreate:
   ```powershell
   Remove-Item -Recurse -Force .venv
   uv venv --python 3.12.10
   uv sync
   ```

---

## Phase 3 Frontend Reference — Full-Screen Video Player (Next.js)

> Save for the Next.js frontend (Phase 3). Place at `src/app/[route]/page.tsx`.

**Key gotchas:**
- `onDurationChange` not `onLoadedMetadata` — fires even on browser cache hit
- Seek via `getBoundingClientRect` on a `div`, NOT `<input type="range">` — more reliable
- Never set `cursor: none` globally — breaks buttons
- **No `filter: brightness()` / grain / vignette on the video element** — renders video differently from source

```tsx
'use client'
import { useEffect, useRef, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'

const VIDEO_URL = 'https://your-cdn/video.mp4'   // ← swap this

function fmt(s: number) {
  const m = Math.floor(s / 60)
  return `${String(m).padStart(2,'0')}:${String(Math.floor(s % 60)).padStart(2,'0')}`
}

export default function VideoPage() {
  const router      = useRouter()
  const videoRef    = useRef<HTMLVideoElement>(null)
  const trackRef    = useRef<HTMLDivElement>(null)
  const isDragging  = useRef(false)
  const hideTimer   = useRef<ReturnType<typeof setTimeout> | null>(null)

  const [isPlaying,    setIsPlaying]    = useState(false)
  const [currentTime,  setCurrentTime]  = useState(0)
  const [duration,     setDuration]     = useState(0)
  const [volume,       setVolume]       = useState(1)
  const [showControls, setShowControls] = useState(true)
  const [mounted,      setMounted]      = useState(false)

  // Fix: catch cached video where onLoadedMetadata never fires
  useEffect(() => {
    setMounted(true)
    const v = videoRef.current
    if (v && v.duration && !isNaN(v.duration)) setDuration(v.duration)
  }, [])

  const resetHideTimer = useCallback(() => {
    setShowControls(true)
    if (hideTimer.current) clearTimeout(hideTimer.current)
    hideTimer.current = setTimeout(() => setShowControls(false), 3000)
  }, [])

  useEffect(() => {
    resetHideTimer()
    return () => { if (hideTimer.current) clearTimeout(hideTimer.current) }
  }, [resetHideTimer])

  const handlePlayPause = () => {
    const v = videoRef.current; if (!v) return
    if (v.paused) { v.play(); setIsPlaying(true) }
    else          { v.pause(); setIsPlaying(false) }
  }

  const handleStop = () => {
    const v = videoRef.current; if (!v) return
    v.pause(); v.currentTime = 0
    setIsPlaying(false); setCurrentTime(0)
  }

  const skip = (sec: number) => {
    const v = videoRef.current; if (!v) return
    v.currentTime = Math.max(0, Math.min(v.currentTime + sec, v.duration || 0))
  }

  const handleLoaded = () => {
    const v = videoRef.current
    if (v && !isNaN(v.duration)) setDuration(v.duration)
  }

  // Fix: precise seek via getBoundingClientRect — not <input type="range">
  const seekTo = (clientX: number) => {
    const el = trackRef.current; const v = videoRef.current
    if (!el || !v || !v.duration) return
    const rect = el.getBoundingClientRect()
    const pct  = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
    v.currentTime = pct * v.duration
    setCurrentTime(v.currentTime)
  }

  const handleTrackMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault()
    isDragging.current = true
    seekTo(e.clientX)
    const v = videoRef.current
    if (v && v.paused) { v.play(); setIsPlaying(true) }
    const onMove = (me: MouseEvent) => { if (isDragging.current) seekTo(me.clientX) }
    const onUp   = () => {
      isDragging.current = false
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onUp)
    }
    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
  }

  const handleVolume = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = videoRef.current; if (!v) return
    const vol = Number(e.target.value)
    v.volume = vol; setVolume(vol)
  }

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        .vp-root { position:fixed; inset:0; background:#05101E; font-family:'Sora',sans-serif; overflow:hidden; }
        .vp-video { position:fixed; inset:0; width:100%; height:100%; object-fit:contain; z-index:1; cursor:pointer; }
        .vp-badge {
          position:fixed; top:24px; left:50%; transform:translateX(-50%);
          display:flex; align-items:center; gap:8px; padding:6px 18px;
          border:1px solid rgba(17,181,164,0.25); border-radius:100px;
          background:rgba(5,16,30,0.6); backdrop-filter:blur(12px);
          color:rgba(255,255,255,0.6); font-size:11px; letter-spacing:0.12em;
          text-transform:uppercase; z-index:20; transition:opacity 0.4s;
        }
        .vp-badge-dot { width:6px; height:6px; border-radius:50%; background:#11B5A4; box-shadow:0 0 8px #11B5A4; animation:vp-pulse 2s ease-in-out infinite; }
        @keyframes vp-pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.4;transform:scale(.7)} }
        .vp-close {
          position:fixed; top:24px; right:28px; width:44px; height:44px; border-radius:50%;
          border:1px solid rgba(255,255,255,0.18); background:rgba(5,16,30,0.55);
          backdrop-filter:blur(12px); display:flex; align-items:center; justify-content:center;
          color:rgba(255,255,255,0.75); font-size:20px; z-index:20; cursor:pointer;
          transition:border-color .2s,color .2s,background .2s;
        }
        .vp-close:hover { border-color:#11B5A4; color:#11B5A4; background:rgba(17,181,164,.12); }
        .vp-center { position:fixed; inset:0; display:flex; align-items:center; justify-content:center; z-index:10; pointer-events:none; transition:opacity .3s; }
        .vp-center.hidden { opacity:0; }
        .vp-center-btn {
          width:80px; height:80px; border-radius:50%;
          border:2px solid rgba(17,181,164,0.6); background:rgba(5,16,30,0.65);
          backdrop-filter:blur(16px); display:flex; align-items:center; justify-content:center;
          color:#11B5A4; pointer-events:all; cursor:pointer;
          box-shadow:0 0 32px rgba(17,181,164,.15); transition:transform .2s,box-shadow .2s;
        }
        .vp-center-btn:hover { transform:scale(1.1); box-shadow:0 0 48px rgba(17,181,164,.35); }
        .vp-controls {
          position:fixed; bottom:0; left:0; right:0; padding:16px 28px 28px;
          background:linear-gradient(to top,rgba(2,8,18,0.92) 0%,transparent 100%);
          backdrop-filter:blur(4px); z-index:15; transition:opacity .4s,transform .4s;
        }
        .vp-controls.hidden { opacity:0; transform:translateY(16px); pointer-events:none; }
        .vp-scrubber { position:relative; height:20px; margin-bottom:8px; display:flex; align-items:center; cursor:pointer; }
        .vp-track { position:absolute; left:0; right:0; height:4px; border-radius:4px; background:rgba(255,255,255,0.1); }
        .vp-fill { position:absolute; left:0; height:4px; border-radius:4px; background:linear-gradient(90deg,#11B5A4,#6EE7B7); pointer-events:none; }
        .vp-thumb { position:absolute; width:14px; height:14px; border-radius:50%; background:#fff; box-shadow:0 0 8px rgba(17,181,164,.6); transform:translateX(-50%) scale(0); transition:transform .15s; pointer-events:none; top:50%; margin-top:-7px; }
        .vp-scrubber:hover .vp-thumb { transform:translateX(-50%) scale(1); }
        .vp-scrubber:hover .vp-track { background:rgba(255,255,255,.22); }
        .vp-btn-row { display:flex; align-items:center; gap:10px; }
        .vp-btn { width:38px; height:38px; border-radius:50%; border:1px solid rgba(255,255,255,.12); background:rgba(255,255,255,.06); backdrop-filter:blur(8px); display:flex; align-items:center; justify-content:center; color:rgba(255,255,255,.8); cursor:pointer; flex-shrink:0; transition:border-color .2s,color .2s,background .2s; }
        .vp-btn:hover { border-color:#11B5A4; color:#11B5A4; background:rgba(17,181,164,.1); }
        .vp-btn.play-main { width:44px; height:44px; border-color:rgba(17,181,164,.4); color:#11B5A4; }
        .vp-btn.play-main:hover { background:rgba(17,181,164,.18); box-shadow:0 0 20px rgba(17,181,164,.25); }
        .vp-time { font-size:12px; letter-spacing:.04em; color:rgba(255,255,255,.45); font-variant-numeric:tabular-nums; white-space:nowrap; }
        .vp-time span { color:rgba(255,255,255,.75); }
        .vp-spacer { flex:1; }
        .vp-vol { display:flex; align-items:center; gap:8px; }
        .vp-vol-icon { color:rgba(255,255,255,.45); flex-shrink:0; }
        .vp-vol-slider { -webkit-appearance:none; width:72px; height:3px; border-radius:3px; background:rgba(255,255,255,.15); outline:none; cursor:pointer; }
        .vp-vol-slider::-webkit-slider-thumb { -webkit-appearance:none; width:12px; height:12px; border-radius:50%; background:#11B5A4; cursor:pointer; }
        .vp-vol-slider::-moz-range-thumb { width:12px; height:12px; border-radius:50%; background:#11B5A4; border:none; cursor:pointer; }
      `}</style>

      <div className="vp-root" onMouseMove={resetHideTimer} onClick={resetHideTimer}>
        {/* No filters/overlays on the video */}
        <video
          ref={videoRef} className="vp-video" src={VIDEO_URL}
          preload="auto" playsInline
          onTimeUpdate={() => { const v=videoRef.current; if(v) setCurrentTime(v.currentTime) }}
          onLoadedMetadata={handleLoaded}
          onDurationChange={handleLoaded}
          onEnded={() => setIsPlaying(false)}
          onClick={handlePlayPause}
        />

        <div className="vp-badge" style={{ opacity: showControls ? 1 : 0 }}>
          <span className="vp-badge-dot" />
          How It Works
        </div>

        <button className="vp-close" style={{ opacity: showControls ? 1 : 0 }}
          onClick={() => router.push('/')} aria-label="Close">✕</button>

        <div className={`vp-center${isPlaying ? ' hidden' : ''}`}>
          <button className="vp-center-btn" onClick={handlePlayPause} aria-label="Play">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><polygon points="5,3 19,12 5,21"/></svg>
          </button>
        </div>

        {mounted && (
          <div className={`vp-controls${!showControls ? ' hidden' : ''}`}>
            <div ref={trackRef} className="vp-scrubber" onMouseDown={handleTrackMouseDown}>
              <div className="vp-track" />
              <div className="vp-fill"  style={{ width: `${progress}%` }} />
              <div className="vp-thumb" style={{ left:  `${progress}%` }} />
            </div>
            <div className="vp-btn-row">
              <button className="vp-btn" onClick={() => skip(-10)} aria-label="Rewind 10s">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M1 4v6h6"/><path d="M3.51 15a9 9 0 1 0 .49-4.5"/>
                </svg>
              </button>
              <button className="vp-btn play-main" onClick={handlePlayPause} aria-label={isPlaying ? 'Pause' : 'Play'}>
                {isPlaying
                  ? <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>
                  : <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="5,3 19,12 5,21"/></svg>}
              </button>
              <button className="vp-btn" onClick={handleStop} aria-label="Stop">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><rect x="4" y="4" width="16" height="16" rx="2"/></svg>
              </button>
              <button className="vp-btn" onClick={() => skip(10)} aria-label="Forward 10s">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M23 4v6h-6"/><path d="M20.49 15a9 9 0 1 1-.49-4.5"/>
                </svg>
              </button>
              <div className="vp-time"><span>{fmt(currentTime)}</span> / {fmt(duration)}</div>
              <div className="vp-spacer" />
              <div className="vp-vol">
                <svg className="vp-vol-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <polygon points="11,5 6,9 2,9 2,15 6,15 11,19"/>
                  {volume > 0   && <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>}
                  {volume > 0.5 && <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>}
                </svg>
                <input type="range" className="vp-vol-slider"
                  min={0} max={1} step={0.02} value={volume}
                  onChange={handleVolume} aria-label="Volume"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
```

**Optional time-range blur** (hide sensitive content between timestamps):
```tsx
const isBlurred = currentTime >= 137 && currentTime <= 141
// on <video> style: filter: isBlurred ? 'blur(12px)' : 'none', transition: 'filter 0.2s'
```
