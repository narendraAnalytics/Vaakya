"""
dispute sub-graph — legal dispute resolution flow:

  START → vivada → sahee → END

Vivada analyses the dispute and drafts a legal notice.
Sahee vaults the dispute summary and legal notice.
No HITL — output is advisory / informational, not a binding signed document.
"""

from langgraph.graph import END, START, StateGraph

from agents.sahee import run_sahee
from agents.vivada import run_vivada
from graph.state import VaakyaState


def build_dispute_graph() -> StateGraph:
    builder = StateGraph(VaakyaState)

    builder.add_node("vivada", run_vivada)
    builder.add_node("sahee",  run_sahee)

    builder.add_edge(START,    "vivada")
    builder.add_edge("vivada", "sahee")
    builder.add_edge("sahee",  END)

    return builder


dispute_graph = build_dispute_graph()
