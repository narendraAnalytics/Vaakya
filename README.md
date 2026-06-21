# Vaakya (వాక్య) — Autonomous Legal Document Factory

> Telugu for *"legal statement / clause"* — the smallest unit of law.

Vaakya is a multi-agent AI platform that eliminates the legal document bottleneck for Indian SMBs. A business owner types a plain-English request or uploads a PDF — Vaakya drafts, reviews, risk-checks, and delivers a legally sound contract ready for e-signature in under 4 minutes, at 95% lower cost than a lawyer.

---

## The 8 Agents

| # | Agent (Telugu) | Role | LLM |
|---|---|---|---|
| 01 | **Arambha** (ఆరంభ) | Orchestrator / Intake | llama-3.1-8b-instant |
| 02 | **Rachana** (రచన) | Contract Drafting | llama-3.3-70b-versatile |
| 03 | **Parisheelanam** (పరిశీలనం) | Review + Reflexion Loop | llama-3.3-70b-versatile |
| 04 | **Jokhim** (జోఖిమ్) | Risk Flagging | llama-3.3-70b-versatile |
| 05 | **Samjoota** (సమ్జూత) | Negotiation / Redline | llama-3.3-70b-versatile |
| 06 | **Sahee** (సహీ) | Sign & Deliver | Tool-based |
| 07 | **Sruthi** (శ్రుతి) | Obligation Tracker | llama-3.1-8b-instant |
| 08 | **Vivada** (వివాద) | Dispute Resolution | llama-3.3-70b-versatile |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Python 3.12.10 (uv) |
| API | FastAPI + Uvicorn |
| AI Orchestration | LangGraph 0.2+ |
| LLM | Groq (llama-3.3-70b-versatile / llama-3.1-8b-instant) |
| Auth | Supabase Auth |
| Database | Supabase PostgreSQL + pgvector |
| Storage | Supabase Storage |
| Embeddings | BAAI/bge-small-en-v1.5 |
| PDF Parse | PyMuPDF |
| PDF Generate | ReportLab |
| E-Signature | Digio API *(Phase 2)* |
| Frontend | Next.js *(Phase 3)* |

---

## Repo Structure

```
Vaakya/
├── backend/          # FastAPI + LangGraph backend (Python 3.12.10)
│   ├── agents/       # 8 Telugu-named agent modules
│   ├── graph/        # LangGraph state + workflow + subgraphs
│   ├── api/          # FastAPI routes + middleware
│   ├── services/     # Supabase, PDF, embeddings, storage
│   ├── clause_library/  # JSON contract clause templates
│   ├── tests/
│   ├── pyproject.toml
│   └── .env.example
├── frontend/         # Next.js frontend (Phase 3 — coming soon)
├── CLAUDE.md         # Project-wide AI coding guide
├── projectworkflow.txt  # Full workflow & architecture spec
└── infographic.png   # Workflow diagram
```

---

## Quickstart (Backend)

```powershell
cd backend

# Fix Python version if needed (first time only)
uv python install 3.12.10
Remove-Item -Recurse -Force .venv
uv venv --python 3.12.10

# Install dependencies
uv sync

# Set up environment
copy .env.example .env
# Fill in SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY,
# SUPABASE_DB_URL, GROQ_API_KEY in .env

# Run dev server
uv run uvicorn api.main:app --reload --port 8000
```

---

## LangGraph Workflow

```
User Input (text or PDF)
        │
        ▼
   [ARAMBHA] — classify document type, extract parties + jurisdiction
        │
        ▼
   [RACHANA] — generate full contract from clause library
        │
        ▼
   [PARISHEELANAM] — review & score (loops back to Rachana if score < 75, max 3×)
        │
   PARALLEL FAN-OUT
   ┌────┴────┐
[PARISHEELANAM] [JOKHIM]     ← risk flags run in parallel
   └────┬────┘
   FAN-IN
        │
   [HITL CHECKPOINT] — user reviews + approves (mandatory)
        │
   [SAHEE] — generate PDF → Supabase Storage → Digio e-sign
        │
   [SRUTHI] — extract obligations → schedule renewal alerts
```

---

## Document Types Supported

NDA · Vendor Agreement · Employment Contract · Freelancer Agreement · Service Agreement · Lease Agreement · Partnership Deed · Legal Notice · MSA · IP Assignment · Privacy Policy · Loan Agreement

---

## Development Phases

| Phase | Scope | Status |
|---|---|---|
| **Phase 1** | Foundation — NDA from text/PDF, Arambha + Rachana + Parisheelanam, Supabase auth + storage | 🔄 In Progress |
| **Phase 2** | Parallel agents — Jokhim + Sruthi + Sahee, Digio e-sign, obligation alerts | Planned |
| **Phase 3** | Negotiation + Disputes — Samjoota + Vivada, Next.js frontend, WhatsApp alerts | Planned |

---

## Why Vaakya?

Indian SMBs lose **9.2% of annual revenue** to poor contract management — missed renewals, unenforceable clauses, delayed agreements. 90% cannot afford a lawyer for routine legal work. Vaakya delivers:

- NDA drafted + reviewed + e-sign ready in **under 4 minutes**
- **94% risk detection** accuracy (vs 85% for an average lawyer)
- **Rs.299–2,999/month** vs Rs.10,000–50,000 per contract

---

*"From a Rs.15,000 lawyer's fee and a 5-day wait — to a Rs.199 document ready in 4 minutes."*
