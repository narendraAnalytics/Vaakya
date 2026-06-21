"""
Main Vaakya LangGraph workflow.
Routes incoming state to the correct sub-graph based on VaakyaState.sub_graph.

  new_doc  → graph/subgraphs/new_doc.py   (Phase 1 — active)
  redline  → graph/subgraphs/redline.py   (Phase 3 — placeholder)
  dispute  → graph/subgraphs/dispute.py   (Phase 3 — placeholder)
"""

from langgraph.checkpoint.postgres.aio import AsyncPostgresSaver
from langgraph.graph import END, START, StateGraph
from langgraph.store.postgres.aio import AsyncPostgresStore

from graph.state import VaakyaState
from graph.subgraphs.new_doc import new_doc_graph


# ── Placeholder nodes for Phase 3 sub-graphs ─────────────────────────────────

async def _redline_placeholder(state: VaakyaState) -> dict:
    return {"errors": ["Redline sub-graph not yet implemented (Phase 3)"]}


async def _dispute_placeholder(state: VaakyaState) -> dict:
    return {"errors": ["Dispute sub-graph not yet implemented (Phase 3)"]}


# ── Router ────────────────────────────────────────────────────────────────────

def _route_sub_graph(state: VaakyaState) -> str:
    return state.get("sub_graph", "new_doc")


# ── Main graph builder ────────────────────────────────────────────────────────

def build_graph(
    checkpointer: AsyncPostgresSaver | None = None,
    store: AsyncPostgresStore | None = None,
) -> StateGraph:
    """
    Builds and compiles the full Vaakya graph.
    checkpointer — AsyncPostgresSaver for HITL persistence (required in production)
    store        — AsyncPostgresStore for long-term memory (optional)
    """
    builder = StateGraph(VaakyaState)

    # Register sub-graphs as nodes
    builder.add_node("new_doc", new_doc_graph.compile())
    builder.add_node("redline", _redline_placeholder)
    builder.add_node("dispute", _dispute_placeholder)

    # Route from START based on sub_graph field set by Arambha
    builder.add_conditional_edges(
        START,
        _route_sub_graph,
        {
            "new_doc": "new_doc",
            "redline": "redline",
            "dispute": "dispute",
        },
    )

    builder.add_edge("new_doc", END)
    builder.add_edge("redline", END)
    builder.add_edge("dispute", END)

    return builder.compile(checkpointer=checkpointer, store=store)
