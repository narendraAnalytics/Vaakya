# CLAUDE.md — Vaakya Project Guide

## Project Identity
**Vaakya** (వాక్య) — Autonomous Legal Document Factory for Indian SMBs.
Telugu for "legal statement/clause." Gives every SMB owner a voice in every contract.

---

## Tech Stack (Locked)

| Layer | Technology | Notes |
|---|---|---|
| Runtime | Python 3.12.10 (uv) | `.python-version` pinned |
| API | FastAPI + Uvicorn | Async, Pydantic v2 validation |
| AI Orchestration | LangGraph 0.2+ | Stateful multi-agent graph |
| LLM (reasoning) | Groq `llama-3.3-70b-versatile` | Rachana, Parisheelanam, Jokhim, Samjoota, Vivada |
| LLM (routing) | Groq `llama-3.1-8b-instant` | Arambha, Sruthi |
| Auth | Supabase Auth | JWT via Supabase SDK |
| Database | Supabase PostgreSQL + pgvector | State, clause library, vault metadata |
| Storage | Supabase Storage | PDFs, signed contracts, uploads |
| Embeddings | `BAAI/bge-small-en-v1.5` | Clause semantic search |
| PDF Processing | PyMuPDF (fitz) | Text extraction with page labels |
| Doc Generation | python-docx + ReportLab | Draft and final contract PDFs |
| E-Signature | Digio API | Phase 2 |
| Alerts | WhatsApp Business API | Phase 2 |
| Frontend | Next.js | Phase 3 |
| Package Manager | uv | Never use pip directly |

---

## Repository Structure

```
vaakya/
├── backend/
│   ├── agents/
│   │   ├── arambha.py          # Orchestrator/Intake — llama-3.1-8b-instant
│   │   ├── rachana.py          # Drafting — llama-3.3-70b-versatile
│   │   ├── parisheelanam.py    # Review — llama-3.3-70b-versatile
│   │   ├── jokhim.py           # Risk — llama-3.3-70b-versatile
│   │   ├── samjoota.py         # Negotiation — llama-3.3-70b-versatile
│   │   ├── sahee.py            # Sign & Deliver — (tool-based)
│   │   ├── sruthi.py           # Obligation Tracker — llama-3.1-8b-instant
│   │   └── vivada.py           # Dispute — llama-3.3-70b-versatile
│   ├── graph/
│   │   ├── state.py            # TypedDict VaakyaState schema
│   │   ├── workflow.py         # Main LangGraph graph
│   │   └── subgraphs/
│   │       ├── new_doc.py      # Sub-graph A: new document flow
│   │       ├── redline.py      # Sub-graph B: redline review
│   │       └── dispute.py      # Sub-graph C: dispute resolution
│   ├── api/
│   │   ├── main.py             # FastAPI app entry point
│   │   ├── routes/
│   │   │   ├── document.py     # POST /document/new, /document/upload
│   │   │   ├── vault.py        # GET /vault, /vault/{id}
│   │   │   ├── dispute.py      # POST /dispute
│   │   │   └── webhook.py      # Digio e-sign webhooks
│   │   └── middleware/
│   │       ├── auth.py         # Supabase JWT verification
│   │       └── logging.py
│   ├── services/
│   │   ├── pdf_extractor.py    # PyMuPDF text extraction with page labels
│   │   ├── doc_generator.py    # python-docx + ReportLab  (Phase 2)
│   │   ├── supabase_client.py  # Shared Supabase client (anon + service role)
│   │   ├── storage.py          # Supabase Storage operations
│   │   ├── legal_search.py     # Tavily Indian law search (Jokhim + Vivada)
│   │   └── embeddings.py       # BGE embeddings + pgvector search  (Phase 3)
│   ├── clause_library/         # JSON clause templates by doc type
│   ├── tests/
│   ├── pyproject.toml
│   ├── .python-version         # 3.12.10
│   └── .env.example
├── CLAUDE.md                   # ← this file
├── projectworkflow.txt         # detailed workflow documentation
├── vaakya_doc.txt              # project blueprint
└── infographic.png             # workflow diagram
```

