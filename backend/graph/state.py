import operator
from typing import Annotated, Literal, TypedDict


class VaakyaState(TypedDict):
    # ── Input ──────────────────────────────────────────────────────────────
    user_id: str
    input_mode: Literal["text", "pdf"]
    raw_input: str          # plain-text request or PDF-extracted text
    document_type: str      # NDA, Vendor Agreement, Employment, etc.

    # ── Extracted by Arambha ───────────────────────────────────────────────
    parties: list[dict]     # [{"name": ..., "role": ...}, ...]
    jurisdiction: str       # default: "India"
    key_terms: dict         # {"duration": ..., "governing_law": ..., ...}

    # ── Agent outputs ──────────────────────────────────────────────────────
    # Annotated[list, operator.add] → safe concurrent writes from parallel nodes
    draft: str
    review_score: int
    confidence_score: float      # Parisheelanam certainty (0.0–1.0); < 0.65 → low-confidence warning
    review_issues: Annotated[list[str], operator.add]
    risk_flags: Annotated[list[dict], operator.add]
    negotiation_redlines: Annotated[list[dict], operator.add]
    obligations: Annotated[list[dict], operator.add]
    dispute_summary: str

    # ── Control ────────────────────────────────────────────────────────────
    loop_count: int         # Rachana ↔ Parisheelanam reflexion counter (max 3)
    hitl_approved: bool
    sub_graph: Literal["new_doc", "redline", "dispute"]

    # ── Output ─────────────────────────────────────────────────────────────
    final_pdf_url: str      # Supabase Storage URL
    vault_id: str
    esign_status: str
    errors: Annotated[list[str], operator.add]
