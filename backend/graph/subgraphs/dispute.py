"""
dispute sub-graph — legal dispute resolution flow:

  START → vivada → hitl_review → sahee → END
                        │
                     rejected
                        │
                        END

Vivada analyses the dispute and drafts a legal notice.
HITL checkpoint: user must approve before the analysis is vaulted.
A generated legal notice must never be sent without explicit user approval.
Sahee vaults the approved dispute summary.
"""

from langgraph.graph import END, START, StateGraph
from langgraph.types import interrupt

from agents.sahee import run_sahee
from agents.vivada import run_vivada
from graph.state import VaakyaState


# ── HITL node ─────────────────────────────────────────────────────────────────

async def hitl_review(state: VaakyaState) -> dict:
    """
    Human-in-the-loop checkpoint for dispute flow.
    Surfaces the dispute analysis and draft legal notice for user approval.
    Pauses until the API resumes via Command(resume=...).
    """
    payload = {
        "dispute_summary": state.get("dispute_summary", ""),
        "document_type": state.get("document_type", ""),
        "parties": state.get("parties", []),
        "jurisdiction": state.get("jurisdiction", "India"),
    }

    approval = interrupt(payload)
    return {"hitl_approved": bool(approval.get("approved", False))}


def _after_hitl(state: VaakyaState) -> str:
    return "sahee" if state.get("hitl_approved") else END


# ── Sub-graph builder ─────────────────────────────────────────────────────────

def build_dispute_graph() -> StateGraph:
    builder = StateGraph(VaakyaState)

    builder.add_node("vivada",      run_vivada)
    builder.add_node("hitl_review", hitl_review)
    builder.add_node("sahee",       run_sahee)

    builder.add_edge(START,     "vivada")
    builder.add_edge("vivada",  "hitl_review")

    builder.add_conditional_edges(
        "hitl_review",
        _after_hitl,
        {"sahee": "sahee", END: END},
    )

    builder.add_edge("sahee", END)

    return builder


dispute_graph = build_dispute_graph()