---

## The 8 Agents

| # | Telugu Name | Role | LLM |
|---|---|---|---|
| 01 | **Arambha** (ఆరంభ) | Orchestrator / Intake | 8B instant |
| 02 | **Rachana** (రచన) | Drafting | 70B versatile |
| 03 | **Parisheelanam** (పరిశీలనం) | Review (reflexion loop) | 70B versatile |
| 04 | **Jokhim** (జోఖిమ్) | Risk Flagging | 70B versatile |
| 05 | **Samjoota** (సమ్జూత) | Negotiation / Redline | 70B versatile |
| 06 | **Sahee** (సహీ) | Sign & Deliver | Tool-based |
| 07 | **Sruthi** (శ్రుతి) | Obligation Tracker | 8B instant |
| 08 | **Vivada** (వివాద) | Dispute Resolution | 70B versatile |

---

## LangGraph State Schema (VaakyaState)

```python
class VaakyaState(TypedDict):
    # Input
    user_id: str
    input_mode: Literal["text", "pdf"]
    raw_input: str                  # plain text request or extracted PDF text
    document_type: str              # NDA, Vendor Agreement, Employment, etc.

    # Extracted metadata
    parties: list[dict]
    jurisdiction: str
    key_terms: dict

    # Agent outputs — parallel-written fields use Annotated[list, operator.add]
    draft: str
    review_score: int
    review_issues: Annotated[list[str], operator.add]
    risk_flags:    Annotated[list[dict], operator.add]
    negotiation_redlines: Annotated[list[dict], operator.add]
    obligations:   Annotated[list[dict], operator.add]
    dispute_summary: str
    errors:        Annotated[list[str], operator.add]

    # Control
    loop_count: int                 # Rachana ↔ Parisheelanam loop counter
    hitl_approved: bool
    sub_graph: Literal["new_doc", "redline", "dispute"]

    # Output
    final_pdf_url: str              # Supabase Storage URL
    vault_id: str
    esign_status: str
```

---

## Sub-Graph Routing

```
User Input
    │
    ▼
Arambha (classify)
    │
    ├── new_doc ──► Rachana ──► Parisheelanam (loop ≤3)
    │                                │
    │                    PARALLEL ───┤
    │               Parisheelanam   Jokhim
    │                    └─── FAN-IN ──► HITL ──► Sahee ──► Sruthi
    │
    ├── redline ──► PARALLEL: Samjoota + Jokhim
    │                    └─── FAN-IN ──► HITL ──► Sahee
    │
    └── dispute ──► Vivada ──► Sahee
```

---

## Auth Pattern (Supabase)

- All API routes protected by `Authorization: Bearer <supabase_jwt>`
- FastAPI dependency `get_current_user()` verifies JWT locally via Supabase JWKS (no per-request API call)
- Row-Level Security (RLS) on all Supabase tables — users only see their own documents
- Never expose Supabase service role key to frontend
- `DEV_AUTH_BYPASS=true` in `.env` skips JWT verification for local testing (Bearer value used as user_id)

---

## API Endpoints

| Method | Path | Sub-graph | Description |
|--------|------|-----------|-------------|
| POST | `/document/new` | new_doc | Text input → draft → review → HITL → sign. Returns 202 + document_id |
| POST | `/document/upload` | redline | PDF multipart upload → negotiate + risk → HITL → sign. Returns 202 + document_id |
| GET | `/document/{id}/status` | — | Poll graph state; returns HITL payload when paused at approval |
| POST | `/document/{id}/approve` | — | Resume after HITL. `approved=true` → Sahee; `approved=false` → back to Rachana |
| GET | `/health` | — | Liveness check + DB connection status |

---

## Development Phases

