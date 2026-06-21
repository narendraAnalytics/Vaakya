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
│   │   ├── pdf_extractor.py    # PyMuPDF text extraction
│   │   ├── doc_generator.py    # python-docx + ReportLab
│   │   ├── supabase_client.py  # Shared Supabase client
│   │   ├── storage.py          # Supabase Storage operations
│   │   └── embeddings.py       # BGE embeddings + pgvector search
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

    # Agent outputs (append-only lists for parallel branches)
    draft: str
    review_score: int
    review_issues: list[str]
    risk_flags: list[dict]
    negotiation_redlines: list[dict]
    obligations: list[dict]
    dispute_summary: str

    # Control
    loop_count: int                 # Rachana ↔ Parisheelanam loop counter
    hitl_approved: bool
    sub_graph: Literal["new_doc", "redline", "dispute"]

    # Output
    final_pdf_url: str              # Supabase Storage URL
    vault_id: str
    esign_status: str
    errors: list[str]
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
- FastAPI dependency `get_current_user()` verifies token via Supabase Admin SDK
- Row-Level Security (RLS) on all Supabase tables — users only see their own documents
- Never expose Supabase service role key to frontend

---

## Development Phases

### Phase 1 — Foundation (current)
- [ ] Fix Python 3.12.10 venv (uv venv --python 3.12.10)
- [ ] pyproject.toml with all dependencies
- [ ] Supabase project + schema (users, documents, vault, obligations)
- [ ] VaakyaState TypedDict
- [ ] Arambha Agent (classify + extract)
- [ ] Rachana Agent (draft generation)
- [ ] Parisheelanam Agent (review + reflexion loop)
- [ ] FastAPI: POST /document/new
- [ ] FastAPI: POST /document/upload (PDF mode)
- [ ] Supabase Auth middleware
- [ ] Supabase Storage for PDFs

### Phase 2 — Parallel Agents & E-Sign
- [ ] Jokhim Agent (parallel with Parisheelanam)
- [ ] Sruthi Agent (obligation extraction + alerts)
- [ ] Sahee Agent (Digio integration)
- [ ] Supabase Storage vault with pgvector metadata
- [ ] 5 more document types

### Phase 3 — Negotiation & Disputes
- [ ] Samjoota Agent (redline sub-graph)
- [ ] Vivada Agent (dispute sub-graph)
- [ ] pgvector semantic clause search
- [ ] WhatsApp Business API alerts
- [ ] Next.js frontend

---

## Coding Conventions

- All agents are pure async functions: `async def run_arambha(state: VaakyaState) -> VaakyaState`
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
GROQ_API_KEY=
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
