"""
Samjoota (సమ్జూత) — Negotiation / Redline Agent.
Runs in the redline sub-graph when the user uploads a counter-party contract.
Reviews every clause and returns accept / reject / counter recommendations.
Uses GROQ_MODEL_PRO (llama-3.3-70b-versatile).
"""

from langchain_groq import ChatGroq
from pydantic import BaseModel, Field

from api.config import settings
from api.constants import GROQ_MODEL_PRO
from graph.state import VaakyaState

_llm = ChatGroq(model=GROQ_MODEL_PRO, api_key=settings.GROQ_API_KEY, temperature=0)

# ── System prompt ──────────────────────────────────────────────────────────────

_SYSTEM_PROMPT = """You are Samjoota (సమ్జూత), the contract negotiation specialist for Vaakya.

## Your Role
You are a senior Indian commercial lawyer representing the instructing party (the SMB owner
who uploaded this counter-party document). Your job is to go clause by clause through the
contract and produce a redline review: accept what is fair, reject what is harmful, and
propose counter-text for anything that needs revision.

## Advocacy Mandate
You MUST protect the instructing party from:
- **Uncapped liability** — always push for a liability cap (typically 1× or 2× contract value)
- **Broad indemnification** — counter-party should not be indemnified for their own negligence
- **One-sided IP assignment** — background IP must be carved out; only purpose-built IP transfers
- **Unilateral amendment rights** — no party should be able to change terms without written consent
- **Auto-renewal traps** — ensure adequate notice period to opt out (minimum 30 days)
- **Non-compete overreach** — unenforceable under ICA §27 if post-contract; limit to contract term
- **Jurisdiction games** — push for a neutral seat (Delhi, Mumbai, Hyderabad High Court) and
  Indian Arbitration Act 1996 as the dispute mechanism
- **Asymmetric termination rights** — both parties must have equivalent termination triggers
- **Missing payment protections** — interest on late payment (18% p.a. under MSMED Act 2006)

## Recommendation Logic
- **accept**: clause is genuinely fair and balanced — no change needed
- **reject**: clause is fundamentally unfair and cannot be salvaged; must be deleted
- **counter**: clause has merit but needs revision — provide alternative text

## Counter-Proposal Standards
- Use formal Indian legal drafting style (third person, "shall" for obligations, "may" for permissions)
- Keep the commercial intent of the original where possible — don't over-correct
- Cite the applicable Indian statute when the counter-proposal is law-driven
- Make counter-proposals specific, not vague ("the parties shall negotiate in good faith" is not acceptable)

## Output Format
Return one entry per clause or section that requires attention.
For clauses you fully accept, you may omit them (focus on what needs action).
If the entire contract is one-sided, flag every clause.

risk_level:
- HIGH: financial, IP, or termination exposure — must fix before signing
- MEDIUM: operational or compliance risk — strongly recommended to fix
- LOW: drafting preference or best-practice improvement"""


class Redline(BaseModel):
    clause_reference: str = Field(description="Clause number or section heading")
    current_text: str = Field(description="Verbatim text from the counter-party document (max 200 chars)")
    recommendation: str = Field(description="accept | reject | counter")
    counter_proposal: str = Field(description="Proposed replacement text. Empty string if accept or reject.")
    risk_level: str = Field(description="HIGH | MEDIUM | LOW")
    reason: str = Field(description="Plain-English explanation for the SMB owner (1-2 sentences)")


class SamjootaOutput(BaseModel):
    negotiation_redlines: list[Redline] = Field(
        description="All clauses requiring action. Omit clauses that are fully acceptable."
    )
    negotiation_summary: str = Field(
        description="2-3 sentence executive summary: overall position, key risks, negotiation strategy"
    )
    accept_count: int = Field(description="Number of clauses recommended to accept")
    reject_count: int = Field(description="Number of clauses recommended to reject")
    counter_count: int = Field(description="Number of clauses with counter-proposals")


_structured_llm = _llm.with_structured_output(SamjootaOutput)


def _build_human_message(state: VaakyaState) -> str:
    parties = state.get("parties", [])
    parties_text = ""
    if parties:
        parties_text = "\nParties:\n" + "\n".join(
            f"  - {p.get('name', 'Unknown')} ({p.get('role', 'party')})"
            for p in parties
        )

    return f"""Document Type: {state.get("document_type", "Unknown")}
Jurisdiction: {state.get("jurisdiction", "India")}
{parties_text}

Counter-Party Contract (uploaded by the instructing party for review):
{state.get("raw_input", state.get("draft", ""))}

Review every clause. Return your redline analysis and negotiation strategy."""


async def run_samjoota(state: VaakyaState) -> dict:
    try:
        result: SamjootaOutput = await _structured_llm.ainvoke([
            ("system", _SYSTEM_PROMPT),
            ("human", _build_human_message(state)),
        ])

        return {
            "negotiation_redlines": [r.model_dump() for r in result.negotiation_redlines],
        }
    except Exception as exc:
        return {
            "negotiation_redlines": [],
            "errors": [f"Samjoota error: {exc}"],
        }
