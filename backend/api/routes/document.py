"""
Document routes.

POST /document/new          → 202 Accepted, starts background graph run
GET  /document/{id}/status  → poll for completion / HITL interrupt payload
POST /document/{id}/approve → resume graph after HITL human approval
"""

import uuid
from datetime import datetime, timezone
from typing import Any

from fastapi import APIRouter, BackgroundTasks, Depends, File, HTTPException, Request, UploadFile, status
from langgraph.types import Command
from pydantic import BaseModel

from api.config import settings
from api.middleware.auth import get_current_user
from services.pdf_extractor import extract_text
from services.storage import upload_user_pdf
from services.supabase_client import get_supabase

router = APIRouter()

# ── Request / Response models ─────────────────────────────────────────────────

class NewDocumentRequest(BaseModel):
    request: str                        # plain-text instruction from the user
    input_mode: str = "text"            # "text" | "pdf"


class NewDocumentResponse(BaseModel):
    document_id: str
    status: str = "processing"
    message: str = "Document creation started. Poll /document/{id}/status for updates."


class ApprovalRequest(BaseModel):
    approved: bool
    feedback: str = ""                  # optional user feedback on rejection


# ── Supabase persistence helpers ──────────────────────────────────────────────

def _derive_status(graph_state) -> str:
    """Map LangGraph state → document status string."""
    next_nodes = list(graph_state.next) if graph_state.next else []
    for task in getattr(graph_state, "tasks", []):
        if hasattr(task, "interrupts") and task.interrupts:
            return "awaiting_approval"
    if not next_nodes:
        values = graph_state.values
        if values.get("errors"):
            return "completed"   # completed with errors is still completed
        return "completed"
    return "processing"


async def _persist_state(graph, document_id: str, config: dict) -> None:
    """Read final graph state and write to Supabase. No-op in DEV_AUTH_BYPASS mode."""
    if settings.DEV_AUTH_BYPASS:
        return  # user_id is "dev-token", not a real UUID — skip FK writes

    try:
        graph_state = await graph.aget_state(config)
        if graph_state is None:
            return
        v = graph_state.values
        doc_status = _derive_status(graph_state)
        now = datetime.now(timezone.utc).isoformat()
        sb = get_supabase()

        # Update documents row
        sb.table("documents").update({
            "document_type": v.get("document_type", ""),
            "parties":       v.get("parties", []),
            "jurisdiction":  v.get("jurisdiction", "India"),
            "key_terms":     v.get("key_terms", {}),
            "sub_graph":     v.get("sub_graph", "new_doc"),
            "draft":         v.get("draft", ""),
            "review_score":  v.get("review_score", 0),
            "loop_count":    v.get("loop_count", 0),
            "hitl_approved": v.get("hitl_approved", False),
            "status":        doc_status,
            "vault_id":      v.get("vault_id") or None,
            "esign_status":  v.get("esign_status", ""),
            "risk_flags":    v.get("risk_flags", []),
            "errors":        v.get("errors", []),
            "updated_at":    now,
        }).eq("id", document_id).execute()

        # Write vault_documents row when document is completed with a vault_id
        if doc_status == "completed" and v.get("vault_id"):
            sb.table("vault_documents").upsert({
                "id":             v["vault_id"],
                "user_id":        v.get("user_id", ""),
                "document_id":    document_id,
                "document_type":  v.get("document_type", ""),
                "jurisdiction":   v.get("jurisdiction", "India"),
                "parties":        v.get("parties", []),
                "esign_status":   v.get("esign_status", "pending_signature"),
                "updated_at":     now,
            }).execute()

        # Write obligations rows (idempotent — delete + re-insert)
        if doc_status == "completed" and v.get("obligations"):
            sb.table("obligations").delete().eq("document_id", document_id).execute()
            rows = []
            for obl in v["obligations"]:
                rows.append({
                    "user_id":          v.get("user_id", ""),
                    "document_id":      document_id,
                    "party":            obl.get("party", ""),
                    "obligation_type":  obl.get("obligation_type", "other"),
                    "action":           obl.get("action", ""),
                    "deadline":         obl.get("deadline", ""),
                    "deadline_type":    obl.get("deadline_type", "relative"),
                    "consequence":      obl.get("consequence", ""),
                    "priority":         obl.get("priority", "MEDIUM"),
                    "clause_reference": obl.get("clause_reference", ""),
                })
            if rows:
                sb.table("obligations").insert(rows).execute()

    except Exception as exc:
        print(f"[WARN] Supabase persist failed for {document_id}: {exc}")


