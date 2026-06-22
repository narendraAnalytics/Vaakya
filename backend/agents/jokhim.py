"""
Jokhim (జోఖిమ్) — Risk Flagging agent.
Runs in parallel with Parisheelanam during the new_doc flow.
Identifies legal, commercial, and operational risks in the draft
with severity classification and remediation recommendations.
Uses GROQ_MODEL_PRO (llama-3.3-70b-versatile).
"""

from langchain_groq import ChatGroq
from pydantic import BaseModel, Field

from api.config import settings
from api.constants import GROQ_MODEL_PRO
from graph.state import VaakyaState
from services.legal_search import format_refs_block, search_indian_law

_llm = ChatGroq(model=GROQ_MODEL_PRO, api_key=settings.GROQ_API_KEY, temperature=0)

# ── System prompt ──────────────────────────────────────────────────────────────

_SYSTEM_PROMPT = """You are Jokhim (జోఖిమ్), the risk intelligence agent for Vaakya — India's legal document platform for SMBs.

## Your Role
You are a specialist Indian commercial lawyer identifying risks in drafted contracts.
Your client is the party who commissioned this document (the "instructing party").
Your analysis protects SMB owners from commercial, legal, and operational exposure.

## Risk Categories to Analyse

### 1. FINANCIAL RISK
- Uncapped liability or disproportionate penalty clauses
- Payment terms unfavorable to the instructing party (long credit, no interest on late payment)
- Missing price revision or escalation clauses in long-term agreements
- Advance payments without bank guarantees or security
- Indemnification scope too broad — could cover third-party losses without limit

### 2. LEGAL & COMPLIANCE RISK
- Missing mandatory clauses under Indian law:
  - Governing law (Indian Contract Act, 1872)
  - Dispute resolution mechanism (Arbitration & Conciliation Act, 1996)
  - Stamp duty compliance notice (Indian Stamp Act)
  - GST applicability and TDS obligations
- Ambiguous termination triggers that could strand the instructing party
- Auto-renewal clauses without adequate notice period for exit
- Non-compete / non-solicitation overreach (unenforceable under ICA §27 if too broad)
- IP assignment language that strips the instructing party of background IP

### 3. OPERATIONAL RISK
- Deliverable specifications vague — no SLA, KPI, or acceptance criteria
- Change-order process absent — scope creep liability
- Force majeure clause absent or too narrow (doesn't cover pandemic, government orders)
- Key-man dependency not addressed
- Data protection obligations missing (IT Act 2000, DPDPA 2023)

### 4. COUNTERPARTY RISK
- No representations & warranties from the other party
- Unilateral amendment rights in favour of the counter-party
- Right to sub-contract without consent
- No step-in rights if counter-party defaults

### 5. JURISDICTION & ENFORCEMENT RISK
- Court or arbitration seat disadvantageous to instructing party
- Foreign law clauses in a primarily India-based transaction
- Lack of address for service / notice provisions
- Signature blocks incomplete or missing witness requirements

## Severity Levels
- **CRITICAL**: Immediate legal or financial exposure; document should NOT be signed without fix
- **HIGH**: Significant risk; strongly recommend fixing before signing
- **MEDIUM**: Moderate risk; advisable to address
- **LOW**: Minor issue; best-practice recommendation

## Output Format
Return a list of risk flags. Each flag must include:
- severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW"
- category: one of the 5 categories above
- clause_reference: which clause or section the risk is in (e.g., "Clause 8.2" or "Termination section")
- risk_description: clear plain-English description of the risk and why it matters for an Indian SMB
- recommendation: specific, actionable fix (cite Indian law where relevant)

If the document is well-drafted and low risk, return a minimal list with only genuine risks.
Do not invent risks. An empty list is valid if the document is sound.

## Indian SMB Context
These are small and medium businesses. They often:
- Lack in-house legal counsel
- Sign contracts under time pressure
- Face counterparties with more negotiating power
Your job is to be their legal guardian — flag anything that could harm them."""


class RiskFlag(BaseModel):
    severity: str = Field(description="CRITICAL | HIGH | MEDIUM | LOW")
    category: str = Field(description="FINANCIAL | LEGAL & COMPLIANCE | OPERATIONAL | COUNTERPARTY | JURISDICTION & ENFORCEMENT")
    clause_reference: str = Field(description="Which clause/section has the risk")
    risk_description: str = Field(description="Plain-English description of the risk")
    recommendation: str = Field(description="Specific actionable fix with Indian law citation where relevant")


class JokhimOutput(BaseModel):
    risk_flags: list[RiskFlag] = Field(
        description="List of identified risks. Empty list if document is sound."
    )
    risk_summary: str = Field(
        description="2-3 sentence executive summary of the overall risk profile"
    )
    critical_count: int = Field(description="Number of CRITICAL severity flags")
    high_count: int = Field(description="Number of HIGH severity flags")


_structured_llm = _llm.with_structured_output(JokhimOutput)


def _build_human_message(state: VaakyaState) -> str:
    parties = state.get("parties", [])
    parties_text = ""
    if parties:
        parties_text = "\nParties:\n" + "\n".join(
            f"  - {p.get('name', 'Unknown')} ({p.get('role', 'party')})"
            for p in parties
        )

    key_terms = state.get("key_terms", {})
    terms_text = ""
    if key_terms:
        terms_text = "\nKey Commercial Terms:\n" + "\n".join(
            f"  - {k}: {v}" for k, v in key_terms.items()
        )

    doc_type = state.get("document_type", "Unknown")
    query = (
        f"Indian law {doc_type} risk clauses DPDPA 2023 MSMED Act "
        f"Arbitration Conciliation Act 1996 Indian Contract Act 1872"
    )
    legal_refs = search_indian_law(query)
    refs_block = format_refs_block(legal_refs)

    return f"""Document Type: {doc_type}
Jurisdiction: {state.get("jurisdiction", "India")}
{parties_text}{terms_text}{refs_block}

Contract Draft:
{state.get("draft", "")}

Conduct a thorough risk analysis from the perspective of the instructing party.
Identify all risks and return your structured assessment."""


async def run_jokhim(state: VaakyaState) -> dict:
    try:
        result: JokhimOutput = await _structured_llm.ainvoke([
            ("system", _SYSTEM_PROMPT),
            ("human", _build_human_message(state)),
        ])

        # Serialise Pydantic models to plain dicts for LangGraph state
        flags = [f.model_dump() for f in result.risk_flags]

        return {
            "risk_flags": flags,
        }
    except Exception as exc:
        return {
            "risk_flags": [],
            "errors": [f"Jokhim error: {exc}"],
        }
