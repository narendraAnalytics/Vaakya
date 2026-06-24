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
│   ├── clause_library/         # JSON clause templates — nda, vendor, employment, service, lease, partnership
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
- **JWT algorithm: ES256** — new Supabase projects use ECDSA P-256 keys, NOT RS256 or HS256. `api/middleware/auth.py` uses `algorithms=["ES256"]`. The legacy HS256 JWT secret only applies to anon/service_role API keys.
- Row-Level Security (RLS) on all Supabase tables — users only see their own documents
- Never expose Supabase service role key to frontend
- `DEV_AUTH_BYPASS=true` in `.env` skips JWT verification for local testing (Bearer value used as user_id) — **never set this on Render**

---

## API Endpoints

| Method | Path | Sub-graph | Description |
|--------|------|-----------|-------------|
| POST | `/document/new` | new_doc | Text input → draft → review → HITL → sign. Returns 202 + document_id |
| POST | `/document/upload` | redline | PDF multipart upload → negotiate + risk → HITL → sign. Returns 202 + document_id |
| GET | `/document/{id}/status` | — | Poll graph state; returns HITL payload + `sub_graph` field when paused at approval |
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

### Phase 2 — Parallel Agents & E-Sign
- [x] Jokhim Agent (parallel with Parisheelanam in new_doc; parallel with Samjoota in redline)
- [x] Sruthi Agent (obligation extraction, post-HITL)
- [x] Sahee Agent (vault card + esign_status + PDF generation + Storage upload)
- [x] Samjoota Agent (negotiation/redline sub-graph)
- [x] Vivada Agent (dispute sub-graph)
- [x] All 3 sub-graphs wired with parallel fan-out (new_doc, redline, dispute)
- [x] `services/doc_generator.py` (ReportLab platypus — contract PDF + redline report PDF; populates final_pdf_url)
- [x] `clause_library/` — 6 doc types, 67 clauses (NDA, Vendor Agreement, Employment, Service, Lease, Partnership Deed)
- [x] Backend deployed to Render — https://vaakya.onrender.com (health ✅ `db: connected`)
- [x] Agent prompts hardened — Rachana drafts 5 mandatory clauses (acceptance criteria, revision limits, late payment protection, deliverable warranty, source code handover); Parisheelanam scores them; Jokhim flags when absent
- [x] **Rachana enhanced** — 6 new document types (MSA, IP Assignment, Loan Agreement, Legal Notice, Privacy Policy, Terms of Service) → 12 total; 7-point pre-output internal consistency check (dates, party names, money values, notice periods, term/renewal, liability cap, cross-references)
- [x] **Vivada enhanced** — 7 dispute playbooks (NDA, Lease, Vendor, Freelancer, Employment, Partnership, MSA/SaaS, Loan); damages calculation (principal/interest/penalties/consequential); limitation period analyser (SAFE/URGENT/EXPIRED); settlement recommendation with ₹ floor; success probability (HIGH/MEDIUM/LOW); structured evidence matrix [{document, importance, reason}]; contract-aware analysis reads draft/obligations/risk_flags from VaakyaState
- [x] **Sruthi enhanced** — 10 doc-type obligation checklists; 8 new obligation categories (employment, sla, security, audit, maintenance, warranty, ip_transfer, governance); deadline normalization fields (deadline_days, deadline_date, trigger_event); reminder schedule generation (priority-based offset strings); estimated_penalty field
- [x] **Samjoota enhanced** — 8 doc-type negotiation playbooks (NDA, Lease, Vendor, Employment, Freelancer, Partnership, MSA/SaaS, Loan); 3-axis clause severity (business_impact/legal_impact/negotiation_priority); deal-breaker detection (6 trigger conditions); negotiation_score formula (100 − 20×deal-breakers − 10×HIGH − 5×MEDIUM); redline diff output (- old / + new); fallback_position + walkaway_position per clause; acceptance_probability + confidence at output level; Jokhim risk_flags injected as shared context
- [ ] Supabase Storage vault with pgvector metadata
- [ ] Digio API integration in Sahee (e-signatures)
- [ ] `tests/test_nda_pipeline.py` (10 scenarios)