# ── Background task ───────────────────────────────────────────────────────────

async def _run_graph(
    graph,
    document_id: str,
    initial_state: dict,
    config: dict,
) -> None:
    """Runs the Vaakya graph in the background. Interrupts at HITL node."""
    try:
        async for _ in graph.astream(initial_state, config=config, stream_mode="updates"):
            pass
    except Exception:
        pass
    # Persist whatever state we reached (processing → awaiting_approval or error)
    await _persist_state(graph, document_id, config)


# ── Routes ────────────────────────────────────────────────────────────────────

@router.post("/new", response_model=NewDocumentResponse, status_code=status.HTTP_202_ACCEPTED)
async def create_document(
    body: NewDocumentRequest,
    background_tasks: BackgroundTasks,
    request: Request,
    user_id: str = Depends(get_current_user),
) -> NewDocumentResponse:
    graph = request.app.state.graph
    document_id = str(uuid.uuid4())

    # Persist initial row to Supabase (real auth only — dev bypass uses non-UUID user_id)
    if not settings.DEV_AUTH_BYPASS:
        try:
            get_supabase().table("documents").insert({
                "id":            document_id,
                "user_id":       user_id,
                "document_type": "",
                "input_mode":    body.input_mode,
                "raw_input":     body.request,
                "status":        "processing",
            }).execute()
        except Exception as exc:
            print(f"[WARN] Supabase insert failed: {exc}")

    initial_state: dict[str, Any] = {
        "user_id": user_id,
        "input_mode": body.input_mode,
        "raw_input": body.request,
        "document_type": "",
        "parties": [],
        "jurisdiction": "India",
        "key_terms": {},
        "draft": "",
        "review_score": 0,
        "review_issues": [],
        "risk_flags": [],
        "negotiation_redlines": [],
        "obligations": [],
        "dispute_summary": "",
        "loop_count": 0,
        "hitl_approved": False,
        "sub_graph": "new_doc",
        "final_pdf_url": "",
        "vault_id": "",
        "esign_status": "",
        "errors": [],
    }

    config = {"configurable": {"thread_id": document_id}}
    background_tasks.add_task(_run_graph, graph, document_id, initial_state, config)

    return NewDocumentResponse(document_id=document_id)


