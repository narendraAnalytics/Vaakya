"""
new_doc sub-graph — Phase 1 + Phase 2 core flow:

  START → arambha → rachana → parisheelanam ─┐
                        ↑                    fan_in → hitl_review
                        └──────── jokhim ───┘     │
                          (redraft loop)           │
                                         ┌─────────┴──────────┐
                                      approved             rejected
                                         │                    │
                                       sahee                 END
                                         │
                                       sruthi
                                         │
                                        END

Rachana fans out to both Parisheelanam and Jokhim simultaneously.
fan_in collects both outputs, then routes: score<75 & loops<3 → rachana, else → hitl.
"""

from langgraph.graph import END, START, StateGraph
from langgraph.types import interrupt

from agents.arambha import run_arambha
from agents.jokhim import run_jokhim
from agents.parisheelanam import run_parisheelanam
from agents.rachana import run_rachana
from agents.sahee import run_sahee
from agents.sruthi import run_sruthi
from graph.state import VaakyaState

MAX_LOOPS = 3
REVIEW_THRESHOLD = 75


# ── Edge functions ─────────────────────────────────────────────────────────────

def _after_hitl(state: VaakyaState) -> str:
    """After HITL: vault + obligations if approved, else stop."""
    return "sahee" if state.get("hitl_approved") else END


async def _fan_in(state: VaakyaState) -> dict:
    """Fan-in node: collects parallel outputs from Parisheelanam and Jokhim."""
    return {}


def _should_redraft(state: VaakyaState) -> str:
    """After fan_in: redraft or proceed to HITL."""
    score = state.get("review_score", 0)
    loops = state.get("loop_count", 0)
    if score < REVIEW_THRESHOLD and loops < MAX_LOOPS:
        return "redraft"
    return "hitl"


# ── HITL node ─────────────────────────────────────────────────────────────────

async def hitl_review(state: VaakyaState) -> dict:
    """
    Human-in-the-loop checkpoint.
    Surfaces draft, review score, and risk flags to the user.
    Pauses until the API resumes the graph via Command(resume=...).
    """
    score = state.get("review_score", 0)
    loops = state.get("loop_count", 0)
    risk_flags = state.get("risk_flags", [])

    critical_flags = [f for f in risk_flags if f.get("severity") == "CRITICAL"]
    high_flags = [f for f in risk_flags if f.get("severity") == "HIGH"]

    payload = {
        "draft": state.get("draft", ""),
        "review_score": score,
        "review_issues": state.get("review_issues", []),
        "loop_count": loops,
        "document_type": state.get("document_type", ""),
        "parties": state.get("parties", []),
        "max_loops_reached": loops >= MAX_LOOPS and score < REVIEW_THRESHOLD,
        "risk_flags": risk_flags,
        "risk_summary": {
            "total": len(risk_flags),
            "critical": len(critical_flags),
            "high": len(high_flags),
            "critical_flags": critical_flags,
        },
    }

    # interrupt() pauses graph here; resumes when API calls
    # graph.astream(Command(resume=approval_data), config=config)
    approval = interrupt(payload)

    return {"hitl_approved": bool(approval.get("approved", False))}


# ── Sub-graph builder ─────────────────────────────────────────────────────────

def build_new_doc_graph() -> StateGraph:
    builder = StateGraph(VaakyaState)

    builder.add_node("arambha",       run_arambha)
    builder.add_node("rachana",       run_rachana)
    builder.add_node("parisheelanam", run_parisheelanam)
    builder.add_node("jokhim",        run_jokhim)
    builder.add_node("fan_in",        _fan_in)
    builder.add_node("hitl_review",   hitl_review)
    builder.add_node("sahee",         run_sahee)
    builder.add_node("sruthi",        run_sruthi)

    builder.add_edge(START,         "arambha")
    builder.add_edge("arambha",     "rachana")

    # Parallel fan-out: Parisheelanam and Jokhim run simultaneously
    builder.add_edge("rachana",       "parisheelanam")
    builder.add_edge("rachana",       "jokhim")
    # Fan-in: fan_in waits for both before routing
    builder.add_edge("parisheelanam", "fan_in")
    builder.add_edge("jokhim",        "fan_in")

    builder.add_conditional_edges(
        "fan_in",
        _should_redraft,
        {"redraft": "rachana", "hitl": "hitl_review"},
    )

    builder.add_conditional_edges(
        "hitl_review",
        _after_hitl,
        {"sahee": "sahee", END: END},
    )

    builder.add_edge("sahee",  "sruthi")
    builder.add_edge("sruthi", END)

    return builder


new_doc_graph = build_new_doc_graph()
