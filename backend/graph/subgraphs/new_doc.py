"""
new_doc sub-graph — Phase 1 core flow:

  arambha → rachana → parisheelanam
                ↑           │
                └───────────┘  (score < 75 AND loop_count < 3)
                            │
                      hitl_review  (score ≥ 75 OR loop_count ≥ 3)
"""

from langgraph.graph import END, START, StateGraph
from langgraph.types import interrupt

from agents.arambha import run_arambha
from agents.parisheelanam import run_parisheelanam
from agents.rachana import run_rachana
from graph.state import VaakyaState

MAX_LOOPS = 3
REVIEW_THRESHOLD = 75


# ── Edge functions ─────────────────────────────────────────────────────────────

def _should_redraft(state: VaakyaState) -> str:
    """After Parisheelanam: redraft or proceed to HITL."""
    score = state.get("review_score", 0)
    loops = state.get("loop_count", 0)
    if score < REVIEW_THRESHOLD and loops < MAX_LOOPS:
        return "redraft"
    return "hitl"


# ── HITL node ─────────────────────────────────────────────────────────────────

async def hitl_review(state: VaakyaState) -> dict:
    """
    Human-in-the-loop checkpoint.
    Pauses graph execution and surfaces the draft + review score to the user.
    The API layer resumes the graph after the user approves or requests changes.
    """
    score = state.get("review_score", 0)
    loops = state.get("loop_count", 0)

    payload = {
        "draft": state.get("draft", ""),
        "review_score": score,
        "review_issues": state.get("review_issues", []),
        "loop_count": loops,
        "document_type": state.get("document_type", ""),
        "parties": state.get("parties", []),
        "max_loops_reached": loops >= MAX_LOOPS and score < REVIEW_THRESHOLD,
    }

    # interrupt() pauses the graph here; execution resumes when the API
    # calls graph.astream(Command(resume=approval_data), config=config)
    approval = interrupt(payload)

    return {"hitl_approved": bool(approval.get("approved", False))}


# ── Sub-graph builder ─────────────────────────────────────────────────────────

def build_new_doc_graph() -> StateGraph:
    builder = StateGraph(VaakyaState)

    builder.add_node("arambha",       run_arambha)
    builder.add_node("rachana",       run_rachana)
    builder.add_node("parisheelanam", run_parisheelanam)
    builder.add_node("hitl_review",   hitl_review)

    builder.add_edge(START,         "arambha")
    builder.add_edge("arambha",     "rachana")
    builder.add_edge("rachana",     "parisheelanam")

    builder.add_conditional_edges(
        "parisheelanam",
        _should_redraft,
        {"redraft": "rachana", "hitl": "hitl_review"},
    )

    builder.add_edge("hitl_review", END)

    return builder


new_doc_graph = build_new_doc_graph()
