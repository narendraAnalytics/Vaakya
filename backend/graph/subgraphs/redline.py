"""
redline sub-graph — counter-party contract review flow:

  START → samjoota → jokhim → hitl_review
                                    │
                          ┌─────────┴──────────┐
                       approved             rejected
                          │                    │
                        sahee                 END
                          │
                         END

Samjoota produces negotiation redlines; Jokhim flags risks on the same document.
HITL surfaces both redlines + risk flags for the SMB owner to approve before vaulting.
"""

from langgraph.graph import END, START, StateGraph
from langgraph.types import interrupt

from agents.jokhim import run_jokhim
from agents.sahee import run_sahee
from agents.samjoota import run_samjoota
from graph.state import VaakyaState


# ── Edge functions ─────────────────────────────────────────────────────────────

def _after_hitl(state: VaakyaState) -> str:
    return "sahee" if state.get("hitl_approved") else END


# ── HITL node ─────────────────────────────────────────────────────────────────

async def hitl_review(state: VaakyaState) -> dict:
    """
    Human-in-the-loop checkpoint for the redline flow.
    Surfaces negotiation redlines + risk flags for SMB owner review.
    """
    risk_flags = state.get("risk_flags", [])
    redlines = state.get("negotiation_redlines", [])

    critical_flags = [f for f in risk_flags if f.get("severity") == "CRITICAL"]
    reject_redlines = [r for r in redlines if r.get("recommendation") == "reject"]
    counter_redlines = [r for r in redlines if r.get("recommendation") == "counter"]

    payload = {
        "document_type": state.get("document_type", ""),
        "parties": state.get("parties", []),
        "negotiation_redlines": redlines,
        "risk_flags": risk_flags,
        "negotiation_summary": {
            "total_clauses_flagged": len(redlines),
            "reject_count": len(reject_redlines),
            "counter_count": len(counter_redlines),
        },
        "risk_summary": {
            "total": len(risk_flags),
            "critical": len(critical_flags),
            "critical_flags": critical_flags,
        },
    }

    approval = interrupt(payload)
    return {"hitl_approved": bool(approval.get("approved", False))}


# ── Sub-graph builder ─────────────────────────────────────────────────────────

def build_redline_graph() -> StateGraph:
    builder = StateGraph(VaakyaState)

    builder.add_node("samjoota",    run_samjoota)
    builder.add_node("jokhim",      run_jokhim)
    builder.add_node("hitl_review", hitl_review)
    builder.add_node("sahee",       run_sahee)

    builder.add_edge(START,       "samjoota")
    builder.add_edge("samjoota",  "jokhim")
    builder.add_edge("jokhim",    "hitl_review")

    builder.add_conditional_edges(
        "hitl_review",
        _after_hitl,
        {"sahee": "sahee", END: END},
    )

    builder.add_edge("sahee", END)

    return builder


redline_graph = build_redline_graph()
