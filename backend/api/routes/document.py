"""
Document routes.

POST /document/new          → 202 Accepted, starts background graph run
GET  /document/{id}/status  → poll for completion / HITL interrupt payload
POST /document/{id}/approve → resume graph after HITL human approval
"""

import uuid
from typing import Any

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Request, status
from langgraph.types import Command
from pydantic import BaseModel

from api.middleware.auth import get_current_user

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
            pass   # graph persists state via checkpointer; we don't need to capture here
    except Exception:
        pass       # errors are stored in state["errors"] via agent fallbacks


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

    return {
        "document_id": document_id,
        "status": "approved" if body.approved else "revision_requested",
    }