@router.post("/upload", response_model=NewDocumentResponse, status_code=status.HTTP_202_ACCEPTED)
async def upload_document(
    background_tasks: BackgroundTasks,
    request: Request,
    file: UploadFile = File(...),
    user_id: str = Depends(get_current_user),
) -> NewDocumentResponse:
    """
    PDF upload endpoint for the redline flow.
    Extracts text via PyMuPDF, stores the original PDF in vaakya-uploads,
    then runs the graph with input_mode='pdf' and sub_graph='redline'.
    """
    if file.content_type not in ("application/pdf", "application/octet-stream"):
        raise HTTPException(status_code=415, detail="Only PDF files are accepted.")

    pdf_bytes = await file.read()
    if len(pdf_bytes) > 10 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="PDF must be under 10 MB.")

    try:
        raw_text = extract_text(pdf_bytes)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc))

    document_id = str(uuid.uuid4())
    graph = request.app.state.graph

    if not settings.DEV_AUTH_BYPASS:
        try:
            upload_user_pdf(user_id, document_id, pdf_bytes)
        except Exception as exc:
            print(f"[WARN] PDF upload to storage failed: {exc}")
        try:
            get_supabase().table("documents").insert({
                "id":            document_id,
                "user_id":       user_id,
                "document_type": "",
                "input_mode":    "pdf",
                "raw_input":     raw_text[:2000],
                "status":        "processing",
            }).execute()
        except Exception as exc:
            print(f"[WARN] Supabase insert failed: {exc}")

    initial_state: dict[str, Any] = {
        "user_id":              user_id,
        "input_mode":           "pdf",
        "raw_input":            raw_text,
        "document_type":        "",
        "parties":              [],
        "jurisdiction":         "India",
        "key_terms":            {},
        "draft":                "",
        "review_score":         0,
        "review_issues":        [],
        "risk_flags":           [],
        "negotiation_redlines": [],
        "obligations":          [],
        "dispute_summary":      "",
        "loop_count":           0,
        "hitl_approved":        False,
        "sub_graph":            "redline",
        "final_pdf_url":        "",
        "vault_id":             "",
        "esign_status":         "",
        "errors":               [],
    }

    config = {"configurable": {"thread_id": document_id}}
    background_tasks.add_task(_run_graph, graph, document_id, initial_state, config)

    return NewDocumentResponse(document_id=document_id)


@router.get("/{document_id}/status")
async def get_document_status(
    document_id: str,
    request: Request,
    user_id: str = Depends(get_current_user),
) -> dict:
    """
    Returns current graph state for the document.
    If the graph is paused at hitl_review, the response includes the draft
    and review payload so the frontend can render the approval screen.
    """
    graph = request.app.state.graph
    config = {"configurable": {"thread_id": document_id}}

    try:
        state = await graph.aget_state(config)
    except Exception as exc:
        raise HTTPException(status_code=404, detail=f"Document not found: {exc}")

    if state is None:
        raise HTTPException(status_code=404, detail="Document not found")

    values = state.values
    next_nodes = list(state.next) if state.next else []

    # Check if paused at HITL
    pending_interrupts = getattr(state, "tasks", [])
    hitl_payload = None
    for task in pending_interrupts:
        if hasattr(task, "interrupts") and task.interrupts:
            hitl_payload = task.interrupts[0].value
            break

    return {
        "document_id": document_id,
        "status": "awaiting_approval" if hitl_payload else ("completed" if not next_nodes else "processing"),
        "document_type": values.get("document_type", ""),
        "review_score": values.get("review_score", 0),
        "loop_count": values.get("loop_count", 0),
        "hitl_payload": hitl_payload,
        "hitl_approved": values.get("hitl_approved", False),
        "vault_id": values.get("vault_id", ""),
        "esign_status": values.get("esign_status", ""),
        "obligations_count": len(values.get("obligations", [])),
        "errors": values.get("errors", []),
        "draft_preview": (values.get("draft", "")[:500] + "…") if values.get("draft") else "",
    }


@router.post("/{document_id}/approve", status_code=status.HTTP_200_OK)
async def approve_document(
    document_id: str,
    body: ApprovalRequest,
    request: Request,
    user_id: str = Depends(get_current_user),
) -> dict:
    """
    Resumes the graph after HITL review.
    approved=True  → graph proceeds to Sahee (e-sign / PDF delivery).
    approved=False → graph re-enters Rachana with user feedback as new review_issues.
    """
    graph = request.app.state.graph
    config = {"configurable": {"thread_id": document_id}}

    resume_value = {"approved": body.approved, "feedback": body.feedback}

    try:
        async for _ in graph.astream(
            Command(resume=resume_value),
            config=config,
            stream_mode="updates",
        ):
            pass
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Resume failed: {exc}")

    # Persist completed state (vault_documents + obligations written here)
    await _persist_state(graph, document_id, config)

    return {
        "document_id": document_id,
        "status": "approved" if body.approved else "revision_requested",
    }
