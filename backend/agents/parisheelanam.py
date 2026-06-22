"""
Parisheelanam (పరిశీలనం) — Review agent with reflexion loop.
Scores the draft 0–100 and returns specific issues for Rachana to fix.
Uses GROQ_MODEL_PRO (llama-3.3-70b-versatile).

Score ≥ 75 → proceed to HITL.
Score < 75 AND loop_count < 3 → send back to Rachana.
Score < 75 AND loop_count ≥ 3 → escalate to HITL with warnings.
"""

from langchain_groq import ChatGroq
from pydantic import BaseModel, Field

from api.config import settings
from api.constants import GROQ_MODEL_PRO
from graph.state import VaakyaState

_llm = ChatGroq(model=GROQ_MODEL_PRO, api_key=settings.GROQ_API_KEY, temperature=0)

# ── System prompt ──────────────────────────────────────────────────────────────

_SYSTEM_PROMPT = """You are Parisheelanam (పరిశీలనం), the senior legal review agent for Vaakya.

## Your Role
You conduct a rigorous quality review of drafted Indian legal documents.
Your feedback is used to redraft the document until it meets the quality threshold (score ≥ 75).

## Review Dimensions (100 points total)

### 1. Legal Completeness (25 points)
- All required clauses present for this document type?
- Definitions section covers all terms used?
- Governing law, jurisdiction, dispute resolution present?
- Signature blocks complete?

### 2. Legal Accuracy (25 points)
- Indian law citations correct (ICA 1872, IT Act, Arbitration Act)?
- Obligations stated with "shall", permissions with "may"?
- No contradictory clauses?
- Consideration clearly stated?

### 3. Enforceability (20 points)
- Parties clearly identified with full legal names and roles?
- Obligations specific and measurable (not vague)?
- Termination triggers unambiguous?
- Remedies clearly defined?

### 4. Clarity & Professionalism (15 points)
- No grammatical errors or typos?
- Consistent use of defined terms throughout?
- Formal legal tone maintained?
- No contradictory definitions?

### 5. Risk Balance (15 points)
- Neither party unfairly disadvantaged?
- Liability caps reasonable under Indian law?
- Indemnification obligations balanced?
- Force majeure clause present if needed?

## Output Format
You MUST return:
- review_score: integer 0-100 (sum of all dimensions)
- confidence_score: float 0.0-1.0 — how confident you are in your score.
  Set high (0.85–1.0) when the document is clear and complete.
  Set medium (0.65–0.84) when some clauses are ambiguous or context is thin.
  Set low (0.40–0.64) when the document is incomplete, heavily templated, or you lack sufficient context to score accurately.
- review_issues: list of specific, actionable issues (empty list if score ≥ 90)
  Format each issue as: "[DIMENSION] <specific problem> → <required fix>"
  Example: "[LEGAL COMPLETENESS] Missing dispute resolution clause → Add arbitration under Arbitration and Conciliation Act, 1996"
- review_summary: 2-3 sentence executive summary of the document quality

Be strict. A score ≥ 75 means the document is ready for client review.
A score < 75 means it MUST go back for redrafting. Be precise about what needs fixing.
Return ONLY valid JSON."""


class ParisheelanamOutput(BaseModel):
    review_score: int = Field(ge=0, le=100, description="Quality score 0-100")
    confidence_score: float = Field(ge=0.0, le=1.0, description="Reviewer certainty 0.0-1.0")
    review_issues: list[str] = Field(
        description="Actionable issues for Rachana to fix. Empty if score >= 90."
    )
    review_summary: str = Field(description="2-3 sentence executive summary of document quality")


_structured_llm = _llm.with_structured_output(ParisheelanamOutput, method="json_mode")


def _build_human_message(state: VaakyaState) -> str:
    loop_count = state.get("loop_count", 0)
    prior_issues = state.get("review_issues", [])

    context = f"""Document Type: {state.get("document_type", "Unknown")}
Jurisdiction: {state.get("jurisdiction", "India")}
Review Iteration: {loop_count + 1} of 3"""

    if loop_count > 0 and prior_issues:
        prior_text = "\n".join(f"  - {i}" for i in prior_issues)
        context += f"""

Issues from Previous Review (check if resolved):
{prior_text}"""

    return f"""{context}

Draft to Review:
{state.get("draft", "")}

Review this document against all 5 dimensions and return your structured assessment."""


async def run_parisheelanam(state: VaakyaState) -> dict:
    try:
        result: ParisheelanamOutput = await _structured_llm.ainvoke([
            ("system", _SYSTEM_PROMPT),
            ("human", _build_human_message(state)),
        ])

        new_loop_count = state.get("loop_count", 0) + 1

        return {
            "review_score": result.review_score,
            "confidence_score": result.confidence_score,
            "review_issues": result.review_issues,
            "loop_count": new_loop_count,
        }
    except Exception as exc:
        return {
            "review_score": 0,
            "confidence_score": 0.0,
            "review_issues": [f"Parisheelanam error: {exc}"],
            "loop_count": state.get("loop_count", 0) + 1,
            "errors": [f"Parisheelanam error: {exc}"],
        }
