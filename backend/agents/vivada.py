"""
Vivada (వివాద) — Dispute Resolution Agent.
Runs in the dispute sub-graph. Analyses the dispute, determines the legal position,
recommends the resolution path, and drafts a legal notice if needed.
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

_SYSTEM_PROMPT = """You are Vivada (వివాద), the dispute resolution specialist for Vaakya.

## Your Role
You are a senior Indian litigator and dispute resolution expert advising an SMB owner who
has a legal dispute. Your job is to:
1. Analyse the dispute and determine the legal position
2. Recommend the most cost-effective resolution path
3. Draft a legal notice if required
4. Give clear, actionable next steps

## Indian Dispute Resolution Hierarchy (prefer lower rungs for SMBs)

### 1. Negotiation (fastest, cheapest)
Direct settlement. Appropriate when: relationship matters, facts are not disputed,
or the amount at stake doesn't justify legal cost.

### 2. Mediation
Neutral mediator. Appropriate when: parties are willing but can't agree, or court
would take years. MSME Facilitation Council (MSMED Act 2006) for MSME disputes.

### 3. Arbitration (Arbitration & Conciliation Act, 1996)
Binding, private, faster than courts. Appropriate when: contract has an arbitration
clause, or both parties agree. Seats: Delhi, Mumbai, Bengaluru, Hyderabad.

### 4. Litigation (last resort for SMBs)
Civil suit under CPC 1908. District Court (up to ₹20 lakh), High Court (above).
Commercial Court (Commercial Courts Act, 2015) for commercial disputes above ₹3 lakh.

## Key Indian Laws

| Situation | Law |
|---|---|
| Contract breach, damages | Indian Contract Act, 1872 (§73–§75) |
| Fraud, misrepresentation | ICA §17–§19 |
| Limitation period (contract) | Limitation Act, 1963 — 3 years from breach |
| Injunction, interim relief | Specific Relief Act, 1963; CPC Order 39 |
| MSME payment disputes | MSMED Act, 2006 (45-day payment, 3× bank rate interest) |
| Employment disputes | Industrial Disputes Act, 1947; Labour Court |
| IP disputes (trademark/copyright) | Trade Marks Act 1999; Copyright Act 1957 |
| Consumer disputes | Consumer Protection Act, 2019 (NCDRC/SCDRC) |
| Data / IT disputes | IT Act, 2000; DPDPA 2023 |

## Legal Notice Format (when required)
A legal notice under Section 80 CPC (when suing the government) or as a demand notice
must include:
1. From: [Name, Address, designation]
2. To: [Name, Address]
3. Date
4. Subject: Legal Notice
5. Facts (numbered paragraphs)
6. Legal basis (statute, clause violated)
7. Demand (specific amount or action)
8. Response deadline (15 days for urgent, 30 days standard)
9. Consequence of non-response (legal action)
10. Signature

## Output Guidelines
- Be direct — tell the SMB owner exactly what to do and in what order
- Quantify costs where possible (filing fees, lawyer retainer ranges in INR)
- Flag any limitation period risk — if the 3-year clock is running, say so explicitly
- If documents must be preserved, list them (emails, invoices, WhatsApp messages, contracts)
- Write the legal notice in formal English suitable for service on the counter-party"""


class VivadaOutput(BaseModel):
    legal_position: str = Field(
        description="Plain-English summary of the SMB's legal position — are they likely to succeed, and why?"
    )
    legal_basis: str = Field(
        description="The specific Indian laws and contract clauses that support the SMB's position"
    )
    recommended_path: str = Field(
        description="negotiation | mediation | arbitration | litigation"
    )
    recommended_path_reason: str = Field(
        description="Why this path is best for this SMB given cost, time, and strength of case"
    )
    legal_notice_draft: str = Field(
        description="Full draft legal notice ready to send. Empty string if notice is not appropriate."
    )
    timeline_estimate: str = Field(
        description="Realistic timeline for the recommended path (e.g. '4-8 weeks for negotiation')"
    )
    cost_estimate: str = Field(
        description="Rough cost range in INR including legal fees and filing costs"
    )
    urgent_actions: list[str] = Field(
        description="Immediate steps the SMB must take (preserve evidence, meet deadlines, etc.)"
    )
    documents_to_preserve: list[str] = Field(
        description="Specific documents / evidence the SMB must secure immediately"
    )


_structured_llm = _llm.with_structured_output(VivadaOutput, method="json_mode")


def _build_dispute_summary(result: VivadaOutput) -> str:
    """Serialise the full Vivada analysis into the dispute_summary state field."""
    notice_section = (
        f"\n\n## DRAFT LEGAL NOTICE\n\n{result.legal_notice_draft}"
        if result.legal_notice_draft
        else ""
    )

    actions = "\n".join(f"  {i+1}. {a}" for i, a in enumerate(result.urgent_actions))
    docs = "\n".join(f"  - {d}" for d in result.documents_to_preserve)

    return f"""## LEGAL POSITION
{result.legal_position}

## LEGAL BASIS
{result.legal_basis}

## RECOMMENDED PATH: {result.recommended_path.upper()}
{result.recommended_path_reason}

Timeline: {result.timeline_estimate}
Estimated Cost: {result.cost_estimate}

## URGENT ACTIONS
{actions}

## DOCUMENTS TO PRESERVE
{docs}{notice_section}"""


def _build_human_message(state: VaakyaState) -> str:
    parties = state.get("parties", [])
    parties_text = ""
    if parties:
        parties_text = "\nParties involved:\n" + "\n".join(
            f"  - {p.get('name', 'Unknown')} ({p.get('role', 'party')})"
            for p in parties
        )

    doc_type = state.get("document_type", "Unknown")
    party_names = " ".join(p.get("name", "") for p in parties[:2])
    query = (
        f"Indian law dispute {doc_type} {party_names} breach remedy "
        f"arbitration MSMED Act Limitation Act 2024 precedent"
    )
    legal_refs = search_indian_law(query)
    refs_block = format_refs_block(legal_refs)

    return f"""Document Type: {doc_type}
Jurisdiction: {state.get("jurisdiction", "India")}
{parties_text}{refs_block}

Dispute Description:
{state.get("raw_input", "")}

Analyse this dispute and provide a complete resolution strategy with legal notice if needed."""


async def run_vivada(state: VaakyaState) -> dict:
    try:
        result: VivadaOutput = await _structured_llm.ainvoke([
            ("system", _SYSTEM_PROMPT),
            ("human", _build_human_message(state)),
        ])

        return {
            "dispute_summary": _build_dispute_summary(result),
        }
    except Exception as exc:
        return {
            "dispute_summary": f"Vivada error: {exc}",
            "errors": [f"Vivada error: {exc}"],
        }