### Phase 3 — Negotiation, Disputes & Frontend
- [ ] pgvector semantic clause search (`services/embeddings.py`)
- [ ] WhatsApp Business API alerts in Sruthi
- [x] Next.js 16 frontend — landing page + auth + onboarding (deployed: https://vaakya-tau.vercel.app)
- [x] Dashboard page (`frontend/src/app/dashboard/`) — server component fetches vault, client component renders full UI
- [x] Agent progress page (`frontend/src/app/dashboard/documents/[id]/`) — polls status, HITL review, final result
- [x] `MarkdownRenderer` component (`frontend/src/components/MarkdownRenderer.tsx`) — renders LLM draft output as styled Markdown (Georgia serif headings, green blockquote borders, GFM tables/lists)
- [x] Agent pipeline now dynamic per `sub_graph` — `ALL_AGENTS` (8 entries) filtered by `flows` field; Tavily badge via `agent.tavily` + `agent.tavilyLabel`
- [x] Live activity feed on agent progress page — `prevStatesRef` tracks state transitions between polls; `msgTick` counter rotates agent work messages every 2.5s
- [x] Agent workflow page redesigned — 2-column command-center layout (vertical graph left, sticky panel right); Cloudinary agent avatars (`avatarUrl` in `ALL_AGENTS`, URLs in `projectworkflow.txt`); animated connector lines + fork/merge pipes; circular SVG score gauge; botanical decorations
- [x] **Dashboard doc types expanded** — 16 document types with icons (added MSA 🗂️, IP Assignment 💡, Loan 💰, Legal Notice ⚖️, Privacy Policy 🔒, Terms of Service 📜 to dropdown + `getDocIcon()`)
- [x] **Dispute Analysis panel** — left column, shown when `sub_graph === 'dispute'` and `dispute_summary` present; renders Vivada markdown output via `MarkdownRenderer`; right panel heading adapts to "Dispute Summary"
- [x] **Obligations & Deadlines panel** — shown post-completion when `obligations.length > 0`; priority-colored cards (red/amber/green left border); shows action, deadline, deadline_days, clause_reference, estimated_penalty warning, reminder_schedule chips; status endpoint now returns full `obligations` array
- [x] **Redline Analysis panel** — shown when `sub_graph === 'redline'` and `negotiation_redlines.length > 0`; negotiation score badge, deal-breaker count, P1 must-fix count; per-clause cards sorted P1→P2→P3 with `business_impact` color coding, 🚨 deal-breaker badge, diff block (- red / + green), fallback/walkaway positions; status endpoint now returns `negotiation_redlines` array

#### Frontend Auth — Resolved Issues
- **Signup 500 error**: Supabase had `on_auth_user_created` trigger → `handle_new_user()` tried to INSERT into missing `profiles` table. Fixed by dropping the trigger and creating `public.profiles` (id, username, created_at) with RLS.
- **Next.js 16 proxy conflict**: `src/middleware.ts` + `src/proxy.ts` cannot coexist. Deleted `middleware.ts`; `src/proxy.ts` exports `async function proxy()` (not `middleware`).
- **Onboarding redirect loop**: `updateUser()` updates `user_metadata` but JWT stays stale. Proxy reads old JWT → no username → bounces back. Fixed by calling `supabase.auth.refreshSession()` before `router.replace('/')`.
- **Username login**: Added `username` column to `profiles`. Onboarding upserts username there. Login form accepts email OR username — if no `@`, calls `get_email_by_username(p_username)` SECURITY DEFINER RPC to resolve email, then signs in normally.

#### Production Bug Fixes — Resolved Issues
- **JWT algorithm mismatch**: `auth.py` used `algorithms=["RS256"]` but new Supabase projects sign JWTs with **ES256** (ECDSA P-256) via JWKS. Fixed: `algorithms=["ES256"]` in `api/middleware/auth.py`. The legacy HS256 JWT secret only signs anon/service_role API keys — never user session tokens.
- **Dashboard cold-start blank page**: Dashboard is SSR; vault fetch blocks HTML delivery; Render free-tier cold start takes ~30s. Fixed: warmup ping to `/health` fired from landing page `useEffect` when user is logged in; `AbortSignal.timeout(5000)` on vault fetch so SSR never hangs longer than 5s.
- **PDF download "Not authenticated"**: `<a href target="_blank">` sends no `Authorization` header; `/vault/{id}` requires Bearer token. Fixed: replaced with `<button>` that fetches vault record with auth, gets Supabase signed URL, opens it in new tab.
- **Dashboard shows 0 documents**: `documents.document_type TEXT NOT NULL` constraint — initial INSERT omitted this field → PostgreSQL NOT NULL violation → silently caught → no row inserted → `_persist_state` UPDATE matched nothing → `vault_documents` never populated. Fixed: added `"document_type": ""` to both INSERT statements in `backend/api/routes/document.py` (`/new` and `/upload`). Status polling still worked because it reads from LangGraph PostgreSQL checkpoint, not Supabase.
- **Textarea accessibility errors**: Two `<textarea>` elements in the agent progress page had no labels. Fixed: added `aria-label="Document draft preview"` and `aria-label="Revision feedback"` in `frontend/src/app/dashboard/documents/[id]/page.tsx`.
- **Status response missing `sub_graph`**: `/document/{id}/status` didn't expose `sub_graph` from `VaakyaState`, so the frontend couldn't distinguish flows. Fixed: added `"sub_graph": values.get("sub_graph", "new_doc")` to return dict in `backend/api/routes/document.py`.
- **Agent pipeline hard-coded for `new_doc`**: Frontend `AGENTS` array showed only 6 agents. Fixed: replaced with `ALL_AGENTS` (8 agents with `flows: string[]` and `tavily: bool` metadata), filtered at render time via `ALL_AGENTS.filter(a => a.flows.includes(subGraph))`.
- **Raw Markdown in agent responses**: LLM draft output contains `**bold**`, `## headings`, `- lists` — displayed as raw symbols before fix. Fixed: created `frontend/src/components/MarkdownRenderer.tsx` (react-markdown + remark-gfm + rehype-sanitize, inline JSX styles matching Vaakya palette). Use `<MarkdownRenderer content={...} />` for all LLM text output.
- **Dashboard "permission denied for table vault_documents" / all tables returning 0 rows**: Supabase tables were created without granting DML privileges to the `authenticated` and `service_role` roles. PostgreSQL requires explicit `GRANT SELECT/INSERT/UPDATE/DELETE` even when RLS policies exist — missing grants cause "permission denied" at the table level before RLS even runs. The `postgres` superuser (used by Supabase MCP) could still read/write, masking the issue. Fixed: ran `GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.<table> TO authenticated, service_role` for all 6 Vaakya tables (`documents`, `vault_documents`, `disputes`, `obligations`, `clause_library`, `profiles`). **Always run this grant after creating any new table.** Frontend SSR client also calls `supabase.auth.refreshSession()` before vault queries to get a fresh JWT in-memory (proxy.ts does not refresh sessions, so SSR cookies may carry an expired access token that makes `auth.uid()` return null in RLS).

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

## Deployment

| Service | Platform | URL |
|---------|----------|-----|
| Backend (FastAPI) | Render | https://vaakya.onrender.com |
| Frontend (Next.js) | Vercel | https://vaakya-tau.vercel.app |

---

## Key Constraints

- **Jurisdiction-aware**: all contracts must cite Indian Contract Act 1872 by default
- **Risk threshold**: Parisheelanam score must be ≥ 75 before proceeding; max 3 loops
- **HITL is mandatory**: no document ever reaches e-sign without explicit user approval
- **Multi-tenant**: every DB row has `user_id` FK; RLS enforced at Supabase level
- **PDF-first output**: all final documents are PDF (ReportLab), not DOCX