### Phase 1 — Foundation ✅ COMPLETE
- [x] Fix Python 3.12.10 venv (uv venv --python 3.12.10)
- [x] pyproject.toml with all dependencies
- [x] VaakyaState TypedDict (`graph/state.py`)
- [x] Arambha Agent (classify + extract)
- [x] Rachana Agent (draft generation)
- [x] Parisheelanam Agent (review + reflexion loop)
- [x] FastAPI app entry point (`api/main.py`) with lifespan + AsyncPostgresSaver
- [x] `run.py` with Windows SelectorEventLoop fix
- [x] Supabase project + schema (6 tables + RLS + 2 storage buckets)
- [x] FastAPI: POST /document/new (202, background graph run, Supabase row insert)
- [x] FastAPI: POST /document/upload (PDF multipart → redline sub-graph)
- [x] FastAPI: GET /document/{id}/status + POST /document/{id}/approve (HITL)
- [x] Supabase Auth middleware — JWKS JWT verification + DEV_AUTH_BYPASS (`api/middleware/auth.py`)
- [x] `services/pdf_extractor.py` (PyMuPDF, page labels, image-PDF guard)
- [x] `services/supabase_client.py` (singleton, anon + service role)
- [x] `services/storage.py` (upload_pdf, get_signed_url, upload_user_pdf)
- [x] `services/legal_search.py` (Tavily Indian law search — Jokhim + Vivada)

### Phase 2 — Parallel Agents & E-Sign ✅ Agents done
- [x] Jokhim Agent (parallel with Parisheelanam in new_doc; parallel with Samjoota in redline)
- [x] Sruthi Agent (obligation extraction, post-HITL)
- [x] Sahee Agent (vault card + esign_status)
- [x] Samjoota Agent (negotiation/redline sub-graph)
- [x] Vivada Agent (dispute sub-graph)
- [x] All 3 sub-graphs wired with parallel fan-out (new_doc, redline, dispute)
- [ ] `services/doc_generator.py` (ReportLab PDF — populates final_pdf_url)
- [ ] Supabase Storage vault with pgvector metadata
- [ ] Digio API integration in Sahee (e-signatures)
- [ ] 5 more document types in clause_library/
- [ ] `tests/test_nda_pipeline.py` (10 scenarios)

### Phase 3 — Negotiation, Disputes & Frontend
- [ ] pgvector semantic clause search (`services/embeddings.py`)
- [ ] WhatsApp Business API alerts in Sruthi
- [ ] Next.js frontend

---

## Coding Conventions

- All agents are pure async functions: `async def run_arambha(state: VaakyaState) -> dict`
- No global state — everything passes through VaakyaState
- Supabase client is a singleton from `services/supabase_client.py`
- All LLM calls use `langchain-groq` with structured output (Pydantic models)
- Reflexion loop max iterations = 3 (hard-coded in graph, not agent)
- HITL via LangGraph `interrupt()` — never sleep/poll
- All file uploads go to Supabase Storage bucket `vaakya-contracts`
- Environment: `.env` file, never hardcode secrets
- Package management: `uv add <package>` only, never pip

---

## Environment Variables (.env)

```
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_JWKS_URL=              # https://<ref>.supabase.co/auth/v1/.well-known/jwks.json
DATABASE_URL=                   # postgresql+psycopg://... (direct — NOT pooled port 6543)
GROQ_API_KEY=
TAVILY_API_KEY=                 # Jokhim + Vivada legal research (optional — degrades gracefully if absent)
DEV_AUTH_BYPASS=false           # set true in local .env only — NEVER in production
LANGSMITH_API_KEY=
LANGSMITH_PROJECT=vaakya
DIGIO_API_KEY=                  # Phase 2
WHATSAPP_API_KEY=               # Phase 2
```

---

## Key Constraints

- **Jurisdiction-aware**: all contracts must cite Indian Contract Act 1872 by default
- **Risk threshold**: Parisheelanam score must be ≥ 75 before proceeding; max 3 loops
- **HITL is mandatory**: no document ever reaches e-sign without explicit user approval
- **Multi-tenant**: every DB row has `user_id` FK; RLS enforced at Supabase level
- **PDF-first output**: all final documents are PDF (ReportLab), not DOCX
